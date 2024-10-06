import React from 'react';

export default function CourseInfo(props: {
    picture: string;
    name: string;
    date: string;
    dateColour?: string;
    description: string;
    extraClasses?: string;
}) {
    // Litterally just person_info without the border (atm)
    const baseClassNames = `w-full whitespace-pre-line bg-pure-white text-xl sm:text-xl md:text-2xl font-mono font-bold text-center text-wai-gray p-2 md:p-4 justify-self-center`;
    const cardClassNames = `${baseClassNames} ${props.extraClasses || ""}` + "grid grid-cols-1 md:flex md:flex-row md:items-center";
    const colour = props.dateColour || "#9372BE";

    return (
        <div className={cardClassNames}>
            <img src={props.picture} className="place-self-center w-3/5 min-w-36 max-w-52 md:2/5 aspect-square mb-4 lg:pb-0 lg:w-1/5 object-cover" />
            <div className="flex-1 pl-4 text-left">
                <div className="text-lg sm:text-xl mb-0 md:text-2xl">{props.name}</div>
                <div className="text-base sm:text-lg md:text-xl mb-2 text-wai-gray" style={{ color: colour }}>{props.date}</div>
                <div className="text-sm sm:text-base md:text-lg">{props.description}</div>
            </div>
        </div>
    );
}
