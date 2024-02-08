import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.warwick.ai"),
  applicationName: "Warwick AI",
  robots: {
    noimageindex: true,
  },
  title: "WAI",
  description:
    "Warwick Artificial Intelligence is the gateway to AI at the University of Warwick with various projects, educational courses and research opportunities on offer as well as a range of social events. Students of all levels and backgrounds are welcome.",
  icons: {
    icon: [
      {
        url: "/images/favicon.svg",
        type: "image/svg+xml",
        sizes: "96x96",
      },
    ],
  },
  openGraph: {
    title: "WAI",
    description:
      "Warwick Artificial Intelligence is the gateway to AI at the University of Warwick with various projects, educational courses and research opportunities on offer as well as a range of social events. Students of all levels and backgrounds are welcome.",
    siteName: "Warwick.AI",
    type: "website",
    locale: "en_GB",
    url: "https://www.warwick.ai",
    images: [
      {
        url: "https://www.warwick.ai/images/wai.jpg",
        width: 64,
        height: 64,
        alt: "WAI logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
