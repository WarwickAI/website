import BackButton from "@/components/back_button";
import Button from "@/components/button";
import ClickableInfoBox from "@/components/clickable_info_box";
import defaultPage from "@/components/default";


enum CompetitionState {
    Active, Completed, Coming_Soon
}


interface CompetitionEvent {
    name: string;
    urlName: string;    // The competition name
    imageUrl: string;
    description: string;
    active: CompetitionState;
}

export default function Home() {
    const activeColour = "#4EA75D";
    const unactiveColour = "#A74E5D";
    const comingSoonColour = undefined;     // Defaults to WAI Purple when undefined

    // The competitions
    const competitions: CompetitionEvent[] = [{
        name: "Chess Competition",
        urlName: "chess",
        imageUrl: "/images/competition/chess/Chess_Competition.webp",
        description: "This is a chess competition! This description is WIP",
        active: CompetitionState.Coming_Soon
    }, {
        name: "Pacman Competition",
        urlName: "pacman",
        imageUrl: "/images/competition/pacman/Pacman_Competition.webp",
        description: "This is a PvP pacman competition! This description is WIP",
        active: CompetitionState.Completed
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
                    tag={
                        comp.active == CompetitionState.Active ? "Competition In Progress!" :
                            comp.active == CompetitionState.Completed ? "Competition Has Ended." : "Competition Coming Soon!"}
                    tagColour={
                        comp.active == CompetitionState.Active ? activeColour :
                            comp.active == CompetitionState.Completed ? unactiveColour : comingSoonColour}
                    clickLocation={`/competition/${comp.urlName}`}
                    description={comp.description}
                />
            ))}

            <BackButton />
        </div>,
    );
}
