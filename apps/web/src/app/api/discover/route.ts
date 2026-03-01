import { NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

type TmdbMovie = {
  id: number;
  title?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
};

type TmdbDiscoverResponse = {
  results?: TmdbMovie[];
};

type TmdbAuth = {
  headers: Record<string, string>;
  authQuery: string;
};

function getTmdbAuth(): TmdbAuth | null {
  const readToken = process.env.TMDB_READ_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  if (readToken) {
    return {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${readToken}`,
      },
      authQuery: "",
    };
  }

  if (!apiKey) return null;

  if (apiKey.includes(".")) {
    return {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      authQuery: "",
    };
  }

  return {
    headers: {
      accept: "application/json",
    },
    authQuery: `&api_key=${encodeURIComponent(apiKey)}`,
  };
}

function toBackendMovie(movie: TmdbMovie) {
  return {
    id: movie.id,
    title: movie.title ?? "Untitled",
    poster: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
    backdrop: movie.backdrop_path
      ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}`
      : null,
    rating: typeof movie.vote_average === "number" ? movie.vote_average : 0,
    release_date: movie.release_date ?? "",
  };
}

export async function GET(request: Request) {
  const auth = getTmdbAuth();
  if (!auth) {
    return NextResponse.json(
      { error: "TMDB credentials are not configured." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre");
  const lang = searchParams.get("lang") || "en-US";
  const pageRaw = Number.parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const genreParam = genre ? `&with_genres=${encodeURIComponent(genre)}` : "";
  const langParam = `&with_original_language=${encodeURIComponent(
    lang.split("-")[0] || "en"
  )}`;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?language=${encodeURIComponent(
        lang
      )}&sort_by=vote_average.desc&vote_count.gte=500&page=${page}${genreParam}${langParam}${auth.authQuery}`,
      {
        headers: auth.headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from TMDB." }, { status: 500 });
    }

    const data = (await response.json()) as TmdbDiscoverResponse;
    const results = Array.isArray(data.results) ? data.results.map(toBackendMovie) : [];
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
