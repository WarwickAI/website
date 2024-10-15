import defaultPage from "@/components/default";
import PersonInfo from "@/components/person_info";

export default function Home() {
  const enablePage = false;
  if (!enablePage) {
    return defaultPage(
      <>
        <PersonInfo picture={""} name={"Jakub"} tag={""} description={"TBD"} />
        <PersonInfo
          picture={""}
          name={"Jake Turrell"}
          tag={""}
          description={"TBD"}
        />
      </>,
    );
  }
}
