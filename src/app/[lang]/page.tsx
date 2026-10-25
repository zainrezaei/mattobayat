import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";
import { getDictionary, hasLocale, t } from "@/i18n";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import { mapsLink, telLink, whatsappLink } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import ArrowIcon from "@/components/ArrowIcon";

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
            <span className="eyebrow">{dict.home.eyebrow}</span>

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
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                marginTop: "0.5rem",
              }}
            >
              <Link href={`/${lang}/products`} className="btn btn--gold btn--lg">
                <span>{dict.home.ctaShop}</span>
                <ArrowIcon direction="forward" />
              </Link>
              <a
                href={mapsLink(settings)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline btn--lg"
              >
                <span>📍</span>
                <span>{dict.home.ctaVisit}</span>
              </a>
            </div>

            {/* Fast Stats */}
            <div
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
              src="/images/site/hero.jpg"
              alt="Matto Bayat Persian rugs in bright living room"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "1rem",
                insetInlineStart: "1rem",
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(8px)",
                padding: "0.6rem 1.1rem",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--plum)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <span>✦</span>
              <span>Putkitie 6, Helsinki</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Bar */}
      <section
        style={{
          backgroundColor: "var(--surface)",
          borderBlock: "1px solid var(--line)",
          paddingBlock: "1.5rem",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <span style={{ fontSize: "1.5rem", color: "var(--gold-600)" }}>🚚</span>
            <div>
              <strong style={{ display: "block", fontSize: "0.92rem", color: "var(--ink)" }}>
                {lang === "fi" ? "Ilmainen toimitus" : lang === "fa" ? "ارسال رایگان" : "Free Delivery"}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                {lang === "fi" ? "Helsingissä yli 200 €" : lang === "fa" ? "در هلسینکی بالای ۲۰۰ یورو" : "In Helsinki over 200 €"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <span style={{ fontSize: "1.5rem", color: "var(--gold-600)" }}>✨</span>
            <div>
              <strong style={{ display: "block", fontSize: "0.92rem", color: "var(--ink)" }}>
                {lang === "fi" ? "Aito alkuperä" : lang === "fa" ? "اصالت تضمین‌شده" : "Authentic Origin"}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                {lang === "fi" ? "Iran, Turkki & Afganistan" : lang === "fa" ? "ایران، ترکیه و افغانستان" : "Iran, Turkey & Afghanistan"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <span style={{ fontSize: "1.5rem", color: "var(--gold-600)" }}>🛡️</span>
            <div>
              <strong style={{ display: "block", fontSize: "0.92rem", color: "var(--ink)" }}>
                {lang === "fi" ? "Varaa ilman riskiä" : lang === "fa" ? "رزرو بدون ریسک" : "Zero-Risk Reservation"}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                {lang === "fi" ? "Maksu vasta myymälässä" : lang === "fa" ? "پرداخت هنگام تحویل" : "Pay only upon pickup"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <span style={{ fontSize: "1.5rem", color: "var(--gold-600)" }}>💬</span>
            <div>
              <strong style={{ display: "block", fontSize: "0.92rem", color: "var(--ink)" }}>
                {lang === "fi" ? "4 kielen palvelu" : lang === "fa" ? "خدمات به ۴ زبان" : "Service in 4 Languages"}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                Suomi, English, فارسی, دری
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">{dict.home.categoriesLabel}</span>
              <h2>{dict.home.categoriesTitle}</h2>
            </div>
            <Link href={`/${lang}/products`} className="link-arrow">
              <span>{dict.common.viewAll}</span>
              <ArrowIcon direction="forward" />
            </Link>
          </div>

          <div
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
          <div className="section-head">
            <div>
              <span className="eyebrow">{dict.home.featuredLabel}</span>
              <h2>{dict.home.featuredTitle}</h2>
            </div>
            <Link href={`/${lang}/products`} className="btn btn--outline btn--sm">
              {dict.common.viewAll}
            </Link>
          </div>

          <div
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
        </div>
      </section>

      {/* 5. How It Works (Online Reservation flow) */}
      <section className="section">
        <div className="container">
          <div className="section-head section-head--center" style={{ marginBottom: "3.5rem" }}>
            <span className="eyebrow">{dict.home.howLabel}</span>
            <h2>{dict.home.howTitle}</h2>
            <p>
              {lang === "fi"
                ? "Emme veloita ennakkomaksua verkossa. Näin prosessi toimii:"
                : lang === "fa"
                ? "پرداخت آنلاین لازم نیست. مراحل کار بسیار ساده است:"
                : "No advance payment online. Here is how the process works:"}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
              gap: "2rem",
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                backgroundColor: "var(--surface)",
                padding: "2rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "var(--plum-50)",
                  color: "var(--plum)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: "1.25rem", color: "var(--plum)", margin: 0 }}>
                {dict.home.how1Title}
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                {dict.home.how1Text}
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                backgroundColor: "var(--surface)",
                padding: "2rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "var(--gold-50)",
                  color: "var(--gold-600)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: "1.25rem", color: "var(--plum)", margin: 0 }}>
                {dict.home.how2Title}
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                {dict.home.how2Text}
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                backgroundColor: "var(--surface)",
                padding: "2rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "var(--success-50)",
                  color: "var(--success)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: "1.25rem", color: "var(--plum)", margin: 0 }}>
                {dict.home.how3Title}
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                {dict.home.how3Text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Showroom Highlight with Real Google Maps Photos */}
      <section className="section section--alt">
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))",
              gap: "3rem",
              alignItems: "center",
            }}
          >
            {/* Showroom Photos Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  aspectRatio: "4 / 3",
                  gridColumn: "1 / -1",
                  boxShadow: "var(--shadow)",
                }}
              >
                <Image
                  src="/images/site/showroom.jpg"
                  alt="Matto Bayat Showroom Putkitie 6 Helsinki"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  aspectRatio: "1 / 1",
                }}
              >
                <Image
                  src="/images/site/rolls.jpg"
                  alt="Carpet rolls display Matto Bayat"
                  fill
                  sizes="25vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  aspectRatio: "1 / 1",
                }}
              >
                <Image
                  src="/images/site/detail.jpg"
                  alt="Hand-knotted rug texture detail"
                  fill
                  sizes="25vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>

            {/* Showroom Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <span className="eyebrow">{dict.home.showroomLabel}</span>
              <h2 style={{ fontSize: "clamp(2rem, 3.8vw, 2.8rem)", color: "var(--plum)" }}>
                {dict.home.showroomTitle}
              </h2>
              <p style={{ color: "var(--ink-soft)", fontSize: "1.05rem", lineHeight: 1.65 }}>
                {dict.home.showroomText}
              </p>

              {/* Hours & Address quick card */}
              <div
                style={{
                  padding: "1.5rem",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>📍</span>
                  <div>
                    <strong style={{ color: "var(--ink)" }}>{settings.address}, {settings.postal} {settings.city}</strong>
                    <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                      {lang === "fi" ? "Vartiokylä · 400 m Siilitien metrosta · Ilmainen asiakaspysäköinti" : lang === "fa" ? "وارتیوکیلا · ۴۰۰ متری ایستگاه متروی Siilitie · پارکینگ رایگان" : "Vartiokylä · 400m from Siilitie metro · Free customer parking"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>🕐</span>
                  <div style={{ fontSize: "0.9rem", color: "var(--ink-soft)" }}>
                    <strong>{dict.hours.monFri}:</strong> {settings.hours.mon_fri.open}–{settings.hours.mon_fri.close} ·{" "}
                    <strong>{dict.hours.sat}:</strong> {settings.hours.sat.open}–{settings.hours.sat.close} ·{" "}
                    <strong>{dict.hours.sun}:</strong> {settings.hours.sun.open}–{settings.hours.sun.close}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.5rem" }}>
                <a
                  href={mapsLink(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--gold"
                >
                  <span>🗺️</span>
                  <span>{dict.common.directions}</span>
                </a>
                <a
                  href={whatsappLink(settings.whatsapp, "Hei! Haluaisin tulla käymään myymälässä.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--whatsapp"
                >
                  <span>💬</span>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Interactive Room Size Guide Banner */}
      <section className="section">
        <div className="container">
          <div
            style={{
              padding: "clamp(2rem, 5vw, 3.5rem)",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--plum)",
              color: "#fff",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
              gap: "2rem",
              alignItems: "center",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div>
              <span style={{ color: "var(--gold-soft)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                ✦ {dict.guide.title}
              </span>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#fff", marginBlock: "0.5rem 1rem" }}>
                {dict.guide.sizeTitle}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: "44ch" }}>
                {dict.guide.sizeText}
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
      `}</style>
    </div>
  );
}
