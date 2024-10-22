import Button from "@/components/button";
import { loadEvents } from "@/components/calendar/google_api";
import ListCalendar from "@/components/calendar/list_calendar";
import defaultPage from "@/components/default";
import KonamiCodeListener from "@/components/easter_eggs/konami_code";
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
  const events = await loadEvents();
  const currentTime = Date.now();

  return defaultPage(
    <div>
      <KonamiCodeListener />

      <div
        id="logo-and-calendar"
        className="grid grid-cols-1 place-content-start gap-12 p-1 md:grid-cols-2 md:place-items-center md:gap-2"
      >
        <div
          id="logo-with-links"
          className="grid h-fit grid-cols-1 place-content-center justify-self-center"
        >
          <div className="h-fit pb-4 pt-4 drop-shadow-sm-wai-gray md:pb-12">
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

        <div className="w-7/8 grid h-fit grid-cols-1 place-items-center justify-self-center text-black md:place-content-center lg:w-3/4">
          <ListCalendar
            events={events}
            enableLocation={true}
            enableLinks={true}
            currentTime={currentTime}
          />
        </div>
      </div>

      <div
        id="learn-more"
        className="flex w-4/5 flex-wrap place-content-center place-self-center md:-mt-12"
      >
        <Button
          enabled={true}
          text="Courses"
          href="/courses"
          ariaLabel="See what courses we offer!"
          extraClasses="m-2"
        />
        <Button
          enabled={true}
          text="Projects"
          href="https://projects.warwick.ai/"
          ariaLabel="Join in on the projects!"
          extraClasses="m-2"
        />
        <Button
          enabled={true}
          text="AI Safety"
          href="/ai_safety"
          ariaLabel="See our ai safety events!"
          extraClasses="m-2"
        />
        <Button
          enabled={true}
          text="Competition"
          href="/competition"
          ariaLabel="Compete in our competition!"
          extraClasses="m-2"
        />
        <Button
          enabled={true}
          text="Meet the Exec!"
          href="/meet_the_exec"
          ariaLabel="Meet the exec!"
          extraClasses="m-2"
        />
        <Button
          enabled={true}
          text="Summit Details"
          href="/summit"
          ariaLabel="Find out more about the summit!"
          extraClasses="m-2"
        />
      </div>
      <YoutubeEmbed />
    </div>,
  );
}
