import { NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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
    authQuery: `api_key=${encodeURIComponent(apiKey)}`,
  };
}

function appendAuth(endpoint: string, authQuery: string) {
  if (!authQuery) return endpoint;
  return endpoint.includes("?") ? `${endpoint}&${authQuery}` : `${endpoint}?${authQuery}`;
}

export async function GET(request: Request) {
  const auth = getTmdbAuth();
  if (!auth) {
    return NextResponse.json(
      { error: "TMDB credentials are not configured." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  let endpoint: string | null = null;

  switch (action) {
    case "trending":
      endpoint = "/trending/movie/week?language=en-US";
      break;
    case "discover": {
      const genres = searchParams.get("genres") || "";
      const pageRaw = Number.parseInt(searchParams.get("page") || "1", 10);
      const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
      endpoint = `/discover/movie?language=en-US&sort_by=vote_average.desc&vote_count.gte=500&page=${page}${
        genres ? `&with_genres=${encodeURIComponent(genres)}` : ""
      }`;
      break;
    }
    case "movie": {
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json({ error: "Movie ID required." }, { status: 400 });
      }
      endpoint = `/movie/${encodeURIComponent(id)}?language=en-US`;
      break;
    }
    case "similar": {
      const movieId = searchParams.get("id");
      if (!movieId) {
        return NextResponse.json({ error: "Movie ID required." }, { status: 400 });
      }
      endpoint = `/movie/${encodeURIComponent(movieId)}/similar?language=en-US&page=1`;
      break;
    }
    case "videos": {
      const vid = searchParams.get("id");
      if (!vid) {
        return NextResponse.json({ error: "Movie ID required." }, { status: 400 });
      }
      endpoint = `/movie/${encodeURIComponent(vid)}/videos?language=en-US`;
      break;
    }
    default:
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  try {
    const response = await fetch(`${TMDB_BASE_URL}${appendAuth(endpoint, auth.authQuery)}`, {
      headers: auth.headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from TMDB." }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
