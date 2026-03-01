import { NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

type SpinFilters = {
  genres?: number[];
  language?: string;
};

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

function pickWeightedRandom(movies: TmdbMovie[]): TmdbMovie | null {
  if (movies.length === 0) return null;

  const weights = movies.map((movie) =>
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average
      : 1
  );
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let threshold = Math.random() * totalWeight;

  for (let i = 0; i < movies.length; i += 1) {
    threshold -= weights[i];
    if (threshold <= 0) return movies[i];
  }

  return movies[0];
}

function parseFiltersFromSearchParams(searchParams: URLSearchParams): SpinFilters {
  const genresRaw = searchParams.get("genres") || searchParams.get("genre") || "";
  const genres = genresRaw
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value));

  const language = searchParams.get("language") || searchParams.get("lang") || undefined;

  return {
    genres: genres.length > 0 ? genres : undefined,
    language,
  };
}

function parseFiltersFromBody(body: unknown): SpinFilters {
  if (!body || typeof body !== "object") return {};

  const source = body as { genres?: unknown; language?: unknown };
  const genres = Array.isArray(source.genres)
    ? source.genres
        .map((value) =>
          typeof value === "number" ? value : Number.parseInt(String(value), 10)
        )
        .filter((value) => Number.isFinite(value))
    : [];
  const language = typeof source.language === "string" ? source.language : undefined;

  return {
    genres: genres.length > 0 ? genres : undefined,
    language,
  };
}

async function getSpinResult(filters: SpinFilters) {
  const auth = getTmdbAuth();
  if (!auth) {
    return NextResponse.json(
      { error: "TMDB credentials are not configured." },
      { status: 500 }
    );
  }

  const randomPage = Math.floor(Math.random() * 10) + 1;
  const genresParam =
    filters.genres && filters.genres.length > 0
      ? `&with_genres=${encodeURIComponent(filters.genres.join(","))}`
      : "";
  const language = filters.language || "en-US";
  const languageParam = `&with_original_language=${encodeURIComponent(
    language.split("-")[0] || "en"
  )}`;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?language=${encodeURIComponent(
        language
      )}&sort_by=vote_average.desc&vote_count.gte=500&page=${randomPage}${genresParam}${languageParam}${auth.authQuery}`,
      {
        headers: auth.headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from TMDB." }, { status: 500 });
    }

    const data = (await response.json()) as TmdbDiscoverResponse;
    const results = Array.isArray(data.results) ? data.results : [];
    const selectedMovie = pickWeightedRandom(results);

    if (!selectedMovie) {
      return NextResponse.json({ error: "No movies found." }, { status: 500 });
    }

    return NextResponse.json(toBackendMovie(selectedMovie));
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = parseFiltersFromSearchParams(searchParams);
  return getSpinResult(filters);
}

export async function POST(request: Request) {
  let body: unknown = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const filters = parseFiltersFromBody(body);
  return getSpinResult(filters);
}
