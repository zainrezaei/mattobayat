"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Locale, Product } from "@/lib/types";
import { formatPrice, formatSize, getDictionary, t } from "@/i18n";
import { useCart } from "@/context/CartContext";

export default function ProductCard({
  product,
  lang,
}: {
  product: Product;
  lang: Locale;
}) {
  const dict = getDictionary(lang);
  const { addItem, items } = useCart();
  const title = t(product.name, lang);
  const isReserved = items.some((i) => i.product_id === product.id);
  const primaryImage = product.images[0] || "/images/products/tabriz-red.jpg";
  const sizeText = formatSize(product.width_cm, product.length_cm, lang);
  const originText = dict.attrs.origin[product.origin] || product.origin;
  const materialText = dict.attrs.material[product.material] || product.material;

  const handleAddReservation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id: product.id,
      slug: product.slug,
      name: title,
      price: product.price,
      image: primaryImage,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--surface)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--line)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
        transition: "transform 0.3s var(--ease), box-shadow 0.3s var(--ease), border-color 0.3s ease",
        position: "relative",
      }}
      className="product-card"
    >
      {/* Image container */}
      <Link
        href={`/${lang}/products/${product.slug}`}
        style={{
          position: "relative",
          aspectRatio: "3 / 4",
          backgroundColor: "var(--bg-alt)",
          overflow: "hidden",
          display: "block",
        }}
      >
        <Image
          src={primaryImage}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{
            objectFit: "cover",
            transition: "transform 0.5s var(--ease)",
          }}
          className="product-card-img"
        />

        {/* Badges Overlay */}
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            insetInlineStart: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            zIndex: 2,
          }}
        >
          {product.compare_at_price && product.price && (
            <span className="badge badge--danger">
              {dict.common.sale}
            </span>
          )}
          {product.featured && (
            <span className="badge badge--gold">
              ✦ {lang === "fa" ? "ویژه" : lang === "fi" ? "Suosittelemme" : "Featured"}
            </span>
          )}
          {product.stock <= 2 && product.stock > 0 && (
            <span className="badge badge--warning">
              {dict.common.lowStock}
            </span>
          )}
        </div>

        {/* Origin tag */}
        <div
          style={{
            position: "absolute",
            bottom: "0.75rem",
            insetInlineEnd: "0.75rem",
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(4px)",
              color: "var(--ink)",
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            {originText}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div
        style={{
          padding: "1.15rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: "0.6rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>
            {materialText} {sizeText ? `· ${sizeText}` : ""}
          </span>
        </div>

        <h3 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 600, lineHeight: 1.25 }}>
          <Link
            href={`/${lang}/products/${product.slug}`}
            style={{
              color: "var(--ink)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            className="hover:underline"
          >
            {title}
          </Link>
        </h3>

        {/* Pricing */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.6rem",
            marginTop: "auto",
            paddingTop: "0.4rem",
          }}
        >
          {product.price ? (
            <>
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--plum)",
                }}
              >
                {formatPrice(product.price, lang)}
              </span>
              {product.compare_at_price && (
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--muted)",
                    textDecoration: "line-through",
                  }}
                >
                  {formatPrice(product.compare_at_price, lang)}
                </span>
              )}
            </>
          ) : (
            <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--gold-600)" }}>
              {dict.common.priceOnRequest}
            </span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleAddReservation}
          className={`btn btn--block btn--sm ${isReserved ? "btn--outline" : "btn--gold"}`}
          style={{ marginTop: "0.35rem" }}
        >
          {isReserved ? (
            <>
              <span>✓</span>
              <span>{dict.product.inReservation}</span>
            </>
          ) : (
            <>
              <span>+</span>
              <span>{dict.product.addToReservation}</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow);
          border-color: var(--line-strong);
        }
        .product-card:hover .product-card-img {
          transform: scale(1.04);
        }
      `}</style>
    </div>
  );
}
