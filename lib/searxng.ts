/**
 * Minimal SearXNG JSON client for the site's route handlers.
 *
 * Mirrors the request shape of @aplix39/searxng-mcp `src/client.ts`:
 * `/search?format=json`, `/autocompleter`, `/config`.
 */

import { UpstreamError } from "./errors";
import { resolveInstance } from "./instance";
import type { SearXNGConfig, SearXNGSearchResponse } from "./types";

const DEFAULT_TIMEOUT_MS = 20_000;
const USER_AGENT = "searxng-mcp-site/1.0";

const timeoutMs = clamp(
  Number(process.env.SEARXNG_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS),
  500,
  300_000,
);

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return DEFAULT_TIMEOUT_MS;
  return Math.min(Math.max(Math.round(value), min), max);
}

async function getJson<T>(
  path: string,
  params: Record<string, string | undefined>,
  revalidate = 0,
): Promise<T> {
  const baseUrl = await resolveInstance();
  const url = new URL(`${baseUrl}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept: "application/json", "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate },
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === "TimeoutError";
    throw new UpstreamError(
      aborted
        ? `SearXNG did not answer within ${Math.round(timeoutMs / 1000)} s.`
        : `Could not reach the SearXNG instance.`,
      504,
      aborted ? "Raise SEARXNG_TIMEOUT_MS for a slow instance." : "Check SEARXNG_URL.",
    );
  }

  if (!response.ok) {
    throw upstreamStatusError(response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new UpstreamError(
      `SearXNG answered with something that is not JSON.`,
      502,
      "The instance may be behind a proxy or a captcha page.",
    );
  }
}

function upstreamStatusError(status: number): UpstreamError {
  if (status === 403) {
    return new UpstreamError(
      "The instance refuses the JSON API (403).",
      403,
      "Add `json` to `search.formats` in SearXNG's settings.yml, then restart it.",
    );
  }
  if (status === 429) {
    return new UpstreamError(
      "The instance rate-limited this demo (429).",
      429,
      "SearXNG's limiter is throttling automated calls. Try again in a minute.",
    );
  }
  return new UpstreamError(`SearXNG answered ${status}.`, 502);
}

export interface SearchParams {
  q: string;
  categories?: string[];
  language?: string;
  pageno?: number;
  timeRange?: string;
  safesearch?: number;
}

export async function search(params: SearchParams): Promise<SearXNGSearchResponse> {
  const json = await getJson<SearXNGSearchResponse>("/search", {
    q: params.q,
    format: "json",
    categories: params.categories?.join(","),
    language: params.language,
    pageno: params.pageno && params.pageno > 1 ? String(params.pageno) : undefined,
    time_range: params.timeRange,
    safesearch: params.safesearch === undefined ? undefined : String(params.safesearch),
  });

  if (!json || !Array.isArray(json.results)) {
    throw new UpstreamError('SearXNG response is missing its "results" array.', 502);
  }
  return json;
}

export async function autocomplete(q: string, language?: string): Promise<string[]> {
  const json = await getJson<unknown>("/autocompleter", { q, language });
  if (!Array.isArray(json)) return [];
  if (json.every((item) => typeof item === "string")) return json as string[];
  const suggestions = (json as unknown[])[1];
  return Array.isArray(suggestions)
    ? suggestions.filter((item): item is string => typeof item === "string")
    : [];
}

export async function config(): Promise<SearXNGConfig> {
  return getJson<SearXNGConfig>("/config", {}, 3600);
}
