"use client";

import React, { useState } from "react";
import type { Locale, Product, Settings } from "@/lib/types";
import { formatPrice, getDictionary, t } from "@/i18n";
import { useCart } from "@/context/CartContext";
import { whatsappLink } from "@/lib/utils";

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
  const [qty, setQty] = useState(1);
  const title = t(product.name, lang);
  const isReserved = items.some((i) => i.product_id === product.id);

  const handleAdd = () => {
    addItem(
      {
        product_id: product.id,
        slug: product.slug,
        name: title,
        price: product.price,
        image: product.images[0] || "/images/products/tabriz-red.jpg",
      },
      qty
    );
  };

  const whatsappMsg = `${dict.product.whatsappText} ${title} (${product.width_cm}x${product.length_cm} cm, ${
    product.price ? formatPrice(product.price, lang) : dict.common.priceOnRequest
  }) - https://matto-bayat.vercel.app/${lang}/products/${product.slug}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Quantity & Add to reservation */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            border: "1.5px solid var(--line-strong)",
            borderRadius: "999px",
            backgroundColor: "var(--surface)",
            padding: "4px",
          }}
        >
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            style={{ width: "36px", height: "36px", fontSize: "1.2rem", color: "var(--ink-soft)" }}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span style={{ minWidth: "32px", textAlign: "center", fontWeight: 700, fontSize: "0.95rem" }}>
            {qty}
          </span>
          <button
            onClick={() => setQty(qty + 1)}
            style={{ width: "36px", height: "36px", fontSize: "1.2rem", color: "var(--ink-soft)" }}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAdd}
          className={`btn btn--lg btn--block ${isReserved ? "btn--outline" : "btn--gold"}`}
          style={{ flex: 1 }}
        >
          {isReserved ? dict.product.added : dict.product.addToReservation}
        </button>
      </div>

      {/* Direct WhatsApp enquiry */}
      <a
        href={whatsappLink(settings.whatsapp, whatsappMsg)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn--whatsapp btn--lg btn--block"
      >
        <span>💬</span>
        <span>{dict.product.askWhatsapp}</span>
      </a>
    </div>
  );
}
