export default function PersonInfo(props: {
  picture: string;
  name: string;
  tag: string;
  tagColour?: string;
  description: string;
  extraClasses?: string;
}) {
  const baseClassNames =
    "w-full whitespace-pre-line box text-xl sm:text-xl md:text-2xl font-bold text-center p-2 md:p-4 justify-self-center";
  const cardClassNames =
    `${baseClassNames} ${props.extraClasses || ""}` +
    "grid grid-cols-1 md:flex md:flex-row md:items-center";
  const colour = props.tagColour || "#9372BE";

  return (
    <div className={cardClassNames}>
      <img
        src={props.picture}
        className="md:2/5 mb-4 aspect-square w-3/5 min-w-36 max-w-52 place-self-center rounded-lg object-cover lg:w-1/5 lg:pb-0"
      />
      <div className="flex-1 pl-4 text-left">
        <div className="mb-2 text-lg sm:text-xl md:text-2xl">
          {props.name} |{" "}
          <span className=" " style={{ color: colour }}>
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
