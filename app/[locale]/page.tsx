import { notFound } from "next/navigation";
import { Landing } from "@/components/landing";
import { getMessages } from "@/lib/i18n";
import { publicInstances } from "@/lib/instance";
import { isLocale } from "@/lib/locales";

export const revalidate = 3600;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [messages, instances] = await Promise.all([getMessages(locale), publicInstances(8)]);

  return <Landing locale={locale} messages={messages} instances={instances} />;
}
