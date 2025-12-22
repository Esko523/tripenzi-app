import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CacheLogger from "@/components/CacheLogger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- ZDE JE OPRAVA ---
// Viewport se v Next.js 16+ definuje takto samostatně:
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Zákaz zoomování (native app feel)
};

export const metadata: Metadata = {
  title: "Tripenzi",
  description: "Plánování výletů a sdílení nákladů",
  manifest: "/manifest.json", // Odkaz na PWA manifest
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tripenzi",
  },
  // Tady už "viewport" nesmí být
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>
        {/* PŘIDAT LOGGER SEM: */}
        <CacheLogger />
        
        {children}
      </body>
    </html>
  );
}

