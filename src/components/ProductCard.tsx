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
  const { addItem, isInCart, openCart } = useCart();
  const title = t(product.name, lang);
  const isReserved = isInCart(product.id);
  const isSoldOut = product.stock <= 0;
  const primaryImage = product.images[0] || "/images/products/tabriz-red.jpg";
  const sizeText = formatSize(product.width_cm, product.length_cm, lang);
  const originText = dict.attrs.origin[product.origin] || product.origin;
  const materialText = dict.attrs.material[product.material] || product.material;
  const weaveText = dict.attrs.weave[product.weave] || product.weave;
  const imageAlt = `${title} – ${weaveText} ${materialText} (${product.width_cm}×${product.length_cm} ${dict.common.cm}) | Matto Bayat Helsinki`;

  const handleAddReservation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    // Rugs are mostly one-of-a-kind: a second click opens the list
    // instead of silently bumping the quantity.
    if (isReserved) {
      openCart();
      return;
    }
    addItem({
      product_id: product.id,
      slug: product.slug,
      name: title,
      price: product.price,
      image: primaryImage,
    });
  };

  return (
    <div className={`product-card${isSoldOut ? " is-sold-out" : ""}`}>
      {/* Image container (decorative duplicate of the title link, so it is
          skipped by keyboard / screen readers to avoid a double tab stop) */}
      <Link
        href={`/${lang}/products/${product.slug}`}
        className="product-card-media"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={primaryImage}
          alt={imageAlt}
          fill
          sizes="(max-width: 560px) 50vw, (max-width: 1024px) 33vw, 300px"
          style={{ objectFit: "cover" }}
          className="product-card-img"
        />

        {/* Multi-image count indicator */}
        {product.images.length > 1 && (
          <div className="product-card-imgcount">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>{product.images.length}</span>
          </div>
        )}

        {/* Single Refined Priority Badge */}
        {isSoldOut ? (
          <div className="product-card-badge">
            <span className="badge">{dict.common.soldOut}</span>
          </div>
        ) : (product.compare_at_price && product.price) ? (
          <div className="product-card-badge">
            <span className="badge badge--danger">{dict.common.sale}</span>
          </div>
        ) : product.featured ? (
          <div className="product-card-badge">
            <span className="badge badge--gold">✦ {dict.common.featured}</span>
          </div>
        ) : (product.stock <= 2 && product.stock > 0) ? (
          <div className="product-card-badge">
            <span className="badge badge--warning">{dict.common.lowStock}</span>
          </div>
        ) : null}

        {/* Origin tag */}
        <div className="product-card-origin">
          <span>{originText}</span>
        </div>
      </Link>

      {/* Content */}
      <div className="product-card-body">
        <div className="product-card-meta">
          {materialText} {sizeText ? `· ${sizeText}` : ""}
        </div>

        <h3 className="product-card-title">
          <Link href={`/${lang}/products/${product.slug}`}>{title}</Link>
        </h3>

        {/* Pricing */}
        <div className="product-card-pricing">
          {product.price ? (
            <>
              <span className="product-card-price">{formatPrice(product.price, lang)}</span>
              {product.compare_at_price && (
                <s className="product-card-compare">{formatPrice(product.compare_at_price, lang)}</s>
              )}
            </>
          ) : (
            <span className="product-card-onrequest">{dict.common.priceOnRequest}</span>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAddReservation}
          disabled={isSoldOut}
          aria-haspopup={isReserved ? "dialog" : undefined}
          className={`btn btn--block btn--sm product-card-btn ${isReserved || isSoldOut ? "btn--outline" : "btn--gold"}`}
        >
          {isSoldOut ? (
            <span>{dict.common.soldOut}</span>
          ) : isReserved ? (
            <>
              <span aria-hidden="true">✓</span>
              <span>{dict.product.inReservation}</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">+</span>
              <span>{dict.product.addToReservation}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
