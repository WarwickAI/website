import { CalendarEvent } from "@/components/calendar/list_calendar";
import { GaxiosPromise, calendar_v3 } from "@googleapis/calendar";
import { google } from "googleapis";

const apiKey = process.env.GOOGLE_CAL_API_KEY || "FAKE_KEY";
const calendarId = process.env.GOOGLE_CAL_ID || "FAKE_ID";
const googleCalendar = google.calendar({ version: "v3", auth: apiKey });

// For timezone fandangling
const moment = require('moment-timezone');

// Refresh events every 5 minutes minus 10 seconds to never force a user to wait.
var lastUpdated = new Date();
const rateLimitMinutes = 5;
lastUpdated.setFullYear(1970); // Force a refresh on first load.
var events: CalendarEvent[] = [];
setInterval(forceLoadEvents, 60000 * rateLimitMinutes - 10000);

export async function loadEvents(): Promise<CalendarEvent[]> {
  // Loads events from Google Calendar API with a cache/rate limit.
  const now = new Date();
  const diff = now.getTime() - lastUpdated.getTime();
  const diffMinutes = Math.floor(diff / 60000);
  if (diffMinutes < rateLimitMinutes) {
    // Cache hit.
    console.log("Returning cached events.");
    return events;
  }

  const result = await forceLoadEvents();
  return result;
}

async function forceLoadEvents(): Promise<CalendarEvent[]> {
  console.log("Loading events from Google Calendar API.");
  const response = await getEventsFromGoogle();

  if (response.status !== 200) {
    console.log("API returned status code: " + response.status);
    events = [];
    return events;
  }

  lastUpdated = new Date();
  if (!response.data.items || response.data.items.length === 0) {
    console.log("No upcoming events found.");
    events = [];
    return events;
  }

  events = convertToCalendarEvents(response.data.items);
  return events;
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
  });
}

function convertGoogleToFullCalendarEvent(
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

  // Beware, timezones exist :) 
  return {
    id: googleCalendarEvent.id,
    title: googleCalendarEvent.summary || "",
    start: googleCalendarEvent.start.dateTime || "",
    end: googleCalendarEvent.end.dateTime || "",
    url: googleCalendarEvent.htmlLink || undefined,
    location: googleCalendarEvent.location || undefined,
    description: googleCalendarEvent.description || undefined,
  };
}

function convertToCalendarEvents(
  googleCalendarEvents: calendar_v3.Schema$Event[],
): CalendarEvent[] {
  // Converts a list of events.
  const fullCalendarEvents = googleCalendarEvents.map((event) =>
    convertGoogleToFullCalendarEvent(event),
  );

  return fullCalendarEvents;
}
