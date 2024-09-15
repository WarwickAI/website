"use server"

import comingSoon from "@/components/coming_soon";
import defaultPage from "@/components/default";
import Notice from "@/components/notice";
import PersonInfo from "@/components/person_info";
export const dynamic = "force-dynamic";

export default function Home() {
  const enablePage = false;
  if (!enablePage) {
    return defaultPage(
      <>
        <PersonInfo picture={""} name={"Jakub"} tag={""} description={"TBD"} />
        <PersonInfo picture={""} name={"Jake Turrell"} tag={""} description={"TBD"} />
      </>
    );
  }
}
