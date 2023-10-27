"use client";

import googleCalendarPlugin from "@fullcalendar/google-calendar";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";

import React from "react";

// TODO(czarlinski): Replace with env var.
const apiKey = "API_KEY";
const calendarId = "CALENDAR_ID";

// TODO(czarlinski): Style the calendar.
export default class Calendar extends React.Component {
  render() {
    return (
      <FullCalendar
        plugins={[googleCalendarPlugin, listPlugin]}
        initialView="listWeek"
        googleCalendarApiKey={apiKey}
        events={{
          googleCalendarId: calendarId,
        }}
      />
    );
  }
}
