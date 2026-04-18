import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GrainOverlay from "./_components/ui-overlay/GrainOverlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alak",
  description:
    "Alak is an interactive 3D visualization of the first verses of the Quran, designed to evoke a sense of wonder and connection to the text. It combines traditional Arabic calligraphy with modern web technologies to create an immersive experience that invites exploration and reflection.",
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
      className={`${inter.className} h-full antialiased`}
    >
      <body>
        <GrainOverlay />
        {children}
      </body>
    </html>
  );
}
