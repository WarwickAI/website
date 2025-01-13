import React from "react";
import style from "./rainbow_text.module.css";

export default function RainbowText(props: {
  children?: React.ReactNode;
  extraClasses?: string;
  colors?: string[];
  animationDuration?: string;
}) {
  const baseClassNames = `text-xl font-mono font-bold text-center whitespace-pre-line text-wai-gray p-4`;
  const allClassNames = `${baseClassNames} ${props.extraClasses || ""} ${style.shine}`;


  // I HAD THIS STUFF ANIMATED AND THEN I TRIED TO TIDY IT AND IT BROKE SO I UNDID THE DELETES AND IT HASN'T WORKED AGAIN
  // I SPENT SO LONG ON THIS
  // GAAAAH I RAN OUT OF TIME
  // YOU GET PRETTY TEXT, JUST NOT PERFECT TEXT.
  const gradientColour = props.colors?.join(", ") || `purple, orange, purple`;
  const gradientStyle = {
    background: `linear-gradient(90deg, ${gradientColour})`,
    backgroundSize: "200%",
    WebkitBackgroundClip: "text",
    color: "transparent",
    animation: `shine ${props.animationDuration || "5s"} linear infinite`,
  };

  return (
    <div className="flex justify-center">
      <div className={allClassNames} style={{ ...gradientStyle, display: "inline-block" }}>
        {props.children}
      </div>
    </div>
  );
}
