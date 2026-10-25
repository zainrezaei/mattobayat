import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDictionary, hasLocale } from "@/i18n";
import { getSettings } from "@/lib/data";
import { mapsEmbed, mapsLink, telLink, whatsappLink } from "@/lib/utils";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.contact.title,
    description: dict.contact.lead,
  };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const settings = await getSettings();

  return (
    <div className="section" style={{ paddingTop: "clamp(2rem, 4vw, 4rem)" }}>
      <div className="container">
        {/* Header */}
        <div style={{ maxWidth: "600px", marginBottom: "3rem" }}>
          <span className="eyebrow">{dict.nav.contact}</span>
          <h1 style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.5rem)", color: "var(--plum)", marginBlock: "0.4rem 0.6rem" }}>
            {dict.contact.title}
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: "1.05rem" }}>
            {dict.contact.lead}
          </p>
        </div>

        {/* Contact Info Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
            gap: "1.5rem",
            marginBottom: "3.5rem",
          }}
        >
          {/* Card: Phone */}
          <div
            style={{
              backgroundColor: "var(--surface)",
              padding: "1.75rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--gold-50)",
                display: "grid",
                placeItems: "center",
                color: "var(--gold)",
                marginBottom: "0.85rem",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <strong style={{ display: "block", color: "var(--ink)", fontSize: "1rem" }}>
              {dict.contact.phone}
            </strong>
            <a
              href={telLink(settings.phone)}
              style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--plum)", display: "inline-block", marginTop: "0.35rem" }}
            >
              {settings.phone}
            </a>
            <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "0.2rem" }}>
              {dict.common.callUs}
            </div>
          </div>

          {/* Card: WhatsApp */}
          <div
            style={{
              backgroundColor: "var(--surface)",
              padding: "1.75rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--success-50)",
                display: "grid",
                placeItems: "center",
                color: "var(--success)",
                marginBottom: "0.85rem",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <strong style={{ display: "block", color: "var(--ink)", fontSize: "1rem" }}>
              WhatsApp
            </strong>
            <a
              href={whatsappLink(settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1f8f5f", display: "inline-block", marginTop: "0.35rem" }}
            >
              +{settings.whatsapp}
            </a>
            <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "0.2rem" }}>
              {lang === "fi" ? "Nopea vastaus viesteihin" : lang === "fa" ? "پاسخ سریع به پیام‌ها" : "Fast reply to messages"}
            </div>
          </div>

          {/* Card: Email */}
          <div
            style={{
              backgroundColor: "var(--surface)",
              padding: "1.75rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--gold-50)",
                display: "grid",
                placeItems: "center",
                color: "var(--gold)",
                marginBottom: "0.85rem",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <strong style={{ display: "block", color: "var(--ink)", fontSize: "1rem" }}>
              {dict.contact.email}
            </strong>
            <a
              href={`mailto:${settings.email}`}
              style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--plum)", display: "inline-block", marginTop: "0.35rem", wordBreak: "break-all" }}
            >
              {settings.email}
            </a>
            <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "0.2rem" }}>
              {dict.contact.businessId}: {settings.business_id}
            </div>
          </div>

          {/* Card: Address */}
          <div
            style={{
              backgroundColor: "var(--surface)",
              padding: "1.75rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--gold-50)",
                display: "grid",
                placeItems: "center",
                color: "var(--gold)",
                marginBottom: "0.85rem",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <strong style={{ display: "block", color: "var(--ink)", fontSize: "1rem" }}>
              {dict.contact.visit}
            </strong>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)", marginTop: "0.35rem" }}>
              {settings.address}, {settings.postal} {settings.city}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "0.2rem" }}>
              Vartiokylä · Siilitie metro
            </div>
          </div>
        </div>

        {/* Form and Map Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))",
            gap: "3rem",
            alignItems: "start",
          }}
        >
          {/* Contact Form */}
          <ContactForm lang={lang} />

          {/* Map & Hours Box */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Opening hours summary card */}
            <div
              style={{
                backgroundColor: "var(--surface)",
                padding: "1.75rem",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", color: "var(--plum)", marginBottom: "1rem" }}>
                {dict.hours.title}
              </h3>
              <div style={{ display: "grid", gap: "0.75rem", fontSize: "0.95rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "0.5rem" }}>
                  <span>{dict.hours.monFri}:</span>
                  <strong>{settings.hours.mon_fri.open} – {settings.hours.mon_fri.close}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "0.5rem" }}>
                  <span>{dict.hours.sat}:</span>
                  <strong>{settings.hours.sat.open} – {settings.hours.sat.close}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{dict.hours.sun}:</span>
                  <strong>{settings.hours.sun.open} – {settings.hours.sun.close}</strong>
                </div>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div
              style={{
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-sm)",
                minHeight: "340px",
                position: "relative",
              }}
            >
              <iframe
                title="Matto Bayat Location"
                src={mapsEmbed(settings)}
                width="100%"
                height="340"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "1rem",
                  insetInlineStart: "1rem",
                }}
              >
                <a
                  href={mapsLink(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--gold btn--sm"
                  style={{ boxShadow: "var(--shadow)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                  </svg>
                  <span>{dict.common.directions}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
