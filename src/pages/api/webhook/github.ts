import type { APIRoute } from "astro";
import type {
  WebhookEventName,
  InstallationCreatedEvent,
  InstallationDeletedEvent,
  WorkflowRunCompletedEvent,
} from "@octokit/webhooks-types";
import {
  db,
  eq,
  and,
  Account,
  Project,
  Submission,
  Contribution,
} from "astro:db";
import { App } from "octokit";
import { randomUUID } from "crypto";

export const prerender = false;

const gh = new App({
  appId: import.meta.env.GITHUB_APP_ID,
  privateKey: import.meta.env.GITHUB_APP_PRIVATE_KEY,
  webhooks: {
    secret: import.meta.env.GITHUB_WEBHOOK_SECRET,
  },
});

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

    const templateRepo = (await octokit.rest.repos.get({
      owner: repository.owner.login,
      repo: repository.name
    })).data.template_repository;
    if (!templateRepo) return;

    const project = await db.select()
      .from(Project)
      .where(eq(Project.templateRepo, templateRepo.full_name))
      .get();
    if (!project) return;

    const existing = await db.select()
      .from(Submission)
      .where(eq(Submission.commitHash, workflow.head_sha))
      .get();
    if (existing) return;

    // TODO: Block early and late submissions

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

    const match = logs.match(/\*\*Score\*\*:\s*(\d+(?:\.\d+)?)/);
    const score = match ? parseFloat(match[1]) : 0.0;
    const submissionId = randomUUID();

    await db.insert(Submission).values({
      id: submissionId,
      projectId: project.id,
      score: score,
      submissionRepo: repository.full_name,
      commitHash: workflow.head_sha,
      submittedAt: new Date(workflow.created_at),
    });

    try {
      const contributors = await octokit.rest.repos.listContributors({
        owner: repository.owner.login,
        repo: repository.name
      });

      for (const contributor of contributors.data) {
        if (!contributor.id) continue;

        // Check if user is authed on WAI site with GitHub
        const account = await db.select()
          .from(Account)
          .where(and(
            eq(Account.providerId, "github"),
            eq(Account.accountId, contributor.id.toString())
          ))
          .get();

        await db.insert(Contribution).values({
          id: randomUUID(),
          submissionId: submissionId,
          userId: account?.userId || null,
          githubUserId: contributor.id,
          commitCount: contributor.contributions,
          detectedAt: new Date(),
          linkedAt: account ? new Date() : null,
        });
      }
    } catch (error) {
      console.error("Error fetching contributors:", error);

      // Fallback: credit repo owner
      await db.insert(Contribution).values({
        id: randomUUID(),
        submissionId: submissionId,
        userId: null,
        githubUserId: repository.owner.id,
        commitCount: 1,
        detectedAt: new Date(),
        linkedAt: null,
      });
    }
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

