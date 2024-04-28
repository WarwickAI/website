// Competition uploading page
import BackButton from "@/components/back_button";
import Button from "@/components/button";
import defaultPage, { defaultPageWithScroll } from "@/components/default";
import { Pacman } from "@/components/pacman";
import Link from "next/link";
import CompetitionSubmission from "./form";

export default function Home() {
  const submissionOpen = false;

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
      <Pacman />
      <div className="w-full max-w-3xl justify-self-center rounded-lg border-4 border-blue-green bg-pure-white p-4 font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray md:w-fit">
        Submissions are now open! The competition will end on midnight, 24th
        April 2024. With results being announced on codenight the day after.
      </div>

      <Button
        href="/competition/leaderboard"
        text="Leaderboard"
        enabled={true}
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
          <li>Creating your Pacman agents.</li>
          <li>Submitting your agents.</li>
          <li>Extra resources.</li>
        </ul>

        <p className="pb-4">
          We will be supporting Python 3.11 with PyTorch 2.2. We highly
          recommend using Conda environments to manage your dependencies.
          <br />
          <br />
          If you require any additional packages, please let us know in the
          discord under #pacman-competition.
          <br />
          <br />
          You can submit once per hour. New submissions will override your
          previous submission. The leaderboard will be hidden on the last day of
          the competition, although, it will not be frozen so submit with
          caution!
          <br />
          <br />
          Downloads:
        </p>

        <div className="grid grid-cols-1 text-base">
          Conda:
          <Link
            href={"https://docs.anaconda.com/free/miniconda/miniconda-install/"}
            aria-label="Download Miniconda"
            className="text-wrap pb-4 pl-4 pr-4 text-sm"
          >
            https://docs.anaconda.com/free/miniconda/miniconda-install/
          </Link>
          PyTorch:
          <Link
            href={"https://pytorch.org/get-started/locally/"}
            aria-label="Download PyTorch"
            className="text-wrap pb-4 pl-4 pr-4 text-sm"
          >
            https://pytorch.org/get-started/locally/
          </Link>
        </div>

        <div className="grid grid-cols-1 place-content-evenly md:grid-cols-2">
          <Button
            href="https://drive.google.com/file/d/1DYTTBrxv2MaLm7fGhhX3dwN3HJTwXXn4/view?usp=drive_link"
            text="Download Guide"
            enabled={true}
            extraClasses="mb-2"
          />
          <Button
            href="https://drive.google.com/file/d/15w9OcPIWhUvK5Xey7vmrTTgHmJSbtq19/view?usp=drive_link"
            text="Sample Submission"
            enabled={true}
            extraClasses="mb-2"
          />
        </div>
      </div>
      <CompetitionSubmission />
    </div>,
  );
}
