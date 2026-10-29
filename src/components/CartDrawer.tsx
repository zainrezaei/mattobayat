"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import type { Locale } from "@/lib/types";
import { formatPrice, getDictionary } from "@/i18n";
import ArrowIcon from "@/components/ArrowIcon";

export default function CartDrawer({
  lang,
}: {
  lang: Locale;
}) {
  const { items, isOpen, closeCart, updateQty, removeItem, totalPrice, totalCount } = useCart();
  const dict = getDictionary(lang);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeCart();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(36, 26, 38, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 998,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={dict.cart.title}
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          insetInlineEnd: 0,
          width: "min(440px, 100vw)",
          backgroundColor: "var(--surface)",
          boxShadow: "var(--shadow-lg)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : lang === "fa" ? "translateX(-100%)" : "translateX(100%)",
          transition: "transform 0.35s var(--ease)",
          borderInlineStart: "1px solid var(--line)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <h2 style={{ fontSize: "1.35rem", margin: 0, color: "var(--plum)" }}>
              {dict.cart.title}
            </h2>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              ({totalCount} {dict.cart.items})
            </span>
          </div>
          <button
            onClick={closeCart}
            aria-label={dict.nav.close}
            className="icon-btn"
            style={{ width: "36px", height: "36px" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                height: "100%",
                paddingBlock: "3rem",
                color: "var(--ink-soft)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "var(--bg-alt)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--gold-600)",
                  marginBottom: "1rem",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: "0.25rem" }}>
                {dict.cart.empty}
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", maxWidth: "26ch", marginBottom: "1.5rem" }}>
                {dict.cart.note}
              </p>
              <Link
                href={`/${lang}/products`}
                onClick={closeCart}
                className="btn btn--gold btn--sm"
              >
                {dict.cart.emptyCta}
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product_id}
                style={{
                  display: "flex",
                  gap: "1rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid var(--line)",
                  alignItems: "center",
                }}
              >
                <Link
                  href={`/${lang}/products/${item.slug}`}
                  onClick={closeCart}
                  style={{
                    position: "relative",
                    width: "72px",
                    height: "88px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "var(--bg-alt)",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={item.image || "/images/products/tabriz-red.jpg"}
                    alt={item.name}
                    fill
                    sizes="72px"
                    style={{ objectFit: "cover" }}
                  />
                </Link>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/${lang}/products/${item.slug}`}
                    onClick={closeCart}
                    style={{
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "var(--ink)",
                    }}
                  >
                    {item.name}
                  </Link>

                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "var(--plum)",
                      marginTop: "0.2rem",
                    }}
                  >
                    {item.price ? formatPrice(item.price, lang) : dict.common.priceOnRequest}
                  </div>

                  {/* Quantity and Remove */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "0.6rem",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        border: "1px solid var(--line-strong)",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--bg)",
                        padding: "2px",
                      }}
                    >
                      <button
                        onClick={() => updateQty(item.product_id, item.qty - 1)}
                        style={{
                          width: "34px",
                          height: "34px",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "1.05rem",
                          color: "var(--ink-soft)",
                        }}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span
                        style={{
                          paddingInline: "0.5rem",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          minWidth: "24px",
                          textAlign: "center",
                        }}
                      >
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.product_id, item.qty + 1)}
                        style={{
                          width: "34px",
                          height: "34px",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "1.05rem",
                          color: "var(--ink-soft)",
                        }}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product_id)}
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--danger)",
                        textDecoration: "underline",
                        padding: "4px",
                      }}
                    >
                      {dict.cart.remove}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderTop: "1px solid var(--line)",
              backgroundColor: "var(--bg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.95rem", color: "var(--ink-soft)" }}>
                {dict.cart.subtotal}
              </span>
              <span style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--plum)" }}>
                {formatPrice(totalPrice, lang)}
              </span>
            </div>

            <p
              style={{
                fontSize: "0.76rem",
                color: "var(--muted)",
                lineHeight: 1.4,
                marginBottom: "1rem",
              }}
            >
              ✦ {dict.cart.note}
            </p>

            <Link
              href={`/${lang}/reservation`}
              onClick={closeCart}
              className="btn btn--block btn--gold btn--lg"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              <span>{dict.cart.checkout}</span>
              <ArrowIcon direction="forward" />
            </Link>

            <button
              onClick={closeCart}
              className="btn btn--block btn--ghost btn--sm"
              style={{ marginTop: "0.5rem" }}
            >
              {dict.cart.continue}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
