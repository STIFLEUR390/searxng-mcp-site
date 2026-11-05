"use client";

import { useEffect, useRef, useState } from "react";
import { THEME_COOKIE, themes, type Theme } from "@/lib/theme";

export interface ThemeLabels {
  /** Shown before hydration, when the live theme is not yet known. */
  label: string;
  toLight: string;
  toDark: string;
}

export function ThemeToggle({ label, toDark, toLight }: ThemeLabels) {
  const button = useRef<HTMLButtonElement>(null);
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next: Theme = (document.documentElement.dataset.theme === "light" ? "dark" : "light");
    const commit = () => {
      document.documentElement.dataset.theme = next;
      document.cookie = `${THEME_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
      setTheme(next);
    };

    const rect = button.current?.getBoundingClientRect();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!rect || reduced || typeof document.startViewTransition !== "function") {
      commit();
      return;
    }

    // The new palette grows out of the switch, Telegram style. Radius reaches
    // the farthest corner so the circle always covers the viewport.
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(commit);
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        {
          duration: 520,
          easing: "cubic-bezier(0.22, 0.7, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    }).catch(() => {
      // A cancelled transition already committed the palette; nothing to undo.
    });
  }

  const action = theme === "light" ? toDark : theme === "dark" ? toLight : label;

  return (
    <button
      ref={button}
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={action}
      title={action}
      data-theme-toggle
    >
      <svg className="i-sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.6v2.4M12 19v2.4M2.6 12h2.4M19 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7" />
      </svg>
      <svg className="i-moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 14.4A8.4 8.4 0 1 1 9.6 4a6.8 6.8 0 0 0 10.4 10.4Z" />
      </svg>
      <span className="sr-only">{themes.join(" / ")}</span>
    </button>
  );
}
