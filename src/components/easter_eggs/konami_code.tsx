"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

const KonamiCodeListener: React.FC = () => {
  const [keySequence, setKeySequence] = useState<string[]>([]);

  useEffect(() => {
    // The konami code!
    const konamiCode = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
      "Enter",
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      setKeySequence((prevSequence) =>
        [...prevSequence, event.key].slice(-konamiCode.length),
      );
    };

    // Konami Code check
    if (JSON.stringify(keySequence) === JSON.stringify(konamiCode)) {
      console.log("Konami Code entered!");
      setKeySequence([]);

      // I hide this from you :)
      redirect(
        atob("aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ=="),
      );
    }

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [keySequence]);

  return null;
};

export default KonamiCodeListener;
