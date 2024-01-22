// FullCalendar API
"use client";

import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";

import React from "react";

const Calendar = () => {
  return (
    <FullCalendar
      viewClassNames={["w-full h-full"]}
      plugins={[listPlugin]}
      initialView="list"
      events={function (fetchInfo, successCallback, failureCallback) {
        // Fetches events from the API at /api.
        fetch("/api/calendar")
          .then(function (response) {
            return response.json();
          })
          .then(function (events) {
            successCallback(events);
          })
          .catch(function (error) {
            failureCallback(error);
          });
      }}
      noEventsContent={function () {
        return (
          <div className="text-center">
            <p className="text-lg">Loading...</p>
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
