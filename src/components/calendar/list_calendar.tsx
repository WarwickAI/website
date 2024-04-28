// A calendar that displays events as a list grouped by day.

import Link from "next/link";

const moment = require('moment-timezone');

export type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO 8601 string
  end: string; // ISO 8601 string
  url?: string; // URL to the event
  location?: string; // Location of the event
  description?: string; // Description of the event
};

export default function ListCalendar(props: {
  events: CalendarEvent[];
  enableLocation: boolean;
  enableLinks: boolean;
  currentTime?: number;
}) {
  // A calendar that displays events as a list grouped by day.
  //
  // The list is displayed in a single column.
  if (props.events.length === 0) {
    return (
      <div className="h-full w-full rounded-lg border-4 border-wai-gray bg-pure-white p-4 text-center font-mono text-wai-gray shadow-lg">
        <p className="text-lg">
          Join our discord to find out more about upcoming events.
        </p>
      </div>
    );
  }
  const sortedEvents = sortEventsByDate(props.events);
  return generateList(
    sortedEvents,
    props.enableLocation,
    props.enableLinks,
    props.currentTime,
  );
}

function sortEventsByDate(events: CalendarEvent[]): CalendarEvent[] {
  // Sorts ISO 8601 date strings in ascending order.
  return events.sort((a, b) => {
    return a.start.localeCompare(b.start);
  });
}

function generateList(
  events: CalendarEvent[],
  enableLocation: boolean,
  enableLinks: boolean,
  currentTime?: number,
): JSX.Element {
  // Generate a 1 column table of events, grouped by day.
  let lastDate = "";
  const elements: JSX.Element[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const isLast = i === events.length - 1;

    // Handle the date and time using moment-timezone. 
    const startDate = moment.tz(event.start, "Europe/London");
    const endDate = moment.tz(event.end, "Europe/London");
    const startDateString = startDate.format("LL");

    const startTimeString = startDate.format('h:mma');
    const endTimeString = endDate.format('h:mma');

    // Check if the event is currently happening.
    const isCurrentEvent =
      currentTime !== undefined &&
      startDate.valueOf() < currentTime &&
      endDate.valueOf() > currentTime;
    const currentEventStyle = isCurrentEvent ? "bg-lavender bg-opacity-50" : "";

    // Check if we need to make a new header for the date.
    if (startDateString !== lastDate) {
      elements.push(
        <div
          key={startDateString}
          className="w-fill border-b border-wai-gray border-opacity-25 bg-wai-gray bg-opacity-10 p-2"
        >
          <h2 className="pl-2 text-start font-bold">{startDateString}</h2>
        </div>,
      );
      lastDate = startDateString;
    }
    const border = isLast ? "" : "border-b border-wai-gray border-opacity-25";
    if (enableLinks) {
      elements.push(
        <Link
          href={event.url || ""}
          key={event.id}
          className="group"
          aria-label={event.title}
        >
          <div
            className={`group grid grid-cols-9 pb-2 pt-2 hover:bg-purple hover:bg-opacity-50  ${border} ${currentEventStyle}`}
          >
            <div className="col-span-4 pl-4 text-start">
              <p>{`${startTimeString} - ${endTimeString}`}</p>
              <p>{enableLocation ? ` @ ${event.location}` : ""}</p>
            </div>

            <div className="col-span-1 inline-block h-3 w-3 place-self-center rounded-full bg-purple bg-opacity-95"></div>

            <p className="col-span-4 pr-4 text-start group-hover:underline">
              {event.title}
            </p>
          </div>
        </Link>,
      );
    } else {
      // No links or hover effects to indicate that the events are not
      // clickable.
      elements.push(
        <div key={event.id}>
          {" "}
          <div
            className={`grid grid-cols-9 pb-2 pt-2 ${border} ${currentEventStyle}`}
          >
            <div className="col-span-4 pl-4 text-start">
              <p>{`${startTimeString} - ${endTimeString}`}</p>
              <p>{enableLocation ? ` @ ${event.location}` : ""}</p>
            </div>

            <div className="col-span-1 inline-block h-3 w-3 place-self-center rounded-full bg-purple bg-opacity-95"></div>

            <p className="col-span-4 pr-4 text-start">{event.title}</p>
          </div>
        </div>,
      );
    }
  }
  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-wai-gray border-opacity-25 bg-pure-white text-center font-mono text-sm text-wai-gray shadow-lg md:text-base">
      {elements}
    </div>
  );
}
