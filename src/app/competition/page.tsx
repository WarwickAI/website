// Competition uploading page
import BackButton from "@/components/back_button";
import Button from "@/components/button";
import defaultPage from "@/components/default";
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

  return defaultPage(
    <div>
      <h1 className="pt-16 text-center font-mono text-5xl font-bold text-wai-gray">
        Pac-Man AI Competition
      </h1>
      <CompetitionSubmission />
    </div>,
  );
}
