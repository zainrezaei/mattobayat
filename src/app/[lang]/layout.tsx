import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Cormorant_Garamond, Manrope, Vazirmatn } from "next/font/google";
import { LOCALES } from "@/lib/types";
import { dirOf, getDictionary, hasLocale } from "@/i18n";
import { getSettings } from "@/lib/data";
import { buildAlternates, SITE_URL } from "@/lib/seo";
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
  const ogImage = settings.site_images?.hero || "/images/site/hero.jpg";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.meta.title, template: `%s · Matto Bayat` },
    description: dict.meta.description,
    alternates: buildAlternates(lang),
    openGraph: {
      type: "website",
      siteName: "Matto Bayat",
      title: dict.meta.title,
      description: dict.meta.description,
      locale: lang === "fa" ? "fa_AF" : lang === "en" ? "en_GB" : "fi_FI",
      images: [{ url: ogImage, width: 1376, height: 768 }],
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

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    name: "Matto Bayat",
    alternateName: ["قالین بیات", "فرش بیات", "Matto Bayat Helsinki"],
    url: `${SITE_URL}/${lang}`,
    telephone: settings.phone || "+358449715631",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address || "Putkitie 6",
      addressLocality: settings.city || "Helsinki",
      postalCode: settings.postal || "00880",
      addressCountry: "FI",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 60.2148,
      longitude: 25.0592,
    },
    areaServed: ["Helsinki", "Espoo", "Vantaa", "Finland"],
    availableLanguage: ["Finnish", "English", "Dari", "Persian"],
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
