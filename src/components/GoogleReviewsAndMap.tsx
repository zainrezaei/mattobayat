"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Locale, Review, Settings } from "@/lib/types";
import type { Dictionary } from "@/i18n";
import { t } from "@/i18n";
import { DEMO_REVIEWS } from "@/lib/demo-data";
import { mapsEmbed, mapsLink, whatsappLink, telLink, isOpenNow } from "@/lib/utils";
import ArrowIcon from "@/components/ArrowIcon";

type GoogleReviewsAndMapProps = {
  settings: Settings;
  lang: Locale;
  dict: Dictionary;
};

/* Official Google "G" multicolored vector logo */
function GoogleLogo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ flexShrink: 0, display: "inline-block", verticalAlign: "middle" }}
      aria-label="Google"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/* 5 Gold star rating SVGs */
function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div
      style={{ display: "inline-flex", gap: "3px", color: "#F59E0B" }}
      aria-label={`${rating} / 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={star <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={star <= rating ? "0" : "1.5"}
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function GoogleReviewsAndMap({ settings, lang, dict }: GoogleReviewsAndMapProps) {
  const reviews: Review[] =
    settings.reviews && settings.reviews.length > 0 ? settings.reviews : DEMO_REVIEWS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const totalReviews = reviews.length;
  const isRtl = lang === "fa";

  const nextReview = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalReviews);
  }, [totalReviews]);

  const prevReview = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalReviews) % totalReviews);
  }, [totalReviews]);

  // Autoplay rotation every 6.5s, pause on hover/interaction
  useEffect(() => {
    if (isPaused || totalReviews <= 1) return;
    const interval = setInterval(() => {
      nextReview();
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, nextReview, totalReviews]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const distance = touchStartXRef.current - touchEndXRef.current;
      const isSwipe = Math.abs(distance) > 45;
      if (isSwipe) {
        if (distance > 0) {
          // Swiped left
          if (isRtl) prevReview();
          else nextReview();
        } else {
          // Swiped right
          if (isRtl) nextReview();
          else prevReview();
        }
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    setIsPaused(false);
  };

  const activeReview = reviews[currentIndex] || reviews[0];

  // Helper for initials
  const initials = activeReview.author
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  // Determine today's open status
  const openRightNow = isOpenNow(settings);

  // Today's hours for Helsinki
  const todayHours = (() => {
    const dayOfWeek = new Date().toLocaleDateString("en-US", {
      timeZone: "Europe/Helsinki",
      weekday: "short",
    });
    const hours =
      dayOfWeek === "Sat"
        ? settings.hours.sat
        : dayOfWeek === "Sun"
        ? settings.hours.sun
        : settings.hours.mon_fri;

    if (hours.closed) {
      return lang === "fa" ? "امروز رخصت / بسته است" : lang === "fi" ? "Suljettu tänään" : "Closed today";
    }
    const openText =
      lang === "fa"
        ? `امروز باز است: ${hours.open} – ${hours.close}`
        : lang === "fi"
        ? `Tänään avoinna ${hours.open} – ${hours.close}`
        : `Open today ${hours.open} – ${hours.close}`;
    return openText;
  })();

  const googleReviewSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `Matto Bayat, ${settings.address}, ${settings.postal} ${settings.city}`
  )}`;

  return (
    <section
      className="section"
      style={{
        backgroundColor: "var(--bg-alt)",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
        position: "relative",
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            maxWidth: "760px",
            marginInline: "auto",
            textAlign: "center",
            marginBottom: "clamp(2rem, 4vw, 3rem)",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 3.8vw, 2.9rem)",
              color: "var(--plum)",
              marginTop: "0",
              marginBottom: "0.8rem",
              lineHeight: 1.15,
            }}
          >
            {dict.home.reviewsTitle || "Mitä meistä sanotaan"}
          </h2>
          <p
            style={{
              color: "var(--ink-soft)",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              maxWidth: "600px",
              marginInline: "auto",
            }}
          >
            {dict.home.reviewsSubtitle || "Aitoja Google Maps -arvosteluja tyytyväisiltä asiakkailtamme"}
          </p>

          {/* Google Trust Rating Header Pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.65rem",
              padding: "0.5rem 1.15rem",
              backgroundColor: "var(--surface)",
              borderRadius: "999px",
              border: "1px solid var(--line-strong)",
              boxShadow: "var(--shadow-sm)",
              marginTop: "1rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <GoogleLogo size={19} />
              <strong style={{ fontSize: "1rem", color: "var(--ink)", fontWeight: 800 }}>5.0</strong>
              <StarRating rating={5} />
            </div>
            <a
              href={googleReviewSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.84rem",
                color: "var(--gold-600)",
                fontWeight: 700,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              {dict.home.viewOnGoogleMaps || "Google Maps"} ↗
            </a>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Reviews Carousel (Left) + Google Maps & Shop Info (Right) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(450px, 100%), 1fr))",
            gap: "clamp(1.75rem, 4vw, 2.75rem)",
            alignItems: "stretch",
          }}
        >
          {/* ========================================================= */}
          {/* COLUMN 1: GOOGLE MAPS REVIEWS CAROUSEL                    */}
          {/* ========================================================= */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--line-strong)",
              boxShadow: "var(--shadow)",
              padding: "clamp(1.75rem, 3.5vw, 2.5rem)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Row: Author, Google icon, Verified Badge */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                  paddingBottom: "1.25rem",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                  {/* Avatar circle */}
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--plum), var(--plum-600))",
                      color: "#ffffff",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      letterSpacing: "0.5px",
                      boxShadow: "var(--shadow-sm)",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    {initials || "MB"}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <strong style={{ fontSize: "1.05rem", color: "var(--ink)", fontWeight: 700 }}>
                        {activeReview.author}
                      </strong>
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "2px" }}>
                      {t(activeReview.date, lang)}
                    </div>
                  </div>
                </div>

                {/* Badges: Verified + Google */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--success)",
                      backgroundColor: "var(--success-50)",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(40, 109, 76, 0.15)",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{dict.home.verifiedCustomer || "Vahvistettu asiakaspalaute"}</span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "var(--bg-alt)",
                    }}
                    title="Google Review"
                  >
                    <GoogleLogo size={18} />
                  </div>
                </div>
              </div>

              {/* Review Stars & Highlight Title */}
              <div style={{ marginTop: "1.35rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <StarRating rating={activeReview.rating} />
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>5.0 / 5.0</span>
                </div>

                {activeReview.highlight && (
                  <h3
                    style={{
                      fontSize: "clamp(1.15rem, 2vw, 1.35rem)",
                      color: "var(--plum)",
                      marginTop: "0.65rem",
                      marginBottom: "0.5rem",
                      fontWeight: 700,
                      lineHeight: 1.3,
                    }}
                  >
                    &ldquo;{t(activeReview.highlight, lang)}&rdquo;
                  </h3>
                )}

                {/* Review Body Text with Smooth Animated Feel */}
                <blockquote
                  key={activeReview.id}
                  style={{
                    margin: 0,
                    marginTop: "0.75rem",
                    color: "var(--ink-soft)",
                    fontSize: "1.02rem",
                    lineHeight: 1.7,
                    fontStyle: "normal",
                  }}
                >
                  {t(activeReview.text, lang)}
                </blockquote>
              </div>
            </div>

            {/* Bottom Row: Carousel Controls, Dots & Action */}
            <div
              style={{
                marginTop: "2rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              {/* Dots Indicators & Counter */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {reviews.map((rev, idx) => (
                    <button
                      key={rev.id}
                      onClick={() => setCurrentIndex(idx)}
                      type="button"
                      aria-label={`${lang === "fi" ? "Arvostelu" : lang === "fa" ? "نظر" : "Review"} ${idx + 1}`}
                      style={{
                        width: idx === currentIndex ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "999px",
                        backgroundColor: idx === currentIndex ? "var(--plum)" : "var(--line-strong)",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>
                  {currentIndex + 1} / {totalReviews}
                </span>
              </div>

              {/* Prev / Next Carousel Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={prevReview}
                  aria-label={lang === "fi" ? "Edellinen arvostelu" : lang === "fa" ? "نظر قبلی" : "Previous review"}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "1px solid var(--line-strong)",
                    backgroundColor: "var(--surface)",
                    color: "var(--ink)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--plum)";
                    e.currentTarget.style.color = "var(--plum)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--line-strong)";
                    e.currentTarget.style.color = "var(--ink)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <ArrowIcon direction="back" size={16} />
                </button>

                <button
                  type="button"
                  onClick={nextReview}
                  aria-label={lang === "fi" ? "Seuraava arvostelu" : lang === "fa" ? "نظر بعدی" : "Next review"}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "1px solid var(--line-strong)",
                    backgroundColor: "var(--surface)",
                    color: "var(--ink)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--plum)";
                    e.currentTarget.style.color = "var(--plum)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--line-strong)";
                    e.currentTarget.style.color = "var(--ink)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <ArrowIcon direction="forward" size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMN 2: GOOGLE MAPS EMBED & SHOP SHOWROOM LOCATION     */}
          {/* ========================================================= */}
          <div
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--line-strong)",
              boxShadow: "var(--shadow)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Embedded Interactive Google Map */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "300px",
                backgroundColor: "var(--bg-alt)",
              }}
            >
              <iframe
                title="Matto Bayat Showroom Google Maps"
                src={mapsEmbed(settings)}
                width="100%"
                height="100%"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              {/* Live status badge in map overlay */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  insetInlineEnd: "12px",
                  zIndex: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "999px",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(6px)",
                  boxShadow: "var(--shadow-sm)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  border: "1px solid var(--line)",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: openRightNow ? "var(--success)" : "var(--warning)",
                    display: "inline-block",
                    boxShadow: openRightNow ? "0 0 0 3px var(--success-50)" : "none",
                  }}
                />
                <span style={{ color: "var(--ink)" }}>{todayHours}</span>
              </div>
            </div>

            {/* Address & Transit Information */}
            <div
              style={{
                padding: "clamp(1.5rem, 3vw, 2rem)",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius)",
                      backgroundColor: "var(--gold-50)",
                      color: "var(--gold)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>

                  <div>
                    <strong dir="ltr" style={{ display: "block", fontSize: "1.15rem", color: "var(--plum)", fontWeight: 700 }}>
                      Matto Bayat · {settings.address}
                    </strong>
                    <div dir="ltr" style={{ color: "var(--ink-soft)", fontSize: "0.95rem", marginTop: "2px" }}>
                      {settings.address}, {settings.postal} {settings.city}
                    </div>
                  </div>
                </div>

                {/* Transit Details */}
                <div
                  style={{
                    marginTop: "1.1rem",
                    padding: "0.85rem 1.1rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--bg-alt)",
                    border: "1px solid var(--line)",
                    fontSize: "0.88rem",
                    color: "var(--ink-soft)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-600)" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <div>
                    {lang === "fi"
                      ? "Siilitien metroasema ~400 m · Maksuton asiakaspysäköinti suoraan oven edessä"
                      : lang === "fa"
                      ? "۴۰۰ متر تا متروی Siilitie · پارکینگ رایگان پیش روی دکان"
                      : "400m from Siilitie metro station · Free dedicated customer parking at door"}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Directions, WhatsApp, Call */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                <a
                  href={mapsLink(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--gold"
                  style={{ flex: "1 1 auto", justifyContent: "center" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                  </svg>
                  <span>{dict.common.directions || "Reittiohjeet"}</span>
                  <ArrowIcon direction="forward" />
                </a>

                <a
                  href={whatsappLink(
                    settings.whatsapp,
                    lang === "fi"
                      ? "Hei! Haluaisin tulla käymään myymälässä."
                      : lang === "fa"
                      ? "سلام! می‌خواستم برای دیدن قالین‌ها به دکان شما بیایم."
                      : "Hello! I would like to visit your showroom."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--whatsapp"
                  style={{ flex: "1 1 auto", justifyContent: "center" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>

                <a
                  href={telLink(settings.phone)}
                  className="btn btn--outline"
                  style={{ flex: "1 1 auto", justifyContent: "center" }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{settings.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
