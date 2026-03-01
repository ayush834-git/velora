import { NextRequest, NextResponse } from "next/server";

type FilmReasonBody = {
  title?: string;
  year?: string | number;
  filters?: {
    mood?: string | null;
    genre?: string | null;
    era?: string | null;
    language?: string | null;
    rating?: string | null;
  };
};

function fallbackReason(body: FilmReasonBody) {
  const title = body.title ?? "this film";
  const mood = body.filters?.mood ? `${body.filters.mood.toLowerCase()} ` : "";
  const genre = body.filters?.genre ? `${body.filters.genre.toLowerCase()} ` : "";
  const year = body.year ? ` (${body.year})` : "";
  return `For nights when you want a ${mood}${genre}story, ${title}${year} carries the exact tone and momentum to hold you from first frame to last. Because this pick balances emotion, craft, and rewatch value, it fits the mood you set with intent.`;
}

export async function POST(request: NextRequest) {
  let body: FilmReasonBody = {};

  try {
    body = (await request.json()) as FilmReasonBody;
  } catch {
    body = {};
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reason: fallbackReason(body) });
  }

  const title = body.title ?? "this film";
  const year = body.year ?? "";
  const mood = body.filters?.mood ?? "cinematic";
  const genre = body.filters?.genre ?? "story-driven";
  const era = body.filters?.era ?? "any era";

  const prompt = [
    `In 2 short sentences, explain why someone craving a ${mood} ${genre} film from ${era} would love ${title} (${year}).`,
    "Be poetic and specific. Start with 'Because' or 'For nights when...'.",
    "Do not use markdown.",
  ].join(" ");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 140,
        messages: [{ role: "user", content: prompt }],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ reason: fallbackReason(body) });
    }

    const data = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };

    const reason =
      data.content?.find((item) => item.type === "text" && item.text)?.text?.trim() ||
      fallbackReason(body);

    return NextResponse.json({ reason });
  } catch {
    return NextResponse.json({ reason: fallbackReason(body) });
  }
}
