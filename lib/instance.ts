/**
 * Which SearXNG instance this deployment talks to.
 *
 * `SEARXNG_URL` always wins and is never rendered: the site stays instance
 * agnostic, and the deployment owner keeps their URL out of the page. Without
 * it, the healthiest public instances listed on searx.space are probed until
 * one answers the JSON API — public instances usually refuse `format=json`,
 * so the fallback is best effort by design.
 */

import "server-only";

import { UpstreamError } from "./errors";

const INSTANCES_JSON = "https://searx.space/data/instances.json";
const USER_AGENT = "searxng-mcp-site/1.0 (+https://github.com/STIFLEUR390/searxng-mcp-site)";
const PROBE_TIMEOUT_MS = 4_000;
const PARKED_MS = 5 * 60_000;

export interface PublicInstance {
  url: string;
  version: string;
  uptime: number;
  tls: string;
}

interface InstanceMeta {
  network_type?: string;
  version?: string;
  http?: { status_code?: number; grade?: string };
  timing?: { search?: { success_percentage?: number; all?: { median?: number } } };
}

let parked: { baseUrl: string; until: number } | null = null;
let rankedCache: { at: number; list: PublicInstance[] } | null = null;

/** Healthy instances from searx.space, best search success first. */
export async function publicInstances(limit = 8): Promise<PublicInstance[]> {
  const ranked = await loadRanked();
  return ranked.slice(0, limit);
}

/** Base URL for the demo proxy: the configured instance, else a probed public one. */
export async function resolveInstance(): Promise<string> {
  const configured = process.env.SEARXNG_URL?.trim();
  if (configured) return instanceBase(configured);

  if (parked && parked.until > Date.now()) return parked.baseUrl;

  const candidates = await loadRanked();
  if (candidates.length === 0) {
    throw new UpstreamError("No SearXNG instance is configured.", 503, UNCONFIGURED);
  }

  const probed = await Promise.allSettled(
    candidates.slice(0, 4).map(async (candidate) => {
      const baseUrl = instanceBase(candidate.url);
      const response = await fetch(`${baseUrl}/search?q=searxng&format=json`, {
        headers: { accept: "application/json", "user-agent": USER_AGENT },
        signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`${baseUrl} refused (${response.status})`);
      const body = (await response.json()) as { results?: unknown };
      if (!Array.isArray(body.results)) throw new Error(`${baseUrl} did not answer JSON`);
      return baseUrl;
    }),
  );

  const winner = probed.find((entry) => entry.status === "fulfilled");
  if (!winner) {
    throw new UpstreamError(
      "Every public instance refused the JSON API.",
      503,
      `${UNCONFIGURED} Public instances disable format=json by default.`,
    );
  }

  parked = { baseUrl: winner.value, until: Date.now() + PARKED_MS };
  return parked.baseUrl;
}

const UNCONFIGURED =
  "Set SEARXNG_URL to an instance you control with `json` in search.formats.";

const CONFIGURED = "Fix the SEARXNG_URL environment variable.";

/**
 * Normalizes `SEARXNG_URL` and refuses anything that is not a plain http(s)
 * origin+path: no credentials, query or fragment can ride along, and the
 * value itself never appears in an error message.
 */
function instanceBase(value: string): string {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new UpstreamError("SEARXNG_URL is not a valid URL.", 500, CONFIGURED);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new UpstreamError("SEARXNG_URL must be http or https.", 500, CONFIGURED);
  }
  if (url.username || url.password) {
    throw new UpstreamError("SEARXNG_URL must not carry credentials.", 500, CONFIGURED);
  }
  const path = url.pathname.replace(/\/+$/, "").replace(/\/search$/, "");
  return `${url.origin}${path}`;
}

async function loadRanked(): Promise<PublicInstance[]> {
  if (rankedCache && Date.now() - rankedCache.at < 3_600_000) return rankedCache.list;

  let list: PublicInstance[] = [];
  try {
    const response = await fetch(INSTANCES_JSON, {
      headers: { accept: "application/json", "user-agent": USER_AGENT },
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const body = (await response.json()) as { instances?: Record<string, InstanceMeta> };
      list = rank(body.instances ?? {});
    }
  } catch {
    // A missing searx.space answer leaves the section empty; the page still renders.
  }

  rankedCache = { at: Date.now(), list };
  return list;
}

function rank(raw: Record<string, InstanceMeta>): PublicInstance[] {
  const rows: Array<PublicInstance & { median: number }> = [];
  for (const [url, meta] of Object.entries(raw)) {
    const http = meta.http ?? {};
    const timing = meta.timing?.search ?? {};
    if (meta.network_type !== "normal" || http.status_code !== 200) continue;
    if (!url.startsWith("https://")) continue;
    rows.push({
      url,
      version: (meta.version ?? "").split("+")[0] || "unknown",
      uptime: Math.round(timing.success_percentage ?? 0),
      tls: http.grade ?? "—",
      median: timing.all?.median ?? 99,
    });
  }
  rows.sort((a, b) => b.uptime - a.uptime || a.median - b.median);
  return rows.map(({ median: _median, ...rest }) => rest);
}
