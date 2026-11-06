# searxng-mcp site

Product page and live playground for [`@aplix39/searxng-mcp`](https://www.npmjs.com/package/@aplix39/searxng-mcp) — an MCP server that gives AI agents metasearch, news, images, videos, autocomplete and clean page extraction through SearXNG.

- **Site**: Next.js 16 (App Router), no database, no auth.
- **Demo**: `app/api/search/route.ts` proxies `/search?format=json` to the server-side instance and renders the answer with the MCP's own `format.ts`, vendored verbatim from the package (MIT) so the page shows exactly what an agent receives.
- **Guard**: `lib/guard.ts` throttles the demo per IP and strips control characters from queries; the upstream host is fixed server-side, so the route cannot be pointed elsewhere.
- **Languages**: English, French, German and Spanish under `/[locale]`; `proxy.ts` redirects a bare path to the visitor's `Accept-Language`, falling back to the last switcher choice.

## Local

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build
```

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `SEARXNG_URL` | unset → probes healthy instances from searx.space | Instance the demo queries. Must expose `/search` with `json` in `search.formats`. |
| `SEARXNG_TIMEOUT_MS` | `20000` | Upstream deadline for the demo proxy. |

`SEARXNG_URL` is read only by server code guarded with `import "server-only"`, so it cannot end up in the browser bundle, the rendered page, or an error message. Set it in Vercel under Project → Settings → Environment Variables (and in `.env.local`, which is gitignored); never commit it.

## Companion skill

The site advertises [`searxng-mcp`](https://github.com/STIFLEUR390/agent-skills/tree/main/skills/searxng-mcp), a skill that teaches an agent which of the seven tools to call, in what order, and how to read the markdown contract:

```bash
npx skills add STIFLEUR390/agent-skills --skill searxng-mcp
```

The command lives in `SKILL_CMD` (`components/landing.tsx`) and in each dictionary under `skill.*`; nothing else on the page depends on it.

## Themes and motion

Light is the default palette — a cool slate with one teal accent — and dark is its
counterpart, with every hairline and surface still readable. The choice lives in a
`theme` cookie so the server never needs to know it: `lib/theme.ts` exports a tiny
inline script that sets `data-theme` on `<html>` before the body paints, which is
why there is no flash.

The toggle animates the swap with the View Transitions API — the new palette grows
out of the button (`::view-transition-new(root)` + `clip-path: circle()`), falling
back to an instant change when the API or motion is unavailable.

Motion is CSS-only: a one-shot signal across the hero grid and a slow pulse in the
tools topology. Both switch off under `prefers-reduced-motion: reduce`; there is no
scroll reveal, parallax or pointer tilt.

## Translations

`messages/en.json` is the source dictionary; `fr`, `de` and `es` mirror its keys. Copy is translated with [Lingo.dev](https://lingo.dev) from `i18n.json`:

```bash
OPENAI_API_KEY=… npx lingo.dev@latest run
```

The CLI rewrites `messages/*.json` in place, translating only keys that are missing or changed in a target locale. Commit the result. Swap `provider` in `i18n.json` for `anthropic`, `google`, `mistral`, `openrouter` or `ollama` to run offline.

## Layout

```
app/[locale]/page.tsx        marketing page (server component, four locales)
app/[locale]/layout.tsx      root layout: <html lang>, metadata, alternates
proxy.ts                     locale redirect from Accept-Language
components/landing.tsx       page body, driven by messages/<locale>.json
components/playground.tsx    live search UI (client)
components/language-switcher.tsx
app/api/search/route.ts      demo proxy + search payload
app/api/instance/route.ts    autocomplete + instance metadata
lib/i18n.ts                  dictionary loader (server-only)
lib/locales.ts               locale list shared with the switcher
lib/format.ts                formatter vendored from the MCP package
lib/searxng.ts               fetch client for the instance
messages/en.json             source dictionary
i18n.json                    Lingo.dev CLI configuration
```

## Deploy

Deployed to Vercel from this repository; every push to `master` builds a new production deployment and pull requests get preview URLs.

## License

MIT
