"use client";

import React, { useState, useTransition } from "react";
import type { Locale } from "@/lib/types";
import { getDictionary } from "@/i18n";
import { submitContactMessage } from "@/lib/actions";

export default function ContactForm({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await submitContactMessage({}, formData);
      setResult(res);
      if (res.success) {
        form.reset();
      }
    });
  };

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        padding: "clamp(1.5rem, 4vw, 2.5rem)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h2 style={{ fontSize: "1.6rem", color: "var(--plum)", marginBottom: "1.5rem" }}>
        {dict.contact.formTitle}
      </h2>

      {result?.success && (
        <div className="alert alert--success" style={{ marginBottom: "1.5rem" }}>
          <span>✓</span>
          <span>{dict.contact.success}</span>
        </div>
      )}

      {result?.error && (
        <div className="alert alert--danger" style={{ marginBottom: "1.5rem" }}>
          <span>⚠️</span>
          <span>{dict.contact.error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="field">
          <label htmlFor="c-name" className="label">
            {dict.contact.name} <span className="req">*</span>
          </label>
          <input
            id="c-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="input"
            placeholder={lang === "fa" ? "نام شما" : "Nimesi"}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="c-phone" className="label">
              {dict.contact.phoneField}
            </label>
            <input
              id="c-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className="input"
              placeholder="+358 ..."
            />
          </div>

          <div className="field">
            <label htmlFor="c-email" className="label">
              {dict.contact.emailField} <span className="req">*</span>
            </label>
            <input
              id="c-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              placeholder="sahkoposti@example.com"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="c-subject" className="label">
            {dict.contact.subject}
          </label>
          <input
            id="c-subject"
            name="subject"
            type="text"
            className="input"
            placeholder={lang === "fa" ? "موضوع پیام (مثلاً استعلام قیمت یا عمده‌فروشی)" : "Esim. Tiedustelu tai tukkuhinnat"}
          />
        </div>

        <div className="field">
          <label htmlFor="c-msg" className="label">
            {dict.contact.message} <span className="req">*</span>
          </label>
          <textarea
            id="c-msg"
            name="body"
            required
            className="textarea"
            placeholder={lang === "fa" ? "پیام شما..." : "Kirjoita viestisi tähän..."}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn btn--gold btn--lg"
          style={{ alignSelf: "flex-start" }}
        >
          {isPending ? dict.contact.sending : dict.contact.send} →
        </button>
      </form>
    </div>
  );
}
