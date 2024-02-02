// Competition uploading page
import Button from "../components/button";
import defaultPage from "../components/default";
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
      </div>
    );
  }

  return defaultPage(
    <div>
      <CompetitionSubmission />
    </div>
  );
}
