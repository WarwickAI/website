import defaultPage from "@/components/default";
import { Event } from "@/classes/event"
import EventsDualPage from "@/components/events_dual_page";

export default async function Home() {
    // Creating this list has negatively harmed my mental health. Why oh why do I have to do this.
    // This has made me drastically reconsider how fun a data entry job would be. It went from "not fun" to "i'd rather lick cactuses for a living"
    const events: Event[] = [
        {
            event: [{
                id: "1",
                title: "Intro to AI",
                description: "A formal description of AI and introduction to types of AI. Includes a tour of commonly used machine learning techniques.",
                start: "2024-10-14T17:00:00Z",
                end: "2024-10-14T19:00:00Z",
                location: "MB0.08",
            }, {
                id: "2",
                title: "Intro to AI",
                description: "A formal description of AI and introduction to types of AI. Includes a tour of commonly used machine learning techniques.",
                start: "2024-10-21T17:00:00Z",
                end: "2024-10-21T19:00:00Z",
                location: "MB0.08",
            },
            ],

            pictureUrl: "/images/courses/intro_to_ai.webp",
            simpleDate: "Term 1 Week 3-4"
        },
        {
            event: [{
                id: "3",
                title: "Use AI to make art",
                description: "A short self-contained course on how to create AI art using ready-made diffusion models. No programming knowledge required.",
                start: "2024-10-28T17:00:00Z",
                end: "2024-10-28T19:00:00Z",
                location: "MB0.08",
            }, {
                id: "4",
                title: "Use AI to make art",
                description: "A short self-contained course on how to create AI art using ready-made diffusion models. No programming knowledge required.",
                start: "2024-11-04T17:00:00Z",
                end: "2024-11-04T19:00:00Z",
                location: "MB0.08",
            }
            ],
            pictureUrl: "/images/courses/ai_art.webp",
            simpleDate: "Term 1 Week 5-6"
        },
        {
            event: [{
                id: "5",
                title: "Neural Network Quickstart",
                description: "Learn how to prototype and build Neural Networks quickly to get started solving problems with AI. Neural Networks are immensely powerful and have been shown to be sufficient for the majority of problems.",
                start: "2024-11-18T17:00:00Z",
                end: "2024-11-18T19:00:00Z",
                location: "MB0.08",
            }, {
                id: "6",
                title: "Neural Network Quickstart",
                description: "Learn how to prototype and build Neural Networks quickly to get started solving problems with AI. Neural Networks are immensely powerful and have been shown to be sufficient for the majority of problems.",
                start: "2024-11-25T17:00:00Z",
                end: "2024-11-25T19:00:00Z",
                location: "MB0.08",
            }, {
                id: "7",
                title: "Neural Network Quickstart",
                description: "Learn how to prototype and build Neural Networks quickly to get started solving problems with AI. Neural Networks are immensely powerful and have been shown to be sufficient for the majority of problems.",
                start: "2024-12-02T17:00:00Z",
                end: "2024-12-02T19:00:00Z",
                location: "MB0.08",
            }
            ],
            pictureUrl: "/images/courses/neural_network.webp",
            simpleDate: "Term 1 Week 8-10"
        },
        {
            // T2
            event: [{
                id: "8",
                title: "Practical AI",
                description: "Learn how to structure AI problems and choose the right tools for the job. How to source and prepare datasets to aid your solutions.",
                start: "2025-01-13T17:00:00Z",
                end: "2025-01-13T19:00:00Z",
                location: "TBD",
            }, {
                id: "9",
                title: "Practical AI",
                description: "Learn how to structure AI problems and choose the right tools for the job. How to source and prepare datasets to aid your solutions.",
                start: "2025-01-20T17:00:00Z",
                end: "2025-01-20T19:00:00Z",
                location: "TBD",
            },
            ],
            pictureUrl: "/images/courses/practical_ai.webp",
            simpleDate: "Term 2 Week 2-3"
        },
        {
            event: [{
                id: "10",
                title: "Machine Learning",
                description: "Machine Learning and pattern recognition in all its glory. Covers numerous ML methods for prediction, feature extraction and feature reduction.",
                start: "2025-01-27T17:00:00Z",
                end: "2025-01-27T19:00:00Z",
                location: "TBD",
            }, {
                id: "11",
                title: "Machine Learning",
                description: "Machine Learning and pattern recognition in all its glory. Covers numerous ML methods for prediction, feature extraction and feature reduction.",
                start: "2025-02-03T17:00:00Z",
                end: "2025-02-03T19:00:00Z",
                location: "TBD",
            },
            ],
            pictureUrl: "/images/courses/machine_learning.webp",
            simpleDate: "Term 2 Week 4-5"
        },
        {
            event: [{
                id: "12",
                title: "Computer Vision",
                description: "Learn how to extract features from images for use in AI image-based applications. Discover specialised image processing models for computer vision based problems.",
                start: "2025-02-10T17:00:00Z",
                end: "2025-02-10T19:00:00Z",
                location: "TBD",
            }, {
                id: "13",
                title: "Computer Vision",
                description: "Learn how to extract features from images for use in AI image-based applications. Discover specialised image processing models for computer vision based problems.",
                start: "2025-02-17T17:00:00Z",
                end: "2025-02-17T19:00:00Z",
                location: "TBD",
            },
            ],
            pictureUrl: "/images/courses/computer_vision.webp",
            simpleDate: "Term 2 Week 6-7"
        },
        {
            event: [{
                id: "14",
                title: "Reinforcement Learning",
                description: "What is reinforcement learning, how can I use it and when? Learn how to build cooperative and adversarial agents for use in complex learning environments.",
                start: "2025-02-24T17:00:00Z",
                end: "2025-02-24T19:00:00Z",
                location: "TBD",
            }, {
                id: "15",
                title: "Reinforcement Learning",
                description: "What is reinforcement learning, how can I use it and when? Learn how to build cooperative and adversarial agents for use in complex learning environments.",
                start: "2025-03-03T17:00:00Z",
                end: "2025-03-03T19:00:00Z",
                location: "TBD",
            }, {
                id: "16",
                title: "Reinforcement Learning",
                description: "What is reinforcement learning, how can I use it and when? Learn how to build cooperative and adversarial agents for use in complex learning environments.",
                start: "2025-03-10T17:00:00Z",
                end: "2025-03-10T19:00:00Z",
                location: "TBD",
            },
            ],
            pictureUrl: "/images/courses/reinforcement_learning.webp",
            simpleDate: "Term 2 Week 8-10"
        },

    ];

    return defaultPage(
        <>
            <EventsDualPage
                pageTitle={"Courses"}
                pageSubtitle={"Here are the FREE courses we are running! We hope to see you there!"}
                events={events}
            />
        </>,
    );
}

