"use client";

import type { CSSProperties } from "react";

import { useCallback, useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import type { SearchError, SearchPayload } from "@/lib/payload";

const CATEGORIES = ["general", "news", "images", "videos"] as const;

type CategoryId = (typeof CATEGORIES)[number];

const LIMITS = [5, 10, 20];
const RANGES = ["", "day", "week", "month", "year"] as const;

const RANGE_LABELS = {
  "": "any",
  day: "day",
  week: "week",
  month: "month",
  year: "year",
} as const;

export type PlaygroundStrings = {
  live: string;
  api: string;
  routeNote: string;
  placeholder: string;
  queryLabel: string;
  limit: string;
  range: string;
  ranges: Record<(typeof RANGE_LABELS)[(typeof RANGES)[number]], string>;
  categories: Record<CategoryId, string>;
  search: string;
  searching: string;
  resultsTab: string;
  agentTab: string;
  resultsWord: string;
  skipped: string;
  running: string;
  noRun: string;
  via: string;
  instance: string;
  copy: string;
  copyOutput: string;
  copied: string;
  empty: string;
  querying: string;
  idle: string;
  networkError: string;
  tool: string;
  suggestions: string[];
};

export function Playground({ strings }: { strings: PlaygroundStrings }) {
  const initialQuery = strings.suggestions[0] ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryId>("general");
  const [limit, setLimit] = useState(10);
  const [time, setTime] = useState("");
  const [payload, setPayload] = useState<SearchPayload | null>(null);
  const [error, setError] = useState<SearchError | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"results" | "agent">("results");
  const pending = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const run = useCallback(
    async (next: Partial<{ q: string; category: CategoryId; limit: number; time: string }> = {}) => {
      const q = (next.q ?? query).trim();
      if (!q) {
        input.current?.focus();
        return;
      }

      pending.current?.abort();
      const controller = new AbortController();
      pending.current = controller;
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        q,
        category: next.category ?? category,
        limit: String(next.limit ?? limit),
      });
      const range = next.time ?? time;
      if (range) params.set("time", range);

      try {
        const response = await fetch(`/api/search?${params}`, { signal: controller.signal });
        const body = (await response.json()) as SearchPayload | SearchError;
        // A newer run owns the panel: drop whatever this one settled with.
        if (controller !== pending.current) return;
        if (response.ok) {
          setPayload(body as SearchPayload);
        } else {
          setPayload(null);
          setError(body as SearchError);
        }
      } catch (cause) {
        if (controller !== pending.current) return;
        if ((cause as Error).name !== "AbortError") {
          setPayload(null);
          setError({ error: strings.networkError });
        }
      } finally {
        if (controller === pending.current) setLoading(false);
      }
    },
    [category, limit, query, strings.networkError, time],
  );

  useEffect(() => {
    void run({ q: initialQuery });
    return () => pending.current?.abort();
    // Initial fetch only: subsequent runs are triggered by the controls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickCategory(id: CategoryId) {
    setCategory(id);
    void run({ category: id });
  }

  function pickLimit(value: number) {
    setLimit(value);
    void run({ limit: value });
  }

  function pickTime(value: string) {
    setTime(value);
    void run({ time: value });
  }

  function pickSuggestion(value: string) {
    setQuery(value);
    void run({ q: value });
  }

  const meta = payload?.meta;

  return (
    <div className="demo">
      <div className="demo-head">
        <span className="dot" aria-hidden />
        <b>{strings.live}</b>
        <span>{strings.api}</span>
        <span className="spacer" />
        <span>{strings.routeNote}</span>
      </div>

      <div className="demo-controls">
        <form
          className="qrow"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          {/* Dark Reader rewrites the paint attributes of these nodes, which React cannot patch up. */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden suppressHydrationWarning>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" suppressHydrationWarning />
            <path
              d="m16.5 16.5 4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              suppressHydrationWarning
            />
          </svg>
          <input
            ref={input}
            id="demo-query"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={strings.placeholder}
            aria-label={strings.queryLabel}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>↵</kbd>
        </form>

        <div className="controls-row">
          <div className="seg" role="group" aria-label={strings.categories.general}>
            {CATEGORIES.map((entry) => (
              <button
                key={entry}
                type="button"
                aria-pressed={category === entry}
                onClick={() => pickCategory(entry)}
              >
                {strings.categories[entry]}
              </button>
            ))}
          </div>

          <div className="field">
            <label htmlFor="limit">{strings.limit}</label>
            <select
              id="limit"
              value={limit}
              onChange={(event) => pickLimit(Number(event.target.value))}
            >
              {LIMITS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="time">{strings.range}</label>
            <select id="time" value={time} onChange={(event) => pickTime(event.target.value)}>
              {RANGES.map((entry) => (
                <option key={entry} value={entry}>
                  {strings.ranges[RANGE_LABELS[entry]]}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn btn-primary push"
            onClick={() => void run()}
            disabled={loading}
          >
            {loading ? strings.searching : strings.search}
          </button>
        </div>

        {!payload ? (
          <div className="suggestions">
            {strings.suggestions.map((value) => (
              <button key={value} type="button" onClick={() => pickSuggestion(value)}>
                {value}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="demo-body">
        <div className="demo-toolbar">
          <div className="tabs" role="tablist" aria-label="View">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "results"}
              onClick={() => setTab("results")}
            >
              {strings.resultsTab}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "agent"}
              onClick={() => setTab("agent")}
            >
              {strings.agentTab}
            </button>
          </div>

          <div className="status">
            {meta ? (
              <>
                <span>
                  {meta.shown}/{meta.total} {strings.resultsWord}
                </span>
                <span>{meta.elapsedMs} ms</span>
                <span>{strings.via} {meta.engines.join(", ") || strings.instance}</span>
                {meta.unresponsive.length > 0 ? (
                  <span className="bad">{meta.unresponsive.length} {strings.skipped}</span>
                ) : null}
              </>
            ) : (
              <span>{loading ? strings.running : strings.noRun}</span>
            )}
          </div>

          <div className="toolbar-end">
            {payload ? <CopyButton value={payload.text} label={strings.copyOutput} copiedLabel={strings.copied} /> : null}
          </div>
        </div>

        {error ? (
          <div className="error" role="alert">
            <b>{error.error}</b>
            {error.hint ? <span>{error.hint}</span> : null}
          </div>
        ) : null}

        {!error && payload && tab === "results" ? (
          payload.results.length > 0 ? (
            <ul className="results">
              {payload.results.map((result, index) => (
                <li
                  className="result"
                  key={`${result.url}-${index}`}
                  style={{ "--i": index } as CSSProperties}
                >
                  <span className="r-idx">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <a
                      className="r-title"
                      href={result.url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {result.title}
                    </a>
                    <span className="r-url">
                      <b>{result.domain}</b>
                      {result.url.replace(/^https?:\/\/[^/]+/, "")}
                    </span>
                    {result.content ? <p className="r-snip">{result.content}</p> : null}
                    {result.thumbnail ?? result.image ? (
                      <div className="thumbs">
                        <img
                          src={(result.thumbnail ?? result.image) as string}
                          alt=""
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : null}
                    <div className="r-meta">
                      {result.engines.map((engine) => (
                        <span className="badge" key={engine}>
                          {engine}
                        </span>
                      ))}
                      {result.category ? <span className="badge">{result.category}</span> : null}
                      {result.published ? (
                        <span className="badge hot">{result.published.slice(0, 10)}</span>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <p>{strings.empty}</p>
              <div className="suggestions">
                {strings.suggestions.map((value) => (
                  <button key={value} type="button" onClick={() => pickSuggestion(value)}>
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )
        ) : null}

        {!error && payload && tab === "agent" ? (
          <>
            <pre className="agent">{payload.text}</pre>
            <div className="mcp-call">
              <code>
                {strings.tool} <em>searxng_search</em> · q=&quot;{meta?.query}&quot; · limit={limit}
                {time ? ` · time_range=${time}` : ""}
              </code>
              <CopyButton value={payload.text} label={strings.copy} copiedLabel={strings.copied} />
            </div>
          </>
        ) : null}

        {!error && !payload && loading ? (
          <div className="empty">
            <p>{strings.querying}</p>
          </div>
        ) : null}

        {!error && !payload && !loading ? (
          <div className="empty">
            <p>{strings.idle}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
