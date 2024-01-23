// FullCalendar API
"use client";

import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";

import React from "react";

const Calendar = () => {
  return (
    <FullCalendar
      noEventsClassNames={["w-full h-full p-4"]}
      viewClassNames={[
        "shadow-lg bg-pure-white font-mono text-wai-gray border-4 rounded-lg border-wai-gray",
      ]}
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
