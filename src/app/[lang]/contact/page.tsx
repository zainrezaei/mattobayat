import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDictionary, hasLocale } from "@/i18n";
import { getSettings } from "@/lib/data";
import { isOpenNow, mapsEmbed, mapsLink, telLink, whatsappLink } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";
import ContactForm from "@/components/ContactForm";
import ArrowIcon from "@/components/ArrowIcon";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return buildPageMetadata({
    lang,
    path: "/contact",
    title: dict.meta.contactTitle,
    description: dict.meta.contactDescription,
  });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const settings = await getSettings();
  const isOpen = isOpenNow(settings);

  return (
    <div className="section" style={{ paddingTop: "clamp(1.5rem, 3vw, 2.5rem)" }}>
      <div className="container">
        <h1 className="visually-hidden">{dict.contact.title}</h1>

        {/* 2-Column Desktop Grid / Clean Stacked Mobile */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))",
            gap: "2.25rem",
            alignItems: "start",
          }}
          className="contact-layout-grid"
        >
          {/* Column 1: One Unified Showroom & Contact Card + Map */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            
            {/* The Unified Contact Card */}
            <div
              style={{
                backgroundColor: "var(--surface)",
                padding: "clamp(1.5rem, 3.5vw, 2.25rem)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* Header with Live Open Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.45rem", color: "var(--plum)", margin: 0, fontWeight: 700 }}>
                    Matto Bayat Helsinki
                  </h2>
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    padding: "0.3rem 0.8rem",
                    borderRadius: "999px",
                    backgroundColor: isOpen ? "var(--success-50)" : "var(--bg-alt)",
                    color: isOpen ? "var(--success)" : "var(--muted)",
                    border: `1px solid ${isOpen ? "rgba(31,143,95,0.25)" : "var(--line)"}`,
                  }}
                >
                  <span
                    className={`dot ${isOpen ? "dot--pulse" : ""}`}
                    style={{
                      backgroundColor: isOpen ? "var(--success)" : "var(--muted)",
                    }}
                  />
                  <span>{isOpen ? dict.common.openNow : dict.common.closedNow}</span>
                </span>
              </div>

              {/* Direct Quick Action Buttons (Call & WhatsApp) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <a
                  href={telLink(settings.phone)}
                  className="btn btn--gold"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 0.85rem",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{dict.contact.phone}</span>
                </a>

                <a
                  href={whatsappLink(settings.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--whatsapp"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 0.85rem",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Information Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", borderTop: "1px solid var(--line)", paddingTop: "1.25rem" }}>
                
                {/* Address & Navigation */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--gold-50)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--gold)",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--ink)", display: "block" }}>
                      {dict.contact.visit}
                    </strong>
                    <div dir="ltr" style={{ fontSize: "1.02rem", fontWeight: 600, color: "var(--plum)", marginTop: "2px", display: "inline-block" }}>
                      {settings.address}, {settings.postal} {settings.city}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "2px" }}>
                      {lang === "fi" ? "Lähellä Siilitien metroa · Ilmainen pysäköinti liikkeen edessä" : lang === "fa" ? "نزدیک متروی Siilitie · پارکینگ رایگان پیش روی دکان" : "Near Siilitie metro · Free customer parking"}
                    </div>
                    <a
                      href={mapsLink(settings)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-arrow"
                      style={{ fontSize: "0.82rem", color: "var(--gold-600)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.35rem", marginTop: "0.35rem" }}
                    >
                      <span>{dict.common.directions}</span>
                      <ArrowIcon direction="forward" />
                    </a>
                  </div>
                </div>

                {/* Opening Hours */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--gold-50)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--gold)",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--ink)", display: "block" }}>
                      {dict.hours.title}
                    </strong>
                    <div style={{ display: "grid", gap: "0.25rem", fontSize: "0.88rem", marginTop: "0.35rem", maxWidth: "290px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--ink-soft)" }}>{dict.hours.monFri}:</span>
                        <strong style={{ color: settings.hours.mon_fri.closed ? "var(--muted)" : "var(--plum)" }}>
                          {settings.hours.mon_fri.closed ? dict.hours.closed : <span dir="ltr">{`${settings.hours.mon_fri.open} – ${settings.hours.mon_fri.close}`}</span>}
                        </strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--ink-soft)" }}>{dict.hours.sat}:</span>
                        <strong style={{ color: settings.hours.sat.closed ? "var(--muted)" : "var(--plum)" }}>
                          {settings.hours.sat.closed ? dict.hours.closed : <span dir="ltr">{`${settings.hours.sat.open} – ${settings.hours.sat.close}`}</span>}
                        </strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--ink-soft)" }}>{dict.hours.sun}:</span>
                        <strong style={{ color: settings.hours.sun.closed ? "var(--muted)" : "var(--plum)" }}>
                          {settings.hours.sun.closed ? dict.hours.closed : <span dir="ltr">{`${settings.hours.sun.open} – ${settings.hours.sun.close}`}</span>}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email & Business ID */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--gold-50)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--gold)",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--ink)", display: "block" }}>
                      {dict.contact.email}
                    </strong>
                    <a
                      href={`mailto:${settings.email}`}
                      style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--plum)", display: "inline-block", marginTop: "2px" }}
                    >
                      {settings.email}
                    </a>
                    <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "2px" }}>
                      {dict.contact.businessId}: {settings.business_id}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Google Map Box */}
            <div
              style={{
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-sm)",
                minHeight: "260px",
                position: "relative",
              }}
            >
              <iframe
                title="Matto Bayat Location"
                src={mapsEmbed(settings)}
                width="100%"
                height="260"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Column 2: Contact Message Form */}
          <div>
            <ContactForm lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
