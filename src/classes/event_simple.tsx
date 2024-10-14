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

    return events.map((event) => {
        // I am allergic to good code.
        return {
            event: event.dates.map((date) => {
                const calenderEvent: CalendarEvent = {
                    id: (id++).toString(),
                    title: event.title,
                    start: date.start,
                    end: date.end,
                    location: event.location,
                    url: undefined,
                    description: event.description
                }
                return calenderEvent;
            }),
            pictureUrl: event.pictureUrl,
            simpleDate: event.simpleDate,
        };
    });
}


