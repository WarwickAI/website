// Summit details and ticket purchase page.

// ************************************************************************************************************************
// **                       Kept for formatting for 2025, once that is made, this will be deleted.                       **
// ************************************************************************************************************************ 


import BackButton from "@/components/back_button";
import Button from "@/components/button";
import ListCalendar, {
  CalendarEvent,
} from "@/components/calendar/list_calendar";
import defaultPage from "@/components/default";
import Notice from "@/components/notice";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Home() {
  const enablePage = false;
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
    // Saturday
    {
      id: "1",
      title: "TBC",
      start: "2025-02-15T10:30:00Z",
      end: "2025-02-15T11:20:00Z",
      location: "FAB0.03",
    },
    {
      id: "2",
      title: "The Quantum Revolution, Mohamed Elagamy, IBM",
      start: "2025-02-15T11:30:00Z",
      end: "2025-02-15T12:20:00Z",
      location: "FAB0.03",
    },
    {
      id: "3",
      title: "The Explosive Growth of AI, Ollie Jaffe, OpenAI",
      start: "2025-02-15T12:30:00Z",
      end: "2025-02-15T13:20:00Z",
      location: "FAB0.03",
    },
    {
      id: "4",
      title: "TBC",
      start: "2025-02-15T14:00:00Z",
      end: "2025-02-15T14:50:00Z",
      location: "FAB0.03",
    },
    {
      id: "5",
      title: "Language Learning with Gen AI, Matt Wilson, British Council",
      start: "2025-02-15T15:00:00Z",
      end: "2025-02-15T15:50:00Z",
      location: "FAB0.03",
    },
    {
      id: "6",
      title: "TBC",
      start: "2025-02-15T16:00:00Z",
      end: "2025-02-15T16:50:00Z",
      location: "FAB0.03",
    },
    {
      id: "7",
      title: "VIP Networking Drinks",
      start: "2025-02-15T19:00:00Z",
      end: "2025-02-15T21:00:00Z",
      location: "Chancellors Suite, Rootes Building",
    },
    // Sunday
    {
      id: "8",
      title: "TBC",
      start: "2025-02-16T10:30:00Z",
      end: "2025-02-16T11:20:00Z",
      location: "FAB0.03",
    },
    {
      id: "9",
      title: "TBC",
      start: "2025-02-16T11:30:00Z",
      end: "2025-02-16T12:20:00Z",
      location: "FAB0.03",
    },
    {
      id: "10",
      title: "The Future is Open, Paul Squires, IBM",
      start: "2025-02-16T12:30:00Z",
      end: "2025-02-16T13:20:00Z",
      location: "FAB0.03",
    },
    {
      id: "11",
      title: "TBC",
      start: "2025-02-16T14:00:00Z",
      end: "2025-02-16T14:50:00Z",
      location: "FAB0.03",
    },
    {
      id: "12",
      title: "AI Transformations of Business Technology, Louis Samuel, 4MC Partners",
      start: "2025-02-16T15:00:00Z",
      end: "2025-02-16T15:50:00Z",
      location: "FAB0.03",
    },
    {
      id: "13",
      title: "TBC",
      start: "2025-02-16T16:00:00Z",
      end: "2025-02-16T16:50:00Z",
      location: "FAB0.03",
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
        <div className="flex justify-center p-4">
          <Button
            enabled={true}
            text="Feedback Form"
            href="https://docs.google.com/forms/d/1Bb4GSBiJG1rDW1lgKhF92bK38tg_Q7iGWAf4jHRAk4U/edit?usp=drivesdk"
            ariaLabel="Fill in our the summit feedback form."
            extraClasses="h-fit m-4"
          />
        </div>
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
            🕘 Don't forget to snag your wristband starting at 9am on the 17th
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
