import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDictionary, hasLocale, t } from "@/i18n";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import { mapsLink, telLink, whatsappLink } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";
import ProductCard from "@/components/ProductCard";
import ArrowIcon from "@/components/ArrowIcon";
import GoogleReviewsAndMap from "@/components/GoogleReviewsAndMap";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return buildPageMetadata({
    lang,
    path: "",
    title: dict.meta.title,
    description: dict.meta.description,
  });
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const settings = await getSettings();
  const categories = await getCategories();
  const allProducts = await getProducts();
  const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 4);

  return (
    <div>
      {/* 1. Hero Section */}
      <section
        style={{
          position: "relative",
          minHeight: "calc(100dvh - var(--header-h) - 40px)",
          display: "flex",
          alignItems: "center",
          backgroundColor: "var(--bg)",
          overflow: "hidden",
          paddingBlock: "clamp(3rem, 6vw, 6rem)",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))",
            gap: "clamp(2rem, 5vw, 4rem)",
            alignItems: "center",
          }}
        >
          {/* Hero text */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", zIndex: 2 }}>
            <h1
              style={{
                fontSize: "clamp(2.8rem, 6.2vw, 4.8rem)",
                lineHeight: 1.04,
                color: "var(--plum)",
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              {dict.home.title1} <br />
              <em style={{ fontStyle: "italic", color: "var(--gold-600)" }}>
                {dict.home.title2}
              </em>{" "}
              <br />
              {dict.home.title3}
            </h1>

            <p
              style={{
                fontSize: "clamp(1.05rem, 1.8vw, 1.25rem)",
                lineHeight: 1.6,
                color: "var(--ink-soft)",
                maxWidth: "48ch",
              }}
            >
              {dict.home.lead}
            </p>

            {/* CTAs */}
            <div
              className="hero-ctas"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.85rem",
                marginTop: "0.5rem",
              }}
            >
              <Link href={`/${lang}/products`} className="btn btn--gold btn--lg hero-cta-btn">
                <span>{dict.home.ctaShop}</span>
                <ArrowIcon direction="forward" />
              </Link>
              <a
                href={mapsLink(settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline btn--lg hero-cta-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{dict.home.ctaVisit}</span>
              </a>
            </div>

            {/* Fast Stats */}
            <div
              className="hero-fast-stats"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                paddingTop: "2rem",
                marginTop: "1rem",
                borderTop: "1px solid var(--line-strong)",
              }}
            >
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--plum)", lineHeight: 1 }}>
                  500+
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "4px" }}>
                  {dict.home.stat1}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--plum)", lineHeight: 1 }}>
                  7+
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "4px" }}>
                  {dict.home.stat2}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--plum)", lineHeight: 1 }}>
                  7 / 7
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "4px" }}>
                  {dict.home.stat3}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "4 / 3",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)",
              border: "4px solid var(--surface)",
            }}
          >
            <Image
              src={settings.site_images?.hero || "/images/site/hero.jpg"}
              alt="Matto Bayat Persian rugs in bright living room"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* 2. Trust Bar */}
      <section
        style={{
          backgroundColor: "var(--surface)",
          borderBlock: "1px solid var(--line)",
          paddingBlock: "1.75rem",
        }}
      >
        <div
          className="container trust-bar-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem 2rem",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--gold-50)",
                display: "grid",
                placeItems: "center",
                color: "var(--gold)",
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "0.92rem", color: "var(--ink)", fontWeight: 600 }}>
                {lang === "fi" ? "Aito alkuperä" : lang === "fa" ? "قالین‌های اصیل" : "Authentic Origin"}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                {lang === "fi" ? "Iran, Turkki & Afganistan" : lang === "fa" ? "افغانستان، ایران و ترکیه" : "Iran, Turkey & Afghanistan"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--gold-50)",
                display: "grid",
                placeItems: "center",
                color: "var(--gold)",
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "0.92rem", color: "var(--ink)", fontWeight: 600 }}>
                {lang === "fi" ? "Varaa ilman riskiä" : lang === "fa" ? "سفارش بدون پیش‌پرداخت" : "Zero-Risk Reservation"}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                {lang === "fi" ? "Maksu vasta myymälässä" : lang === "fa" ? "پرداخت پول در دکان" : "Pay only upon pickup"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--gold-50)",
                display: "grid",
                placeItems: "center",
                color: "var(--gold)",
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
                <path d="M2 9h20" />
              </svg>
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "0.92rem", color: "var(--ink)", fontWeight: 600 }}>
                {lang === "fi" ? "Aito villa & silkki" : lang === "fa" ? "پشم و ابریشم طبیعی" : "Pure Wool & Silk"}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                {lang === "fi" ? "100 % luonnonmateriaalit" : lang === "fa" ? "جنس اصل و بادوام" : "100% natural materials"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--gold-50)",
                display: "grid",
                placeItems: "center",
                color: "var(--gold)",
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "0.92rem", color: "var(--ink)", fontWeight: 600 }}>
                {lang === "fi" ? "Palvelu 3 kielellä" : lang === "fa" ? "مشوره به ۳ زبان" : "Service in 3 Languages"}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                Suomi, English, دری
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories */}
      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <h2>{dict.home.categoriesTitle}</h2>
          </div>

          <div
            className="categories-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
              gap: "1.5rem",
            }}
          >
            {categories.map((cat, idx) => {
              const bgImages = [
                "/images/products/tabriz-red.jpg",
                "/images/products/kilim-anatolia.jpg",
                "/images/products/heriz-runner.jpg",
                "/images/products/isfahan-round.jpg",
                "/images/products/velvet-throws.jpg",
              ];
              const bg = bgImages[idx % bgImages.length];

              return (
                <Link
                  key={cat.id}
                  href={`/${lang}/products?category=${cat.slug}`}
                  style={{
                    position: "relative",
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    aspectRatio: "3 / 4",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "1.5rem",
                    color: "#fff",
                    textDecoration: "none",
                  }}
                  className="cat-card"
                >
                  <Image
                    src={bg}
                    alt={t(cat.name, lang)}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    style={{
                      objectFit: "cover",
                      transition: "transform 0.5s var(--ease)",
                    }}
                    className="cat-card-img"
                  />
                  {/* Dark gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(36, 26, 38, 0.85) 0%, rgba(36, 26, 38, 0.2) 60%, transparent 100%)",
                      zIndex: 1,
                    }}
                  />
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <h3 style={{ fontSize: "1.35rem", fontWeight: 600, color: "#fff", marginBottom: "0.25rem" }}>
                      {t(cat.name, lang)}
                    </h3>
                    <span
                      className="link-arrow"
                      style={{ fontSize: "0.85rem", color: "var(--gold-soft)", fontWeight: 500 }}
                    >
                      <span>{dict.common.viewAll}</span>
                      <ArrowIcon direction="forward" size={15} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Rugs */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head section-head--center">
            <h2>{dict.home.featuredTitle}</h2>
          </div>

          <div
            className="featured-products-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(270px, 100%), 1fr))",
              gap: "2rem",
            }}
          >
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href={`/${lang}/products`} className="btn btn--outline">
              <span>{dict.common.viewAll}</span>
              <ArrowIcon direction="forward" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. What People Say About Us (Google Reviews Carousel) & Google Maps Showroom */}
      <GoogleReviewsAndMap settings={settings} lang={lang} dict={dict} />


      {/* 6. Interactive Room Size Guide Banner (Refined Scandinavian Aesthetic) */}
      <section className="section">
        <div className="container">
          <div
            style={{
              padding: "clamp(2rem, 5vw, 3.5rem)",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--bg-alt)",
              border: "1px solid var(--line-strong)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
              gap: "2.5rem",
              alignItems: "center",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "clamp(1.9rem, 3.6vw, 2.7rem)",
                  color: "var(--plum)",
                  marginBlock: "0 1rem",
                }}
              >
                {dict.guide.sizeTitle}
              </h2>
              <p
                style={{
                  color: "var(--ink-soft)",
                  fontSize: "1.05rem",
                  lineHeight: 1.65,
                  maxWidth: "46ch",
                }}
              >
                {dict.guide.sizeText}
              </p>
            </div>

            <div
              className="guide-banner-cta"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--line)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--gold-50)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--gold)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <div>
                  <strong style={{ fontSize: "0.95rem", color: "var(--plum)", display: "block" }}>
                    200 × 300 cm / 250 × 350 cm
                  </strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    {lang === "fi" ? "Laske mittasuhde huoneellesi" : lang === "fa" ? "پیدا کردن اندازه مناسب قالین برای اتاق شما" : "Calculate proportions for your space"}
                  </span>
                </div>
              </div>

              <Link href={`/${lang}/guide`} className="btn btn--gold btn--lg">
                <span>{dict.guide.seeMatching}</span>
                <ArrowIcon direction="forward" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .cat-card:hover .cat-card-img {
          transform: scale(1.06);
        }
        @media (max-width: 640px) {
          .hero-ctas {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.6rem !important;
            width: 100%;
          }
          .hero-cta-btn {
            min-block-size: 46px !important;
            padding: 0.65rem 0.6rem !important;
            font-size: 0.85rem !important;
            gap: 0.4rem !important;
            white-space: nowrap;
            width: 100%;
          }
          .trust-bar-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 1rem 0.75rem !important;
            align-items: flex-start !important;
          }
          .trust-bar-grid > div {
            gap: 0.55rem !important;
            align-items: flex-start !important;
          }
          .trust-bar-grid > div > div:first-child {
            width: 34px !important;
            height: 34px !important;
          }
          .trust-bar-grid strong {
            font-size: 0.82rem !important;
            line-height: 1.25;
          }
          .trust-bar-grid span {
            font-size: 0.72rem !important;
            line-height: 1.25;
            display: block;
          }
          .categories-grid {
            display: flex !important;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 0.85rem !important;
            padding-bottom: 0.5rem;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .categories-grid::-webkit-scrollbar {
            display: none;
          }
          .categories-grid .cat-card {
            flex: 0 0 68vw;
            max-width: 240px;
            aspect-ratio: 4 / 5 !important;
            scroll-snap-align: start;
            padding: 1.15rem !important;
          }
          .featured-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.85rem !important;
          }
        }
        @media (max-width: 440px) {
          .hero-fast-stats {
            gap: 0.5rem !important;
          }
          .hero-fast-stats > div > div:first-child {
            font-size: 1.45rem !important;
          }
          .hero-fast-stats > div > div:last-child {
            font-size: 0.74rem !important;
            line-height: 1.25;
          }
        }
      `}</style>
    </div>
  );
}
