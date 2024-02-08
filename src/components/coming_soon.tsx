import defaultPage from "./default";

export default function comingSoon() {
  return defaultPage(
    <div>
      <div
        id="page-coming-soon"
        className="grid grid-cols-1 place-content-start"
      >
        <p className="w-fit justify-self-center rounded-lg border-4 border-wai-gray bg-pure-white p-4 text-center font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray">
          page coming soon
        </p>
      </div>
    </div>,
  );
}
