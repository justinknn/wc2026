import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "WM 2026 Live | Turnierbaum & Gruppen",
  description:
    "Live-Turnierbaum der FIFA WM 2026 mit dynamischer Annex-C-Berechnung, Gruppenständen und Spielübersicht.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "WM 2026 Live",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${outfit.variable} ${jetbrains.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
