// Google Calendar API for loading events into FullCalendar.

import { DateInput, EventInput } from "@fullcalendar/core/index.js";
import { calendar_v3 } from "@googleapis/calendar";
import { google } from "googleapis";

const apiKey = process.env.GOOGLE_CAL_API_KEY || "FAKE_KEY";
const calendarId = process.env.GOOGLE_CAL_ID || "FAKE_ID";
const googleCalendar = google.calendar({ version: "v3", auth: apiKey });

// We rate limit the calendar API to 1 new request every minute.
var lastUpdated = new Date();
const rateLimitMinutes = 5;
lastUpdated.setFullYear(1970); // Force a refresh on first load.

var events: EventInput[];

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(_: Request) {
  // Loads events from Google Calendar API and displays them in a calendar.
  await loadEvents();
  return new Response(JSON.stringify(events), {
    headers: { "content-type": "application/json" },
  });
}

async function loadEvents() {
  // Loads events from Google Calendar API with a rate limit.

  // If we've already loaded events in the last 5 minutes, return the cached events.
  const now = new Date();
  const diff = now.getTime() - lastUpdated.getTime();
  const diffMinutes = Math.floor(diff / 60000);
  if (diffMinutes < rateLimitMinutes) {
    // Cache hit.
    return console.log("Returning cached events.");
  }
  lastUpdated = now;

  // Otherwise, load events from Google Calendar API.
  console.log("Loading events from Google Calendar API.");
  const response = await getEventsFromGoogle();
  if (!response) {
    return console.log("No response from API.");
  }
  if (response.status !== 200) {
    return console.log("API returned status code: " + response.status);
  }
  if (!response.data.items) {
    return console.log("No upcoming events found.");
  }

  const googleCalendarEvents = response.data.items;
  if (googleCalendarEvents.length) {
    events = converListToFullCalendarEvents(googleCalendarEvents);
    return events;
  } else {
    return console.log("No upcoming events found.");
  }
}

async function getEventsFromGoogle() {
  const timeMin = new Date();
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 7);
  return googleCalendar.events.list({
    calendarId: calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    maxResults: 150,
  });
}

function convertGoogleToFullCalendarEvent(
  googleCalendarEvent: calendar_v3.Schema$Event
) {
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

  const start: DateInput = googleCalendarEvent.start.dateTime || "";
  const end: DateInput = googleCalendarEvent.end.dateTime || "";
  const title: string = googleCalendarEvent.summary || "";
  const url = googleCalendarEvent.htmlLink || undefined;

  const fullCalendarEvent = {
    id: googleCalendarEvent.id,
    title: title,
    start: start,
    end: end,
    url: url,
    extendedProps: {
      description: googleCalendarEvent.description,
      location: googleCalendarEvent.location,
    },
    description: googleCalendarEvent.description,
  };
  return fullCalendarEvent;
}

function converListToFullCalendarEvents(
  googleCalendarEvents: calendar_v3.Schema$Event[]
): EventInput[] {
  // Converts a list of events.
  const fullCalendarEvents = googleCalendarEvents.map((event) =>
    convertGoogleToFullCalendarEvent(event)
  );
  return fullCalendarEvents;
}
