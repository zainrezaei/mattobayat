import type { Metadata } from "next";
import type { Locale } from "./types";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://matto-bayat.vercel.app"
).replace(/\/$/, "");

export function toAbsoluteUrl(urlOrPath?: string | null): string {
  if (!urlOrPath) return `${SITE_URL}/images/site/hero.jpg`;
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    return urlOrPath;
  }
  return `${SITE_URL}${urlOrPath.startsWith("/") ? "" : "/"}${urlOrPath}`;
}

export const SEO_KEYWORDS: Record<Locale, string[]> = {
  fi: [
    "Matto Bayat",
    "matot Helsinki",
    "persialainen matto",
    "itämainen matto",
    "afganistanilainen matto",
    "turkkilainen matto",
    "käsinsolmittu matto",
    "villamatto",
    "silkkimatto",
    "kelim matto",
    "käytävämatto",
    "pyöreä matto",
    "mattokauppa Helsinki",
    "mattoliike Vartiokylä",
    "Putkitie 6",
  ],
  en: [
    "Matto Bayat",
    "rugs Helsinki",
    "Persian rugs Helsinki",
    "oriental rugs Finland",
    "Afghan rugs Helsinki",
    "Turkish rugs Helsinki",
    "hand-knotted wool rug",
    "silk rug Helsinki",
    "kilim rug",
    "runner rug",
    "carpet shop Helsinki",
    "Putkitie 6 Helsinki",
  ],
  fa: [
    "قالین بیات",
    "فرش بیات هلسینکی",
    "قالین در هلسینکی",
    "قالین افغانی در فنلند",
    "قالین ایرانی هلسینکی",
    "قالین ترکی",
    "قالین دستباف",
    "دکان قالین هلسینکی",
    "سرانداز و کناره",
    "کمپل و پرده هلسینکی",
    "Matto Bayat Helsinki",
    "Putkitie 6 Helsinki",
  ],
};

/**
 * Builds accurate hreflang and canonical alternates for any route.
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
 * Helper to construct standard page metadata with consistent Open Graph, Twitter, keywords, and hreflang tags.
 */
export function buildPageMetadata({
  lang,
  path = "",
  title,
  description,
  ogImage,
  image,
}: {
  lang: Locale;
  path?: string;
  title: string;
  description: string;
  ogImage?: string;
  image?: string;
}): Metadata {
  const cleanPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  const canonicalUrl = `${SITE_URL}/${lang}${cleanPath}`;
  const alternates = buildAlternates(lang, path);
  const resolvedImage = toAbsoluteUrl(ogImage || image || "/images/site/hero.jpg");
  const ogLocale = lang === "fa" ? "fa_AF" : lang === "en" ? "en_GB" : "fi_FI";
  const alternateLocales = ["fi_FI", "en_GB", "fa_AF"].filter((l) => l !== ogLocale);

  return {
    title,
    description,
    keywords: SEO_KEYWORDS[lang],
    alternates,
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: "Matto Bayat Helsinki",
      title,
      description,
      locale: ogLocale,
      alternateLocale: alternateLocales,
      images: [
        {
          url: resolvedImage,
          width: 1376,
          height: 768,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolvedImage],
    },
  };
}
