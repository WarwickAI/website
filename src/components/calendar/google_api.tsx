import { CalendarEvent } from "@/components/calendar/list_calendar";
import { GaxiosPromise, calendar_v3 } from "@googleapis/calendar";
import { google } from "googleapis";

const apiKey = process.env.GOOGLE_CAL_API_KEY || "FAKE_KEY";
const calendarId = process.env.GOOGLE_CAL_ID || "FAKE_ID";
const googleCalendar = google.calendar({ version: "v3", auth: apiKey });

// Refresh events every 5 minutes minus 10 seconds to never force a user to wait.
var lastUpdated = new Date();
const rateLimitMinutes = 5;
const refreshRate = 60000 * rateLimitMinutes - 10000;
if (refreshRate <= 0) {
  throw new Error("Rate limit is zero or negative.");
}

lastUpdated.setFullYear(1970); // Force a refresh on first load.
var events: CalendarEvent[] = [];
setInterval(forceLoadEvents, refreshRate);

export async function loadEvents(): Promise<CalendarEvent[]> {
  // Loads events from Google Calendar API with a cache/rate limit.
  const now = new Date();
  const diff = now.getTime() - lastUpdated.getTime();
  const diffMinutes = Math.floor(diff / 60000);
  if (diffMinutes < rateLimitMinutes) {
    // Cache hit.
    console.log("Returning cached events.");
    return events; // not actually a promise
  }

  if (events.length > 0) {
    // Cache miss, but we have events. Return them an update in the background
    // for next time.
    return forceLoadEvents().then((e) => (events = e));
  }
  return forceLoadEvents().then((e) => (events = e));
}

async function forceLoadEvents(): Promise<CalendarEvent[]> {
  console.log("Loading events from Google Calendar API.");
  return getEventsFromGoogle().then(async (response) => {
    const res = await response;
    if (res.status !== 200) {
      console.log("API returned status code: " + res.status);
      events = [];
      return events;
    }

    lastUpdated = new Date();
    const items = res.data.items;
    if (!items || items.length === 0) {
      console.log("No upcoming events found.");
      events = [];
      return events;
    }
    return convertToCalendarEvents(items);
  });
}

async function getEventsFromGoogle(): Promise<
  GaxiosPromise<calendar_v3.Schema$Events>
> {
  const timeMin = new Date();
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 14);
  return googleCalendar.events.list({
    calendarId: calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    maxResults: 10,
    fields: "items(start,end,summary,description,location,htmlLink,id)",
  });
}

function convertGoogleToCalendarEvent(
  googleCalendarEvent: calendar_v3.Schema$Event,
): CalendarEvent {
  // Converts a single event from the Google Calendar API to a FullCalendar API.
  if (!googleCalendarEvent.start) {
    throw new Error("No start time found on event.");
  }
  if (!googleCalendarEvent.end) {
    throw new Error("No end time found on event.");
  }
  if (!googleCalendarEvent.id) {
    throw new Error("No id found on event.");
  }

  const start = new Date(googleCalendarEvent.start.dateTime || "");
  const end = new Date(googleCalendarEvent.end.dateTime || "");

  // Shift the time by the timezone offset.
  const timezone = "Europe/London";
  const timeZonedStart = new Date(
    start.toLocaleString("en-US", { timeZone: timezone }),
  );
  const diff = timeZonedStart.getTime() - start.getTime();
  const shiftedStart = new Date(start.getTime() + diff);
  const shiftedEnd = new Date(end.getTime() + diff);

  return {
    id: googleCalendarEvent.id,
    title: googleCalendarEvent.summary || "",
    start: shiftedStart.toISOString() || "",
    end: shiftedEnd.toISOString() || "",
    url: googleCalendarEvent.htmlLink || undefined,
    location: googleCalendarEvent.location || undefined,
    description: googleCalendarEvent.description || undefined,
  };
}

function convertToCalendarEvents(
  googleCalendarEvents: calendar_v3.Schema$Event[],
): CalendarEvent[] {
  // Converts a list of events.
  const fullCalendarEvents = [];
  for (const event of googleCalendarEvents) {
    fullCalendarEvents.push(convertGoogleToCalendarEvent(event));
  }
  return fullCalendarEvents;
}
