import "server-only";

import en from "@/messages/en.json";
import type { Locale } from "@/lib/locales";

/**
 * `en.json` is the source dictionary: every other locale mirrors its keys, and
 * `npx lingo.dev run` fills in any key that only exists here.
 */
export type Messages = typeof en;

const dictionaries: Record<Locale, () => Promise<{ default: Messages }>> = {
  en: () => import("@/messages/en.json"),
  fr: () => import("@/messages/fr.json"),
  de: () => import("@/messages/de.json"),
  es: () => import("@/messages/es.json"),
};

export async function getMessages(locale: Locale): Promise<Messages> {
  const { default: messages } = await dictionaries[locale]();
  return messages;
}
