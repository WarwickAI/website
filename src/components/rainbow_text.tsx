import React from "react";
import style from "./rainbow_text.module.css";

export default function RainbowText(props: {
  children?: React.ReactNode;
  extraClasses?: string;
  colors?: string[];
  animationDuration?: string;
}) {
  const allClassNames = `${props.extraClasses || ""} animate-shine`;

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
