"use client";

import React, { useState } from "react";
import type { Locale, Settings } from "@/lib/types";
import { t } from "@/i18n";

export default function AnnouncementBar({
  settings,
  lang,
}: {
  settings: Settings;
  lang: Locale;
}) {
  const [closed, setClosed] = useState(false);

  if (!settings.announcement_active || closed) return null;

  const text = t(settings.announcement, lang);
  if (!text) return null;

  return (
    <div
      className="announcement-bar"
      style={{
        backgroundColor: "var(--plum)",
        color: "#fff",
        fontSize: "0.82rem",
        fontWeight: 500,
        paddingBlock: "0.45rem",
        paddingInlineStart: "1.75rem",
        paddingInlineEnd: "2.25rem",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        letterSpacing: "0.01em",
        zIndex: 40,
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ color: "var(--gold-soft)", fontSize: "0.9rem" }}>✦</span>
        <span>{text}</span>
      </div>
      <button
        onClick={() => setClosed(true)}
        aria-label="Close announcement"
        style={{
          position: "absolute",
          insetInlineEnd: "1rem",
          color: "rgba(255,255,255,0.7)",
          padding: "4px",
          display: "flex",
          alignItems: "center",
        }}
      >
        ✕
      </button>

      <style>{`
        @media (max-width: 768px) {
          .announcement-bar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
