/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/tmdb";

interface BlurUpImageProps {
  path: string | null;
  alt: string;
  type?: "poster" | "backdrop";
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/*
  Blur-up strategy:
  1) Tiny w92 thumbnail loaded inline as CSS-blurred placeholder (< 3KB)
  2) Next.js Image loads w342/w780 via responsive srcset
  3) Opacity transition on load for smooth reveal (700ms)

  srcset mapping:
    poster:   w92 (blur) → w185 (thumb) → w342 (mobile) → w500 (tablet) → w780 (large)
    backdrop: w92 (blur) → w300 (mobile) → w780 (tablet) → w1280 (desktop)
*/
const SIZE_MAP = {
  poster: "w500",
  backdrop: "w1280",
} as const;

export default function BlurUpImage({
  path,
  alt,
  type = "poster",
  fill = false,
  width,
  height,
  className = "",
  priority = false,
}: BlurUpImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!path || error) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}
        style={{ width: fill ? "100%" : width, height: fill ? "100%" : height,
          background: "linear-gradient(135deg, #f5f0e8, #ede5d8)" }}>
        <span className="text-ink-muted/30 text-xs">No Image</span>
      </div>
    );
  }

  // Tiny placeholder — w92 TMDB thumbnail, CSS-blurred
  const placeholderSrc = getImageUrl(path, "w92");
  const mainSrc = getImageUrl(path, SIZE_MAP[type]);

  // Responsive sizes for Next.js Image srcset
  const sizes =
    type === "poster"
      ? "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px"
      : "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1280px";

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: fill ? "100%" : width,
        height: fill ? "100%" : height,
      }}
    >
      {/* Blur placeholder — visible until hi-res loads */}
      {!loaded && !error && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "blur(20px)", transform: "scale(1.1)" }}
          onError={() => setError(true)}
        />
      )}

      {fill ? (
        <Image
          src={mainSrc}
          alt={alt}
          fill
          sizes={sizes}
          quality={95}
          className={`object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          priority={priority}
          unoptimized={true}
        />
      ) : (
        <Image
          src={mainSrc}
          alt={alt}
          width={width || 300}
          height={height || 450}
          sizes={sizes}
          quality={95}
          className={`object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          priority={priority}
          unoptimized={true}
        />
      )}
    </div>
  );
}
