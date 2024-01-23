import "../globals.css";
import ParticleBackground from "../particles/background";

export default function Home() {
  return (
    <div id="background" className="z-0 bg-pure-white">
      <div
        id="content"
        className="grid h-screen grid-cols-1 gap-12 p-1 overflow-y-auto place-content-center"
      >
        <div id="page-coming-soon" className="grid grid-cols-1 place-content-start">
          <p
            className="shadow-sm shadow-wai-gray bg-pure-white text-xl font-mono font-bold text-center text-wai-gray border-4 rounded-lg border-wai-gray p-4 w-fit justify-self-center"
          >
            page coming soon
          </p>
        </div>
      </div>
      <ParticleBackground />
    </div>
  );
}
