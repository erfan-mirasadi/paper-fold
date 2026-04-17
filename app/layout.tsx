import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GrainOverlay from "./_components/ui-overlay/GrainOverlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quran Fold",
  description:
    "An interactive 3D visualization of the folding pattern of a traditional Quran, built with React Three Fiber and Next.js.",
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
