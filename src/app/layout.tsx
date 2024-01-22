import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://warwick.ai"),
  applicationName: "Warwick AI",
  robots: {
    noimageindex: true,
  },
  title: "WAI",
  description: "Warwick AI",
  icons: {
    icon: [
      {
        url: "/images/favicon.svg",
        type: "image/svg+xml",
        sizes: "64x64",
      },
    ],
  },
  openGraph: {
    title: "WAI",
    description: "Warwick AI",
    type: "website",
    locale: "en_GB",
    url: "https://warwick.ai",
    images: [
      {
        url: "https://warwick.ai/images/wai.jpg",
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
