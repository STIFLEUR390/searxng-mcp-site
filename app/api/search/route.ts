import { NextResponse } from "next/server";
import { formatSearchResponse, type ResultKind } from "@/lib/format";
import type { ResultCard, SearchPayload } from "@/lib/payload";
import { UpstreamError } from "@/lib/errors";
import { cleanQuery, rateLimit } from "@/lib/guard";
import { search } from "@/lib/searxng";
import type { SearXNGResult, SearXNGSearchResponse } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const KINDS: ResultKind[] = ["general", "news", "images", "videos"];
const TIME_RANGES = ["day", "week", "month", "year"];

export async function GET(request: Request): Promise<NextResponse> {
  const verdict = rateLimit(request);
  if (!verdict.allowed) {
    return NextResponse.json(
      { error: "Too many searches from this address.", hint: "Try again in a minute." },
      { status: 429, headers: { "retry-after": String(verdict.retryAfter) } },
    );
  }

  const params = new URL(request.url).searchParams;
  const q = cleanQuery(params.get("q"));
  if (!q) {
    return NextResponse.json({ error: "A query is required." }, { status: 400 });
  }

  const requested = params.get("category");
  const kind: ResultKind = KINDS.includes(requested as ResultKind)
    ? (requested as ResultKind)
    : "general";
  const limit = clampInt(params.get("limit"), 1, 20, 10);
  const pageno = clampInt(params.get("page"), 1, 50, 1);
  const timeRange = params.get("time") ?? "";
  const language = (params.get("language") ?? "").replace(/[^a-z-]/gi, "").slice(0, 12);
  const safesearch = clampInt(params.get("safe"), 0, 2, 0);

  const started = performance.now();
  try {
    const response = await search({
      q,
      categories: [kind],
      language: language || undefined,
      pageno,
      timeRange: TIME_RANGES.includes(timeRange) ? timeRange : undefined,
      safesearch: safesearch === 0 ? undefined : safesearch,
    });

    const payload: SearchPayload = {
      text: formatSearchResponse(response, { kind, limit }),
      results: response.results.slice(0, limit).map(toCard),
      meta: {
        query: response.query || q,
        shown: Math.min(response.results.length, limit),
        total: response.results.length,
        elapsedMs: Math.round(performance.now() - started),
        engines: collectEngines(response),
        unresponsive: (response.unresponsive_engines ?? []).map((entry) =>
          Array.isArray(entry) ? `${entry[0]}${entry[1] ? ` (${entry[1]})` : ""}` : String(entry),
        ),
        corrections: (response.corrections ?? []).map(asText),
        suggestions: (response.suggestions ?? []).map(asText),
      },
    };
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof UpstreamError) {
      return NextResponse.json(
        { error: error.message, hint: error.hint },
        { status: error.status >= 500 ? 502 : error.status },
      );
    }
    console.error("search failed", error);
    return NextResponse.json({ error: "The search failed." }, { status: 500 });
  }
}

function clampInt(value: string | null, min: number, max: number, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function toCard(result: SearXNGResult): ResultCard {
  let domain = "";
  try {
    domain = new URL(result.url).hostname.replace(/^www\./, "");
  } catch {
    // A result without a parseable URL keeps an empty domain label.
  }
  return {
    title: result.title?.trim() || "(untitled)",
    url: result.url,
    domain,
    content: (result.content ?? "").replace(/\s+/g, " ").trim(),
    engines: result.engines?.length ? result.engines : result.engine ? [result.engine] : [],
    category: result.category ?? "",
    published: result.publishedDate ?? result.metadata ?? null,
    thumbnail: result.thumbnail?.trim() || null,
    image: result.img_src?.trim() || null,
  };
}

function collectEngines(response: SearXNGSearchResponse): string[] {
  const seen = new Set<string>();
  for (const result of response.results) {
    for (const engine of result.engines?.length ? result.engines : [result.engine]) {
      if (engine) seen.add(engine);
    }
  }
  return [...seen];
}

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["correction", "suggestion", "answer"]) {
      const field = record[key];
      if (typeof field === "string" && field) return field;
    }
  }
  return String(value);
}
