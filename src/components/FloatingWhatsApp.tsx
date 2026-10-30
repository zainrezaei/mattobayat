"use client";

import React from "react";
import { usePathname } from "next/navigation";
import type { Locale, Settings } from "@/lib/types";
import { getDictionary } from "@/i18n";

export default function FloatingWhatsApp({
  lang,
  settings,
}: {
  lang: Locale;
  settings: Settings;
}) {
  const pathname = usePathname() || "";
  if (pathname.includes("/admin")) return null;

  const dict = getDictionary(lang);
  const rawWa = (settings.whatsapp || settings.phone || "").replace(/\D/g, "");
  if (!rawWa) return null;

  return (
    <a
      href={`https://wa.me/${rawWa}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={dict.common.whatsapp}
      title={dict.common.whatsapp}
      className="floating-whatsapp"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>

      <style>{`
        .floating-whatsapp {
          position: fixed;
          bottom: 1.25rem;
          inset-inline-end: 1.25rem;
          z-index: 45;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background-color: #1f8b4c;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(31, 139, 76, 0.38);
          transition: transform 0.25s var(--ease), opacity 0.25s var(--ease), background-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
          text-decoration: none;
        }
        .floating-whatsapp:hover {
          background-color: #19733e;
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 10px 26px rgba(31, 139, 76, 0.45);
        }
        .floating-whatsapp:active {
          transform: scale(0.96);
        }
        body:has(.product-mobile-bar.visible) .floating-whatsapp,
        body[style*="overflow: hidden"] .floating-whatsapp {
          opacity: 0;
          pointer-events: none;
          transform: translateY(12px) scale(0.9);
        }
        @media (max-width: 640px) {
          .floating-whatsapp {
            bottom: 1rem;
            inset-inline-end: 1rem;
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </a>
  );
}
