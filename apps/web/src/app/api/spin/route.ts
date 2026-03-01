import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const GENRE_TO_ID: Record<string, number> = {
  Action: 28,
  Drama: 18,
  Comedy: 35,
  "Sci-Fi": 878,
  Horror: 27,
  Romance: 10749,
  Thriller: 53,
  Animation: 16,
};

const MOOD_TO_GENRE_IDS: Record<string, number[]> = {
  "Mind-Bending": [878, 9648, 53],
  Comfort: [35, 10751, 16],
  Dark: [27, 53, 80],
  Uplifting: [35, 10751, 10402],
  Epic: [28, 12, 14],
  Romantic: [10749, 18],
};

const LANGUAGE_TO_CODE: Record<string, string> = {
  English: "en",
  Korean: "ko",
  Japanese: "ja",
  French: "fr",
  Spanish: "es",
  Hindi: "hi",
};

const ERA_TO_RANGE: Record<string, { gte: string; lte?: string }> = {
  "Classic (pre-1980)": { gte: "1900-01-01", lte: "1979-12-31" },
  "80s & 90s": { gte: "1980-01-01", lte: "1999-12-31" },
  "2000s": { gte: "2000-01-01", lte: "2009-12-31" },
  "2010s": { gte: "2010-01-01", lte: "2019-12-31" },
  "Recent (2020+)": { gte: "2020-01-01" },
};

const RATING_TO_THRESHOLD: Record<string, number> = {
  "9+ Masterpiece": 9,
  "8+ Excellent": 8,
  "7+ Great": 7,
};

type SpinFilterInput = {
  genre?: string | null;
  genres?: unknown;
  mood?: string | null;
  era?: string | null;
  language?: string | null;
  lang?: string | null;
  rating?: string | null;
};

type ResolvedSpinFilters = {
  genreIds: number[];
  mood: string | null;
  era: string | null;
  languageCode: string;
  ratingThreshold: number | null;
  hasActiveFilters: boolean;
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

function parseGenreIds(rawValue: string | null) {
  if (!rawValue) return [] as number[];

  return rawValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const numeric = Number.parseInt(item, 10);
      if (Number.isFinite(numeric)) return numeric;
      return GENRE_TO_ID[item] ?? null;
    })
    .filter((value): value is number => typeof value === "number");
}

function parseLanguageCode(value: string | null) {
  if (!value) return "en";
  if (LANGUAGE_TO_CODE[value]) return LANGUAGE_TO_CODE[value];
  if (value.includes("-")) return value.split("-")[0].toLowerCase();
  if (value.length === 2) return value.toLowerCase();
  return "en";
}

function parseRatingThreshold(value: string | null) {
  if (!value || value === "Any") return null;
  if (RATING_TO_THRESHOLD[value]) return RATING_TO_THRESHOLD[value];

  const match = value.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRawFilters(searchParams: URLSearchParams, body: SpinFilterInput): SpinFilterInput {
  const rawGenresFromBody = Array.isArray(body.genres) ? body.genres.join(",") : null;

  return {
    genre: searchParams.get("genre") ?? body.genre ?? rawGenresFromBody,
    mood: searchParams.get("mood") ?? body.mood ?? null,
    era: searchParams.get("era") ?? body.era ?? null,
    language:
      searchParams.get("language") ??
      searchParams.get("lang") ??
      body.language ??
      body.lang ??
      null,
    rating: searchParams.get("rating") ?? body.rating ?? null,
  };
}

function resolveFilters(raw: SpinFilterInput): ResolvedSpinFilters {
  const baseGenreIds = parseGenreIds(raw.genre ?? null);
  const moodGenreIds = raw.mood && MOOD_TO_GENRE_IDS[raw.mood] ? MOOD_TO_GENRE_IDS[raw.mood] : [];
  const genreIds = Array.from(new Set([...baseGenreIds, ...moodGenreIds]));
  const languageCode = parseLanguageCode(raw.language ?? null);
  const ratingThreshold = parseRatingThreshold(raw.rating ?? null);

  const hasActiveFilters = Boolean(
    (raw.genre && raw.genre.trim().length > 0) ||
      (raw.mood && raw.mood.trim().length > 0) ||
      (raw.era && raw.era.trim().length > 0) ||
      (raw.language && raw.language.trim().length > 0) ||
      (raw.rating && raw.rating.trim().length > 0 && raw.rating !== "Any")
  );

  return {
    genreIds,
    mood: raw.mood ?? null,
    era: raw.era ?? null,
    languageCode,
    ratingThreshold,
    hasActiveFilters,
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

async function getSpinResult(rawFilters: SpinFilterInput) {
  const auth = getTmdbAuth();
  if (!auth) {
    return NextResponse.json(
      { error: "TMDB credentials are not configured." },
      { status: 500 }
    );
  }

  const filters = resolveFilters(rawFilters);
  const eraRange = filters.era ? ERA_TO_RANGE[filters.era] : undefined;

  if (process.env.NODE_ENV !== "production") {
    console.log("[api/spin] filters", {
      rawFilters,
      resolved: filters,
      eraRange,
    });
  }

  const randomPage = Math.floor(Math.random() * 10) + 1;

  const genreParam =
    filters.genreIds.length > 0
      ? `&with_genres=${encodeURIComponent(filters.genreIds.join(","))}`
      : "";
  const languageParam = `&with_original_language=${encodeURIComponent(filters.languageCode)}`;
  const ratingParam =
    typeof filters.ratingThreshold === "number"
      ? `&vote_average.gte=${encodeURIComponent(String(filters.ratingThreshold))}`
      : "";
  const releaseStartParam =
    eraRange?.gte ? `&primary_release_date.gte=${encodeURIComponent(eraRange.gte)}` : "";
  const releaseEndParam =
    eraRange?.lte ? `&primary_release_date.lte=${encodeURIComponent(eraRange.lte)}` : "";

  const filterParams = filters.hasActiveFilters
    ? `${genreParam}${languageParam}${ratingParam}${releaseStartParam}${releaseEndParam}`
    : `${languageParam}`;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?language=en-US&sort_by=vote_average.desc&vote_count.gte=500&page=${randomPage}${filterParams}${auth.authQuery}`,
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

export async function GET(request: NextRequest) {
  const filters = parseRawFilters(request.nextUrl.searchParams, {});
  return getSpinResult(filters);
}

export async function POST(request: NextRequest) {
  let body: SpinFilterInput = {};

  try {
    body = (await request.json()) as SpinFilterInput;
  } catch {
    body = {};
  }

  const filters = parseRawFilters(request.nextUrl.searchParams, body);
  return getSpinResult(filters);
}
