import defaultPage from "@/components/default";
import { Event } from "@/classes/event";
import EventsDualPage from "@/components/events_dual_page";


export default async function Home() {
    // Calendar of the course events
    const events: Event[] = [
        {
            event: [{
                id: "1",
                title: "What are the social and ethical risks of advanced AI systems?",
                description: "A test description",
                start: "2024-10-14T17:00:00Z",
                end: "2024-10-14T19:00:00Z",
                location: "TBD",
            }
            ],
            pictureUrl: "/images/ai_safety/social_ethical_risks.webp",
            simpleDate: "Term 1 Week 3"
        },
        {
            event: [{
                id: "2",
                title: "Could AI reach and even surpass human-level capabilities?",
                description: "A test description2",
                start: "2024-10-21T17:00:00Z",
                end: "2024-10-21T19:00:00Z",
                location: "TBD",
            }
            ],
            pictureUrl: "/images/ai_safety/ai_surpass_humans.webp",
            simpleDate: "Term 1 Week 4"
        }
    ];

    // The <> is required. I do not know why, and I am scared to question why.
    return defaultPage(
        <>
            <EventsDualPage
                pageTitle={"AI Safety"}
                pageSubtitle={"Here are the FREE AI Safety events we are running! We hope to see you there!"}
                events={events}
            />
        </>,
    );
}

