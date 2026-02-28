import { NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || "";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (!API_KEY) {
    return NextResponse.json({ error: "No TMDB API key configured" }, { status: 500 });
  }

  const headers = {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };

  try {
    let endpoint = "";

    switch (action) {
      case "trending":
        endpoint = "/trending/movie/week?language=en-US";
        break;
      case "discover": {
        const genres = searchParams.get("genres") || "";
        const page = searchParams.get("page") || "1";
        endpoint = `/discover/movie?language=en-US&sort_by=vote_average.desc&vote_count.gte=500&page=${page}${genres ? `&with_genres=${genres}` : ""}`;
        break;
      }
      case "movie": {
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Movie ID required" }, { status: 400 });
        endpoint = `/movie/${id}?language=en-US`;
        break;
      }
      case "similar": {
        const movieId = searchParams.get("id");
        if (!movieId) return NextResponse.json({ error: "Movie ID required" }, { status: 400 });
        endpoint = `/movie/${movieId}/similar?language=en-US&page=1`;
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const res = await fetch(`${TMDB_BASE_URL}${endpoint}`, { headers });
    if (!res.ok) {
      return NextResponse.json({ error: "TMDB API error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
