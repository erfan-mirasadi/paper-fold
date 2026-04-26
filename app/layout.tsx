import type { Metadata, Viewport } from "next";
import { Fira_Sans_Condensed, Inter } from "next/font/google";
import "./globals.css";
import GrainOverlay from "./_components/ui-overlay/GrainOverlay";

const inter = Inter({ subsets: ["latin"] });

const firaSansCondensed = Fira_Sans_Condensed({
  weight: ["500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-fira-sans-condensed",
});

export const metadata: Metadata = {
  title: "Alak",
  description:
    "Alak is an interactive 3D visualization of the first verses of the Quran, designed to evoke a sense of wonder and connection to the text. It combines traditional Arabic calligraphy with modern web technologies to create an immersive experience that invites exploration and reflection.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Alak",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.className} ${firaSansCondensed.variable} h-full antialiased`}
    >
      <body>
        <GrainOverlay />
        {children}
      </body>
    </html>
  );
}
