import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

// Brand typefaces: Space Grotesk (display headlines), IBM Plex Sans (body
// reading), Space Mono (technical chrome — labels, dates, metadata).
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "NewsDigest",
  description: "Your daily news, compiled and explained.",
  // The share image is app/opengraph-image.png (file convention). On Vercel its
  // URL resolves against the production domain, so no metadataBase is needed.
  openGraph: {
    type: "website",
    title: "News Digest",
    description: "Your daily news, compiled and explained.",
  },
  appleWebApp: { capable: true, title: "NewsDigest", statusBarStyle: "default" },
  icons: { apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#edece3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
