import BackButton from "@/components/back_button";
import defaultPage from "@/components/default";
import Notice from "@/components/notice";

export default function Home() {
  return defaultPage(
    <div>
      <Notice>Page under construction...</Notice>
      <BackButton />
    </div>,
  );
}
