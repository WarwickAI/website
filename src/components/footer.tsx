// Footer for the website
import { WaiLogo } from "@/components/icons";
import noiseSvg from "@/components/noise.svg";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="grid h-24 w-full place-content-center bg-wai-gray p-4">
      <div className="grid grid-cols-3 gap-12">
        <Link
          href={"/"}
          aria-label="Go to the home page."
          className="col-span-1 grid grid-cols-1 place-content-center"
        >
          {WaiLogo}
        </Link>
        <p className="col-span-2 grid place-content-center text-center font-mono text-lg font-bold text-lavender">
          &copy; 2024 Warwick Artificial Intelligence
        </p>
      </div>
    </div>
  );
}

const noise = (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <filter id="noiseFilter">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.1"
        numOctaves="3"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);
