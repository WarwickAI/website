// FullCalendar API
"use client";

import { EventInput } from "@fullcalendar/core/index.js";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";

export default function Calendar(props: { events: EventInput[] }) {
  return (
    <FullCalendar
      noEventsClassNames={["w-full h-full p-4"]}
      viewClassNames={[
        "shadow-lg bg-pure-white font-mono text-wai-gray border-4 rounded-lg border-wai-gray",
      ]}
      plugins={[listPlugin]}
      initialView="list"
      events={props.events}
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
}
