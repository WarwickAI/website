"use client";

import { useRouter } from "next/navigation";

export default function ClickableInfoBox(props: {
  picture: string;
  name: string;
  tag: string;
  tagColour?: string;
  clickLocation: string;
  description: string;
  extraClasses?: string;
}) {
  // Litterally a person info but clickonable
  const baseClassNames = "w-full shadow-sm whitespace-pre-line shadow-wai-gray bg-pure-white text-xl sm:text-xl md:text-2xl font-mono font-bold text-center text-wai-gray border-4 rounded-lg border-wai-gray p-2 md:p-4 justify-self-center max-w-4xl mx-auto";
  const cardClassNames =
    `${baseClassNames} ${props.extraClasses || ""}` +
    "grid grid-cols-1 md:flex md:flex-row md:items-center hover:shadow-purple hover:border-purple hover:text-purple";
  const colour = props.tagColour || "#9372BE";

  // Handle the click
  const router = useRouter();
  const handleClick = () => {
    router.push(props.clickLocation);
  };

  return (
    <div className={cardClassNames} onClick={handleClick} role="button">
      <img
        src={props.picture}
        className="md:2/5 mb-4 aspect-square w-3/5 min-w-36 max-w-52 place-self-center rounded-lg object-cover lg:w-1/5 lg:pb-0"
      />
      <div className="flex-1 pl-4 text-left">
        <div className="mb-2 text-lg sm:text-xl md:text-2xl">
          {props.name} |{" "}
          <span className="text-wai-gray" style={{ color: colour }}>
            {props.tag}
          </span>
        </div>
        <div className="text-sm sm:text-base md:text-lg">
          {props.description}
        </div>
      </div>
    </div>
  );
}
