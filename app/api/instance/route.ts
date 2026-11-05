import { NextResponse } from "next/server";
import { UpstreamError } from "@/lib/errors";
import { cleanQuery, rateLimit } from "@/lib/guard";
import { autocomplete, config } from "@/lib/searxng";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request): Promise<NextResponse> {
  const verdict = rateLimit(request);
  if (!verdict.allowed) {
    return NextResponse.json(
      { error: "Too many requests from this address." },
      { status: 429, headers: { "retry-after": String(verdict.retryAfter) } },
    );
  }

  const params = new URL(request.url).searchParams;
  const q = cleanQuery(params.get("q"), 256);

  try {
    if (q) {
      const suggestions = await autocomplete(q, params.get("language") ?? undefined);
      return NextResponse.json({ suggestions: suggestions.slice(0, 6) });
    }
    const instance = await config();
    return NextResponse.json({
      autocomplete: instance.autocomplete ?? null,
      categories: instance.categories ?? [],
      engines: instance.engines?.length ?? 0,
    });
  } catch (error) {
    if (error instanceof UpstreamError) {
      return NextResponse.json(
        { error: error.message, hint: error.hint },
        { status: error.status >= 500 ? 502 : error.status },
      );
    }
    return NextResponse.json({ error: "The instance did not answer." }, { status: 500 });
  }
}
