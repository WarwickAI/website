import Link from "next/link";
import Calendar from "./calendar/full_calendar_api";
import { loadEvents } from "./calendar/google_api";
import Button from "./components/button";
import defaultPage from "./components/default";
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
          className="grid grid-cols-1 gap-12 md:gap-2 p-1 md:grid-cols-2 place-content-start md:place-content-center"
        >
          <div
            id="logo-with-links"
            className="grid grid-cols-1 place-content-center justify-self-center"
          >
            <div
              id="logo"
              className="mt-4 mb-4 md:mb-16 h-full  drop-shadow-sm-wai-gray"
            >
              {logoSvg()}
            </div>

            <div id="links" className="grid grid-cols-6 gap-2">
              {roundedIcon(
                discordSvg(),
                "https://discord.gg/43FnkSMEPX",
                "Join our Discord server."
              )}
              {roundedIcon(
                githubSvg(),
                "https://www.github.com/WarwickAI",
                "View our GitHub repositories."
              )}
              {roundedIcon(
                instagramSvg(),
                "https://www.instagram.com/warwick_ai/",
                "Follow us on Instagram."
              )}
              {roundedIcon(
                linkedinSvg(),
                "https://www.linkedin.com/company/warwick-ai/",
                "Follow us on LinkedIn."
              )}
              {roundedIcon(
                mediumSvg(),
                "https://medium.com/warwick-artificial-intelligence",
                "Read our Medium blog."
              )}
              {roundedIcon(
                studentUnionSvg(),
                "https://www.warwicksu.com/societies-sports/societies/warwickai/",
                "Join our society!"
              )}
            </div>
          </div>

          <div
            id="calendar"
            className="md:w-7/8 grid w-7/8 grid-cols-1 justify-self-center text-black md:place-content-center lg:w-3/4"
          >
            <Calendar events={events} />
          </div>
        </div>

        <div id="learn-more" className="grid grid-cols-1 place-content-start">
          <Button
            enabled={true}
            text="Competition"
            href="/competition"
            ariaLabel="Compete in our competition!"
          />
        </div>
      </div>
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
        d="M.473.88h146.949l202.4 472.536L530.044.88h123.381l122 318.962-72.092 169.817-106.746-283.521h-9.705L417.752 658H281.894zm1060.037 0h155.05L915.8 658H772.562l-5.907-13.29zm282.48 0h156.52L1799.28 658h-155.05l-221.5-487.3-160.96 351.446 165.39-1.477L1486.22 658H1044.7zm293.86 0h153.57l50.21 109.274h-155.05zm95.98 212.641h155.05L2090.18 658h-155.05z"
      />
    </svg>
  );
}

function roundedIcon(icon: React.ReactNode, link: string, ariaLabel: string) {
  return (
    <Link href={link} className="group" aria-label={ariaLabel}>
      <div className="shadow-sm shadow-wai-gray bg-pure-white grid h-11 w-11 sm:h-12 sm:w-12 grid-cols-1 place-content-center rounded-lg border-4 border-wai-gray p-2 group-hover:border-purple">
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
      d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
      className={svgIconClass}
    />
  </svg>
);

const instagramSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path
      d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
      className={svgIconClass}
    />
  </svg>
);

const linkedinSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path
      d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"
      className={svgIconClass}
    />
  </svg>
);

const mediumSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
    <path
      d="M180.5,74.262C80.813,74.262,0,155.633,0,256S80.819,437.738,180.5,437.738,361,356.373,361,256,280.191,74.262,180.5,74.262Zm288.25,10.646c-49.845,0-90.245,76.619-90.245,171.095s40.406,171.1,90.251,171.1,90.251-76.619,90.251-171.1H559C559,161.5,518.6,84.908,468.752,84.908Zm139.506,17.821c-17.526,0-31.735,68.628-31.735,153.274s14.2,153.274,31.735,153.274S640,340.631,640,256C640,171.351,625.785,102.729,608.258,102.729Z"
      className={svgIconClass}
    />
  </svg>
);

const studentUnionSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <path
      d="M41.138,79.278h81.183c-0.275,15.319,0,29.225,0,43.838,0-.019-81.244-0.018-81.183,0-13.312,0-21.09-11.114-20.926-22.529C20.031,93,24.524,79.278,41.138,79.278Zm94.173,0H179.15v48.709c0,5.957,12.989,6.006,12.989,0V79.278h43.839V124.74c0,68.194-100.667,66.888-100.667,4.871V79.278ZM20.031,176.7V132.858h81.183c15.4,0.338,21.107,14.7,21.107,22.732,0,10.721-9.472,21.107-19.483,21.107C101.551,176.7,23.561,176.769,20.031,176.7Z"
      className={svgIconClass}
    />
  </svg>
);
