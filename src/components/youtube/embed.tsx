// Youtube LoFi Girl Embed

export default function YoutubeEmbed() {
  // Returns a youtube embed if it is Thursday 7:00-9:00pm, otherwise empty div.
  const date = new Date();
  const day = date.getDay();
  const hour = date.getHours();
  const minute = date.getMinutes();
  if (day !== 4) {
    return <div></div>;
  }
  if (hour < 19 || hour > 21) {
    return <div></div>;
  }
  if (hour === 21 && minute > 0) {
    return <div></div>;
  }

  return (
    <div className="grid grid-cols-1 place-self-center">
      <p className="text-center font-mono text-lg text-wai-gray">
        Welcome to CodeNight!
      </p>

      <iframe
        className="rounded-lg shadow-lg"
        width="480"
        height="270"
        src="https://www.youtube.com/embed/jfKfPfyJRdk"
        title="lofi hip hop radio 📚 - beats to relax/study to"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
}
