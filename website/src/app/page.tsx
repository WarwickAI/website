export default function Home() {
  // On large screens:
  //   Home page displays the logo in the vertical center of the page along with
  //   a calendar of events. For now the calendar can be text only. The calendar
  //   is on the right side of the logo.
  //
  // On small screens:
  //   Calendar is below the logo

  return (
    // On large screens:
    //   2 column grid. Logo and calendar are 1 columns each.
    //
    // On small screens:
    //   Single column. Logo first, then calendar.

    <div className="grid h-screen grid-cols-1 place-content-center gap-4 bg-white p-4 md:grid-cols-2 md:justify-items-stretch">
      <div className="justify-self-center">{logoSvg()}</div>

      <div className="grid grid-cols-1 place-content-center justify-self-center text-black">
        {calendar()}
      </div>
    </div>
  );
}

function logoSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2091 658" height={100}>
      <path
        d="M.473.88h146.949l202.4 472.536L530.044.88h123.381l122 318.962-72.092 169.817-106.746-283.521h-9.705L417.752 658H281.894zm1060.037 0h155.05L915.8 658H772.562l-5.907-13.29zm282.48 0h156.52L1799.28 658h-155.05l-221.5-487.3-160.96 351.446 165.39-1.477L1486.22 658H1044.7zm293.86 0h153.57l50.21 109.274h-155.05zm95.98 212.641h155.05L2090.18 658h-155.05z"
        fill="#3c3c3c"
        fillRule="evenodd"
      />
    </svg>
  );
}

const calendar = () => (
  <div className="calendar">
    <p>Coming soon...</p>
  </div>
);
