// Competition uploading page
import BackButton from "@/components/back_button";
import Button from "@/components/button";
import defaultPage, { defaultPageWithScroll } from "@/components/default";
import Notice from "@/components/notice";
import ChessDemo from "@/components/chess/chess_demo";
import path from "path";
import { promises } from "fs";



export default async function Home() {
    // Get the chess stuff
    const chessDir = path.join(process.cwd(), 'private', 'chess');
    const files = await promises.readdir(chessDir);

    const randomFile = files[Math.floor(Math.random() * files.length)];

    const filePath = path.join(chessDir, randomFile);
    const fenData = (await promises.readFile(filePath, 'utf8')).trim();

    const submissionOpen = true;
    if (!submissionOpen) {
        return defaultPage(
            <div>
                <br />
                <Notice>
                    Submissions are not currently open.
                </Notice>
                <ChessDemo title={randomFile.replaceAll('_', ' ').replace('.fen', '')} fenData={fenData} tileSize="3vw" />
                <BackButton />
            </div>,
        );
    }

    // TODO: Replace this 
    return defaultPageWithScroll(
        // Centered splash
        <>
            <h1 className="pt-16 text-center font-mono text-5xl font-bold text-wai-gray">
                Chess AI Competition
            </h1>
            <div className="justify-self-center">
                <p className="max-w-3xl pb-4 text-center font-mono text-lg text-wai-gray md:text-xl">
                    <span className="font-semibold">
                        Welcome to our Chess AI Competition!
                    </span>
                    <br />
                    <br />
                    Your challenge is to create a chess AI, which
                    will go head-to-head against other submissions in a best of 3 matchup!
                    To enter, read the guidelines below and submit your python submission file.
                    Submissions by the top 3 contestants will be awarded prizes!
                    <br />
                    <br />
                    Good luck!
                </p>
            </div>
            <div className="w-full max-w-3xl justify-self-center rounded-lg border-4 border-blue-green bg-pure-white p-4 font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray md:w-fit">
                Submissions are now open! The competition will end on {"{TBD}"}. With results being announced on codenight the day after.
            </div>

            <ChessDemo title={randomFile.replaceAll('_', ' ').replace('.fen', '')} fenData={fenData} tileSize="5vh" />

            <Button
                href="/competition/chess/leaderboard"
                text="Leaderboard"
                enabled={false}
                extraClasses="mb-4"
            />
        </>,

        // Content
        <div className="grid grid-cols-1 place-content-center gap-12 p-1 pb-8">
            <div className="w-full max-w-3xl justify-self-center rounded-lg border-4 border-wai-gray bg-pure-white p-4 font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray md:w-fit">
                <h2 className="pb-4">Instructions:</h2>

                <p className="pb-4">
                    Download the guide below! In the guide you will find information on:
                </p>
                <ul className="list-disc pb-4 pl-8">
                    <li>Creating your first chess AI.</li>
                    <li>Submitting your chess AI.</li>
                    <li>Extra resources.</li>
                </ul>

                <p className="pb-4">
                    <br />
                    <br />
                    Big sorry. This area is under construction. Tight time constraints mean that corners are cut... :P
                    <br />
                    <br />
                    Also the stuff below won't work -- In progress of making it all seemless ;)
                </p>

                <div className="grid grid-cols-1 place-content-evenly md:grid-cols-2">
                    <Button
                        href="https://drive.google.com/file/d/1DYTTBrxv2MaLm7fGhhX3dwN3HJTwXXn4/view?usp=drive_link"
                        text="Download Guide"
                        enabled={false}
                        extraClasses="mb-2"
                    />
                    <Button
                        href="https://drive.google.com/file/d/15w9OcPIWhUvK5Xey7vmrTTgHmJSbtq19/view?usp=drive_link"
                        text="Sample Submission"
                        enabled={false}
                        extraClasses="mb-2"
                    />
                </div>
            </div>
        </div>,
    );
}






// ######################## OLD ########################

// import BackButton from '@/components/back_button';
// import ChessUrlWrapper from '@/components/chess/chess_from_url';
// import ChessBoardPlayable from '@/components/chess/chess_user_playable';
// import defaultPage from '@/components/default';
// import { Suspense } from 'react';


// export default function Home() {
//     return defaultPage(
//         <>
//             <Suspense fallback={<div>Loading...</div>}>
//                 <ChessBoardPlayable />
//             </Suspense>
//             <BackButton />
//         </>
//     );
// }
