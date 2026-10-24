import React from "react";
import Link from "next/link";
import type { Locale, Settings } from "@/lib/types";
import { getDictionary } from "@/i18n";
import { mapsLink, telLink, whatsappLink } from "@/lib/utils";

export default function Footer({
  lang,
  settings,
}: {
  lang: Locale;
  settings: Settings;
}) {
  const dict = getDictionary(lang);
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "var(--bg-alt)",
        borderTop: "1px solid var(--line-strong)",
        paddingTop: "clamp(3.5rem, 6vw, 5.5rem)",
        paddingBottom: "2.5rem",
        color: "var(--ink)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
            gap: "2.5rem 2rem",
            marginBottom: "3.5rem",
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  backgroundColor: "var(--plum)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--gold-soft)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h16v16H4z" />
                  <path d="M8 8h8v8H8z" strokeWidth="1.2" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.35rem",
                    fontWeight: 600,
                    color: "var(--plum)",
                    lineHeight: 1.1,
                  }}
                >
                  Matto Bayat
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--gold-600)", fontWeight: 600 }}>
                  {lang === "fa" ? "فرش بیات" : "Helsinki"}
                </div>
              </div>
            </div>

            <p style={{ color: "var(--ink-soft)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "1.25rem", maxWidth: "34ch" }}>
              {dict.footer.tagline}
            </p>

            <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              {dict.contact.businessId}: <strong>{settings.business_id}</strong>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "var(--plum)",
                marginBottom: "1.2rem",
              }}
            >
              {dict.footer.pages}
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.6rem" }}>
              <li>
                <Link href={`/${lang}`} style={{ color: "var(--ink-soft)", fontSize: "0.92rem", transition: "color 0.2s" }}>
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/products`} style={{ color: "var(--ink-soft)", fontSize: "0.92rem" }}>
                  {dict.nav.products}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/guide`} style={{ color: "var(--ink-soft)", fontSize: "0.92rem" }}>
                  {dict.nav.guide}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} style={{ color: "var(--ink-soft)", fontSize: "0.92rem" }}>
                  {dict.nav.about}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} style={{ color: "var(--ink-soft)", fontSize: "0.92rem" }}>
                  {dict.nav.contact}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/reservation`} style={{ color: "var(--ink-soft)", fontSize: "0.92rem" }}>
                  {dict.nav.reservation}
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "var(--plum)",
                marginBottom: "1.2rem",
              }}
            >
              {dict.hours.title}
            </h4>
            <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.9rem", color: "var(--ink-soft)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <span>{dict.hours.monFri}:</span>
                <strong style={{ color: "var(--ink)" }}>
                  {settings.hours.mon_fri.open} – {settings.hours.mon_fri.close}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <span>{dict.hours.sat}:</span>
                <strong style={{ color: "var(--ink)" }}>
                  {settings.hours.sat.open} – {settings.hours.sat.close}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <span>{dict.hours.sun}:</span>
                <strong style={{ color: "var(--ink)" }}>
                  {settings.hours.sun.open} – {settings.hours.sun.close}
                </strong>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                📍 {lang === "fi" ? "Lähellä Siilitien metroa · Ilmainen pysäköinti" : lang === "fa" ? "نزدیک ایستگاه متروی Siilitie · پارکینگ رایگان" : "Near Siilitie metro · Free customer parking"}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "var(--plum)",
                marginBottom: "1.2rem",
              }}
            >
              {dict.footer.contact}
            </h4>
            <div style={{ display: "grid", gap: "0.6rem", fontSize: "0.9rem", color: "var(--ink-soft)" }}>
              <div>
                <a
                  href={mapsLink(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  📍 {settings.address}, {settings.postal} {settings.city}
                </a>
              </div>
              <div>
                <a href={telLink(settings.phone)} style={{ color: "var(--plum)", fontWeight: 600 }}>
                  📞 {settings.phone}
                </a>
              </div>
              <div>
                <a
                  href={whatsappLink(settings.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1f8f5f", fontWeight: 600 }}
                >
                  💬 WhatsApp: +{settings.whatsapp}
                </a>
              </div>
              <div>
                <a href={`mailto:${settings.email}`} style={{ color: "inherit" }}>
                  ✉️ {settings.email}
                </a>
              </div>

              {/* Social links */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-btn"
                  style={{ width: "36px", height: "36px", backgroundColor: "var(--surface)" }}
                  aria-label="Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-btn"
                  style={{ width: "36px", height: "36px", backgroundColor: "var(--surface)" }}
                  aria-label="Facebook"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
                <a
                  href={settings.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-btn"
                  style={{ width: "36px", height: "36px", backgroundColor: "var(--surface)" }}
                  aria-label="TikTok"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 00-.85-.06A6.34 6.34 0 003.1 15.68a6.34 6.34 0 009.68 5.37 6.27 6.27 0 002.56-4.99V8.62a8.21 8.21 0 004.25 1.54v-3.47z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom separator and copyright */}
        <div
          style={{
            borderTop: "1px solid var(--line-strong)",
            paddingTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.82rem",
            color: "var(--muted)",
          }}
        >
          <div>
            © {currentYear} Matto Bayat. {dict.footer.rights}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link
              href={`/${lang}/about`}
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              {dict.nav.about}
            </Link>
            <Link
              href={`/${lang}/admin`}
              style={{
                color: "var(--plum)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <span>🔒</span>
              <span>{dict.footer.admin}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
