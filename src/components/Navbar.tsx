"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale, Settings } from "@/lib/types";
import { getDictionary } from "@/i18n";
import { isOpenNow, telLink } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const LANGUAGES: { code: Locale; label: string; name: string }[] = [
  { code: "fi", label: "FI", name: "Suomi" },
  { code: "en", label: "EN", name: "English" },
  { code: "fa", label: "فا", name: "فارسی" },
];

export default function Navbar({
  lang,
  settings,
}: {
  lang: Locale;
  settings: Settings;
}) {
  const dict = getDictionary(lang);
  const pathname = usePathname() || `/${lang}`;
  const { openCart, totalCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openState, setOpenState] = useState(false);

  useEffect(() => {
    setOpenState(isOpenNow(settings));
    const timer = setInterval(() => setOpenState(isOpenNow(settings)), 60000);
    return () => clearInterval(timer);
  }, [settings]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Compute equivalent URL for a given locale
  const getLocaleUrl = (targetLocale: Locale) => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0 || segments[0] === lang) {
      segments[0] = targetLocale;
    } else {
      segments.unshift(targetLocale);
    }
    return `/${segments.join("/")}`;
  };

  const navLinks = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/products`, label: dict.nav.products },
    { href: `/${lang}/guide`, label: dict.nav.guide },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/contact`, label: dict.nav.contact },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: scrolled ? "rgba(250, 247, 242, 0.94)" : "var(--bg)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--line)" : "transparent"}`,
        transition: "all 0.25s ease",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "var(--header-h)",
          gap: "1rem",
        }}
      >
        {/* Logo */}
        <Link
          href={`/${lang}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "var(--plum)",
              display: "grid",
              placeItems: "center",
              color: "var(--gold-soft)",
              boxShadow: "0 4px 12px rgba(91, 37, 89, 0.2)",
              flexShrink: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 4h16v16H4z" />
              <path d="M8 8h8v8H8z" strokeWidth="1.2" />
              <path d="M12 6l2 2-2 2-2-2z" fill="currentColor" />
              <path d="M12 14l2 2-2 2-2-2z" fill="currentColor" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.45rem",
                fontWeight: 600,
                color: "var(--plum)",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              Matto Bayat
            </span>
            <span
              style={{
                fontSize: "0.74rem",
                color: "var(--gold-600)",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              {lang === "fa" ? "فرش بیات · هلسینکی" : "Helsinki · Putkitie 6"}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: "none",
            gap: "1.8rem",
            alignItems: "center",
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === `/${lang}`
                ? pathname === `/${lang}`
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "0.95rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--plum)" : "var(--ink)",
                  position: "relative",
                  paddingBlock: "0.4rem",
                  transition: "color 0.2s ease",
                }}
              >
                {link.label}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      backgroundColor: "var(--gold)",
                      borderRadius: "2px",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions (Language + Open status + Cart + Mobile burger) */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {/* Live store hours indicator (hidden on small mobile) */}
          <div
            className="store-status-pill"
            style={{
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.76rem",
              fontWeight: 600,
              padding: "0.3rem 0.75rem",
              borderRadius: "999px",
              backgroundColor: openState ? "var(--success-50)" : "var(--bg-alt)",
              color: openState ? "var(--success)" : "var(--muted)",
              border: `1px solid ${openState ? "#cfe7d9" : "var(--line)"}`,
            }}
          >
            <span
              className={`dot ${openState ? "dot--pulse" : ""}`}
              style={{
                backgroundColor: openState ? "var(--success)" : "var(--muted)",
              }}
            />
            <span>{openState ? dict.common.openNow : dict.common.closedNow}</span>
          </div>

          {/* Direct phone call button */}
          <a
            href={telLink(settings.phone)}
            className="icon-btn"
            title={settings.phone}
            aria-label={dict.common.callUs}
            style={{ display: "none" }}
            id="desktop-phone-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
          </a>

          {/* Language Switcher */}
          <div
            className="header-lang-switcher"
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--line-strong)",
              borderRadius: "999px",
              padding: "2px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {LANGUAGES.map((item) => {
              const active = item.code === lang;
              return (
                <Link
                  key={item.code}
                  href={getLocaleUrl(item.code)}
                  style={{
                    padding: "0.25rem 0.55rem",
                    borderRadius: "999px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    backgroundColor: active ? "var(--plum)" : "transparent",
                    color: active ? "#ffffff" : "var(--ink-soft)",
                    transition: "all 0.2s ease",
                  }}
                  title={item.name}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Cart / Reservation button */}
          <button
            onClick={openCart}
            className="icon-btn"
            aria-label={dict.cart.open}
            style={{
              backgroundColor: "var(--plum-50)",
              color: "var(--plum)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {totalCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  insetInlineEnd: "2px",
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 4px",
                  borderRadius: "999px",
                  backgroundColor: "var(--gold)",
                  color: "#fff",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {totalCount}
              </span>
            )}
          </button>

          {/* Mobile burger toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="icon-btn"
            id="mobile-burger"
            aria-label={dict.nav.menu}
            style={{ display: "none" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: "var(--header-h)",
            insetInline: 0,
            bottom: 0,
            backgroundColor: "var(--surface)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            overflowY: "auto",
            zIndex: 90,
            boxShadow: "var(--shadow-lg)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {/* Mobile Dedicated Language Selector */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
            {LANGUAGES.map((item) => {
              const active = item.code === lang;
              return (
                <Link
                  key={item.code}
                  href={getLocaleUrl(item.code)}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    textAlign: "center",
                    padding: "0.65rem 0.4rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    backgroundColor: active ? "var(--plum)" : "var(--bg-alt)",
                    color: active ? "#ffffff" : "var(--ink-soft)",
                    border: `1.5px solid ${active ? "var(--plum)" : "var(--line)"}`,
                    transition: "all 0.2s ease",
                  }}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                  padding: "0.6rem 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius)",
              backgroundColor: "var(--bg-alt)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--plum)" }}>
              {settings.address}, {settings.postal} {settings.city}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
              {dict.hours.monFri}: {settings.hours.mon_fri.closed ? dict.hours.closed : `${settings.hours.mon_fri.open}–${settings.hours.mon_fri.close}`}
            </div>
            <a
              href={telLink(settings.phone)}
              className="btn btn--gold btn--sm"
              style={{ marginTop: "0.5rem" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{settings.phone}</span>
            </a>
          </div>
        </div>
      )}

      {/* Media query styling for responsive navbar */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          #desktop-phone-btn {
            display: inline-grid !important;
          }
        }
        @media (max-width: 859px) {
          #mobile-burger {
            display: inline-grid !important;
          }
          .store-status-pill {
            display: none !important;
          }
        }
        @media (max-width: 520px) {
          .header-lang-switcher {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
