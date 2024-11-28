import { redirect, RedirectType } from "next/navigation";

export default function Home() {
  redirect("https://forms.gle/p6C9vjsQEUQuypEV7", RedirectType.replace);
}
