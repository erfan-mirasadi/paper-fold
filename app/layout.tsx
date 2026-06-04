import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { Manrope, Cormorant_Garamond, Poppins, DM_Serif_Text, Fraunces } from "next/font/google";
import "./globals.css";
import GrainOverlay from "./_components/dom/ui-overlay/GrainOverlay";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
});

const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const dmSerifText = DM_Serif_Text({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-serif",
});

const fraunces = Fraunces({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
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
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`dark ${manrope.variable} ${cormorantGaramond.variable} ${poppins.variable} ${dmSerifText.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="font-sans">
        <GrainOverlay />
        {children}
      </body>
    </html>
  );
}
