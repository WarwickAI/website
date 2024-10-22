import React from "react";

export default function Notice(props: {
  children?: React.ReactNode;
  important?: boolean;
  extraClasses?: string;
}) {
  const baseClassNames = `shadow-sm shadow-wai-gray bg-pure-white text-xl font-mono font-bold text-center whitespace-pre-line text-wai-gray border-4 rounded-lg border-wai-gray p-4 justify-self-center`;
  const importantClassNames = props.important
    ? `bg-yellow-100 border-yellow-500 text-yellow-700`
    : ``; // These don't work lol

  const allClassNames = `${baseClassNames} ${props.extraClasses || ""} ${importantClassNames || ""}`;

  return <div className={allClassNames}>{props.children}</div>;
}
