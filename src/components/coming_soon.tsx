import defaultPage from "./default";

export default function comingSoon() {
  return defaultPage(
    <div>
      <div
        id="page-coming-soon"
        className="grid grid-cols-1 place-content-start"
      >
        <p className="box w-fit justify-self-center text-center text-xl font-bold">
          page coming soon
        </p>
      </div>
    </div>,
  );
}
