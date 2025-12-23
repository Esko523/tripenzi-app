import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister"; // <--- IMPORT

// Tady už NENÍ "use client", takže metadata budou fungovat
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
      <body suppressHydrationWarning={true}>
        <ServiceWorkerRegister /> {/* <--- VLOŽIT SEM */}
        {children}
      </body>
    </html>
  );
}