import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDictionary, hasLocale } from "@/i18n";
import RoomSizeCalculator from "@/components/RoomSizeCalculator";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/guide">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.guide.title,
    description: dict.guide.lead,
  };
}

export default async function GuidePage({ params }: PageProps<"/[lang]/guide">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);

  return (
    <div>
      {/* Header */}
      <section className="section" style={{ paddingBottom: "2rem" }}>
        <div className="container">
          <div style={{ maxWidth: "680px" }}>
            <span className="eyebrow">{dict.nav.guide}</span>
            <h1
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                color: "var(--plum)",
                marginBlock: "0.5rem 1rem",
              }}
            >
              {dict.guide.title}
            </h1>
            <p style={{ fontSize: "1.15rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
              {dict.guide.lead}
            </p>
          </div>
        </div>
      </section>

      {/* 1. Interactive Size Calculator */}
      <section style={{ paddingBottom: "clamp(3rem, 6vw, 6rem)" }}>
        <div className="container">
          <RoomSizeCalculator lang={lang} />
        </div>
      </section>

      {/* 2. Room by Room Guide */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head section-head--center" style={{ marginBottom: "3.5rem" }}>
            <span className="eyebrow">
              {lang === "fi" ? "Huonekohtainen opas" : lang === "fa" ? "راهنمای فضاها" : "Room by Room"}
            </span>
            <h2>
              {lang === "fi" ? "Oikea matto oikeaan huoneeseen" : lang === "fa" ? "فرش مناسب برای هر اتاق" : "The Right Rug for Every Space"}
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(270px, 100%), 1fr))",
              gap: "2rem",
            }}
          >
            {dict.guide.rooms.map((room, idx) => {
              const icons = ["🛋️", "🍽️", "🛏️", "🚪"];
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "var(--surface)",
                    padding: "2rem",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--line)",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ fontSize: "2rem" }}>{icons[idx]}</div>
                  <h3 style={{ fontSize: "1.3rem", color: "var(--plum)", margin: 0 }}>
                    {room.title}
                  </h3>
                  <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                    {room.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Care & Maintenance */}
      <section className="section">
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(380px, 100%), 1fr))",
              gap: "3.5rem",
              alignItems: "center",
            }}
          >
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
                src="/images/site/detail.jpg"
                alt="Persian rug wool knots and craft detail"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            </div>

            <div>
              <span className="eyebrow">{lang === "fi" ? "Kestävyys" : lang === "fa" ? "طول عمر و مراقبت" : "Longevity"}</span>
              <h2 style={{ fontSize: "2.4rem", color: "var(--plum)", marginBlock: "0.5rem 1.5rem" }}>
                {dict.guide.careTitle}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {dict.guide.care.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "1rem" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "var(--gold-50)",
                        color: "var(--gold-600)",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <strong style={{ fontSize: "1.05rem", color: "var(--ink)", display: "block", marginBottom: "0.2rem" }}>
                        {item.title}
                      </strong>
                      <p style={{ color: "var(--ink-soft)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "2rem" }}>
                <Link href={`/${lang}/products`} className="btn btn--gold">
                  {dict.guide.seeMatching} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
