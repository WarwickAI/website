import BackButton from "@/components/back_button";
import Button from "@/components/button";
import ClickableInfoBox from "@/components/clickable_info_box";
import defaultPage from "@/components/default";


interface CompetitionEvent {
    name: string;
    urlName: string;    // The competition name
    imageUrl: string;
    description: string;
    active: boolean;
}

export default function Home() {
    const activeColour = "#4EA75D";
    const unactiveColour = "#A74E5D";

    // The competitions
    const competitions: CompetitionEvent[] = [{
        name: "Chess Competition",
        urlName: "chess",
        imageUrl: "/images/competition/chess/Chess_Competition.webp",
        description: "This is a chess competition! This description is WIP",
        active: false
    }, {
        name: "Pacman Competition",
        urlName: "pacman",
        imageUrl: "/images/competition/pacman/Pacman_Competition.webp",
        description: "This is a PvP pacman competition! This description is WIP",
        active: false
    }];

    return defaultPage(
        <div>
            <div>
                <h1 className="pt-16 text-center font-mono text-5xl font-bold text-wai-gray">
                    Competitions
                </h1>
                <h2 className="text-center font-mono text-xl font-bold text-wai-gray">
                    See our competitions below!
                </h2>
            </div>

            {competitions.map((comp, index) => (
                <ClickableInfoBox
                    picture={comp.imageUrl}
                    name={comp.name}
                    tag={comp.active ? "Competition In Progress!" : "Competition Has Ended."}
                    tagColour={comp.active ? activeColour : unactiveColour}
                    clickLocation={`/competition/${comp.urlName}`}
                    description={comp.description}
                />
            ))}

            <BackButton />
        </div>,
    );
}
