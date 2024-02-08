// TODO(JakubCzarlinski): Add home page.
import Button from "@/components/button";
import comingSoon from "@/components/coming_soon";
import defaultPage from "@/components/default";
import "../globals.css";

export default function Home() {
  return comingSoon();
  // TODO(JakubCzarlinski): make this look nicer
  const extraClasses = "w-full";
  return defaultPage(
    <div>
      <div
        id="home-page-grid"
        className="grid grid-cols-1 place-content-start gap-12 p-1 md:grid-cols-2 md:place-content-center md:gap-2"
      >
        <Button
          href="/projects"
          text="projects"
          enabled={true}
          extraClasses={extraClasses}
          ariaLabel="Learn about our projects."
        />
        <Button
          href="/research"
          text="research"
          enabled={true}
          extraClasses={extraClasses}
          ariaLabel="Learn about our research."
        />
        <Button
          href="/safety"
          text="safety"
          enabled={true}
          extraClasses={extraClasses}
          ariaLabel="Learn about our safety department."
        />
        <Button
          href="/education"
          text="education"
          enabled={true}
          extraClasses={extraClasses}
          ariaLabel="Learn about our courses and tutorials."
        />
      </div>
    </div>,
  );
}
