import { EventSimple, ParseSimpleEvents } from "@/classes/event";
import comingSoon from "@/components/coming_soon";
import defaultPage from "@/components/default";
import EventsDualPage from "@/components/events_dual_page";

export default async function Home() {
  const pageEnabled: boolean = false;

  if (!pageEnabled) {
    return comingSoon();
  }

  // Calendar of the course... IDK if this is an even worse way of doing it but like... No more redundant data! :D
  const events_simple: EventSimple[] = [
    {
      title: "What are the social and ethical risks of advanced AI systems?",
      description: "A test description",
      pictureUrl: "/images/ai_safety/social_ethical_risks.webp",
      simpleDate: "TBD",
      location: "TBD",
      dates: [
        {
          start: "2024-10-14T17:00:00Z",
          end: "2024-10-14T19:00:00Z",
        },
        {
          start: "2024-10-17T17:00:00Z",
          end: "2024-10-17T19:00:00Z",
        },
      ],
    },
    {
      title: "Could AI reach and even surpass human-level capabilities?",
      description: "A test description",
      pictureUrl: "/images/ai_safety/ai_surpass_humans.webp",
      simpleDate: "TBD",
      location: "TBD",
      dates: [
        {
          start: "2024-10-21T17:00:00Z",
          end: "2024-10-21T19:00:00Z",
        },
      ],
    },
  ];

  // The <> is required. I do not know why, and I am scared to question why.
  return defaultPage(
    <>
      <EventsDualPage
        pageTitle={"AI Safety"}
        pageSubtitle={
          "Here are the FREE AI Safety events we are running! We hope to see you there!"
        }
        events={ParseSimpleEvents(events_simple)}
      />
    </>,
  );
}
