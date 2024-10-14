import BackButton from "./back_button";
import ListCalendar from "./calendar/list_calendar";
import CourseInfo from "./course_info";
import { Event } from "@/classes/event"


export default function EventsDualPage(props: {
    pageTitle: string;
    pageSubtitle: string;
    events: Event[];
}) {
    const currentTime = Date.now();

    return (
        <div>
            <div>
                <h1 className="pt-16 text-center font-mono text-5xl font-bold text-wai-gray">
                    {props.pageTitle}
                </h1>
                <h2 className="text-center font-mono text-xl font-bold text-wai-gray">
                    {props.pageSubtitle}
                </h2>
            </div>

            <div className="grid grid-cols-1 place-content-center gap-16 p-3 pb-12 lg:grid-cols-[60%_40%] lg:p-4 max-w-screen-xl mx-auto">
                <div className="m-auto grid h-fit  grid-cols-1 rounded-lg border-4 border-wai-gray bg-pure-white p-2 shadow-sm shadow-wai-gray md:p-4">
                    <div className="font-mono text-sm text-wai-gray md:text-base">
                        {props.events && props.events.map((event, index) => (
                            <>
                                <CourseInfo
                                    picture={event.pictureUrl}
                                    name={event.event[0].title}
                                    description={event.event[0].description || ""}
                                    date={event.simpleDate}
                                />
                                {/* The cute lil' bar :) */}
                                {index < props.events.length - 1 && (
                                    <div className="my-4 w-full flex justify-center">
                                        <div className="h-1 w-11/12 md:w-10/12 rounded-full bg-wai-gray opacity-30"></div>
                                    </div>
                                )}
                            </>
                        ))}
                    </div>
                </div>
                <div>
                    <ListCalendar
                        events={props.events.map(x => x.event).flat()}
                        enableLinks={false}
                        enableLocation={true}
                        currentTime={currentTime}
                    />
                </div>
            </div>
            <div className="grid place-content-center">
                <BackButton />
            </div>
        </div>

    );
}
