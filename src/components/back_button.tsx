// Back button
"use client";

import { useRouter } from "next/navigation";

const className =
  "shadow-sm box text-xl font-bold text-center justify-self-center hover:shadow-purple hover:border-purple hover:text-purple";

export default function BackButton(props: { extraClasses?: string }) {
  const router = useRouter();
  const allClassNames = `${className} ${props.extraClasses}`;
  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      }}
      className={allClassNames}
      style={{paddingLeft: "1.5rem", paddingRight: "1.5rem"}}
    >
      &larr;
    </button>
  );
}
