import { Movie, MovieDetails, TMDBResponse } from "@/types/movie";
import { TMDB_BASE_URL, TMDB_IMAGE_BASE, IMAGE_SIZES, DEMO_MOVIES } from "./constants";

const API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || "";

function getHeaders() {
  return {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };
}

export function getImageUrl(
  path: string | null,
  size: string = IMAGE_SIZES.poster.medium
): string {
  if (!path) return "/placeholder-poster.svg";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${TMDB_IMAGE_BASE}/${size}/${cleanPath}`;
}

export async function getTrending(): Promise<Movie[]> {
  if (!API_KEY) return DEMO_MOVIES;
  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?language=en-US`, {
      headers: getHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return DEMO_MOVIES;
    const data: TMDBResponse = await res.json();
    return data.results;
  } catch {
    return DEMO_MOVIES;
  }
}

export async function getDiscover(genreIds?: number[], page: number = 1): Promise<Movie[]> {
  if (!API_KEY) return DEMO_MOVIES;
  try {
    const genreParam = genreIds ? `&with_genres=${genreIds.join(",")}` : "";
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?language=en-US&sort_by=vote_average.desc&vote_count.gte=500&page=${page}${genreParam}`,
      { headers: getHeaders(), next: { revalidate: 3600 } }
    );
    if (!res.ok) return DEMO_MOVIES;
    const data: TMDBResponse = await res.json();
    return data.results;
  } catch {
    return DEMO_MOVIES;
  }
}

export async function getMovieDetails(id: number): Promise<MovieDetails | null> {
  if (!API_KEY) {
    const demo = DEMO_MOVIES.find((m) => m.id === id);
    if (demo) return { ...demo, runtime: 120, genres: [], budget: 0, revenue: 0, status: "Released", production_companies: [], tagline: demo.tagline || "" } as MovieDetails;
    return null;
  }
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?language=en-US`, {
      headers: getHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getSimilar(id: number): Promise<Movie[]> {
  if (!API_KEY) return DEMO_MOVIES.slice(0, 10);
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}/similar?language=en-US&page=1`, {
      headers: getHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return DEMO_MOVIES.slice(0, 10);
    const data: TMDBResponse = await res.json();
    return data.results;
  } catch {
    return DEMO_MOVIES.slice(0, 10);
  }
}

export async function getRandomMovie(genreIds?: number[]): Promise<Movie> {
  if (!API_KEY) {
    const filtered = genreIds
      ? DEMO_MOVIES.filter((m) => m.genre_ids.some((g) => genreIds.includes(g)))
      : DEMO_MOVIES;
    return filtered[Math.floor(Math.random() * filtered.length)] || DEMO_MOVIES[0];
  }
  try {
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const movies = await getDiscover(genreIds, randomPage);
    return movies[Math.floor(Math.random() * movies.length)] || DEMO_MOVIES[0];
  } catch {
    return DEMO_MOVIES[0];
  }
}
