import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { FilterProvider } from "@/context/FilterContext";
import VeloraBackgroundLayer from "@/components/VeloraBackground";
import VeloraCursor from "@/components/VeloraCursor";
import WatchlistDrawer from "@/components/WatchlistDrawer";
import { TrailerProvider } from "@/context/TrailerContext";

export const metadata: Metadata = {
  title: "VELORA - Today, Fate Chooses Your Film",
  description:
    "An AI-powered cinematic ritual that discovers the perfect film for this exact moment in your life. A digital art installation for movie discovery.",
  keywords: ["movies", "film discovery", "AI", "cinematic", "movie recommendation"],
  openGraph: {
    title: "VELORA - Today, Fate Chooses Your Film",
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
      <head>
        <link rel="preload" as="image" href="/assets/backgrounds/velora-bg-amber.avif" type="image/avif" />
        <link rel="preload" as="image" href="/assets/backgrounds/velora-bg-champagne.avif" type="image/avif" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <VeloraBackgroundLayer />
        <VeloraCursor />
        <TrailerProvider>
          <FilterProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </FilterProvider>
          <WatchlistDrawer />
        </TrailerProvider>
        <div className="velora-grain" aria-hidden="true" />
      </body>
    </html>
  );
}
