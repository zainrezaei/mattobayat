import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDictionary, hasLocale } from "@/i18n";
import { getSettings } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import RoomSizeCalculator from "@/components/RoomSizeCalculator";
import ArrowIcon from "@/components/ArrowIcon";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/guide">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return buildPageMetadata({
    lang,
    path: "/guide",
    title: dict.meta.guideTitle,
    description: dict.meta.guideDescription,
  });
}

export default async function GuidePage({ params }: PageProps<"/[lang]/guide">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const settings = await getSettings();

  return (
    <div>
      <h1 className="visually-hidden">{dict.guide.title}</h1>

      {/* 1. Interactive Size Calculator */}
      <section style={{ paddingTop: "clamp(1.5rem, 3vw, 2.5rem)", paddingBottom: "clamp(3rem, 6vw, 6rem)" }}>
        <div className="container">
          <RoomSizeCalculator lang={lang} />
        </div>
      </section>

      {/* 2. Room by Room Guide */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head section-head--center" style={{ marginBottom: "3.5rem" }}>
            <h2>
              {lang === "fi" ? "Oikea matto oikeaan huoneeseen" : lang === "fa" ? "قالین مناسب برای هر اتاق" : "The Right Rug for Every Space"}
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
              const icons = [
                // Sofa (Living Room)
                <svg key="living" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
                  <path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5z" />
                  <path d="M4 18v2M20 18v2M6 11v3M18 11v3" />
                </svg>,
                // Dining Table
                <svg key="dining" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 10h16M6 10v10M18 10v10" />
                  <rect x="2" y="6" width="20" height="4" rx="1" />
                </svg>,
                // Bed (Bedroom)
                <svg key="bed" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                </svg>,
                // Hallway / Door
                <svg key="hall" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
                  <path d="M2 20h20" />
                  <circle cx="14" cy="12" r="1" fill="currentColor" />
                </svg>,
              ];
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
                    gap: "0.85rem",
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
                    }}
                  >
                    {icons[idx]}
                  </div>
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
                src={settings.site_images?.detail || "/images/site/detail.jpg"}
                alt="Persian rug wool knots and craft detail"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            </div>

            <div>
              <h2 style={{ fontSize: "2.4rem", color: "var(--plum)", marginBlock: "0 1.5rem" }}>
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
                <Link
                  href={`/${lang}/products`}
                  className="btn btn--gold"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <span>{dict.guide.seeMatching}</span>
                  <ArrowIcon direction="forward" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
