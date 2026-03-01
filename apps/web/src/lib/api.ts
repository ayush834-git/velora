import { BackendMovie } from "@/types/movie";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`API ${response.status}: ${body || response.statusText}`);
  }
  return response.json() as Promise<T>;
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

export async function fetchSpinMovie(
  filters: Record<string, unknown> = {}
): Promise<BackendMovie> {
  const hasFilters = Object.keys(filters).length > 0;
  const query = hasFilters
    ? `?${new URLSearchParams(
        Object.entries(filters).reduce<Record<string, string>>((acc, [key, value]) => {
          if (value === undefined || value === null) return acc;
          acc[key] = String(value);
          return acc;
        }, {})
      ).toString()}`
    : "";

  try {
    const postResponse = await fetch("/api/spin", {
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
