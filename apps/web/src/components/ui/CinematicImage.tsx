"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES } from "@/lib/constants";

interface CinematicImageProps {
  path: string | null;
  alt: string;
  type?: "poster" | "backdrop";
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function CinematicImage({
  path,
  alt,
  type = "poster",
  fill = false,
  width,
  height,
  className = "",
  priority = false,
}: CinematicImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const size =
    type === "poster"
      ? IMAGE_SIZES.poster.xlarge
      : IMAGE_SIZES.backdrop.large;

  const src = path ? getImageUrl(path, size) : null;
  const blurSrc = path ? getImageUrl(path, "w92") : undefined;

  if (!src || error) {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{
          width: fill ? "100%" : width,
          height: fill ? "100%" : height,
          background: "linear-gradient(135deg, #f5f0e8, #ede5d8)",
        }}
      >
        <svg
          className="w-10 h-10 text-ink-muted/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: fill ? "100%" : width,
        height: fill ? "100%" : height,
      }}
    >
      {/* Shimmer placeholder */}
      {!loaded && (
        <div
          className="absolute inset-0 shimmer"
          style={{
            background: "linear-gradient(135deg, #f5f0e8, #ede5d8)",
          }}
        />
      )}

      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width:1200px) 33vw, 260px"
          quality={95}
          placeholder={blurSrc ? "blur" : "empty"}
          blurDataURL={blurSrc}
          className={`object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          priority={priority}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 300}
          height={height || 450}
          sizes="(max-width:1200px) 33vw, 260px"
          quality={95}
          placeholder={blurSrc ? "blur" : "empty"}
          blurDataURL={blurSrc}
          className={`object-cover transition-opacity duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          priority={priority}
        />
      )}
    </div>
  );
}
