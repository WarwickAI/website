// API that returns a flag to indicate if a new submission have been made since
// the last time the cloudflare KV store was checked.

const WAI_KV_CLEAR_API_TOKEN =
  process.env.WAI_KV_CLEAR_API_TOKEN || "FAKE_WAI_KV_CLEAR_API_TOKEN";

var newSubmissionsExist: boolean = false;

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(request: Request) {
  // Returns the value of the flag.
  return new Response(newSubmissionsExist.toString(), { status: 200 });
}

export async function DELETE(request: Request) {
  // Clear the value if the bearer token is correct.
  if (!isAuth(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  newSubmissionsExist = false;
  return new Response("Cleared", { status: 200 });
}

export async function PUT(request: Request) {
  // Set the value if the bearer token is correct.
  if (!isAuth(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  newSubmissionsExist = true;
  return new Response("Set", { status: 200 });
}

function isAuth(request: Request) {
  return (
    request.headers.get("Authorization") === `Bearer ${WAI_KV_CLEAR_API_TOKEN}`
  );
}
