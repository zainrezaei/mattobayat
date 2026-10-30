import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Cormorant_Garamond, Manrope, Vazirmatn } from "next/font/google";
import { LOCALES } from "@/lib/types";
import { dirOf, getDictionary, hasLocale, t } from "@/i18n";
import { getSettings } from "@/lib/data";
import { buildAlternates, SEO_KEYWORDS, SITE_URL, toAbsoluteUrl } from "@/lib/seo";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementBar from "@/components/AnnouncementBar";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  const settings = await getSettings();
  const ogImage = toAbsoluteUrl(settings.site_images?.hero || "/images/site/hero.jpg");
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.meta.title, template: `%s · Matto Bayat` },
    description: dict.meta.description,
    keywords: SEO_KEYWORDS[lang],
    alternates: buildAlternates(lang),
    verification: {
      google:
        process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
        "vgrIuqSA07tZ67S0E2Gs7KlN1EepKPPAOMwFyfU-Gaw",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/${lang}`,
      siteName: "Matto Bayat Helsinki",
      title: dict.meta.title,
      description: dict.meta.description,
      locale: lang === "fa" ? "fa_AF" : lang === "en" ? "en_GB" : "fi_FI",
      images: [{ url: ogImage, width: 1376, height: 768, alt: dict.meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [ogImage],
    },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const settings = await getSettings();
  const dict = getDictionary(lang);

  // Build dynamic openingHoursSpecification from settings.hours
  const openingHoursSpecification = [
    ...(!settings.hours.mon_fri.closed
      ? [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: settings.hours.mon_fri.open,
            closes: settings.hours.mon_fri.close,
          },
        ]
      : []),
    ...(!settings.hours.sat.closed
      ? [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Saturday"],
            opens: settings.hours.sat.open,
            closes: settings.hours.sat.close,
          },
        ]
      : []),
    ...(!settings.hours.sun.closed
      ? [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Sunday"],
            opens: settings.hours.sun.open,
            closes: settings.hours.sun.close,
          },
        ]
      : []),
  ];

  const socialLinks = [settings.instagram, settings.facebook, settings.tiktok].filter(Boolean);
  const reviewsList = settings.reviews || [];

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    "@id": `${SITE_URL}/#store`,
    name: "Matto Bayat",
    alternateName: ["قالین بیات", "فرش بیات", "Matto Bayat Helsinki"],
    description: dict.meta.description,
    url: `${SITE_URL}/${lang}`,
    image: toAbsoluteUrl(settings.site_images?.showroom || settings.site_images?.hero || "/images/site/hero.jpg"),
    telephone: settings.phone,
    email: settings.email,
    taxID: settings.business_id,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: settings.city,
      postalCode: settings.postal,
      addressCountry: "FI",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 60.2148,
      longitude: 25.0592,
    },
    openingHoursSpecification,
    ...(socialLinks.length > 0 ? { sameAs: socialLinks } : {}),
    ...(reviewsList.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5.0",
            bestRating: "5",
            ratingCount: String(reviewsList.length),
          },
          review: reviewsList.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5" },
            reviewBody: t(r.text, lang),
          })),
        }
      : {}),
    areaServed: ["Helsinki", "Espoo", "Vantaa", "Finland"],
    availableLanguage: ["Finnish", "English", "Dari", "Persian"],
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    priceRange: "€€",
  };

  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${manrope.variable} ${vazirmatn.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
      </head>
      <body>
        <CartProvider>
          <a href="#main-content" className="skip-link">
            {dict.nav.skip}
          </a>

          <AnnouncementBar settings={settings} lang={lang} />
          <Navbar lang={lang} settings={settings} />

          <main id="main-content">
            {children}
          </main>

          <CartDrawer lang={lang} />
          <FloatingWhatsApp lang={lang} settings={settings} />
          <Footer lang={lang} settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}
