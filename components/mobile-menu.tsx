"use client";

import { useRef } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/lib/locales";

export function MobileMenu({
  label,
  close,
  links,
  npm,
  locale,
  language,
}: {
  label: string;
  close: string;
  links: { href: string; label: string }[];
  npm: { href: string; label: string };
  locale: Locale;
  language: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className="menu-btn"
        aria-label={label}
        aria-haspopup="dialog"
        aria-controls="site-menu"
        onClick={() => dialog.current?.showModal()}
      >
        <span />
        <span />
        <span />
      </button>
      <dialog
        ref={dialog}
        id="site-menu"
        className="menu"
        aria-label={label}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="menu-top">
          <span className="menu-label">{label}</span>
          <button type="button" className="menu-close" onClick={() => dialog.current?.close()}>
            {close}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="menu-links" aria-label={label}>
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => dialog.current?.close()}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="menu-foot">
          <a className="btn btn-primary" href={npm.href} target="_blank" rel="noreferrer noopener">
            {npm.label}
          </a>
          <LanguageSwitcher locale={locale} label={language} />
        </div>
      </dialog>
    </>
  );
}
