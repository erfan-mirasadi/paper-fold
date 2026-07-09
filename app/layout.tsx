import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { Manrope, Cormorant_Garamond, Poppins, DM_Serif_Text, Fraunces } from "next/font/google";
import "./globals.css";
import GrainOverlay from "./_components/dom/ui-overlay/GrainOverlay";
import AudioUnlockInitializer from "./_components/dom/AudioUnlockInitializer";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
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

const SITE_NAME = "Quran Patterns";
const SITE_DESCRIPTION =
  "Quran Patterns is an interactive 3D visualization of the Quran — combining traditional Arabic calligraphy with immersive WebGL paper-fold experiences that invite exploration and reflection.";
// Encoded so Next's metadata resolver never has to guess how to escape the space.
const DEFAULT_OG_IMAGE = "/hero/Hero%20section.jpg";

export const metadata: Metadata = {
  metadataBase: new URL("https://quranpatterns.com"),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
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
  children: ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`light ${manrope.variable} ${cormorantGaramond.variable} ${poppins.variable} ${dmSerifText.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hostname === 'localhost' && window.location.port === '3000') {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <AudioUnlockInitializer />
        <GrainOverlay />
        {children}
      </body>
    </html>
  );
}
