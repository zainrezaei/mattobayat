import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { fill, getDictionary, hasLocale } from "@/i18n";
import { getSettings } from "@/lib/data";
import { mapsLink, whatsappLink } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.about.title,
    description: dict.about.lead,
  };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const settings = await getSettings();

  return (
    <div>
      {/* 1. Header */}
      <section className="section" style={{ paddingBottom: "2rem" }}>
        <div className="container">
          <div style={{ maxWidth: "680px" }}>
            <span className="eyebrow">{dict.nav.about}</span>
            <h1
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                color: "var(--plum)",
                marginBlock: "0.5rem 1rem",
              }}
            >
              {dict.about.title}
            </h1>
            <p style={{ fontSize: "1.15rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
              {dict.about.lead}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Story Section with Showroom Image */}
      <section style={{ paddingBottom: "clamp(3rem, 6vw, 6rem)" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))",
              gap: "clamp(2rem, 5vw, 4rem)",
              alignItems: "center",
            }}
          >
            {/* Story Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <span className="eyebrow">{dict.about.storyTitle}</span>
              <h2 style={{ fontSize: "2.4rem", color: "var(--plum)" }}>
                {lang === "fi" ? "Mattoja suurella sydämellä" : lang === "fa" ? "عشق به هنر فرش و اصالت" : "Carpets with a Great Heart"}
              </h2>

              <p style={{ color: "var(--ink-soft)", fontSize: "1.05rem", lineHeight: 1.7 }}>
                {dict.about.story1}
              </p>
              <p style={{ color: "var(--ink-soft)", fontSize: "1.05rem", lineHeight: 1.7 }}>
                {dict.about.story2}
              </p>
              <p style={{ color: "var(--ink-soft)", fontSize: "1.05rem", lineHeight: 1.7 }}>
                {dict.about.story3}
              </p>

              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--bg-alt)",
                  display: "inline-block",
                  fontSize: "0.85rem",
                  color: "var(--muted)",
                  marginTop: "0.5rem",
                }}
              >
                <span>{dict.contact.businessId}: </span>
                <strong style={{ color: "var(--ink)" }}>{settings.business_id}</strong> ·{" "}
                <span>{lang === "fi" ? "Perustettu 4.12.2017" : lang === "fa" ? "تأسیس ۴ دسامبر ۲۰۱۷" : "Established 4 Dec 2017"}</span>
              </div>
            </div>

            {/* Showroom Photo from Putkitie 6 */}
            <div
              style={{
                position: "relative",
                aspectRatio: "4 / 3",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <Image
                src="/images/site/showroom.jpg"
                alt="Matto Bayat Showroom Helsinki"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Pillars */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head section-head--center" style={{ marginBottom: "3.5rem" }}>
            <span className="eyebrow">{dict.about.valuesTitle}</span>
            <h2>
              {lang === "fi" ? "Miksi valita Matto Bayat?" : lang === "fa" ? "چرا فرش بیات؟" : "Why Choose Matto Bayat?"}
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
              gap: "2rem",
            }}
          >
            <div
              style={{
                backgroundColor: "var(--surface)",
                padding: "2.25rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--gold-50)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--gold)",
                  marginBottom: "1rem",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
                  <path d="M2 9h20M10 3l-4 6 6 12 6-12-4-6" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.3rem", color: "var(--plum)", marginBottom: "0.5rem" }}>
                {dict.home.promise1Title}
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                {dict.home.promise1Text}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "var(--surface)",
                padding: "2.25rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--gold-50)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--gold)",
                  marginBottom: "1rem",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.3rem", color: "var(--plum)", marginBottom: "0.5rem" }}>
                {dict.home.promise2Title}
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                {dict.home.promise2Text}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "var(--surface)",
                padding: "2.25rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--gold-50)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--gold)",
                  marginBottom: "1rem",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.3rem", color: "var(--plum)", marginBottom: "0.5rem" }}>
                {dict.home.promise3Title}
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                {dict.home.promise3Text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ Accordion */}
      <section className="section">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="section-head section-head--center" style={{ marginBottom: "3rem" }}>
            <span className="eyebrow">{dict.about.faqTitle}</span>
            <h2>
              {lang === "fi" ? "Usein kysytyt kysymykset" : lang === "fa" ? "پرسش‌های متداول" : "Frequently Asked Questions"}
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {dict.about.faq.map((item, idx) => (
              <details
                key={idx}
                style={{
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--line)",
                  padding: "1.25rem 1.5rem",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <summary
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "var(--plum)",
                    cursor: "pointer",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{item.q}</span>
                  <span style={{ fontSize: "1.2rem", color: "var(--gold-600)", marginInlineStart: "1rem" }}>+</span>
                </summary>
                <p
                  style={{
                    color: "var(--ink-soft)",
                    fontSize: "0.95rem",
                    lineHeight: 1.65,
                    marginTop: "0.85rem",
                    paddingTop: "0.85rem",
                    borderTop: "1px solid var(--line)",
                    marginInline: 0,
                    marginBottom: 0,
                  }}
                >
                  {fill(item.a, { amount: settings.free_delivery_threshold })}
                </p>
              </details>
            ))}
          </div>

          {/* CTA Banner */}
          <div
            style={{
              marginTop: "4rem",
              padding: "2.5rem",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--plum-50)",
              border: "1px solid var(--plum-100)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <h3 style={{ fontSize: "1.6rem", color: "var(--plum)", margin: 0 }}>
              {lang === "fi" ? "Haluatko kysyä lisää?" : lang === "fa" ? "سؤالی دارید؟" : "Have More Questions?"}
            </h3>
            <p style={{ color: "var(--ink-soft)", maxWidth: "40ch", margin: 0 }}>
              {lang === "fi"
                ? "Tule käymään myymälässämme Helsingissä tai ota suoraan yhteyttä WhatsAppissa."
                : lang === "fa"
                ? "به فروشگاه ما در هلسینکی بیایید یا مستقیم در واتس‌اپ پیام دهید."
                : "Drop by our store in Helsinki or contact us directly on WhatsApp."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.5rem" }}>
              <Link href={`/${lang}/contact`} className="btn btn--gold">
                {dict.nav.contact}
              </Link>
              <a
                href={whatsappLink(settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--whatsapp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
