import { Movie, MovieDetails, TMDBResponse } from "@/types/movie";
import { TMDB_IMAGE_BASE, IMAGE_SIZES, DEMO_MOVIES } from "./constants";

export function getImageUrl(
  path: string | null,
  size: string = IMAGE_SIZES.poster.medium
): string {
  if (!path) return "/placeholder-poster.svg";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${TMDB_IMAGE_BASE}/${size}/${cleanPath}`;
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  if (!response.ok) return null;

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getTrending(): Promise<Movie[]> {
  try {
    const response = await fetch("/api/tmdb?action=trending", {
      cache: "no-store",
    });
    const data = await parseJsonResponse<TMDBResponse>(response);
    return data?.results ?? DEMO_MOVIES;
  } catch {
    return DEMO_MOVIES;
  }
}

export async function getDiscover(genreIds?: number[], page: number = 1): Promise<Movie[]> {
  const params = new URLSearchParams({
    action: "discover",
    page: String(page),
  });

  if (genreIds && genreIds.length > 0) {
    params.set("genres", genreIds.join(","));
  }

  try {
    const response = await fetch(`/api/tmdb?${params.toString()}`, {
      cache: "no-store",
    });
    const data = await parseJsonResponse<TMDBResponse>(response);
    return data?.results ?? DEMO_MOVIES;
  } catch {
    return DEMO_MOVIES;
  }
}

export async function getMovieDetails(id: number): Promise<MovieDetails | null> {
  try {
    const response = await fetch(
      `/api/tmdb?action=movie&id=${encodeURIComponent(String(id))}`,
      {
      cache: "no-store",
      }
    );
    const data = await parseJsonResponse<MovieDetails>(response);
    return data;
  } catch {
    return null;
  }
}

export async function getSimilar(id: number): Promise<Movie[]> {
  try {
    const response = await fetch(
      `/api/tmdb?action=similar&id=${encodeURIComponent(String(id))}`,
      {
        cache: "no-store",
      }
    );
    const data = await parseJsonResponse<TMDBResponse>(response);
    return data?.results ?? DEMO_MOVIES.slice(0, 10);
  } catch {
    return DEMO_MOVIES.slice(0, 10);
  }
}

export async function getRandomMovie(genreIds?: number[]): Promise<Movie> {
  try {
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const movies = await getDiscover(genreIds, randomPage);
    return movies[Math.floor(Math.random() * movies.length)] || DEMO_MOVIES[0];
  } catch {
    return DEMO_MOVIES[0];
  }
}
