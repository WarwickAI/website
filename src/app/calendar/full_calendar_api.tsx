// FullCalendar API
"use client";

import { EventSourceInput } from "@fullcalendar/core/index.js";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";

import React from "react";

const Calendar = (events: EventSourceInput ) => {
  return (
    <FullCalendar
      viewClassNames={["w-full h-full"]}
      plugins={[listPlugin]}
      initialView="list"
      events={events}
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
};

export default Calendar;
