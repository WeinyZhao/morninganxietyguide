import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://morninganxietyguide.com"),
  title: {
    default: "Box Breathing Timer — Free 4-4-4-4 Tool for Morning Anxiety",
    template: "%s | Morning Anxiety Guide",
  },
  description:
    "Free box breathing timer with 4-4-4-4 pattern visualization. Reduce morning anxiety in 5 minutes. No signup, no download, works on all devices.",
  keywords: [
    "box breathing timer",
    "free box breathing",
    "4-4-4-4 breathing",
    "breathing timer online",
    "morning anxiety relief",
    "box breathing app",
  ],
  authors: [{ name: "Morning Anxiety Guide" }],
  openGraph: {
    type: "website",
    title: "Box Breathing Timer — Free 4-4-4-4 Tool",
    description:
      "Reduce morning anxiety in 5 minutes with our free box breathing timer. Visual 4-4-4-4 pattern, multiple patterns, no signup.",
    siteName: "Morning Anxiety Guide",
  },
  twitter: {
    card: "summary_large_image",
    title: "Box Breathing Timer",
    description: "Free 4-4-4-4 breathing tool for morning anxiety relief.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
