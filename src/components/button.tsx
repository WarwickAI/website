import Link from "next/link";

export default function Button(props: {
  enabled: boolean;
  text: string;
  href: string;
  extraClasses?: string;
  ariaLabel?: string;
}) {
  const className =
    "whitespace-pre-line box text-xl font-bold text-center justify-self-center";

  if (props.enabled) {
    const enabledClassNames =
      "hover:shadow-purple hover:border-purple hover:text-purple";
    const allClassNames = `${className} ${enabledClassNames} ${
      props.extraClasses || ""
    }`;
    return (
      <Link
        href={props.href}
        className={allClassNames}
        aria-label={props.ariaLabel}
      >
        {props.text}
      </Link>
    );
  } else {
    const allClassNames = `${className} ${props.extraClasses || ""}`;
    return <p className={allClassNames}>{props.text}</p>;
  }
}
