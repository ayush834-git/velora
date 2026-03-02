"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "@/lib/gsapConfig";
import { IMAGE_SIZES } from "@/lib/constants";
import { getBackdropPath, getPosterPath } from "@/lib/movie-utils";
import { getImageUrl } from "@/lib/tmdb";
import { Movie } from "@/types/movie";

interface ParallaxBackgroundProps {
  movies?: Movie[];
}

type ParticleSpec = {
  top: string;
  left: string;
  delay: string;
  duration: string;
};

function uniquePaths(paths: string[]) {
  const seen = new Set<string>();
  return paths.filter((path) => {
    if (seen.has(path)) return false;
    seen.add(path);
    return true;
  });
}

export default function ParallaxBackground({ movies = [] }: ParallaxBackgroundProps) {
  // New VELORA cinematic background system injected in layout overrides this.
  return null;
}
