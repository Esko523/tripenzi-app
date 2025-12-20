import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tripenzí",
  description: "Cestuj chytře.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={`${outfit.className} bg-slate-50 text-slate-900 antialiased`}>
        <div className="mx-auto max-w-md min-h-screen bg-white shadow-2xl overflow-hidden relative">
           {children}
        </div>
      </body>
    </html>
  );
}