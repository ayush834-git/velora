export interface BackendMovie {
  id: number;
  title: string;
  overview: string;
  original_language: string;
  poster: string | null;
  backdrop: string | null;
  rating: number;
  release_date: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  tagline?: string;
  poster?: string | null;
  backdrop?: string | null;
  rating?: number;
}

export interface MovieDetails extends Movie {
  tagline: string;
  runtime: number;
  genres: { id: number; name: string }[];
  budget: number;
  revenue: number;
  status: string;
  production_companies: { id: number; name: string; logo_path: string | null }[];
}

export interface TMDBResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MoodConfig {
  id: string;
  label: string;
  subtitle: string;
  genreIds: number[];
  gradient: string;
  accentColor: string;
}
