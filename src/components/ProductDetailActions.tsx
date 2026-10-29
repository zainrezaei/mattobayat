"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Locale, Product, Settings } from "@/lib/types";
import { formatPrice, getDictionary, t } from "@/i18n";
import { useCart } from "@/context/CartContext";
import { whatsappLink } from "@/lib/utils";
import { SITE_URL } from "@/lib/seo";

export default function ProductDetailActions({
  product,
  lang,
  settings,
}: {
  product: Product;
  lang: Locale;
  settings: Settings;
}) {
  const dict = getDictionary(lang);
  const { addItem, items } = useCart();
  const [showStickyBar, setShowStickyBar] = useState(false);
  const inlineActionsRef = useRef<HTMLDivElement>(null);
  const title = t(product.name, lang);
  const isReserved = items.some((i) => i.product_id === product.id);

  useEffect(() => {
    const el = inlineActionsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAdd = () => {
    addItem(
      {
        product_id: product.id,
        slug: product.slug,
        name: title,
        price: product.price,
        image: product.images[0] || "/images/products/tabriz-red.jpg",
      },
      1
    );
  };

  const whatsappMsg = `${dict.product.whatsappText} ${title} (${product.width_cm}x${product.length_cm} cm, ${
    product.price ? formatPrice(product.price, lang) : dict.common.priceOnRequest
  }) - ${SITE_URL}/${lang}/products/${product.slug}`;

  return (
    <div ref={inlineActionsRef} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Side-by-side Primary Actions: Reserve + Ask on WhatsApp */}
      <div className="product-actions-row">
        <button
          onClick={handleAdd}
          className={`btn btn--lg product-action-btn ${isReserved ? "btn--outline" : "btn--gold"}`}
        >
          <span>{isReserved ? "✓" : "+"}</span>
          <span>{isReserved ? dict.product.added : dict.product.addToReservation}</span>
        </button>

        <a
          href={whatsappLink(settings.whatsapp, whatsappMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--whatsapp btn--lg product-action-btn"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>{dict.product.askWhatsapp}</span>
        </a>
      </div>

      {/* Compact Reassurance Note */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.82rem",
          color: "var(--ink-soft)",
          paddingInline: "0.25rem",
        }}
      >
        <span style={{ color: "var(--gold-600)", fontWeight: 700 }}>✦</span>
        <span>{dict.product.payInStore}</span>
      </div>

      {/* Mobile Sticky Bottom Floating Bar (shown when inline actions scroll out of view) */}
      <div className={`product-mobile-bar ${showStickyBar ? "visible" : ""}`}>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: "1 1 auto" }}>
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--plum)", lineHeight: 1.2 }}>
            {product.price ? formatPrice(product.price, lang) : dict.common.priceOnRequest}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <a
            href={whatsappLink(settings.whatsapp, whatsappMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--whatsapp"
            style={{
              width: "44px",
              height: "44px",
              padding: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: "var(--radius-btn)",
            }}
            aria-label="WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </a>

          <button
            onClick={handleAdd}
            className={`btn ${isReserved ? "btn--outline" : "btn--gold"}`}
            style={{
              minHeight: "44px",
              padding: "0.5rem 1.15rem",
              fontSize: "0.88rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {isReserved ? dict.product.added : dict.product.addToReservation}
          </button>
        </div>
      </div>

      <style>{`
        .product-actions-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.65rem;
        }
        .product-action-btn {
          width: 100%;
          min-block-size: 48px !important;
          padding: 0.65rem 0.75rem !important;
          font-size: 0.9rem !important;
          white-space: nowrap;
        }
        .product-mobile-bar {
          display: none;
        }
        @media (max-width: 768px) {
          .product-mobile-bar {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 80;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-top: 1px solid var(--line);
            padding: 0.65rem 1rem;
            padding-bottom: max(0.65rem, env(safe-area-inset-bottom));
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
            transform: translateY(100%);
            opacity: 0;
            pointer-events: none;
            transition: transform 0.25s var(--ease), opacity 0.25s var(--ease);
          }
          .product-mobile-bar.visible {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
          }
        }
        @media (max-width: 420px) {
          .product-action-btn {
            font-size: 0.82rem !important;
            padding: 0.6rem 0.5rem !important;
            gap: 0.35rem !important;
          }
        }
      `}</style>
    </div>
  );
}
