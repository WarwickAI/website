// components/TwitchEmbed.js

export default function TwitchEmbed(props: {
  channel: string;
  height?: string;
  width?: string;
}) {
  return (
    <div className="grid grid-cols-1 place-self-center">
      <p className="text-center font-mono text-lg text-wai-gray">
        Our Benji is currently live!
      </p>
      <iframe
        src={`https://player.twitch.tv/?channel=${props.channel}&parent=${process.env.NODE_ENV === "development" ? 'localhost' : 'www.warwick.ai'}`}
        height={props.height ?? "420"}
        width={props.width ?? "720"}
        allowFullScreen={true}
      ></iframe>
    </div>
  );
};

