// Summit details and ticket purchase page.
// TODO(JakubCzarlinski): Remove after the event.

import ListCalendar, {
  CalendarEvent,
} from "@/components/calendar/list_calendar";
import defaultPage from "@/components/default";
import { redirect } from "next/navigation";

export default function Home() {
  const enablePage = false;
  if (!enablePage) {
    return redirect(
      "https://www.warwicksu.com/venues-events/events/57846/25060/",
    );
  }
  // Split the page into two columns.

  // Saturday 17th February 2024
  // Introduction from WAI Pres and VP 11am OC1.05
  // Competition Annoucements 11:30am OC1.05
  // Seeing the Unseen: Using CNNs for Image Steganalysis 12pm OC1.05
  // AI Safety Panel feat. Deepmind, UK Institute of AI Safety and Effecitve Altruism 1pm OC1.05
  // Creating an AI Startup by Truss Archive 2pm OC1.05
  // The AI Revolution: Ethics, Technology and Society by IATL 4pm OC1.05
  // Summit Code Night Social with Warwick GDSC 6pm OC0.02

  // Sunday:
  // AI and Blockchain Workshop by Encode Club 11am OC1.05
  // AI Speed Friending 12pm OC0.02
  // WAI Project Presentations 2pm OC1.05
  // AI, Politics and Disinformation 3pm OC1.05
  // Closing Remarks from WAI Pres 4pm OC1.05
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Introduction from WAI Pres and VP",
      start: "2024-02-17T11:00:00Z",
      end: "2024-02-17T11:30:00Z",
      location: "OC1.05",
    },
    {
      id: "2",
      title: "Competition Annoucements",
      start: "2024-02-17T11:30:00Z",
      end: "2024-02-17T12:00:00Z",
      location: "OC1.05",
    },
    {
      id: "3",
      title: "Seeing the Unseen: Using CNNs for Image Steganalysis",
      start: "2024-02-17T12:00:00Z",
      end: "2024-02-17T13:00:00Z",
      location: "OC1.05",
    },
    {
      id: "4",
      title:
        "AI Safety Panel with Google DeepMind, UK Institute of AI Safety and Effecitve Altruism",
      start: "2024-02-17T13:00:00Z",
      end: "2024-02-17T14:00:00Z",
      location: "OC1.05",
    },
    {
      id: "5",
      title: "Creating an AI Startup by Truss Archive",
      start: "2024-02-17T14:00:00Z",
      end: "2024-02-17T16:00:00Z",
      location: "OC1.05",
    },
    {
      id: "6",
      title: "The AI Revolution: Ethics, Technology and Society by IATL",
      start: "2024-02-17T16:00:00Z",
      end: "2024-02-17T18:00:00Z",
      location: "OC1.05",
    },
    {
      id: "7",
      title: "Summit Code Night Social with Warwick GDSC",
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
      location: "OC1.05",
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
      location: "OC1.05",
    },
    {
      id: "11",
      title: "AI, Politics and Disinformation",
      start: "2024-02-18T15:00:00Z",
      end: "2024-02-18T16:00:00Z",
      location: "OC1.05",
    },
    {
      id: "12",
      title: "Closing Remarks from WAI Pres",
      start: "2024-02-18T16:00:00Z",
      end: "2024-02-18T17:00:00Z",
      location: "OC1.05",
    },
  ];

  return defaultPage(
    <div>
      <h1 className="text-center font-mono text-5xl font-bold text-wai-gray">
        WAI Summit 2024
      </h1>
      <div className="grid grid-cols-1 gap-12 p-4 lg:grid-cols-2 lg:gap-12">
        <div className="h-fit rounded-lg border-4 border-wai-gray bg-pure-white p-4 text-justify font-mono text-wai-gray shadow-sm shadow-wai-gray">
          Artificial Intelligence is one of the biggest technological advances
          in recent years, underpinning development such as self-driving cars,
          image generation and ChatGPT! Whether you're a machine learning expert
          or just getting started, this Summit will give you the opportunity to
          learn about AI's industry applications, get hands-on with cutting-edge
          models and discuss the safety implications of superintelligent
          machines! There will also be plenty of opportunities to network and
          make connections which may be your first step into a career in the AI
          industry.
          <br />
          <br />
          This event will take place in the Oculus on the 17th and 18th
          February, with talks, workshops and discussion panels happening from
          11am to 5/6pm, with our Summit CodeNight social taking place in the
          evening on the 17th! Buying a ticket will give you a wristband which
          will grant entry to all events taking place throughout the weekend,
          you will be able to collect your wristband from 9am on the 17th in
          OC0.01. There will also be a static exhibition of AI research and
          projects in OC0.02 throughout the event.
        </div>
        <ListCalendar
          events={events}
          enableLinks={false}
          enableLocation={true}
        />
      </div>
    </div>,
  );
}
