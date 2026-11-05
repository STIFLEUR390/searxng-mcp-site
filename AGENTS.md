# searxng-mcp site

Marketing page and live search demo for the `@aplix39/searxng-mcp` MCP server, deployed on Vercel from this repository.

## Stack

- Next.js 16 App Router, React 19, TypeScript, no database, no auth.
- `app/[locale]` renders the page for `en`, `fr`, `de`, `es`; `proxy.ts` picks a locale from the `locale` cookie then `Accept-Language`.
- `app/api/search` and `app/api/instance` proxy one SearXNG instance server-side.

## Commands

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit; clear .next after moving routes
npm run build
```

## Invariants

- `SEARXNG_URL` is read only by `lib/instance.ts`, which starts with `import "server-only"`. Never pass it to a component prop, a client component, an error message or metadata — the point of the site is that the instance stays private.
- Every user string comes from `messages/<locale>.json`. Add a key to `en.json` first, then the three other files; `npx lingo.dev@latest run` fills them from `i18n.json`.
- Both route handlers call `rateLimit()` and sanitise input with `cleanQuery()` before touching upstream.
- `lib/format.ts` is vendored verbatim from the MCP package: keep it byte-identical to `src/format.ts` upstream, or the demo stops showing what an agent actually receives.

## Copy

Terse, technical, evidence-first. No superlatives, no exclamation marks. Numbers on the page must be checkable against the package (7 tools, 0 API keys, 118 tests, MIT).

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If a deployment URL returns a Vercel Deployment Protection 401/403, retry the same URL with `vercel curl <url>`; don't disable protection or manage bypass secrets manually
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
