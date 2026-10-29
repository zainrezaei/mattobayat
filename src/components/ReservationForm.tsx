"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Locale, Settings } from "@/lib/types";
import { formatPrice, getDictionary } from "@/i18n";
import { useCart } from "@/context/CartContext";
import { submitReservation } from "@/lib/actions";
import { mapsLink } from "@/lib/utils";
import ArrowIcon from "@/components/ArrowIcon";

export default function ReservationForm({
  lang,
  settings,
}: {
  lang: Locale;
  settings: Settings;
}) {
  const dict = getDictionary(lang);
  const { items, totalPrice, clearCart, removeItem, updateQty } = useCart();
  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery">("pickup");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string; reference?: string } | null>(null);

  if (result?.success) {
    return (
      <div
        style={{
          maxWidth: "600px",
          marginInline: "auto",
          backgroundColor: "var(--surface)",
          padding: "clamp(2rem, 5vw, 3.5rem)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "var(--success-50)",
            color: "var(--success)",
            display: "grid",
            placeItems: "center",
            fontSize: "2rem",
            marginInline: "auto",
            marginBottom: "1.25rem",
          }}
        >
          ✓
        </div>

        <h2 style={{ fontSize: "2rem", color: "var(--plum)", marginBottom: "0.5rem" }}>
          {dict.reservation.successTitle}
        </h2>

        <p style={{ color: "var(--ink-soft)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          {dict.reservation.successText}
        </p>

        {result.reference && (
          <div
            style={{
              padding: "0.85rem 1.25rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-alt)",
              display: "inline-block",
              marginBottom: "1.5rem",
            }}
          >
            <span style={{ fontSize: "0.82rem", color: "var(--muted)", display: "block" }}>
              {dict.reservation.reference}
            </span>
            <strong style={{ fontSize: "1.35rem", color: "var(--plum)", letterSpacing: "0.05em" }}>
              {result.reference}
            </strong>
          </div>
        )}

        <div
          style={{
            textAlign: "start",
            padding: "1.25rem",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--plum-50)",
            border: "1px solid var(--plum-100)",
            fontSize: "0.9rem",
            color: "var(--plum-800)",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, marginBottom: "0.35rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{lang === "fi" ? "Nouto-osoite & aukioloajat:" : lang === "fa" ? "آدرس و ساعات تحویل:" : "Pickup location & hours:"}</span>
          </div>
          <div>{settings.address}, {settings.postal} {settings.city}</div>
          <div style={{ marginTop: "0.25rem" }}>
            {dict.hours.monFri}: {settings.hours.mon_fri.closed ? dict.hours.closed : `${settings.hours.mon_fri.open}–${settings.hours.mon_fri.close}`} · {dict.hours.sat}: {settings.hours.sat.closed ? dict.hours.closed : `${settings.hours.sat.open}–${settings.hours.sat.close}`}
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.82rem", color: "var(--gold-600)" }}>
            ✦ {dict.product.payInStore}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
          <Link href={`/${lang}/products`} className="btn btn--gold">
            {dict.cart.emptyCta}
          </Link>
          <a
            href={mapsLink(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline"
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
    );
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          maxWidth: "500px",
          marginInline: "auto",
          textAlign: "center",
          paddingBlock: "4rem",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "var(--plum-50)",
            color: "var(--plum)",
            display: "grid",
            placeItems: "center",
            marginInline: "auto",
            marginBottom: "1.25rem",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h2 style={{ fontSize: "1.85rem", color: "var(--plum)", marginBottom: "0.5rem" }}>
          {dict.cart.empty}
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          {dict.cart.note}
        </p>
        <Link href={`/${lang}/products`} className="btn btn--gold btn--lg">
          {dict.cart.emptyCta}
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("items", JSON.stringify(items));
    formData.set("locale", lang);

    startTransition(async () => {
      const res = await submitReservation({}, formData);
      if (res.success) {
        clearCart();
        setResult(res);
      } else {
        setResult(res);
      }
    });
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))",
        gap: "3rem",
        alignItems: "start",
      }}
    >
      {/* Left: Customer Info Form */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", color: "var(--plum)", marginBottom: "1.5rem" }}>
          {dict.reservation.details}
        </h2>

        {result?.error && (
          <div className="alert alert--danger" style={{ marginBottom: "1.5rem" }}>
            <span>⚠️</span>
            <span>{result.error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="field">
            <label htmlFor="res-name" className="label">
              {dict.reservation.name} <span className="req">*</span>
            </label>
            <input
              id="res-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="input"
              placeholder={lang === "fa" ? "نام و نام خانوادگی" : "Esim. Matti Meikäläinen"}
            />
          </div>

          <div className="field">
            <label htmlFor="res-phone" className="label">
              {dict.reservation.phone} <span className="req">*</span>
            </label>
            <input
              id="res-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              className="input"
              placeholder="+358 ..."
            />
            <span className="hint">
              {lang === "fi"
                ? "Vahvistamme varauksen puhelimitse tai tekstiviestillä."
                : lang === "fa"
                ? "رزرو را با پیام یا تماس تلفنی با شما تأیید می‌کنیم."
                : "We confirm the reservation by phone or text message."}
            </span>
          </div>

          <div className="field">
            <label htmlFor="res-email" className="label">
              {dict.reservation.email}
            </label>
            <input
              id="res-email"
              name="email"
              type="email"
              autoComplete="email"
              className="input"
              placeholder="sahkoposti@example.com"
            />
          </div>

          {/* Delivery method */}
          <div className="field">
            <label className="label">
              {dict.reservation.fulfilment} <span className="req">*</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <label className="choice-card">
                <input
                  type="radio"
                  name="fulfilment"
                  value="pickup"
                  checked={fulfilment === "pickup"}
                  onChange={() => setFulfilment("pickup")}
                  className="radio"
                />
                <div>
                  <strong>{dict.reservation.pickup}</strong>
                  <span>{dict.reservation.pickupHint}</span>
                </div>
              </label>

              <label className="choice-card">
                <input
                  type="radio"
                  name="fulfilment"
                  value="delivery"
                  checked={fulfilment === "delivery"}
                  onChange={() => setFulfilment("delivery")}
                  className="radio"
                />
                <div>
                  <strong>{dict.reservation.delivery}</strong>
                  <span>{dict.reservation.deliveryHint}</span>
                </div>
              </label>
            </div>
          </div>

          {/* Address if delivery selected */}
          {fulfilment === "delivery" && (
            <div className="field">
              <label htmlFor="res-address" className="label">
                {dict.reservation.address} <span className="req">*</span>
              </label>
              <textarea
                id="res-address"
                name="address"
                required
                className="textarea"
                style={{ minHeight: "80px" }}
                placeholder={lang === "fi" ? "Katuosoite, postinumero, kaupunki" : "Street address, postal code, city"}
              />
            </div>
          )}

          {/* Note / Message */}
          <div className="field">
            <label htmlFor="res-msg" className="label">
              {dict.reservation.message}
            </label>
            <textarea
              id="res-msg"
              name="message"
              className="textarea"
              style={{ minHeight: "80px" }}
              placeholder={dict.reservation.messageHint}
            />
          </div>

          {/* Terms notice */}
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            {dict.reservation.consent}
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="btn btn--gold btn--lg btn--block"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
          >
            <span>{isPending ? dict.reservation.sending : dict.reservation.submit}</span>
            <ArrowIcon direction="forward" />
          </button>
        </form>
      </div>

      {/* Right: Order Summary */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <h3 style={{ fontSize: "1.25rem", color: "var(--plum)", margin: 0 }}>
          {dict.reservation.yourItems} ({items.length})
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {items.map((it) => (
            <div
              key={it.product_id}
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                paddingBottom: "1rem",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "60px",
                  height: "75px",
                  borderRadius: "6px",
                  overflow: "hidden",
                  backgroundColor: "var(--bg-alt)",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={it.image || "/images/products/tabriz-red.jpg"}
                  alt={it.name}
                  fill
                  sizes="60px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: "0.95rem", display: "block", color: "var(--ink)" }}>
                  {it.name}
                </strong>
                <span style={{ fontSize: "0.85rem", color: "var(--plum)", fontWeight: 600 }}>
                  {it.price ? formatPrice(it.price, lang) : dict.common.priceOnRequest}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.4rem" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                    {dict.cart.qty}: {it.qty}
                  </span>
                  <button
                    onClick={() => removeItem(it.product_id)}
                    style={{ fontSize: "0.75rem", color: "var(--danger)", textDecoration: "underline" }}
                  >
                    {dict.cart.remove}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "0.5rem" }}>
          <span style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--ink)" }}>
            {dict.cart.subtotal}
          </span>
          <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--plum)" }}>
            {formatPrice(totalPrice, lang)}
          </span>
        </div>

        {/* Store pickup reminder */}
        <div
          style={{
            padding: "1rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--bg-alt)",
            fontSize: "0.82rem",
            color: "var(--ink-soft)",
            lineHeight: 1.5,
          }}
        >
          ✦ <strong>{lang === "fi" ? "Muistutus:" : lang === "fa" ? "توجه:" : "Note:"}</strong> {dict.cart.note}
        </div>
      </div>
    </div>
  );
}
