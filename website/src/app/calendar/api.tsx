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
        viewClassNames={["w-full h-full"]}
        plugins={[googleCalendarPlugin, listPlugin]}
        initialView="list"
        // googleCalendarApiKey={apiKey}
        // events={{
        //   googleCalendarId: calendarId,
        // }}
        events={[
          { title: "IDK bro", date: "2023-10-28" },
          { title: "XSOC Python Course", date: "2023-10-29" },
          {
            title: "Code Night",
            start: "2023-10-29T14:30",
            end: "2023-10-28T17:30",
          },
        ]}
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
