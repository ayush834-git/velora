import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { FilterProvider } from "@/context/FilterContext";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VELORA — Tonight, Fate Chooses Your Film",
  description:
    "An AI-powered cinematic ritual that discovers the perfect film for this exact moment in your life. A digital art installation for movie discovery.",
  keywords: ["movies", "film discovery", "AI", "cinematic", "movie recommendation"],
  openGraph: {
    title: "VELORA — Tonight, Fate Chooses Your Film",
    description:
      "An AI-powered cinematic ritual that discovers the perfect film for this exact moment in your life.",
    type: "website",
    siteName: "VELORA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
        style={{ background: "#faf8f5", color: "#1a1a2e" }}
        suppressHydrationWarning
      >
        <FilterProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </FilterProvider>
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
