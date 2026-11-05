"use client";

import { localeNames, locales, type Locale } from "@/lib/locales";

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  return (
    <div className="langs" role="group" aria-label={label}>
      {locales.map((code) => (
        <a
          key={code}
          href={`/${code}`}
          hrefLang={code}
          title={localeNames[code]}
          aria-current={code === locale ? "true" : undefined}
          onClick={() => {
            document.cookie = `locale=${code};path=/;max-age=31536000;samesite=lax`;
          }}
        >
          {code}
        </a>
      ))}
    </div>
  );
}
