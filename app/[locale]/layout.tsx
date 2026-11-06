import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { getMessages } from "@/lib/i18n";
import { isLocale, locales, type Locale } from "@/lib/locales";
import { THEME_SCRIPT } from "@/lib/theme";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

/** Vercel exposes the production host at build time; the literal keeps local builds honest. */
const SITE = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://searxng-mcp-site.vercel.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b1114" },
    { media: "(prefers-color-scheme: light)", color: "#f7f9fa" },
  ],
  colorScheme: "light dark",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = await getMessages(locale);
  const title = `searxng-mcp — ${t.meta.title}`;

  return {
    metadataBase: new URL(SITE),
    title: { default: title, template: "%s · searxng-mcp" },
    description: t.meta.description,
    applicationName: "searxng-mcp",
    other: { "page-type": "software", "site-kind": "software" },
    keywords: [
      "mcp",
      "model context protocol",
      "searxng",
      "web search",
      "ai agents",
      "claude",
      "cursor",
    ],
    authors: [{ name: "STIFLEUR390" }],
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}`])),
    },
    openGraph: {
      type: "website",
      title,
      description: t.meta.description,
      siteName: "searxng-mcp",
      locale,
    },
    twitter: { card: "summary_large_image", title, description: t.meta.description },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale satisfies Locale}
      className={`${sans.variable} ${mono.variable}`}
      data-theme="light"
      data-type="software"
      data-site-kind="software"
      data-radius="soft"
      data-buttons="step"
      suppressHydrationWarning
    >
      <body>
        {/* Sets data-theme from the cookie before the body paints: no flash of the wrong palette. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
