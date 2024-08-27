import Link from "next/link";

export default function Button(props: {
  enabled: boolean;
  text: string;
  href: string;
  extraClasses?: string;
  ariaLabel?: string;
}) {
  const classNames = `shadow-sm shadow-wai-gray bg-pure-white text-xl font-mono font-bold text-center text-wai-gray border-4 rounded-lg border-wai-gray p-4 justify-self-center`;
  
  // To allow for \n linebreaks
  const textStyle = { whiteSpace: 'pre-line' };
  
  if (props.enabled) {
    const enabledClassNames = "hover:shadow-purple hover:border-purple hover:text-purple";
    const allClassNames = `${classNames} ${enabledClassNames} ${props.extraClasses || ""}`;
    return (
      <Link
        href={props.href}
        className={allClassNames}
        aria-label={props.ariaLabel}
        style={textStyle}
      >
        {props.text}
      </Link>
    );
  } else {
    const allClassNames = `${classNames} ${props.extraClasses || ""}`;
    return <p style={textStyle} className={allClassNames}>{props.text}</p>;
  }
}
