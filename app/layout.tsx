import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

// Photosynthesis design system — three faces, three jobs.
// Display: organic, used with restraint for titles / big stats.
const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display-src",
  subsets: ["latin"],
  weight: ["700", "800"],
});

// Body: warm, plain-spoken — all running copy, labels, buttons.
const fontBody = Hanken_Grotesk({
  variable: "--font-body-src",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Data: every measured number — carbon, points, streaks, tokens.
const fontData = Space_Mono({
  variable: "--font-data-src",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Sprout — see your day's carbon choices come alive",
  description:
    "Sprout turns four everyday decisions — food, commute, cooling, and travel — into a living world that heals or wilts in real time. India-localized, sourced, and built for behaviour over guilt.",
  openGraph: {
    title: "Sprout — a living world that responds to your choices",
    description:
      "Four everyday decisions drive most of a personal carbon footprint. Make a choice and watch your world respond.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontData.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-pine focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
