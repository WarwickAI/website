import type { APIRoute } from "astro";
import type {
  WebhookEventName,
  InstallationCreatedEvent,
  InstallationDeletedEvent,
  InstallationSuspendEvent,
  InstallationUnsuspendEvent,
  WorkflowRunCompletedEvent,
  WorkflowRunRequestedEvent,
  WorkflowRunInProgressEvent
} from "@octokit/webhooks-types";
import { App } from "octokit";

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

  console.log(`${installPayload.installation.account.login} has installed the app on ${(new Array(installPayload.repositories)).toString()}`);

  // Update db here
});

gh.webhooks.on("installation.deleted", async ({ payload }) => {
  const uninstallPayload = payload as InstallationDeletedEvent;

  console.log(`${uninstallPayload.installation.account.login} has uninstalled`)

  // update db here
});

gh.webhooks.on("installation.suspend", async ({ payload }) => {
  const suspendPayload = payload as InstallationSuspendEvent;

  console.log(`${suspendPayload.installation.account.login} has suspended`)

  // update db here
});

gh.webhooks.on("installation.unsuspend", async ({ payload }) => {
  const unsuspendPayload = payload as InstallationUnsuspendEvent;

  console.log(`${unsuspendPayload.installation.account.login} has unsuspended`)

  // update db here
});

gh.webhooks.on("workflow_run.requested", async ({ payload }) => {
  const workflowPayload = payload as WorkflowRunRequestedEvent;
  console.log(`${workflowPayload.repository.full_name} has scheduled a workflow run`)
});

gh.webhooks.on("workflow_run.in_progress", async ({ payload }) => {
  const workflowPayload = payload as WorkflowRunInProgressEvent;
  console.log(`${workflowPayload.repository.full_name}'s workflow is in progress`)
});

gh.webhooks.on("workflow_run.completed", async ({ payload }) => {
  const workflowPayload = payload as WorkflowRunCompletedEvent;
  console.log(`${workflowPayload.repository.full_name}'s workflow has finished`)

  switch (workflowPayload.workflow_run.conclusion) {
    case 'success':
      console.log(`  Workflow succeeded`);
      break;
    case 'failure':
      console.log(`  Workflow failed`);
      break;
    case 'cancelled':
      console.log(`  Workflow was cancelled`);
      break;
  }

  // update db
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

