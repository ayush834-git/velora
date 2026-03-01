import { BackendMovie } from "@/types/movie";

export interface ApiFilters {
  genres?: string[];
  mood?: string | null;
  era?: string | null;
  language?: string | null;
  rating?: string | null;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`API ${response.status}: ${body || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

function normalizeFilters(filters: ApiFilters = {}) {
  const normalized: Record<string, string> = {};

  if (Array.isArray(filters.genres) && filters.genres.length > 0) {
    normalized.genre = filters.genres.join(",");
  }
  if (filters.mood) normalized.mood = filters.mood;
  if (filters.era) normalized.era = filters.era;
  if (filters.language) normalized.language = filters.language;
  if (filters.rating && filters.rating !== "Any") {
    const match = filters.rating.match(/(\d+(?:\.\d+)?)/);
    normalized.rating = match?.[1] || filters.rating;
  }

  return normalized;
}

function buildFiltersQuery(filters: ApiFilters = {}) {
  const entries = Object.entries(normalizeFilters(filters));
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
}

export async function fetchDiscoverMovies(filters: ApiFilters = {}): Promise<BackendMovie[]> {
  const query = buildFiltersQuery(filters);
  const response = await fetch(`/api/discover${query}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await parseJsonResponse<unknown>(response);
  if (Array.isArray(data)) return data as BackendMovie[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: BackendMovie[] }).results;
  }
  return [];
}

export async function fetchSpinMovie(
  filters: ApiFilters = {}
): Promise<BackendMovie> {
  const query = buildFiltersQuery(filters);

  try {
    const postResponse = await fetch(`/api/spin${query}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizeFilters(filters)),
    });
    return await parseJsonResponse<BackendMovie>(postResponse);
  } catch {
    const getResponse = await fetch(`/api/spin${query}`, {
      method: "GET",
      cache: "no-store",
    });
    return parseJsonResponse<BackendMovie>(getResponse);
  }
}
