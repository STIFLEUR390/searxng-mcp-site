import type { CSSProperties } from "react";

import { CopyButton } from "@/components/copy-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileMenu } from "@/components/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Playground } from "@/components/playground";
import type { Messages } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import type { PublicInstance } from "@/lib/instance";

const NPM_URL = "https://www.npmjs.com/package/@aplix39/searxng-mcp";
const REPO_URL = "https://github.com/STIFLEUR390/searxng-mcp";
const SKILL_URL = "https://github.com/STIFLEUR390/agent-skills/tree/main/skills/searxng-mcp";
const SKILL_CMD = "npx skills add STIFLEUR390/agent-skills --skill searxng-mcp";

/** The instance is configured server-side and never named on the page. */
const PLACEHOLDER = "https://searx.example.com";

const CLAUDE_CODE = `claude mcp add searxng \\
  --env SEARXNG_URL=${PLACEHOLDER} \\
  -- npx -y @aplix39/searxng-mcp`;

const CLAUDE_DESKTOP = `{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "@aplix39/searxng-mcp"],
      "env": { "SEARXNG_URL": "${PLACEHOLDER}" }
    }
  }
}`;

const CURSOR = `// ~/.cursor/mcp.json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "@aplix39/searxng-mcp"],
      "env": { "SEARXNG_URL": "${PLACEHOLDER}" }
    }
  }
}`;

const TOOL_ARGS = {
  search:
    "q · categories · engines · language · pageno · time_range · safesearch · limit · include_domains · exclude_domains",
  news: "q · language · time_range · limit · include_domains · exclude_domains",
  images: "q · language · safesearch · limit · include_domains · exclude_domains",
  videos: "q · language · time_range · limit · include_domains · exclude_domains",
  autocomplete: "q · language",
  config: "include_engines",
  extract:
    "url · include_header/footer/navigation/sidebar/comments/links/images · content_only · selector · max_length · start_char · headings_only",
} as const;

const TOOLS = [
  { id: "search", name: "searxng_search" },
  { id: "news", name: "searxng_search_news" },
  { id: "images", name: "searxng_search_images" },
  { id: "videos", name: "searxng_search_videos" },
  { id: "autocomplete", name: "searxng_autocomplete" },
  { id: "config", name: "searxng_config" },
  { id: "extract", name: "searxng_extract_content" },
] as const;

const ENV_VARS = [
  { id: "url", name: "SEARXNG_URL" },
  { id: "timeout", name: "SEARXNG_TIMEOUT_MS" },
  { id: "browser", name: "SEARXNG_BROWSER_URL" },
] as const;

const SAMPLE_RESULT = `# Search results ("searxng instance")
2 of 20 results

## Results

1. SearXNG instances
   https://searx.space/
   Instance ranking · HTML grade · Default /search returns results · TLS grade · CSP grade · Monthly uptime in 5% steps · SearXNG version from this or previous ...
   (engines: google cse | category: general)

2. SearXNG Documentation (2026.11.2+cccbc9e15)
   https://searxng.org/
   Additionally, SearXNG can be used over Tor for online anonymity. Get started with SearXNG by using one of the instances listed at searx.space. If you don't ...
   (engines: google cse | category: general)

(18 more results on this page — raise "limit" or use pageno)

Note: some engines did not respond: brave (Suspended: too many requests), duckduckgo (CAPTCHA), wikipedia (Suspended: too many requests)`;

/** Section height in screens: `--h` desktop, `--hm` phone. */
function size(h: number, hm?: number): CSSProperties {
  return { "--h": h, ...(hm ? { "--hm": hm } : {}) } as CSSProperties;
}

function Mark() {
  return (
    <span className="glyph" aria-hidden>
      <svg viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="14" fill="currentColor" />
        <circle cx="28" cy="28" r="13" fill="none" stroke="var(--glyph-bg)" strokeWidth="4" />
        <path d="M38 38 48 48" stroke="var(--glyph-bg)" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Landing({
  locale,
  messages,
  instances,
}: {
  locale: Locale;
  messages: Messages;
  instances: PublicInstance[];
}) {
  const t = messages;
  const links = [
    { href: "#demo", label: t.nav.demo },
    { href: "#output", label: t.nav.output },
    { href: "#tools", label: t.nav.tools },
    { href: "#install", label: t.nav.install },
    { href: "#instances", label: t.nav.instances },
  ];

  return (
    <>
      <header className="nav site-head">
        <a className="skip" href="#main">
          {t.nav.skip}
        </a>
        <div className="wrap head-row">
          <a className="wordmark" href="#main" aria-label="searxng-mcp">
            <Mark />
            <span>
              searxng<span className="wordmark-dim">·mcp</span>
            </span>
          </a>
          <nav className="nav-links">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="head-actions">
            <a className="nav-cta" href={NPM_URL} target="_blank" rel="noreferrer noopener">
              {t.nav.npm}
            </a>
            <ThemeToggle {...t.theme} />
            <div className="head-lang">
              <LanguageSwitcher locale={locale} label={t.footer.language} />
            </div>
            <MobileMenu
              label={t.nav.menu}
              close={t.nav.close}
              links={links}
              npm={{ href: NPM_URL, label: t.nav.npm }}
              locale={locale}
              language={t.footer.language}
            />
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero" style={size(1)}>
          <div className="wrap hero-grid">
            <div className="hero-text">
              <p className="eyebrow">
                {t.hero.eyebrow}
              </p>
              <h1>
                {t.hero.title1}
                <br />
                {t.hero.title2}
                <br />
                {t.hero.title3} <span className="accent">{t.hero.accent}</span>.
              </h1>
              <p className="lead">{t.hero.lead}</p>
              <div className="actions">
                <a className="btn btn-primary" href="#demo">
                  {t.hero.ctaDemo}
                </a>
                <a className="btn btn-ghost" href="#install">
                  {t.hero.ctaInstall}
                </a>
              </div>
              <p className="facts">
                <span>
                  <b>7</b> {t.stats.tools}
                </span>
                <span className="fact-sep" aria-hidden>
                  ·
                </span>
                <span>
                  <b className="accent">0</b> {t.stats.keys}
                </span>
                <span className="fact-sep" aria-hidden>
                  ·
                </span>
                <span>
                  <b>118</b> {t.stats.tests}
                </span>
                <span className="fact-sep" aria-hidden>
                  ·
                </span>
                <span>
                  <b>MIT</b>
                </span>
              </p>
            </div>

            <div className="hero-visual">
              <div className="terminal" data-ui>
                <div className="terminal-bar">
                  <i />
                  <i />
                  <i />
                  <span>{t.terminal.label}</span>
                </div>
                <pre>
                  <span className="t-prompt">$</span> claude{"\n"}
                  <span className="t-prompt">&gt;</span> {t.terminal.user}
                  {"\n"}
                  {"\n"}
                  <span className="t-key">⏺ searxng_search</span>
                  {"  "}q=&quot;searxng instance&quot; · limit=2{"\n"}
                  {"\n"}
                  <span className="t-head">  # Search results (&quot;searxng instance&quot;)</span>
                  {"\n"}
                  <span className="t-meta">  2 of 20 results</span>
                  {"\n"}
                  {"\n"}
                  {"  1. SearXNG instances\n"}
                  <span className="t-url">     https://searx.space/</span>
                  {"\n"}
                  {"     Instance ranking · HTML grade · Default /search returns\n"}
                  {"     results · TLS grade · CSP grade · Monthly uptime in 5% …\n"}
                  <span className="t-meta">{"     (engines: google cse | category: general)"}</span>
                  {"\n"}
                  {"\n"}
                  {"  2. SearXNG Documentation (2026.11.2)\n"}
                  <span className="t-url">     https://searxng.org/</span>
                  {"\n"}
                  {"     SearXNG can be used over Tor for online anonymity. Get\n"}
                  {"     started with one of the instances listed at searx.space…\n"}
                  <span className="t-meta">{"     (engines: google cse | category: general)"}</span>
                </pre>
                <div className="terminal-foot">
                  <code>npx -y @aplix39/searxng-mcp</code>
                  <CopyButton
                    value="npx -y @aplix39/searxng-mcp"
                    label={t.terminal.copy}
                    copiedLabel={t.playground.copied}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section band" id="demo" style={size(1, 2)}>
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">
                {t.demo.eyebrow}
              </p>
              <h2>{t.demo.title}</h2>
              <p className="lead">
                {t.demo.lead} <code>/search?format=json</code> {t.demo.leadAfter}{" "}
                <em>{t.demo.leadAgent}</em> {t.demo.leadTail}
              </p>
            </div>

            <Playground strings={t.playground} />
            <p className="note">
              {t.demo.note} <code>429</code> {t.demo.noteAfter}
            </p>
          </div>
        </section>

        <section className="section" id="output" style={size(1, 2)}>
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">
                {t.output.eyebrow}
              </p>
              <h2>{t.output.title}</h2>
              <p className="subhead">{t.output.subtitle}</p>
              <p className="lead">{t.output.lead}</p>
            </div>

            <div className="split">
              <div className="contract">
                <p className="mini-label">{t.output.kept}</p>
                <ul className="chips">
                  <li>
                    <code>title</code>
                  </li>
                  <li>
                    <code>url</code>
                  </li>
                  <li>
                    <code>{t.output.snippet}</code> <span>· {t.output.snippetChars}</span>
                  </li>
                  <li>
                    <code>engines</code>
                  </li>
                  <li>
                    <code>category</code>
                  </li>
                  <li>
                    <code>published</code>
                  </li>
                  <li>
                    <code>{t.output.answer}</code>
                  </li>
                  <li>
                    <code>{t.output.infoboxes}</code>
                  </li>
                  <li>
                    <code>{t.output.related}</code>
                  </li>
                  <li>
                    <code>{t.output.unresponsive}</code>
                  </li>
                </ul>

                <p className="mini-label">{t.output.dropped}</p>
                <ul className="chips cut-list">
                  <li>
                    <code>score</code>
                  </li>
                  <li>
                    <code>positions</code>
                  </li>
                  <li>
                    <code>parsed_url</code>
                  </li>
                  <li>
                    <code>favicons</code>
                  </li>
                  <li>
                    <code>templates</code>
                  </li>
                  <li>
                    <code>raw HTML</code>
                  </li>
                </ul>

                <p className="contract-note">
                  {t.output.lead2} <code>format.ts</code>
                  {t.output.lead2After}
                </p>
              </div>

              <div className="code-block" data-ui>
                <header>
                  <span>{t.output.toolResult}</span>
                  <CopyButton
                    value={SAMPLE_RESULT}
                    label={t.output.copy}
                    copiedLabel={t.playground.copied}
                  />
                </header>
                <pre>
                  <span className="k"># Search results (&quot;searxng instance&quot;)</span>
                  {"\n"}
                  <span className="c">2 of 20 results</span>
                  {"\n\n"}
                  <span className="k">## Results</span>
                  {"\n\n"}
                  {"1. SearXNG instances\n"}
                  <span className="s">   https://searx.space/</span>
                  {"\n"}
                  {"   Instance ranking · HTML grade · Default /search returns\n"}
                  {"   results · TLS grade · CSP grade · Monthly uptime in 5% …\n"}
                  <span className="c">   (engines: google cse | category: general)</span>
                  {"\n\n"}
                  {"2. SearXNG Documentation (2026.11.2+cccbc9e15)\n"}
                  <span className="s">   https://searxng.org/</span>
                  {"\n"}
                  {"   Additionally, SearXNG can be used over Tor for online\n"}
                  {"   anonymity. Get started with one of the instances listed…\n"}
                  <span className="c">   (engines: google cse | category: general)</span>
                  {"\n\n"}
                  <span className="c">
                    (18 more results on this page — raise &quot;limit&quot; or use pageno)
                  </span>
                  {"\n\n"}
                  <span className="c">
                    Note: some engines did not respond: brave (Suspended: too many requests),
                  </span>
                  {"\n"}
                  <span className="c">
                    duckduckgo (CAPTCHA), wikipedia (Suspended: too many requests)
                  </span>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="section band" id="tools" style={size(2)}>
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">
                {t.tools.eyebrow}
              </p>
              <h2>{t.tools.title}</h2>
              <p className="lead">
                {t.tools.lead} <code>include_domains</code> {t.tools.leadMid}{" "}
                <code>exclude_domains</code> {t.tools.leadTail}
              </p>
            </div>

            <div className="topology" data-ui>
              <div className="topo-node">
                <span className="topo-name">{t.hero.accent}</span>
              </div>
              <span className="topo-line" aria-hidden>
                <svg viewBox="0 0 12 12" className="topo-arrow">
                  <path d="M2 6h7M6 3l3 3-3 3" />
                </svg>
              </span>
              <div className="topo-node topo-mcp">
                <span className="topo-name">searxng-mcp</span>
                <span className="topo-meta">
                  7 {t.stats.tools}
                </span>
              </div>
              <span className="topo-line" aria-hidden>
                <svg viewBox="0 0 12 12" className="topo-arrow">
                  <path d="M2 6h7M6 3l3 3-3 3" />
                </svg>
              </span>
              <div className="topo-node">
                <span className="topo-name">SearXNG</span>
                <span className="topo-meta">{t.stats.license}</span>
              </div>
              <div className="topo-tools">
                {TOOLS.map((tool) => (
                  <code key={tool.name}>{tool.name}</code>
                ))}
              </div>
            </div>

            <div className="tools">
              {TOOLS.map((tool) => (
                <div className="tool" key={tool.name}>
                  <code>{tool.name}</code>
                  <div>
                    <p>{t.tools.items[tool.id]}</p>
                    <p className="tool-args">
                      {t.tools.args} · {TOOL_ARGS[tool.id]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="install" style={size(1, 2)}>
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">
                {t.install.eyebrow}
              </p>
              <h2>{t.install.title}</h2>
              <p className="lead">
                {t.install.lead} <code>SEARXNG_URL</code> {t.install.leadMid}{" "}
                <code>search.formats</code> {t.install.leadMid2} <code>json</code>
                {t.install.leadTail}
              </p>
            </div>

            <div className="install-grid">
              <div className="installer" data-ui>
                <fieldset>
                  <input type="radio" name="installer" id="tab-claude-code" defaultChecked />
                  <input type="radio" name="installer" id="tab-claude-desktop" />
                  <input type="radio" name="installer" id="tab-cursor" />
                  <div className="tab-labels">
                    <label htmlFor="tab-claude-code">Claude Code</label>
                    <label htmlFor="tab-claude-desktop">Claude Desktop</label>
                    <label htmlFor="tab-cursor">Cursor</label>
                  </div>
                  <div className="tab-panel panel-claude-code">
                    <div className="panel-head">
                      <span>Claude Code</span>
                      <CopyButton
                        value={CLAUDE_CODE}
                        label={t.playground.copy}
                        copiedLabel={t.playground.copied}
                      />
                    </div>
                    <pre>{CLAUDE_CODE}</pre>
                  </div>
                  <div className="tab-panel panel-claude-desktop">
                    <div className="panel-head">
                      <span>Claude Desktop</span>
                      <CopyButton
                        value={CLAUDE_DESKTOP}
                        label={t.playground.copy}
                        copiedLabel={t.playground.copied}
                      />
                    </div>
                    <pre>{CLAUDE_DESKTOP}</pre>
                  </div>
                  <div className="tab-panel panel-cursor">
                    <div className="panel-head">
                      <span>Cursor</span>
                      <CopyButton
                        value={CURSOR}
                        label={t.playground.copy}
                        copiedLabel={t.playground.copied}
                      />
                    </div>
                    <pre>{CURSOR}</pre>
                  </div>
                </fieldset>
              </div>

              <div className="env-panel" data-ui>
                  <table className="env">
                    <thead>
                      <tr>
                        <th>{t.install.envHeader}</th>
                        <th>{t.install.envWhat}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ENV_VARS.map((entry) => (
                        <tr key={entry.name}>
                          <td>
                            <code>{entry.name}</code>
                          </td>
                          <td>{t.install.env[entry.id]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="skill-panel" id="skill" data-ui>
                  <div className="skill-head">
                    <h3>{t.skill.title}</h3>
                    <CopyButton
                      value={SKILL_CMD}
                      label={t.playground.copy}
                      copiedLabel={t.playground.copied}
                    />
                  </div>
                  <p className="skill-lead">
                    {t.skill.lead} <code>Note:</code> {t.skill.leadMid}
                  </p>
                  <pre className="skill-cmd">{SKILL_CMD}</pre>
                  <p className="skill-agents">{t.skill.agents}</p>
                  <p className="skill-note">{t.skill.note}</p>
                  <a className="inline-link" href={SKILL_URL} target="_blank" rel="noreferrer">
                    {t.skill.repo}
                  </a>
                </div>
            </div>
          </div>
        </section>

        <section className="section band" id="instances" style={size(1, 2)}>
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">
                {t.instances.eyebrow}
              </p>
              <h2>{t.instances.title}</h2>
              <p className="lead">
                {t.instances.lead}{" "}
                <a
                  className="inline-link"
                  href="https://searx.space/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  searx.space
                </a>
                {t.instances.leadAfter} <code>json</code> {t.instances.leadTail}
              </p>
            </div>

            <div className="instances-panel" data-ui>
              <table className="instances-table">
                <thead>
                  <tr>
                    <th>{t.instances.host}</th>
                    <th>{t.instances.version}</th>
                    <th>{t.instances.uptime}</th>
                    <th>{t.instances.tls}</th>
                  </tr>
                </thead>
                <tbody>
                  {instances.map((instance) => (
                    <tr key={instance.url}>
                      <td data-label={t.instances.host}>
                        <a href={instance.url} target="_blank" rel="noreferrer noopener">
                          {new URL(instance.url).host}
                        </a>
                      </td>
                      <td data-label={t.instances.version}>{instance.version}</td>
                      <td data-label={t.instances.uptime}>
                        <span className="meter" aria-hidden>
                          <i style={{ width: `${instance.uptime}%` }} />
                        </span>
                        <span className="uptime">{instance.uptime}%</span>
                      </td>
                      <td data-label={t.instances.tls}>{instance.tls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="instances-foot">
                <span>{t.instances.ranking}</span>
                <a href="https://searx.space/" target="_blank" rel="noreferrer noopener">
                  {t.instances.all}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="closing site-foot">
        <div className="wrap">
          <div className="close">
            <h2>{t.cta.title}</h2>
            <p className="lead">
              {t.cta.body} <code>json</code> {t.cta.bodyMid}
            </p>
            <div className="actions">
              <a className="btn btn-primary" href={NPM_URL} target="_blank" rel="noreferrer noopener">
                {t.cta.primary}
              </a>
              <a className="btn btn-ghost" href={REPO_URL} target="_blank" rel="noreferrer noopener">
                {t.cta.secondary}
              </a>
            </div>
          </div>
          <div className="foot-row">
            <span className="wordmark">
              <Mark />
              <span>
                searxng<span className="wordmark-dim">·mcp</span>
              </span>
            </span>
            <div className="foot-links">
              <a href={NPM_URL} target="_blank" rel="noreferrer noopener">
                {t.footer.npm}
              </a>
              <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
                {t.footer.github}
              </a>
              <a href="https://searxng.org/" target="_blank" rel="noreferrer noopener">
                {t.footer.searxng}
              </a>
              <a href="#main">{t.footer.top}</a>
            </div>
            <p className="legal">
              {t.footer.note} (<code>SEARXNG_URL</code>) {t.footer.noteAfter}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
