import React from "react";

export default function Notice(props: {
  children?: React.ReactNode;
  important?: boolean;
  extraClasses?: string;
}) {
  const baseClassNames = "box text-xl font-bold text-center whitespace-pre-line justify-self-center";
  const importantClassNames = props.important
    ? `bg-yellow-100 border-yellow-500 text-yellow-700`
    : ``; // These don't work lol

  const allClassNames = `${baseClassNames} ${props.extraClasses || ""} ${
    importantClassNames || ""
  }`;

  return <div className={allClassNames}>{props.children}</div>;
}
