import { NextResponse } from "next/server";
import { DEMO_MOVIES } from "@/lib/constants";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || "";

/*
  POST /api/spin
  Body: { genres?: number[], language?: string, mood?: string }
  Returns a single weighted-random movie (server-side selection).
  
  Production: Add Redis caching with TTL 60s (shorter for variety).
  Redis key pattern: spin:{hash_of_filters}
*/

export async function POST(request: Request) {
  let body: { genres?: number[]; language?: string; mood?: string } = {};

  try {
    body = await request.json();
  } catch {
    // Empty body is fine — spin with no filters
  }

  // Fallback: no API key → weighted random from DEMO_MOVIES
  if (!API_KEY) {
    let pool = [...DEMO_MOVIES];

    // Filter by genres if provided
    if (body.genres && body.genres.length > 0) {
      const genreFiltered = pool.filter((m) =>
        m.genre_ids.some((g) => body.genres!.includes(g))
      );
      if (genreFiltered.length > 0) pool = genreFiltered;
    }

    // Weighted random: higher-rated movies have slightly more weight
    const weights = pool.map((m) => m.vote_average);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < pool.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return NextResponse.json(pool[i]);
      }
    }

    return NextResponse.json(pool[0]);
  }

  try {
    // Fetch a random page of results, then pick one randomly
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const genreParam =
      body.genres && body.genres.length > 0
        ? `&with_genres=${body.genres.join(",")}`
        : "";
    const langParam = body.language
      ? `&with_original_language=${body.language}`
      : "";

    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?language=en-US&sort_by=vote_average.desc&vote_count.gte=500&page=${randomPage}${genreParam}${langParam}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        next: { revalidate: 60 }, // 1 min cache
      }
    );

    if (!res.ok) {
      // Fallback to demo movies on API error
      const fallback = DEMO_MOVIES[Math.floor(Math.random() * DEMO_MOVIES.length)];
      return NextResponse.json(fallback);
    }

    const data = await res.json();
    const results = data.results || [];

    if (results.length === 0) {
      const fallback = DEMO_MOVIES[Math.floor(Math.random() * DEMO_MOVIES.length)];
      return NextResponse.json(fallback);
    }

    // Weighted random selection from API results
    const weights = results.map((m: { vote_average: number }) => m.vote_average);
    const totalWeight = weights.reduce((a: number, b: number) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < results.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return NextResponse.json(results[i]);
      }
    }

    return NextResponse.json(results[0]);
  } catch {
    const fallback = DEMO_MOVIES[Math.floor(Math.random() * DEMO_MOVIES.length)];
    return NextResponse.json(fallback);
  }
}
