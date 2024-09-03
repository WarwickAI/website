import Button from "@/components/button";
import comingSoon from "@/components/coming_soon";
import defaultPage, { defaultPageWithScroll } from "@/components/default";
import PersonInfo from "@/components/person_info";


export default function Home() {
    return defaultPageWithScroll(
        <div className="grid grid-cols-1 place-content-center gap-6 p-1 pb-8">
            <h1 className="pt-16 text-center font-mono text-5xl font-bold text-wai-gray">Meet the Exec!</h1>
            <PersonInfo picture="https://cdn.britannica.com/70/234870-050-D4D024BB/Orange-colored-cat-yawns-displaying-teeth.jpg" name="Jake" tag="Head of Engineering" description="Hi!" />
            <PersonInfo picture="https://cdn.britannica.com/36/234736-050-4AC5B6D5/Scottish-fold-cat.jpg" name="Amodeus" tag="Cheif Dimwhit" tagColour="text-blue-500" description="Dogs are key!" />
        </div>,
        <></>
    );
}
