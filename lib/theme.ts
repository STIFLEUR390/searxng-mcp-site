/** Themes are a cookie, not React state: the server never has to know, and the
 * first paint already has the right palette because a tiny inline script runs
 * before the body renders. */

export const themes = ["dark", "light"] as const;

export type Theme = (typeof themes)[number];

export const THEME_COOKIE = "theme";

export function isTheme(value: string | undefined): value is Theme {
  return value === "dark" || value === "light";
}

/** Runs before any markup paints, so there is no flash of the wrong palette. */
export const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(dark|light)/);var t=m&&m[1];if(!t){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t;document.documentElement.classList.add("js")}catch(e){document.documentElement.dataset.theme="dark";document.documentElement.classList.add("js")}})()`;
