import "server-only";

/**
 * Per-instance, per-IP throttle for the demo's upstream calls.
 *
 * Serverless instances each keep their own window, which is the point: this is
 * a burst guard that stops one visitor from draining the SearXNG instance's
 * own limiter, not a global quota.
 */

const WINDOW_MS = 60_000;
const MAX_TRACKED_CLIENTS = 5_000;

const hits = new Map<string, number[]>();

export type RateVerdict = { allowed: true } | { allowed: false; retryAfter: number };

export function rateLimit(request: Request, limit = 30): RateVerdict {
  const forwarded = request.headers.get("x-forwarded-for");
  const client =
    forwarded?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";

  const now = Date.now();
  const recent = (hits.get(client) ?? []).filter((stamp) => now - stamp < WINDOW_MS);

  if (recent.length >= limit) {
    hits.set(client, recent);
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((WINDOW_MS - (now - recent[0])) / 1000)),
    };
  }

  recent.push(now);
  hits.delete(client);
  hits.set(client, recent);

  if (hits.size > MAX_TRACKED_CLIENTS) {
    for (const key of hits.keys()) {
      if (hits.size <= MAX_TRACKED_CLIENTS * 0.8) break;
      hits.delete(key);
    }
  }

  return { allowed: true };
}

/** Strips control characters so nothing odd travels as a query parameter. */
export function cleanQuery(value: string | null, max = 512): string {
  return (value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
