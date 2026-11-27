import type { APIRoute } from "astro";
import type {
  WebhookEventName,
  InstallationCreatedEvent,
  InstallationDeletedEvent,
  WorkflowRunCompletedEvent,
} from "@octokit/webhooks-types";
import { db, eq, and, Repository, Submission } from "astro:db";
import { snapshotSubmission } from "@/lib/snapshots";
import { findProject } from "@/lib/competition/data";
import { githubApp, listCollaborators } from "@/lib/competition/github";
import { recordRepository, recordSubmission } from "@/lib/competition/membership-store";

export const prerender = false;

const gh = githubApp();

gh.webhooks.on("installation.created", async ({ payload }) => {
  const installPayload = payload as InstallationCreatedEvent;
  console.log(`${installPayload.installation.account.login} has installed the app`);
});

gh.webhooks.on("installation.deleted", async ({ payload }) => {
  const uninstallPayload = payload as InstallationDeletedEvent;
  console.log(`${uninstallPayload.installation.account.login} has uninstalled`)
});

gh.webhooks.on("workflow_run.completed", async ({ payload }) => {
  const workflowPayload = payload as WorkflowRunCompletedEvent;
  const workflow = workflowPayload.workflow_run;
  const repository = workflowPayload.repository;

  if (workflow.conclusion !== "success"
    || workflow.name !== "Warwick AI Competition Submission"
  ) return;

  try {
    if (repository.fork || repository.is_template) return;

    // Get installation-specific octokit instance
    const installationId = workflowPayload.installation?.id;
    if (!installationId) {
      console.error("No installation ID found in webhook payload");
      return;
    }

    const octokit = await gh.getInstallationOctokit(installationId);

    const project = await findProject(octokit, repository.owner.login, repository.name);
    if (!project) return;

    // Skip redeliveries and re-runs before downloading anything
    const recorded = await db
      .select({ id: Submission.id })
      .from(Submission)
      .innerJoin(Repository, eq(Submission.repositoryId, Repository.id))
      .where(
        and(
          eq(Repository.githubRepoId, repository.id),
          eq(Submission.commitHash, workflow.head_sha),
        ),
      )
      .get();
    if (recorded) return;

    // Late submissions are still recorded, the leaderboard marks them as late
    if (new Date(workflow.created_at) < project.startDate) {
      console.log(`Ignoring ${repository.full_name}@${workflow.head_sha}, submitted before ${project.id} opened`);
      return;
    }

    const { data: { jobs } } = await octokit.rest.actions.listJobsForWorkflowRun({
      owner: repository.owner.login,
      repo: repository.name,
      run_id: workflow.id,
    });

    const { data: logs } = await octokit.rest.actions.downloadJobLogsForWorkflowRun({
      owner: repository.owner.login,
      repo: repository.name,
      job_id: jobs[0].id
    }) as { data: string };

    const match = logs.match(/\*\*Score:\*\*\s*(\d+(?:\.\d+)?)/);
    const score = match ? parseFloat(match[1]) : 0.0;

    // Keep a copy of the repo at the scored commit, so the exact code (and any
    // trained model) behind a score survives later pushes or the repo being deleted
    let snapshotUrl: string | null = null;
    try {
      snapshotUrl = await snapshotSubmission(octokit, {
        projectId: project.id,
        repo: repository.full_name,
        sha: workflow.head_sha,
      });
    } catch (error) {
      // Still record the score, just without a snapshot
      console.error("Error snapshotting submission:", error);
    }

    // The collaborators are the team; null keeps its members if GitHub can't say
    let collaborators: string[] | null = null;
    try {
      collaborators = await listCollaborators(octokit, {
        owner: repository.owner.login,
        name: repository.name,
        ownerType: repository.owner.type,
        ownerId: repository.owner.id,
      });
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }

    const { repositoryId } = await recordRepository({
      projectId: project.id,
      githubRepoId: repository.id,
      fullName: repository.full_name,
      ownerGithubUserId: String(repository.owner.id),
      collaborators,
    });

    await recordSubmission({
      repositoryId,
      commitHash: workflow.head_sha,
      score,
      snapshotUrl,
      submittedAt: new Date(workflow.created_at),
    });
  } catch (error) {
    console.error("Error processing submission:", error);
  }
});

gh.webhooks.on("ping", async ({ id }) => {
  console.log(`Webhook ping received (${id})`)
});

gh.webhooks.onError((error) => {
  console.error("Webhook error:", error);
});

export const POST: APIRoute = async ({ request }) => {
  const id = request.headers.get("X-GitHub-Delivery");
  const name = request.headers.get("X-GitHub-Event") as WebhookEventName;
  const signature = request.headers.get("X-Hub-Signature-256");

  if (!id || !name || !signature) {
    console.error("Missing required GitHub headers");
    return new Response("Missing required headers", { status: 400 });
  }

  try {
    const payload = await request.text();
    await gh.webhooks.verifyAndReceive({ id, name, payload, signature });

    return new Response("OK", { status: 200 });

  } catch (error) {
    // TODO: process invalid sig with 401 status code
    return new Response(
      "Error processing webhook, possibly invalid signature?",
      { status: 500 }
    );
  }
};
