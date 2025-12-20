import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tripenzí App",
  description: "Moderní cestovní aplikace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      {/* Tady přidáme suppressHydrationWarning, aby ignoroval doplňky v prohlížeči */}
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}