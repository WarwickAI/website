import defaultPage from "./default";

export default function comingSoon() {
  return defaultPage(
    <div>
      <div
        id="page-coming-soon"
        className="grid grid-cols-1 place-content-start"
      >
        <p className="shadow-sm shadow-wai-gray bg-pure-white text-xl font-mono font-bold text-center text-wai-gray border-4 rounded-lg border-wai-gray p-4 w-fit justify-self-center">
          page coming soon
        </p>
      </div>
    </div>
  );
}
