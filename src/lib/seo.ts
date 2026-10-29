import type { Metadata } from "next";
import type { Locale } from "./types";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://mattobayat.fi"
).replace(/\/$/, "");

/**
 * Builds accurate hreflang and canonical alternates for any route.
 * Always produces:
 * - canonical: https://mattobayat.fi/{lang}{path}
 * - languages: fi-FI, en, fa-AF, and x-default (pointing to Finnish)
 */
export function buildAlternates(lang: Locale, path = ""): Metadata["alternates"] {
  const cleanPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  return {
    canonical: `${SITE_URL}/${lang}${cleanPath}`,
    languages: {
      "fi-FI": `${SITE_URL}/fi${cleanPath}`,
      en: `${SITE_URL}/en${cleanPath}`,
      "fa-AF": `${SITE_URL}/fa${cleanPath}`,
      "x-default": `${SITE_URL}/fi${cleanPath}`,
    },
  };
}

/**
 * Disallows indexing on private or transactional routes (e.g. admin, reservation).
 */
export function buildRobotsNoIndex(): Metadata["robots"] {
  return {
    index: false,
    follow: false,
    nocache: true,
  };
}

/**
 * Helper to construct standard page metadata with consistent Open Graph and hreflang tags.
 */
export function buildPageMetadata({
  lang,
  path = "",
  title,
  description,
  ogImage,
}: {
  lang: Locale;
  path?: string;
  title: string;
  description: string;
  ogImage?: string;
}): Metadata {
  const alternates = buildAlternates(lang, path);
  const image = ogImage || `${SITE_URL}/images/site/hero.jpg`;

  return {
    title,
    description,
    alternates,
    openGraph: {
      type: "website",
      siteName: "Matto Bayat",
      title,
      description,
      locale: lang === "fa" ? "fa_AF" : lang === "en" ? "en_GB" : "fi_FI",
      images: [{ url: image }],
    },
  };
}
