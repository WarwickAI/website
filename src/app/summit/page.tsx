// Summit details and ticket purchase page.
// TODO(JakubCzarlinski): Remove after the event.

import Button from "@/components/button";
import ListCalendar, {
  CalendarEvent,
} from "@/components/calendar/list_calendar";
import defaultPage from "@/components/default";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Home() {
  const enablePage = true;
  if (!enablePage) {
    return redirect(
      "https://www.warwicksu.com/venues-events/events/57846/25060/",
    );
  }
  // Split the page into two columns.

  // Saturday 17th February 2024
  // Introduction from WAI Pres and VP 11am OC0.03
  // Competition Annoucements 11:30am OC0.03
  // Seeing the Unseen: Using CNNs for Image Steganalysis 12pm OC0.03
  // AI Safety Panel feat. Deepmind, UK Institute of AI Safety and Effecitve Altruism 1pm OC0.03
  // Creating an AI Startup by Truss Archive 2pm OC0.03
  // The AI Revolution: Ethics, Technology and Society by IATL 4pm OC0.03
  // Summit Code Night Social with Warwick GDSC 6pm OC0.02

  // Sunday:
  // AI and Blockchain Workshop by Encode Club 11am OC0.03
  // AI Speed Friending 12pm OC0.02
  // WAI Project Presentations 2pm OC0.03
  // AI, Politics and Disinformation 3pm OC0.03
  // Closing Remarks from WAI Pres 4pm OC0.03

  const currentTime = Date.now();
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Introduction from WAI Pres and VP",
      start: "2024-02-17T11:00:00Z",
      end: "2024-02-17T11:30:00Z",
      location: "OC0.03",
    },
    {
      id: "2",
      title: "Competition Annoucements",
      start: "2024-02-17T11:30:00Z",
      end: "2024-02-17T12:00:00Z",
      location: "OC0.03",
    },
    {
      id: "3",
      title: "Seeing the Unseen: Using CNNs for Image Steganalysis",
      start: "2024-02-17T12:00:00Z",
      end: "2024-02-17T13:00:00Z",
      location: "OC0.03",
    },
    {
      id: "4",
      title:
        "AI Safety Panel Discussion with Google DeepMind, Conjecture, Oxford University and Arcadia Impact",
      start: "2024-02-17T13:00:00Z",
      end: "2024-02-17T14:00:00Z",
      location: "OC0.03",
    },
    {
      id: "5",
      title: "Creating an AI Startup by Truss Archive",
      start: "2024-02-17T14:00:00Z",
      end: "2024-02-17T16:00:00Z",
      location: "OC0.03",
    },
    {
      id: "6",
      title: "The AI Revolution: Ethics, Technology and Society by IATL",
      start: "2024-02-17T16:00:00Z",
      end: "2024-02-17T18:00:00Z",
      location: "OC0.03",
    },
    {
      id: "7",
      title: "Summit CodeNight Social with Warwick GDSC",
      start: "2024-02-17T18:00:00Z",
      end: "2024-02-17T20:00:00Z",
      location: "OC0.02",
    },
    // Sunday
    {
      id: "8",
      title: "AI and Blockchain Workshop by Encode Club",
      start: "2024-02-18T11:00:00Z",
      end: "2024-02-18T12:00:00Z",
      location: "OC0.03",
    },
    {
      id: "9",
      title: "AI Speed Friending",
      start: "2024-02-18T12:00:00Z",
      end: "2024-02-18T14:00:00Z",
      location: "OC0.02",
    },
    {
      id: "10",
      title: "WAI Project Presentations",
      start: "2024-02-18T14:00:00Z",
      end: "2024-02-18T15:00:00Z",
      location: "OC0.03",
    },
    {
      id: "11",
      title: "AI, Politics and Disinformation",
      start: "2024-02-18T15:00:00Z",
      end: "2024-02-18T16:00:00Z",
      location: "OC0.03",
    },
    {
      id: "12",
      title: "Closing Remarks from WAI Pres",
      start: "2024-02-18T16:00:00Z",
      end: "2024-02-18T17:00:00Z",
      location: "OC0.03",
    },
  ];

  return defaultPage(
    <div>
      <div>
        <h1 className="pt-16 text-center font-mono text-5xl font-bold text-wai-gray">
          WAI Summit 2024
        </h1>
        <h2 className="text-center font-mono text-xl font-bold text-wai-gray">
          17th and 18th February
        </h2>
      </div>

      <div className="grid grid-cols-1 place-content-center gap-12 p-3 pb-12 lg:grid-cols-2 lg:gap-12 lg:p-4">
        <div className="m-auto grid h-fit max-w-lg grid-cols-1 gap-8 rounded-lg border-4 border-wai-gray bg-pure-white p-2 shadow-sm shadow-wai-gray md:p-4">
          <p className="font-mono text-sm text-wai-gray md:text-base">
            Welcome to the exciting world of Artificial Intelligence, where
            innovation meets possibility! Join us on a journey into the
            incredible advancements that AI has brought, from self-driving cars
            to image generation and the amazing ChatGPT.
            <br />
            <br />
            🤖 Whether you're a seasoned machine learning pro or just dipping
            your toes into the AI waters, this Summit is your golden
            opportunity! Explore the real-world applications of AI, dive into
            hands-on experiences with cutting-edge models, and let's chat about
            the safety measures around superintelligent machines.
            <br />
            <br />
            🌐 Plus, seize the chance to network and make connections that could
            be your first step into a thriving career in the AI industry.
            <br />
            <br />
            🕘 Don't forget to snag your wristband starting at 9 am on the 17th
            in OC0.01.
            <br />
            <br />
            🎨 And be sure to check out the captivating static exhibition
            showcasing AI research and projects in OC0.02 throughout the event.
            <br />
            <br />
            See you there! 🚀
          </p>
          <Button
            enabled={true}
            text="Summit Tickets"
            href="https://www.warwicksu.com/venues-events/events/57846/25060/"
            ariaLabel="Buy summit tickets!"
            extraClasses="h-fit m-4"
          />
        </div>

        <ListCalendar
          events={events}
          enableLinks={false}
          enableLocation={true}
          currentTime={currentTime}
        />
      </div>
    </div>,
  );
}
