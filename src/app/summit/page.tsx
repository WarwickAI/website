// Summit details and ticket purchase page.

import BackButton from "@/components/back_button";
import Button from "@/components/button";
import ListCalendar, {
  CalendarEvent,
} from "@/components/calendar/list_calendar";
import defaultPage from "@/components/default";
import Notice from "@/components/notice";
import RainbowText from "@/components/rainbow_text";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Home() {
  const enablePage = true;
  if (!enablePage) {
    return defaultPage(
      <div>
        <Button
          enabled={true}
          href="https://www.warwicksu.com/venues-events/events/57846/25060/"
          text={
            "Summit details for academic year 2024/2025 are not currently available\n\nClick here to see what we did in 2024!"
          }
        />
        <BackButton />
      </div>,
    );
  }


  // Summit events
  const currentTime = Date.now();
  const events: CalendarEvent[] = [
    // Saturday
    {
      id: "1",
      title: "Image Generation Workshop, WAI",
      start: "2025-02-08T10:30:00Z",
      end: "2025-02-08T11:20:00Z",
      location: "FAB0.08",
    },
    {
      id: "2",
      title: "The Quantum Revolution, Mohamed Elagamy, IBM",
      start: "2025-02-08T11:30:00Z",
      end: "2025-02-08T12:20:00Z",
      location: "FAB0.08",
    },
    {
      id: "3",
      title: "Why We Shouldn't Expect Explosive Growth from AI, Ollie Jaffe, OpenAI",
      start: "2025-02-08T12:30:00Z",
      end: "2025-02-08T13:20:00Z",
      location: "FAB0.08",
    },
    {
      id: "4",
      title: "AI Safety Discussion Panel, WAI",
      start: "2025-02-08T14:00:00Z",
      end: "2025-02-08T14:50:00Z",
      location: "FAB0.08",
    },
    {
      id: "5",
      title: "Language Learning with Gen AI, Matt Wilson, British Council",
      start: "2025-02-08T15:00:00Z",
      end: "2025-02-08T15:50:00Z",
      location: "FAB0.08",
    },
    {
      id: "6",
      title: "Project Presentations, WAI",
      start: "2025-02-08T16:00:00Z",
      end: "2025-02-08T16:50:00Z",
      location: "FAB0.08",
    },
    {
      id: "7",
      title: "VIP Networking Drinks",
      start: "2025-02-08T19:00:00Z",
      end: "2025-02-08T21:00:00Z",
      location: "Chancellors Suite, Rootes Building",
    },
    // Sunday
    {
      id: "8",
      title: "DCS Contribution, Long Tran-Thanh, DCS",
      start: "2025-02-09T10:30:00Z",
      end: "2025-02-09T11:20:00Z",
      location: "FAB0.08",
    },
    {
      id: "9",
      title: "How AI Transforms Business, Connor Mattinson, TRUSS",
      start: "2025-02-09T11:30:00Z",
      end: "2025-02-09T12:20:00Z",
      location: "FAB0.08",
    },
    {
      id: "10",
      title: "The Future is Open, Paul Squires, IBM",
      start: "2025-02-09T12:30:00Z",
      end: "2025-02-09T13:20:00Z",
      location: "FAB0.08",
    },
    {
      id: "11",
      title: "Founding a Startup in an AI Boom, TRUSS",
      start: "2025-02-09T14:00:00Z",
      end: "2025-02-09T14:50:00Z",
      location: "FAB0.08",
    },
    {
      id: "12",
      title: "AI Transformations of Business Technology, Louis Samuel, 4MC Partners",
      start: "2025-02-09T15:00:00Z",
      end: "2025-02-09T15:50:00Z",
      location: "FAB0.08",
    },
    {
      id: "13",
      title: "Cybersecurity in an Artificially Intelligent World, WAI",
      start: "2025-02-09T16:00:00Z",
      end: "2025-02-09T16:50:00Z",
      location: "FAB0.08",
    },
  ];



  return defaultPage(
    <div>
      <div className="pt-6">
        <RainbowText extraClasses="text-center font-mono text-6xl font-bold">
          WAI Summit 2025
        </RainbowText>
        <h2 className="text-center font-mono text-2xl font-bold text-wai-gray">
          8th, 9th February 2025
        </h2>
      </div>

      <div className="grid grid-cols-1 place-content-start gap-4 p-1 pb-8 lg:grid-cols-2 lg:gap-4 lg:p-2">
        <div className="m-auto flex flex-col max-w-2xl rounded-lg border-4 border-wai-gray bg-pure-white p-3 shadow-sm shadow-wai-gray md:p-4 mt-0">
          <p className="font-mono text-sm text-wai-gray md:text-base">
            Artificial Intelligence is one of the biggest technological advances
            in recent years, underpinning development such as self-driving cars,
            image generation and ChatGPT! Whether you're a machine learning expert
            or just getting started, this Summit will give you the opportunity to
            learn about AI's industry applications, get hands-on with cutting-edge
            models and discuss the safety implications of superintelligent machines!
            There will also be plenty of opportunities to network and make connections.

            <br />
            <br />

            This event will take place in the FAB on the 8th and 9th February, with
            talks, workshops and discussion panels happening from 10:30am to 5pm, with
            our Summit VIP Networking Drinks taking place in the Chancellors Suite in
            the evening on the 8th! A free standard ticket will give you access to all
            our talks during Saturday and Sunday as well as free food and drinks. Buying
            a VIP ticket will give you access to the VIP Networking event where you can
            meet and network with other students interested in AI. There will also be
            a static exhibition of AI research and projects in the FAB lobby throughout
            the event.

            <br />
            <br />

            See you there! 🚀
          </p>
          <Button
            enabled={true}
            text="Summit Tickets"
            href="https://www.warwicksu.com/venues-events/events/57846/26607/"
            ariaLabel="Buy summit tickets!"
            extraClasses="h-fit m-2"
          />
        </div>

        <div className="m-auto flex flex-col max-w-2xl h-full">
          <ListCalendar
            events={events}
            enableLinks={false}
            enableLocation={true}
            currentTime={currentTime}
          />
        </div>
      </div>
    </div >
  );
}
