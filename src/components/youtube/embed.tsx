// Youtube LoFi Girl Embed
import moment from "moment-timezone";

export default function YoutubeEmbed() {
  if (!isCodenight()) {
    return <></>;
  }

  return (
    <div className="grid grid-cols-1 place-self-center">
      <p className="text-center font-mono text-lg text-wai-gray">
        Welcome to CodeNight!
      </p>
      <iframe
        className="h-[200px] w-[355px] rounded-lg shadow-lg md:h-[270px] md:w-[480px]"
        src="https://www.youtube.com/embed/jfKfPfyJRdk"
        title="lofi hip hop radio 📚 - beats to relax/study to"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
}

function isCodenight() {
  // Tuesday or Thursday between 6pm and 8pm UK time
  const ukTime = moment().tz("Europe/London");
  const day = ukTime.day();
  if (day !== 2 && day !== 4) {
    return false;
  }

  const hour = ukTime.hour();
  if (hour < 18 || hour > 20) {
    return false;
  }

  const minute = ukTime.minute();
  if (hour === 20 && minute > 0) {
    return false;
  }

  return true;
}
