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

export async function GET(request: NextRequest) {
  const auth = getTmdbAuth();
  if (!auth) {
    return NextResponse.json(
      { error: "TMDB credentials are not configured." },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const genre = searchParams.get("genre");
  const mood = searchParams.get("mood");
  const era = searchParams.get("era");
  const language = searchParams.get("language") || searchParams.get("lang");
  const rating = searchParams.get("rating");
  const pageRaw = Number.parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const selectedGenreIds = parseGenreIds(genre);
  const moodGenreIds = mood && MOOD_TO_GENRE_IDS[mood] ? MOOD_TO_GENRE_IDS[mood] : [];
  const combinedGenreIds = Array.from(new Set([...selectedGenreIds, ...moodGenreIds]));
  const languageCode = parseLanguageCode(language);
  const ratingThreshold = parseRatingThreshold(rating);
  const eraRange = era ? ERA_TO_RANGE[era] : undefined;

  if (process.env.NODE_ENV !== "production") {
    console.log("[api/discover] filters", {
      genre,
      mood,
      era,
      language,
      rating,
      combinedGenreIds,
      languageCode,
      ratingThreshold,
      eraRange,
    });
  }

  const genreParam =
    combinedGenreIds.length > 0
      ? `&with_genres=${encodeURIComponent(combinedGenreIds.join(","))}`
      : "";
  const languageParam = `&with_original_language=${encodeURIComponent(languageCode)}`;
  const ratingParam =
    typeof ratingThreshold === "number"
      ? `&vote_average.gte=${encodeURIComponent(String(ratingThreshold))}`
      : "";
  const releaseStartParam =
    eraRange?.gte
      ? `&release_date.gte=${encodeURIComponent(
          eraRange.gte
        )}&primary_release_date.gte=${encodeURIComponent(eraRange.gte)}`
      : "";
  const releaseEndParam =
    eraRange?.lte
      ? `&release_date.lte=${encodeURIComponent(
          eraRange.lte
        )}&primary_release_date.lte=${encodeURIComponent(eraRange.lte)}`
      : "";

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?language=en-US&sort_by=vote_average.desc&vote_count.gte=500&page=${page}${genreParam}${languageParam}${ratingParam}${releaseStartParam}${releaseEndParam}${auth.authQuery}`,
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
