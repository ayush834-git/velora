import { BackendMovie, Movie } from "@/types/movie";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function toTmdbPath(urlOrPath: string | null | undefined): string | null {
  if (!urlOrPath) return null;

  if (urlOrPath.includes("null")) return null;

  if (urlOrPath.startsWith("/")) return urlOrPath;

  try {
    const parsed = new URL(urlOrPath);
    const pathname = parsed.pathname;
    const match = pathname.match(/^\/t\/p\/(?:original|w\d+)\/(.+)$/);
    if (match?.[1]) return `/${match[1]}`;
    return pathname || null;
  } catch {
    return null;
  }
}

export function getPosterPath(movie: Partial<Movie>): string | null {
  return movie.poster_path ?? toTmdbPath(movie.poster) ?? null;
}

export function getBackdropPath(movie: Partial<Movie>): string | null {
  return movie.backdrop_path ?? toTmdbPath(movie.backdrop) ?? null;
}

export function getMovieRating(movie: Partial<Movie>): number {
  if (isFiniteNumber(movie.vote_average)) return movie.vote_average;
  if (isFiniteNumber(movie.rating)) return movie.rating;
  return 0;
}

export function normalizeBackendMovie(movie: BackendMovie): Movie {
  const rating = isFiniteNumber(movie.rating) ? movie.rating : 0;
  const releaseDate = typeof movie.release_date === "string" ? movie.release_date : "";
  const poster = movie.poster ?? null;
  const backdrop = movie.backdrop ?? null;

  return {
    id: movie.id,
    title: movie.title || "Untitled",
    overview: "",
    poster_path: toTmdbPath(poster),
    backdrop_path: toTmdbPath(backdrop),
    release_date: releaseDate,
    vote_average: rating,
    vote_count: 0,
    genre_ids: [],
    popularity: rating * 10,
    original_language: "en",
    poster,
    backdrop,
    rating,
  };
}
