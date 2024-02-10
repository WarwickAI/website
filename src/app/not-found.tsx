// 404 Page

import Button from "@/components/button";
import defaultPage from "@/components/default";

export default function NotFound() {
  return defaultPage(
    <div>
      <Button
        href="/"
        enabled={true}
        text="Page not found."
        ariaLabel="Click to go home."
      />
    </div>,
  );
}
