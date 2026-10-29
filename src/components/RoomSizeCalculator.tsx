"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/types";
import { getDictionary } from "@/i18n";
import ArrowIcon from "@/components/ArrowIcon";

export default function RoomSizeCalculator({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const [roomType, setRoomType] = useState<"living" | "dining" | "bed" | "hall">("living");
  const [roomWidth, setRoomWidth] = useState(380); // cm
  const [roomLength, setRoomLength] = useState(480); // cm

  // Calculate recommendation based on room size & type
  let recWidth = 200;
  let recLength = 300;
  let tipText = "";

  if (roomType === "living") {
    if (roomWidth >= 400 && roomLength >= 500) {
      recWidth = 250;
      recLength = 350;
      tipText =
        lang === "fi"
          ? "Isossa olohuoneessa suuri matto (250×350 cm) kokoaa sohvaryhmän yhteen."
          : lang === "fa"
          ? "در صالون کلان، قالین ۲۵۰×۳۵۰ سانتی‌متر کوچ‌ها را منظم و مقبول نشان می‌دهد."
          : "In a spacious living room, a 250×350 cm rug anchors the entire seating area.";
    } else {
      recWidth = 200;
      recLength = 300;
      tipText =
        lang === "fi"
          ? "Klassinen 200×300 cm matto mahtuu useimpiin olohuoneisiin, ja sohvan etujalat asetetaan maton päälle."
          : lang === "fa"
          ? "قالین ۲۰۰×۳۰۰ سانتی‌متر برای بیشتر صالون‌ها عالی است؛ پایه‌های پیش روی کوچ بالای قالین می‌آید."
          : "A classic 200×300 cm rug fits most living rooms, with sofa front legs placed on the rug.";
    }
  } else if (roomType === "dining") {
    recWidth = Math.max(180, Math.min(250, roomWidth - 120));
    recLength = Math.max(240, Math.min(350, roomLength - 120));
    tipText =
      lang === "fi"
        ? "Ruokapöydän alla maton tulee ulottua vähintään 60 cm pöydän reunojen yli, jotta tuolit pysyvät matolla."
        : lang === "fa"
        ? "زیر میز نانخوری، قالین باید حداقل ۶۰ سانتی‌متر از هر طرف میز کلان‌تر باشد تا چوکی‌ها از قالین بیرون نشود."
        : "Under a dining table, the rug should extend at least 60 cm past table edges so chairs stay on it.";
  } else if (roomType === "bed") {
    recWidth = 200;
    recLength = 300;
    tipText =
      lang === "fi"
        ? "Sängyn alle asetettu matto pehmentää aamut. Vaihtoehtoisesti käytävämatot sängyn molemmin puolin."
        : lang === "fa"
        ? "قالین زیر تخت خواب، اتاق را گرم و نرم می‌سازد. یا می‌توانید دو سرانداز (کناره) در دو طرف تخت بیندازید."
        : "A rug placed under the bed adds morning warmth. Alternatively, runners on either side.";
  } else {
    recWidth = 80;
    recLength = Math.max(200, Math.min(400, roomLength - 80));
    tipText =
      lang === "fi"
        ? "Kapea käytävämatto (esim. 80×300 cm) tuo tilaan akustiikkaa ja suojaa lattiaa kulutukselta."
        : lang === "fa"
        ? "سرانداز باریک (مثلاً ۸۰×۳۰۰ سانتی‌متر) دهلیز را مقبول می‌سازد و از کف خانه محافظت می‌کند."
        : "A long runner (e.g. 80×300 cm) enhances acoustics and protects high-traffic hallway floors.";
  }

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--line)",
        padding: "clamp(1.5rem, 4vw, 3rem)",
        boxShadow: "var(--shadow)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
          gap: "2.5rem",
          alignItems: "center",
        }}
      >
        {/* Controls */}
        <div>
          <h2 style={{ fontSize: "1.85rem", color: "var(--plum)", marginBottom: "0.75rem" }}>
            {dict.guide.sizeTitle}
          </h2>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", marginBottom: "1.75rem" }}>
            {dict.guide.sizeText}
          </p>

          {/* Room Type Selector */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label" style={{ marginBottom: "0.6rem", display: "block" }}>
              {lang === "fi" ? "Huoneen tyyppi" : lang === "fa" ? "کدام اتاق؟" : "Room type"}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {[
                { id: "living", label: dict.guide.rooms[0].title },
                { id: "dining", label: dict.guide.rooms[1].title },
                { id: "bed", label: dict.guide.rooms[2].title },
                { id: "hall", label: dict.guide.rooms[3].title },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRoomType(item.id as any)}
                  className={`chip ${roomType === item.id ? "active" : ""}`}
                  aria-pressed={roomType === item.id}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Room Size Presets */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label" style={{ marginBottom: "0.6rem", display: "block" }}>
              {lang === "fi" ? "Huoneen koko" : lang === "fa" ? "اندازه تقریبی اتاق" : "Approximate room size"}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {[
                { label: lang === "fi" ? "Kompakti (3×4 m)" : lang === "fa" ? "خورد (۳×۴ متر)" : "Compact (3×4 m)", w: 300, l: 400 },
                { label: lang === "fi" ? "Normaali (4×5 m)" : lang === "fa" ? "متوسط (۴×۵ متر)" : "Standard (4×5 m)", w: 380, l: 480 },
                { label: lang === "fi" ? "Tilava (5×6 m)" : lang === "fa" ? "کلان (۵×۶ متر)" : "Spacious (5×6 m)", w: 500, l: 600 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setRoomWidth(preset.w);
                    setRoomLength(preset.l);
                  }}
                  className={`chip ${roomWidth === preset.w && roomLength === preset.l ? "active" : ""}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendation Box */}
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius)",
              backgroundColor: "var(--plum-50)",
              border: "1.5px solid var(--plum-100)",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ fontSize: "0.82rem", color: "var(--gold-600)", fontWeight: 700, textTransform: "uppercase" }}>
              ✦ {dict.guide.suggestion}
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--plum)", marginBlock: "0.2rem" }}>
              {recWidth} × {recLength} cm
            </div>
            <p style={{ fontSize: "0.88rem", color: "var(--ink-soft)", margin: 0, lineHeight: 1.5 }}>
              {tipText}
            </p>
          </div>

          <Link
            href={`/${lang}/products?size=${
              recWidth * recLength < 20000 ? "small" : recWidth * recLength <= 50000 ? "medium" : "large"
            }`}
            className="btn btn--gold btn--block-mobile"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          >
            <span>{dict.guide.seeMatching}</span>
            <ArrowIcon direction="forward" />
          </Link>
        </div>

        {/* Visual 2D diagram */}
        <div
          className="calc-diagram"
          style={{
            backgroundColor: "var(--bg-alt)",
            borderRadius: "var(--radius)",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--line-strong)",
            aspectRatio: "1 / 1",
            position: "relative",
          }}
        >
          {/* Room Representation */}
          <div
            style={{
              width: "85%",
              height: "85%",
              border: "2px dashed #bbaaa0",
              borderRadius: "8px",
              position: "relative",
              display: "grid",
              placeItems: "center",
              backgroundColor: "#fdfbf8",
            }}
          >
            {/* Room Dimensions tag */}
            <span
              style={{
                position: "absolute",
                top: "-12px",
                backgroundColor: "var(--surface)",
                padding: "2px 8px",
                borderRadius: "999px",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--muted)",
                border: "1px solid var(--line)",
              }}
            >
              {roomWidth} × {roomLength} cm
            </span>

            {/* Rug Representation */}
            <div
              style={{
                width: `${Math.min(75, Math.max(35, (recWidth / roomWidth) * 80))}%`,
                height: `${Math.min(75, Math.max(35, (recLength / roomLength) * 80))}%`,
                backgroundColor: "var(--plum)",
                borderRadius: roomType === "dining" ? "4px" : "6px",
                border: "2px solid var(--gold)",
                display: "grid",
                placeItems: "center",
                color: "var(--gold-soft)",
                boxShadow: "0 8px 24px rgba(91, 37, 89, 0.25)",
                transition: "all 0.4s var(--ease)",
                padding: "8px",
                textAlign: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
                  {recWidth} × {recLength} cm
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--gold-soft)", opacity: 0.9 }}>
                  {dict.attrs.shape[recWidth === recLength ? "round" : recWidth <= 90 ? "runner" : "rectangle"]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .calc-diagram {
            aspect-ratio: 16 / 10 !important;
            padding: 1.25rem !important;
          }
          .btn--block-mobile {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
