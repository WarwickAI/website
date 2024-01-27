// Google Calendar API for loading events into FullCalendar.
// TODO(JakubCzarlinski): Remove this.

import { loadEvents } from "../../calendar/google_api";

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(request: Request) {
  // Loads events from Google Calendar API and displays them in a calendar.
  const result = await loadEvents();
  return Response.json(result);
}
