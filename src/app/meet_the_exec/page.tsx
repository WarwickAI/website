"use client"

import { defaultPageWithScroll } from "@/components/default";
import PersonInfo from "@/components/person_info";
import Papa from "papaparse";
import { useEffect, useState } from "react";


interface csvMeetTheExec {
    Name: string;
    Title: string;
    TitleColour: string;
    PictureURL: string;
    Description: string;
}


export default function Home() {
    const [execData, setExecData] = useState<csvMeetTheExec[]>([]);
    const [errored, setErrored] = useState(false);

    // Reduce requests (not by much lol)
    const execDetailsCSV = process.env.NODE_ENV === "production" ? "/data/exec/2024-2025.csv" : "https://yjvdlwzbqpqorfitrwpj.supabase.co/storage/v1/object/public/MeetTheExec/2024-2025.csv";

    // Defaults
    const defaultUnknownImage = "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg";
    const defaultDescription = "I have not yet submitted an about me! Please tell me to get on it!"


    useEffect(() => {
        // Fetch CSV
        const fetchCsv = async () => {
            try {
                const response = await fetch(execDetailsCSV);
                const csvText = await response.text();

                let exec: csvMeetTheExec[] = [];

                // Use PapaParse to parse the CSV
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function (results) {
                        exec = results.data as csvMeetTheExec[];
                    },
                });

                if (exec.length === 0) {
                    throw new Error("Failed reading CSV");
                }

                // Randomise the order of everyone other than the president for each client. This is to keep things fair.
                const president = exec[0];
                const otherExec = exec.slice(1);

                // Fisher-Yates shuffle
                for (let i = otherExec.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [otherExec[i], otherExec[j]] = [otherExec[j], otherExec[i]];
                }
                setExecData([president, ...otherExec]);

            } catch (error) {
                setErrored(true);
                console.error("Error fetching CSV:", error);
            }
        };

        fetchCsv();
    }, []);

    return defaultPageWithScroll(
        <div className="grid grid-cols-1 place-content-center gap-6 p-1 pb-8">
            <h1 className="pt-16 text-center font-mono text-5xl font-bold text-wai-gray">Meet the Exec!</h1>
            {errored ? (
                <div>
                  <p className="pt-16 text-center font-mono font-bold text-wai-gray">Failed to load data. Please let the exec know.</p>
                </div>
            ) : execData.length > 0 ? (
                execData.map((person, index) => (
                    <PersonInfo
                        key={index}
                        picture={person.PictureURL || defaultUnknownImage}
                        name={person.Name || "Unknown"}
                        tag={person.Title || "Unknown"}
                        tagColour={person.TitleColour || undefined}
                        description={person.Description || defaultDescription}
                    />
                ))
            ) : (
                <p>Loading...</p>
            )}

            {/* <PersonInfo
                picture="https://cdn.britannica.com/70/234870-050-D4D024BB/Orange-colored-cat-yawns-displaying-teeth.jpg"
                name="Jake"
                tag="Head of Engineering"
                description="Hi!"
            />
            <PersonInfo picture="https://cdn.britannica.com/36/234736-050-4AC5B6D5/Scottish-fold-cat.jpg" name="Amodeus" tag="Cheif Dimwhit" tagColour="text-blue-500" description="Dogs are key!" /> */}
        </div>,
        <></>
    );
}
