import { LOCALES, type Locale, type Localized } from "@/lib/types";
import fi, { type Dictionary } from "./dictionaries/fi";
import en from "./dictionaries/en";
import fa from "./dictionaries/fa";

const dictionaries: Record<Locale, Dictionary> = { fi, en, fa };

export type { Dictionary };

export function hasLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return locale === "fa" ? "rtl" : "ltr";
}

/** Pick a localized string, falling back to whichever language the owner did fill in. */
export function t(value: Localized | null | undefined, locale: Locale): string {
  if (!value) return "";
  const order: Locale[] = locale === "fa" ? ["fa", "en", "fi"] : locale === "en" ? ["en", "fi", "fa"] : ["fi", "en", "fa"];
  for (const l of order) {
    const v = value[l]?.trim();
    if (v) return v;
  }
  return "";
}

export function formatPrice(amount: number, locale: Locale): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  if (locale === "fa") {
    const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const faNum = formatted.replace(/\d/g, (d) => faDigits[Number(d)]);
    return `${faNum} €`;
  }
  return `${formatted} €`;
}

export function formatNumber(n: number, locale: Locale): string {
  const formatted = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  if (locale === "fa") {
    const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return formatted.replace(/\d/g, (d) => faDigits[Number(d)]);
  }
  return formatted;
}

const dateLocaleMap: Record<Locale, string> = { fi: "fi-FI", en: "en-GB", fa: "fa-IR" };

export function formatDate(iso: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(dateLocaleMap[locale], {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Helsinki",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleDateString();
  }
}

export function formatSize(w: number | null, l: number | null, locale: Locale): string {
  if (!w || !l) return "";
  return `${formatNumber(w, locale)} × ${formatNumber(l, locale)} ${dictionaries[locale].common.cm}`;
}

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
