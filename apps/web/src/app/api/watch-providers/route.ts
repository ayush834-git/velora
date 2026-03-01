import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

type TmdbAuth = {
  headers: Record<string, string>;
  authQuery: string;
};

type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
};

type WatchProviderResponse = {
  results?: Record<
    string,
    {
      flatrate?: Provider[];
      rent?: Provider[];
      buy?: Provider[];
    }
  >;
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
    headers: { accept: "application/json" },
    authQuery: `?api_key=${encodeURIComponent(apiKey)}`,
  };
}

export async function GET(request: NextRequest) {
  const auth = getTmdbAuth();
  if (!auth) {
    return NextResponse.json({ providers: [] });
  }

  const id = request.nextUrl.searchParams.get("id");
  const region = request.nextUrl.searchParams.get("region") || "US";
  if (!id) {
    return NextResponse.json({ providers: [] });
  }

  try {
    const separator = auth.authQuery ? auth.authQuery : "";
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${encodeURIComponent(id)}/watch/providers${separator}`,
      {
        headers: auth.headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json({ providers: [] });
    }

    const data = (await response.json()) as WatchProviderResponse;
    const regionData = data.results?.[region] ?? data.results?.US;
    const candidates = regionData?.flatrate ?? regionData?.rent ?? regionData?.buy ?? [];
    const providers = candidates.slice(0, 3).map((provider) => ({
      provider_id: provider.provider_id,
      provider_name: provider.provider_name,
      logo_path: provider.logo_path,
    }));

    return NextResponse.json({ providers });
  } catch {
    return NextResponse.json({ providers: [] });
  }
}
