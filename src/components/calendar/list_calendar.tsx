// A calendar that displays events as a list grouped by day.

import Link from "next/link";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO 8601 string
  end: string; // ISO 8601 string
  url?: string; // URL to the event
  location?: string; // Location of the event
  description?: string; // Description of the event
};

export default function ListCalendar(props: { events: CalendarEvent[] }) {
  // A calendar that displays events as a list grouped by day.
  //
  // The list is displayed in a single column.
  if (props.events.length === 0) {
    return (
      <div className="h-full w-full rounded-lg border-4 border-wai-gray bg-pure-white p-4 text-center font-mono text-wai-gray shadow-lg">
        <p className="text-lg">
          Join our discord to find our more about upcoming events.
        </p>
      </div>
    );
  }

  const sortedEvents = sortEventsByDate(props.events);
  return generateList(sortedEvents);
}

function sortEventsByDate(events: CalendarEvent[]): CalendarEvent[] {
  // Sorts ISO 8601 date strings in ascending order.
  return events.sort((a, b) => {
    return a.start.localeCompare(b.start);
  });
}

function generateList(events: CalendarEvent[]): JSX.Element {
  // Generate a 1 column table of events, grouped by day.
  let lastDate = "";
  const elements: JSX.Element[] = [];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const isLast = i === events.length - 1;
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const startDateString = startDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Make times in the format 9:00am - 12:00pm
    const startHours = startDate.getHours();
    const startMinutes = startDate.getMinutes().toString().padStart(2, "0");
    const startAmPm = startHours >= 12 ? "pm" : "am";
    const startHour = startHours % 12 || 12;

    const endHours = endDate.getHours();
    const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
    const endAmPm = endHours >= 12 ? "pm" : "am";
    const endHour = endHours % 12 || 12;

    const startTimeString = `${startHour}:${startMinutes}${startAmPm}`;
    const endTimeString = `${endHour}:${endMinutes}${endAmPm}`;

    // Check if we need to make a new header for the date.
    if (startDateString !== lastDate) {
      const date = new Date(event.start);
      const dateString = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      elements.push(
        <div
          key={dateString}
          className={`w-full border-b border-wai-gray border-opacity-25 bg-wai-gray bg-opacity-10 p-2`}
        >
          <h2 className="pl-2 text-start font-bold">{dateString}</h2>
        </div>,
      );
      lastDate = startDateString;
    }
    const border = isLast ? "" : "border-b border-wai-gray border-opacity-25";
    elements.push(
      <Link href={event.url || ""} key={event.id}>
        <div
          className={`grid grid-cols-9 pb-2 pt-2 hover:bg-purple hover:bg-opacity-50 ${border} group`}
        >
          <p className="col-span-4 pl-4  text-start">
            {`${startTimeString} - ${endTimeString}`}
          </p>

          <div className="col-span-1 inline-block h-3 w-3 place-self-center rounded-full bg-purple bg-opacity-95"></div>

          <p className={"col-span-4 pr-4 text-start group-hover:underline"}>
            {event.title}
          </p>
        </div>
      </Link>,
    );
  }

  return (
    <div className="grid-1 h-full w-full overflow-hidden rounded-lg border border-wai-gray border-opacity-25 bg-pure-white text-center font-mono text-wai-gray shadow-lg">
      {elements}
    </div>
  );
}
