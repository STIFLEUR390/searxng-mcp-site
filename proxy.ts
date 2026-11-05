import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/locales";

const LOCALE_COOKIE = "locale";

/**
 * Every page lives under a locale segment. The site has one page, so only `/` is
 * redirected: any other path is a 404 wherever it lands, and prefixing it with a
 * locale would turn `/typo` into `/fr/typo`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isLocale(pathname.split("/")[1] ?? "") || pathname !== "/") return NextResponse.next();

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
