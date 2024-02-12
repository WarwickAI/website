import Button from "@/components/button";
import { loadEvents } from "@/components/calendar/google_api";
import ListCalendar from "@/components/calendar/list_calendar";
import defaultPage from "@/components/default";
import YoutubeEmbed from "@/components/youtube/embed";
import Link from "next/link";
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
            <div
              id="logo"
              className="mb-4 mt-4 h-full drop-shadow-sm-wai-gray  md:mb-16"
            >
              {logoSvg()}
            </div>

            <div id="links" className="grid grid-cols-6 gap-2">
              {roundedIcon(
                discordSvg(),
                "https://discord.gg/43FnkSMEPX",
                "Join our Discord server.",
              )}
              {roundedIcon(
                githubSvg(),
                "https://www.github.com/WarwickAI",
                "View our GitHub repositories.",
              )}
              {roundedIcon(
                instagramSvg(),
                "https://www.instagram.com/warwick_ai/",
                "Follow us on Instagram.",
              )}
              {roundedIcon(
                linkedinSvg(),
                "https://www.linkedin.com/company/warwick-ai/",
                "Follow us on LinkedIn.",
              )}
              {roundedIcon(
                mediumSvg(),
                "https://medium.com/warwick-artificial-intelligence",
                "Read our Medium blog.",
              )}
              {roundedIcon(
                studentUnionSvg(),
                "https://www.warwicksu.com/societies-sports/societies/warwickai/",
                "Join our society!",
              )}
            </div>
          </div>

          <div
            id="calendar"
            className="md:w-7/8 w-7/8 grid grid-cols-1 justify-self-center text-black md:place-content-center lg:w-3/4"
          >
            <ListCalendar
              events={events}
              enableLocation={false}
              enableLinks={true}
            />
          </div>
        </div>

        <div
          id="learn-more"
          className="flex w-3/5 flex-wrap place-content-center place-self-center"
        >
          <Button
            enabled={true}
            text="Summit Tickets"
            href="/summit"
            ariaLabel="Buy summit tickets!"
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

function logoSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2091 658" height={100}>
      <defs>
        <linearGradient id="gradient">
          <stop offset="0%" className="animate-colourPulse" />
          <stop offset="50%" className="animate-colourPulseOffset" />
        </linearGradient>
      </defs>
      <path
        style={{ fill: "url(#gradient)" }}
        d="M0 1h147l203 472L530 1h123l122 319-72 170-106-284h-10L418 658H282Zm1061 0h155L916 658H773l-6-13Zm282 0h157l299 657h-155l-221-487-161 351 165-1 59 137h-441Zm294 0h153l51 109h-155Zm96 213h155l202 444h-155Z"
      />
    </svg>
  );
}

function roundedIcon(icon: React.ReactNode, link: string, ariaLabel: string) {
  return (
    <Link href={link} className="group" aria-label={ariaLabel}>
      <div className="grid h-11 w-11 grid-cols-1 place-content-center rounded-lg border-4 border-wai-gray bg-pure-white p-2 shadow-sm shadow-wai-gray group-hover:border-purple sm:h-12 sm:w-12">
        {icon}
      </div>
    </Link>
  );
}

const svgIconClass = "fill-wai-gray group-hover:fill-purple";

const discordSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
    <path
      d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"
      className={svgIconClass}
    />
  </svg>
);

const githubSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 98 96">
    <path
      d="M48.9 0a49.2 49.2 0 0 0-15.4 96c2.3.4 3.2-1.2 3.2-2.5v-9c-13.6 2.9-16.5-6-16.5-6-2.2-5.7-5.4-7.1-5.4-7.1-4.4-3 .3-3 .3-3 5 .3 7.5 5 7.5 5 4.4 7.5 11.5 5.4 14.3 4a11 11 0 0 1 3-6.5c-10.8-1.1-22.2-5.4-22.2-24.3 0-5.4 2-9.8 5-13.2-.5-1.2-2.2-6.3.5-13 0 0 4.1-1.3 13.4 5A47 47 0 0 1 49 23.8c4 0 8.3.6 12.2 1.6 9.3-6.3 13.4-5 13.4-5 2.7 6.7 1 11.8.5 13a19 19 0 0 1 5 13.2c0 19-11.4 23-22.3 24.3 1.7 1.5 3.3 4.5 3.3 9.1v13.5c0 1.3.8 2.9 3.2 2.4a49.2 49.2 0 0 0 33.4-46.7A49 49 0 0 0 49 0z"
      className={svgIconClass}
    />
  </svg>
);

const instagramSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path
      d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8a26.8 26.8 0 1 1 26.8-26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388a75.63 75.63 0 0 1-42.6 42.6c-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9A75.63 75.63 0 0 1 49.4 388c-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1A75.63 75.63 0 0 1 92 81.2c29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9a75.63 75.63 0 0 1 42.6 42.6c11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
      className={svgIconClass}
    />
  </svg>
);

const linkedinSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path
      d="M416 32H31.9A32.1 32.1 0 0 0 0 64.3v383.4A32.1 32.1 0 0 0 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3A32.2 32.2 0 0 0 416 32zM135.4 416H69V202.2h66.5V416zm-33.2-243a38.5 38.5 0 1 1 0-77 38.5 38.5 0 0 1 0 77zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"
      className={svgIconClass}
    />
  </svg>
);

const mediumSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
    <path
      d="M181 74a182 182 0 0 0 0 364c100 0 180-82 180-182S280 74 181 74Zm288 11c-50 0-90 77-90 171s40 171 90 171 90-77 90-171-40-171-90-171Zm139 18c-17 0-31 68-31 153s14 153 31 153 32-68 32-153-14-153-32-153Z"
      className={svgIconClass}
    />
  </svg>
);

const studentUnionSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <path
      d="M41 79h81v44H41c-13 0-21-11-21-22 0-8 5-22 21-22Zm94 0h44v49c0 6 13 6 13 0V79h44v46c0 68-101 67-101 5V79ZM20 177v-44h81c16 0 21 15 21 23 0 10-9 21-19 21H20Z"
      className={svgIconClass}
    />
  </svg>
);
