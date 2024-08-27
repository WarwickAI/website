// Summit details and ticket purchase page.

import comingSoon from "@/components/coming_soon";
export const dynamic = "force-dynamic";

export default function Home() {
  const enablePage = false;
  if (!enablePage) {
    return comingSoon()
  }
}