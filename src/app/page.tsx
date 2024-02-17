import Button from "@/components/button";
import { loadEvents } from "@/components/calendar/google_api";
import ListCalendar from "@/components/calendar/list_calendar";
import defaultPage from "@/components/default";
import {
  DiscordButton,
  GitHubButton,
  InstagramButton,
  LinkedInButton,
  MediumButton,
  StudentUnionButton,
  WaiLogo,
} from "@/components/icons";
import YoutubeEmbed from "@/components/youtube/embed";
import "./globals.css";

export const dynamic = "force-dynamic"; // defaults to auto

export default async function Home() {
  // On large screens:
  //   Home page displays the logo in the vertical center of the page along with
  //   a calendar of events. For now the calendar can be text only. The calendar
  //   is on the right side of the logo.
  //
  // On small screens:
  //   Calendar is below the logo
  const events = await loadEvents();
  const currentTime = Date.now();

  return (
    // On large screens:
    //   2 column grid. Logo and calendar are 1 columns each.
    //
    // On small screens:
    //   Single column. Logo first, then calendar.
    defaultPage(
      <div>
        <div
          id="logo-and-calendar"
          className="grid grid-cols-1 place-content-start gap-12 p-1 md:grid-cols-2 md:place-content-center md:gap-2"
        >
          <div
            id="logo-with-links"
            className="grid grid-cols-1 place-content-center justify-self-center"
          >
            <div className="h-full pb-4 pt-4 drop-shadow-sm-wai-gray md:pb-12">
              {WaiLogo}
            </div>

            <div className="grid grid-cols-6 gap-2">
              {DiscordButton}
              {GitHubButton}
              {InstagramButton}
              {LinkedInButton}
              {MediumButton}
              {StudentUnionButton}
            </div>
          </div>

          <div className="md:w-7/8 w-7/8 grid grid-cols-1 justify-self-center text-black md:place-content-center lg:w-3/4">
            <ListCalendar
              events={events}
              enableLocation={false}
              enableLinks={true}
              currentTime={currentTime}
            />
          </div>
        </div>

        <div
          id="learn-more"
          className="flex w-3/5 flex-wrap place-content-center place-self-center"
        >
          <Button
            enabled={true}
            text="Summit Details"
            href="/summit"
            ariaLabel="Find out more about the summit!"
            extraClasses="m-2"
          />
          <Button
            enabled={true}
            text="Competition"
            href="/competition"
            ariaLabel="Compete in our competition!"
            extraClasses="m-2"
          />
        </div>
        <YoutubeEmbed />
      </div>,
    )
  );
}
