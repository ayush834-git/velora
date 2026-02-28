import { NextResponse } from "next/server";
import { DEMO_MOVIES } from "@/lib/constants";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || "";

/*
  GET /api/discover?genre=28&lang=en&page=1
  Returns paginated movies filtered by genre and language.
  Falls back to DEMO_MOVIES when no API key is configured.
  
  Production: Add Redis caching with TTL 300s on frequent queries.
  Redis key pattern: discover:genre=28:lang=en:page=1
*/

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const lang = searchParams.get("lang") || "en-US";
  const page = searchParams.get("page") || "1";

  // Fallback: no API key → filter demo movies client-side
  if (!API_KEY) {
    let filtered = [...DEMO_MOVIES];
    if (genre) {
      const genreId = parseInt(genre, 10);
      filtered = filtered.filter((m) => m.genre_ids.includes(genreId));
    }
    return NextResponse.json({
      results: filtered.slice(0, 20),
      total_pages: 1,
      page: 1,
      total_results: filtered.length,
    });
  }

  try {
    const genreParam = genre ? `&with_genres=${genre}` : "";
    const langParam = lang ? `&with_original_language=${lang.split("-")[0]}` : "";

    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?language=${lang}&sort_by=vote_average.desc&vote_count.gte=500&page=${page}${genreParam}${langParam}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        next: { revalidate: 300 }, // 5 min cache (Next.js ISR)
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "TMDB API error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
