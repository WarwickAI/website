// Competition uploading page
import BackButton from "@/components/back_button";
import Button from "@/components/button";
import defaultPage, { defaultPageWithScroll } from "@/components/default";
import CompetitionSubmission from "./form";

export default function Home() {
  const submissionOpen = true;

  if (!submissionOpen) {
    return defaultPage(
      <div>
        <Button
          enabled={false}
          href=""
          text="Submissions are not currently open."
        />
        <BackButton />
      </div>,
    );
  }

  return defaultPageWithScroll(
    // Centered splash
    <>
      <h1 className="pt-16 text-center font-mono text-5xl font-bold text-wai-gray">
        Pac-Man AI Competition
      </h1>
      <div className="justify-self-center">
        <p className="max-w-3xl pb-4 text-center font-mono text-lg text-wai-gray md:text-xl">
          We are excited to announce that we are hosting our first ever
          competition!
          <br />
          <br />
          Your challenge is to create 2 best performing Pacman agents, which
          will go head-to-head against other submissions in a best of 3 Capture
          The Flag! To enter, read the guidelines below and submit your
          competition file. Submissions by the top 3 contestants will be awarded
          prizes!
          <br />
          <br />
          Good luck!
        </p>
      </div>
      {Pacman}
      <div className="w-full max-w-3xl justify-self-center rounded-lg border-4 border-blue-green bg-pure-white p-4 font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray md:w-fit">
        Submissions are not currently open. We are in the testing the
        competition environment. All submission will be deleted. Please check
        back soon!
      </div>
    </>,

    // Content
    <div className="grid grid-cols-1 place-content-center gap-12 p-1 pb-8">
      <div className="w-full max-w-3xl justify-self-center rounded-lg border-4 border-wai-gray bg-pure-white p-4 font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray md:w-fit">
        <h2 className="pb-4">Instructions:</h2>

        <p className="pb-4">
          Download the guide below! In the guide you will find information on:
        </p>
        <ul className="list-disc pb-4 pl-8">
          <li>Creating your Pacman agents.</li>
          <li>Submitting your agents.</li>
          <li>Extra resources.</li>
        </ul>

        <div className="flex justify-center">
          <Button
            href="https://drive.google.com/file/d/1lBM5U8IIzs5_Qapioc_wGkg9NDPfBOS2/view?usp=drive_link"
            text="Download Guide"
            enabled={true}
            extraClasses="mb-2"
          />
        </div>
      </div>
      <CompetitionSubmission />
    </div>,
  );
}

const Pacman = (
  <div>
    <style>
      {`
        @keyframes chomp {
          from {
            stroke-dasharray: 157,100;
            stroke-dashoffset: 0;
          }
          to {
            stroke-dasharray: 126,100;
            stroke-dashoffset: -15;
          }
        }
        @keyframes dots {
          from {
            width: 95%;
          }
          to {
            width: 5%;
          }
        }
      `}
    </style>
    <div className="w-vw box-border overflow-hidden bg-black">
      <div className="h-3 w-full rounded-xl border-x-2 border-y-2 border-solid border-[#2121de]"></div>
      <div className="path relative -ml-[200px] -mr-[200px] mb-2 mt-2 h-20">
        <div
          className="float-right h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(to left, #ddd 20%, transparent 0%)",
            backgroundPosition: "center right",
            backgroundSize: "50px 10px",
            backgroundRepeat: "repeat-x",
            animation: "dots 5s linear infinite",
          }}
        >
          <svg className="h-full" viewBox="0 0 100 100">
            <circle
              className="animated-circle fill-none stroke-[yellow] stroke-[50%]"
              style={{ animation: "chomp .15s linear infinite alternate" }}
              cx="50%"
              cy="50%"
              r="25%"
            ></circle>
          </svg>
        </div>
      </div>
      <div className="h-3 w-full rounded-xl border-x-2 border-y-2 border-solid border-[#2121de]"></div>
    </div>
  </div>
);
