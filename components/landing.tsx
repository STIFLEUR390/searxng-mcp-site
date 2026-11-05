import { CopyButton } from "@/components/copy-button";
import { LanguageSwitcher } from "@/components/language-switcher";
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

  return (
    <>
      <header className="site-head">
        <div className="wrap">
          <a className="wordmark" href="#top">
            searxng<span>·mcp</span>
          </a>
          <nav className="nav">
            <a href="#demo">{t.nav.demo}</a>
            <a href="#tools">{t.nav.tools}</a>
            <a href="#instances">{t.nav.instances}</a>
            <a href="#install">{t.nav.install}</a>
            <a href="#skill">{t.nav.skill}</a>
            <a className="nav-cta" href={NPM_URL} target="_blank" rel="noreferrer noopener">
              {t.nav.npm}
            </a>
            <LanguageSwitcher locale={locale} label={t.footer.language} />
          </nav>
        </div>
      </header>

      <main id="top">
        <div className="wrap">
          <section className="hero">
            <div className="rise">
              <p className="eyebrow">
                <i>01</i> {t.hero.eyebrow}
              </p>
              <h1>
                {t.hero.title1}
                <br />
                {t.hero.title2}
                <br />
                {t.hero.title3} <span className="holo">{t.hero.accent}</span>.
              </h1>
              <p className="lead">{t.hero.lead}</p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#demo">
                  {t.hero.ctaDemo}
                </a>
                <a
                  className="btn btn-ghost"
                  href={NPM_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t.hero.ctaNpm}
                </a>
                <a
                  className="btn btn-ghost"
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t.hero.ctaGithub}
                </a>
              </div>
            </div>

            <div className="terminal rise rise-2">
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
                <CopyButton value="npx -y @aplix39/searxng-mcp" copiedLabel={t.playground.copied} />
              </div>
            </div>
          </section>

          <div className="stats rise rise-3">
            <div className="stat">
              <b>7</b>
              <span>{t.stats.tools}</span>
            </div>
            <div className="stat">
              <b className="holo">0</b>
              <span>{t.stats.keys}</span>
            </div>
            <div className="stat">
              <b>118</b>
              <span>{t.stats.tests}</span>
            </div>
            <div className="stat">
              <b>MIT</b>
              <span>{t.stats.license}</span>
            </div>
          </div>
        </div>

        <section className="section" id="demo">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">
                <i>02</i> {t.demo.eyebrow}
              </p>
              <div>
                <h2>{t.demo.title}</h2>
                <p className="lead">
                  {t.demo.lead} <code>/search?format=json</code> {t.demo.leadAfter}{" "}
                  <em>{t.demo.leadAgent}</em> {t.demo.leadTail}
                </p>
              </div>
            </div>

            <Playground strings={t.playground} />
            <p className="demo-note">
              {t.demo.note} <code>429</code> {t.demo.noteAfter}
            </p>
          </div>
        </section>

        <section className="section" id="output">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">
                <i>03</i> {t.output.eyebrow}
              </p>
              <div>
                <h2>{t.output.title}</h2>
                <p className="lead">{t.output.lead}</p>
              </div>
            </div>

            <div className="split">
              <div>
                <p className="mini-label">{t.output.kept}</p>
                <ul className="chips">
                  <li>
                    <b>title</b>
                  </li>
                  <li>
                    <b>url</b>
                  </li>
                  <li>
                    <b>{t.output.snippet}</b> · {t.output.snippetChars}
                  </li>
                  <li>
                    <b>engines</b>
                  </li>
                  <li>
                    <b>category</b>
                  </li>
                  <li>
                    <b>published</b>
                  </li>
                  <li>
                    <b>{t.output.answer}</b>
                  </li>
                  <li>
                    <b>{t.output.infoboxes}</b>
                  </li>
                  <li>
                    <b>{t.output.related}</b>
                  </li>
                  <li>
                    <b>{t.output.unresponsive}</b>
                  </li>
                </ul>

                <p className="mini-label">{t.output.dropped}</p>
                <ul className="chips">
                  <li className="cut">score</li>
                  <li className="cut">positions</li>
                  <li className="cut">parsed_url</li>
                  <li className="cut">favicons</li>
                  <li className="cut">templates</li>
                  <li className="cut">raw HTML</li>
                </ul>

                <p className="lead">
                  {t.output.lead2} <code>format.ts</code>
                  {t.output.lead2After}
                </p>
              </div>

              <div className="code-block">
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

        <section className="section" id="tools">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">
                <i>04</i> {t.tools.eyebrow}
              </p>
              <div>
                <h2>{t.tools.title}</h2>
                <p className="lead">
                  {t.tools.lead} <code>include_domains</code> {t.tools.leadMid}{" "}
                  <code>exclude_domains</code> {t.tools.leadTail}
                </p>
              </div>
            </div>

            <div className="tools">
              {TOOLS.map((tool) => (
                <div className="tool" key={tool.name}>
                  <code>{tool.name}</code>
                  <div>
                    <p>{t.tools.items[tool.id]}</p>
                    <p>
                      {t.tools.args} · {TOOL_ARGS[tool.id]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="install">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">
                <i>05</i> {t.install.eyebrow}
              </p>
              <div>
                <h2>{t.install.title}</h2>
                <p className="lead">
                  {t.install.lead} <code>SEARXNG_URL</code> {t.install.leadMid}{" "}
                  <code>search.formats</code> {t.install.leadMid2} <code>json</code>
                  {t.install.leadTail}
                </p>
              </div>
            </div>

            <div className="cards">
              <div className="card">
                <h3>
                  Claude Code
                  <CopyButton value={CLAUDE_CODE} copiedLabel={t.playground.copied} />
                </h3>
                <pre>{CLAUDE_CODE}</pre>
              </div>
              <div className="card">
                <h3>
                  Claude Desktop
                  <CopyButton value={CLAUDE_DESKTOP} copiedLabel={t.playground.copied} />
                </h3>
                <pre>{CLAUDE_DESKTOP}</pre>
              </div>
              <div className="card">
                <h3>
                  Cursor
                  <CopyButton value={CURSOR} copiedLabel={t.playground.copied} />
                </h3>
                <pre>{CURSOR}</pre>
              </div>
            </div>

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
                    <td>{entry.name}</td>
                    <td>{t.install.env[entry.id]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section" id="skill">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">
                <i>06</i> {t.skill.eyebrow}
              </p>
              <div>
                <h2>{t.skill.title}</h2>
                <p className="lead">
                  {t.skill.lead} <code>Note:</code> {t.skill.leadMid}
                </p>
              </div>
            </div>

            <div className="cards">
              <div className="card">
                <h3>
                  searxng-mcp
                  <CopyButton value={SKILL_CMD} copiedLabel={t.playground.copied} />
                </h3>
                <pre>{SKILL_CMD}</pre>
              </div>
              <div className="card">
                <h3>{t.skill.eyebrow}</h3>
                <p className="skill-agents">{t.skill.agents}</p>
                <p className="demo-note">{t.skill.note}</p>
                <a className="inline-link" href={SKILL_URL} target="_blank" rel="noreferrer">
                  {t.skill.repo}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="instances">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">
                <i>07</i> {t.instances.eyebrow}
              </p>
              <div>
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
            </div>

            <div className="instances">
              {instances.map((instance) => (
                <a
                  className="instance"
                  key={instance.url}
                  href={instance.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <b>{new URL(instance.url).host}</b>
                  <span className="instance-version">{instance.version}</span>
                  <span className="meter" aria-hidden>
                    <i style={{ width: `${instance.uptime}%` }} />
                  </span>
                  <span className="instance-meta">
                    {instance.uptime}% · TLS {instance.tls}
                  </span>
                </a>
              ))}
              <a
                className="instance instance-more"
                href="https://searx.space/"
                target="_blank"
                rel="noreferrer noopener"
              >
                <b>{t.instances.all}</b>
                <span className="instance-meta">{t.instances.ranking}</span>
              </a>
            </div>
          </div>
        </section>

        <div className="wrap">
          <div className="cta">
            <div>
              <h2>{t.cta.title}</h2>
              <p>
                {t.cta.body} <code>json</code> {t.cta.bodyMid}
              </p>
            </div>
            <div className="hero-actions">
              <a className="btn btn-primary" href={NPM_URL} target="_blank" rel="noreferrer noopener">
                {t.cta.primary}
              </a>
              <a className="btn btn-ghost" href={REPO_URL} target="_blank" rel="noreferrer noopener">
                {t.cta.secondary}
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="site-foot">
        <div className="wrap">
          <div>
            <span className="wordmark">
              searxng<span>·mcp</span>
            </span>
            <p>
              {t.footer.note} (<code>SEARXNG_URL</code>) {t.footer.noteAfter}
            </p>
          </div>
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
            <a href="#top">{t.footer.top}</a>
            <LanguageSwitcher locale={locale} label={t.footer.language} />
          </div>
        </div>
      </footer>
    </>
  );
}
