// Google Calendar API for loading events into FullCalendar.
//
// We use the google calendar API on the server side to hide API keys.
// FullCalendar is a client side library, and forces the use of "use client".
// This exposes the API key to the client when using their google calendar API.

import { calendar_v3 } from "@googleapis/calendar";
import { google } from "googleapis";
import React from "react";
import Calendar from "./full_calendar_api";

const apiKey = process.env.GOOGLE_CAL_API_KEY || "FAKE_KEY";
const calendarId = process.env.GOOGLE_CAL_ID || "FAKE_ID";
const google_calendar = google.calendar({ version: "v3", auth: apiKey });

// We rate limit the calendar API to 1 new request every minute.
var lastUpdated = new Date();
const rateLimitMinutes = 1;
lastUpdated.setFullYear(1970);

var events = loadEvents();

function Events() {
  loadEvents();
  return (
    <div>
      <Calendar events={events} />
    </div>
  );
}

export default Events;

async function loadEvents () {
  // Loads events from Google Calendar API with a rate limit.

  // If we've already loaded events in the last minute, return the cached events.
  const now = new Date();
  const diff = now.getTime() - lastUpdated.getTime();
  const diffMinutes = Math.floor(diff / 60000);

  console.log("diffMinutes: " + diffMinutes);
  if (diffMinutes < rateLimitMinutes) return events;

  lastUpdated = now;

  console.log("Loading events from Google Calendar API.");

  // Otherwise, load events from Google Calendar API.
  const response = await getEventsFromGoogle();
  if (!response) return console.log("No response from API.");
  if (response.status !== 200) {
    return console.log("API returned status code: " + response.status);
  }
  if (!response.data.items) return console.log("No upcoming events found.");

  const google_calendar_events = response.data.items;
  if (google_calendar_events.length) {
    events = converListToFullCalendarEvents(google_calendar_events);
  }
}


async function getEventsFromGoogle() {
  const timeMin = new Date();
  const timeMax = new Date();
  console.log(apiKey);
  console.log(calendarId);
  timeMax.setDate(timeMax.getDate() + 7);

  return google_calendar.events.list({
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

  const fullCalendarEvent = {
    id: googleCalendarEvent.id,
    title: googleCalendarEvent.summary,
    start: googleCalendarEvent.start.dateTime,
    end: googleCalendarEvent.end.dateTime,
    url: googleCalendarEvent.htmlLink,
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
) {
  // Converts a list of events.
  const fullCalendarEvents = googleCalendarEvents.map((event) =>
    convertGoogleToFullCalendarEvent(event)
  );
  return fullCalendarEvents;
}
