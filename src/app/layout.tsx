import type { Metadata, Viewport } from "next";
import "./globals.css";

// 1. ZDE JE JEN SEO A PWA INFO
export const metadata: Metadata = {
  title: "Tripenzi",
  description: "Cestovatelská aplikace",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tripenzi",
  },
};

// 2. TOTO JE NOVÉ - MUSÍ BÝT ZVLÁŠŤ
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>
        {children}
      </body>
    </html>
  );
}