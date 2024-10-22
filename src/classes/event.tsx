import { CalendarEvent } from "@/components/calendar/list_calendar";

export interface DateCouples {
  start: string;
  end: string;
}

export interface EventSimple {
  title: string;
  description: string;
  dates: DateCouples[];
  pictureUrl: string;
  simpleDate: string;
  location: string;
}

export interface Event {
  event: CalendarEvent[];
  pictureUrl: string;
  simpleDate: string;
}

export function ParseSimpleEvents(events: EventSimple[]): Event[] {
  let id = 1;
  const parsedEvents: Event[] = [];

  // I am sad to see the map's go, but here are your nested loops <3
  for (const event of events) {
    const calendarEvents: CalendarEvent[] = [];

    for (const date of event.dates) {
      calendarEvents.push({
        id: (id++).toString(),
        title: event.title,
        start: date.start,
        end: date.end,
        location: event.location,
        url: undefined,
        description: event.description,
      });
    }

    parsedEvents.push({
      event: calendarEvents,
      pictureUrl: event.pictureUrl,
      simpleDate: event.simpleDate,
    });
  }

  return parsedEvents;
}

//
// const complexEvents: Event[] = [];

// events.forEach((event) => {

//     const calendarEvent: CalendarEvent = {};
// })
