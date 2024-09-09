import React from 'react';

export default function PersonInfo(props: {
    picture: string;
    name: string;
    tag: string;
    tagColour?: string;
    description: string;
    extraClasses?: string;
}) {
    const baseClassNames = `w-[90vw] sm:w-[80vw] md:w-[70vw] shadow-sm whitespace-pre-line shadow-wai-gray bg-pure-white text-xl sm:text-xl md:text-2xl font-mono font-bold text-center text-wai-gray border-4 rounded-lg border-wai-gray p-4 justify-self-center flex items-center`;
    const cardClassNames = `${baseClassNames} ${props.extraClasses || ""}`;
    const tagClassNames = `${props.tagColour ? `!${props.tagColour}` : "text-wai-gray"}`;

    return (
        <div className={cardClassNames}>
            <img src={props.picture} className="w-[calc(9vw*7/6)] h-[calc(9vw*7/6)] object-cover" />
            <div className="flex-1 pl-4 text-left">
                <div className="text-lg sm:text-xl md:text-2xl mb-2">
                    {props.name} | <span className={tagClassNames}>{props.tag}</span>
                </div>
                <div className="text-sm sm:text-base md:text-lg">{props.description}</div>
            </div>
        </div>
    );
}
