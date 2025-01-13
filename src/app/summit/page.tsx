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

  return defaultPage(
    <div>
      <div>
        <h1 className="pt-16 text-center font-mono text-5xl font-bold text-wai-gray">
          WAI Summit 2025
        </h1>
        <h2 className="text-center font-mono text-xl font-bold text-wai-gray">
          8th, 9th February 2025
        </h2>
        <br />
        <RainbowText
          extraClasses="text-3xl font-mono font-bold text-center"
        >
          DETAILS COMING SOON
        </RainbowText>
      </div>
    </div>,
  );
}
