import { CalendarEvent } from "@/components/calendar/list_calendar";
import { DateInput, EventInput } from "@fullcalendar/core/index.js";
import { GaxiosPromise, calendar_v3 } from "@googleapis/calendar";
import { google } from "googleapis";

const apiKey = process.env.GOOGLE_CAL_API_KEY || "FAKE_KEY";
const calendarId = process.env.GOOGLE_CAL_ID || "FAKE_ID";
const googleCalendar = google.calendar({ version: "v3", auth: apiKey });

// We rate limit the calendar API to 1 new request every minute.
var lastUpdated = new Date();
const rateLimitMinutes = 5;
lastUpdated.setFullYear(1970); // Force a refresh on first load.

// Refresh events every 5 minutes minus 10 seconds to never force a user to wait.
type FullCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  url: string | undefined;
  extendedProps: {
    description: string | null | undefined;
    location: string | null | undefined;
  };
  description: string | null | undefined;
};

var events: CalendarEvent[] = [];
setInterval(forceLoadEvents, 60000 * rateLimitMinutes - 10000);

export async function loadEvents(): Promise<CalendarEvent[]> {
  // Loads events from Google Calendar API with a rate limit.

  // If we've already loaded events in the last 5 minutes, return the cached events.
  const now = new Date();
  const diff = now.getTime() - lastUpdated.getTime();
  const diffMinutes = Math.floor(diff / 60000);
  if (diffMinutes < rateLimitMinutes) {
    // Cache hit.
    console.log("Returning cached events.");
    return events;
  }

  // Otherwise, load events from Google Calendar API.
  const result = await forceLoadEvents();
  return result;
}

async function forceLoadEvents(): Promise<CalendarEvent[]> {
  console.log("Loading events from Google Calendar API.");
  const response = await getEventsFromGoogle();
  if (!response) {
    console.log("No response from API.");
    events = [];
    return events;
  }
  if (response.status !== 200) {
    console.log("API returned status code: " + response.status);
    events = [];
    return events;
  }

  lastUpdated = new Date();
  if (!response.data.items) {
    console.log("No upcoming events found.");
    events = [];
    return events;
  }

  const googleCalendarEvents = response.data.items;
  if (googleCalendarEvents.length) {
    events = converListToFullCalendarEvents(googleCalendarEvents);
    return events;
  } else {
    console.log("No upcoming events found.");
    events = [];
    return events;
  }
}

async function getEventsFromGoogle(): Promise<
  GaxiosPromise<calendar_v3.Schema$Events>
> {
  const timeMin = new Date();
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 7);
  return googleCalendar.events.list({
    calendarId: calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    maxResults: 50,
  });
}

function convertGoogleToFullCalendarEvent(
  googleCalendarEvent: calendar_v3.Schema$Event
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
  const start: DateInput = googleCalendarEvent.start.dateTime || "";
  const end: DateInput = googleCalendarEvent.end.dateTime || "";
  const title: string = googleCalendarEvent.summary || "";
  const url = googleCalendarEvent.htmlLink || undefined;
  const location = googleCalendarEvent.location || undefined;
  const description = googleCalendarEvent.description || undefined;
  return {
    id: googleCalendarEvent.id,
    title: title,
    start: start,
    end: end,
    url: url,
    location: location,
    description: description,
  };
}

function converListToFullCalendarEvents(
  googleCalendarEvents: calendar_v3.Schema$Event[],
): CalendarEvent[] {
  // Converts a list of events.
  const fullCalendarEvents = googleCalendarEvents.map((event) =>
    convertGoogleToFullCalendarEvent(event)
  );
  return fullCalendarEvents;
}
