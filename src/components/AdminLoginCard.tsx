"use client";

import React, { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/types";
import { getDictionary } from "@/i18n";
import { adminSignIn, type ActionState } from "@/lib/actions";
import ArrowIcon from "@/components/ArrowIcon";

export default function AdminLoginCard({
  lang,
  signedInEmail,
  notAdmin,
}: {
  lang: Locale;
  signedInEmail?: string;
  notAdmin?: boolean;
}) {
  const dict = getDictionary(lang);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    adminSignIn,
    {}
  );

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "2.5rem 2rem",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 20px 40px rgba(91, 37, 89, 0.08)",
          border: "1px solid rgba(176, 136, 63, 0.2)",
          backgroundColor: "var(--surface)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "var(--plum-50)",
              color: "var(--plum)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              fontSize: "1.5rem",
              border: "1px solid rgba(91, 37, 89, 0.15)",
            }}
          >
            🔒
          </div>
          <h1
            style={{
              fontSize: "1.85rem",
              color: "var(--plum)",
              marginTop: "0",
              marginBottom: "0.5rem",
            }}
          >
            {dict.admin.title}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.92rem", margin: 0 }}>
            {lang === "fa"
              ? "ورود به پنل مدیریت فروشگاه"
              : lang === "en"
              ? "Sign in to manage products, reservations and settings"
              : "Kirjaudu sisään hallitaksesi tuotteita, varauksia ja asetuksia"}
          </p>
        </div>

        {notAdmin && (
          <div
            className="alert alert--warning"
            style={{ marginBottom: "1.5rem", fontSize: "0.88rem" }}
          >
            {lang === "fa"
              ? `حساب ${signedInEmail} وارد شده اما دسترسی مدیر ندارد.`
              : lang === "en"
              ? `Account ${signedInEmail} is signed in but has not been granted admin access in Supabase.`
              : `Käyttäjä ${signedInEmail} on kirjautunut, mutta sillä ei ole ylläpito-oikeuksia Supabasessa.`}
          </div>
        )}

        {state.error && (
          <div
            className="alert alert--danger"
            style={{ marginBottom: "1.5rem", fontSize: "0.88rem" }}
          >
            {state.error}
          </div>
        )}

        <form action={formAction} style={{ display: "grid", gap: "1.25rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">
              {lang === "fa" ? "ایمیل" : lang === "en" ? "Email address" : "Sähköposti"}
            </label>
            <input
              id="admin-email"
              type="email"
              name="email"
              required
              defaultValue={signedInEmail || ""}
              placeholder="egbayat@gmail.com"
              className="input"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              {lang === "fa" ? "رمز عبور" : lang === "en" ? "Password" : "Salasana"}
            </label>
            <input
              id="admin-password"
              type="password"
              name="password"
              required
              className="input"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn btn--primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {isPending
              ? lang === "fa"
                ? "در حال ورود..."
                : lang === "en"
                ? "Signing in..."
                : "Kirjaudutaan..."
              : lang === "fa"
              ? "ورود به پنل"
              : lang === "en"
              ? "Sign In"
              : "Kirjaudu sisään"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.75rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border)",
            textAlign: "center",
          }}
        >
          <Link
            href={`/${lang}`}
            style={{
              color: "var(--muted)",
              fontSize: "0.88rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <ArrowIcon direction="back" size={14} />
            <span>{dict.admin.viewSite}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
