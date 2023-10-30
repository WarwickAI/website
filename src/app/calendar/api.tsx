"use client";

import googleCalendarPlugin from "@fullcalendar/google-calendar";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";

import React from "react";

const apiKey = process.env.GOOGLE_CAL_API_KEY || "FAKE_KEY";
const calendarId = process.env.GOOGLE_CALENDAR_ID || "FAKE_ID";

export default class Calendar extends React.Component {
  render() {
    return (
      <FullCalendar
        viewClassNames={["w-full h-full"]}
        plugins={[googleCalendarPlugin, listPlugin]}
        initialView="list"
        googleCalendarApiKey={apiKey}
        events={{
          googleCalendarId: calendarId,
        }}
        noEventsContent={function () {
          return (
            <div className="text-center">
              <p className="text-lg">
                Looks like we're busy taking a break right now.
                <br />
                <br />
                See you soon :)
              </p>
            </div>
          );
        }}
        allDayText="All-day"
        duration={{ days: 7 }}
        headerToolbar={false}
        height="auto"
        eventColor="#6D60C1"
      />
    );
  }
}
