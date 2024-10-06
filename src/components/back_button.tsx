// Back button
"use client";

import { useRouter } from "next/navigation";

const classNames = `shadow-sm pl-6 pr-6 shadow-wai-gray bg-pure-white text-xl font-mono font-bold text-center text-wai-gray border-4 rounded-lg border-wai-gray p-4 justify-self-center hover:shadow-purple hover:border-purple hover:text-purple`;

export default function BackButton(props: { extraClasses?: string }) {
  const router = useRouter();
  const allClassNames = `${classNames} ${props.extraClasses}`;
  return (
    <button
      onClick={() => {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
      }}
      className={allClassNames}
    >
      &larr;
    </button>
  );
}
