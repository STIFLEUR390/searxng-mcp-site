import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/locales";

const LOCALE_COOKIE = "locale";

/**
 * Every page lives under a locale segment. A request without one is redirected
 * to the visitor's Accept-Language match, falling back to the last choice they
 * made in the switcher.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isLocale(pathname.split("/")[1] ?? "")) return NextResponse.next();

  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
  const languages = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((entry) => entry.split(";")[0].trim().slice(0, 2).toLowerCase());

  const locale = [chosen ?? "", ...languages].find(isLocale) ?? defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
