import { BackendMovie } from "@/types/movie";

export interface SpinFilters {
  genre?: string | null;
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

function buildSpinQuery(filters: SpinFilters = {}) {
  const params = new URLSearchParams();

  if (filters.genre) params.set("genre", filters.genre);
  if (filters.mood) params.set("mood", filters.mood);
  if (filters.era) params.set("era", filters.era);
  if (filters.language) params.set("language", filters.language);
  if (filters.rating) params.set("rating", filters.rating);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchDiscoverMovies(): Promise<BackendMovie[]> {
  const response = await fetch("/api/discover", {
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

export async function fetchSpinMovie(filters: SpinFilters = {}): Promise<BackendMovie> {
  const query = buildSpinQuery(filters);

  try {
    const postResponse = await fetch(`/api/spin${query}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
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
