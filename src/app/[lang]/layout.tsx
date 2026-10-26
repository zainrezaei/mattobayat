import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Cormorant_Garamond, Manrope, Vazirmatn } from "next/font/google";
import { LOCALES } from "@/lib/types";
import { dirOf, getDictionary, hasLocale } from "@/i18n";
import { getSettings } from "@/lib/data";
import { CartProvider } from "@/context/CartContext";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://matto-bayat.vercel.app";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.meta.title, template: `%s · Matto Bayat` },
    description: dict.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { fi: "/fi", en: "/en", fa: "/fa", "x-default": "/fi" },
    },
    openGraph: {
      type: "website",
      siteName: "Matto Bayat",
      title: dict.meta.title,
      description: dict.meta.description,
      locale: lang === "fa" ? "fa_IR" : lang === "en" ? "en_GB" : "fi_FI",
      images: [{ url: "/images/site/hero.jpg", width: 1376, height: 768 }],
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

  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${manrope.variable} ${vazirmatn.variable}`}
    >
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
          <Footer lang={lang} settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}
