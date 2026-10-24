import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDictionary, hasLocale } from "@/i18n";
import { getSettings } from "@/lib/data";
import ReservationForm from "@/components/ReservationForm";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/reservation">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.reservation.title,
    description: dict.reservation.lead,
  };
}

export default async function ReservationPage({
  params,
}: PageProps<"/[lang]/reservation">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const settings = await getSettings();

  return (
    <div className="section" style={{ paddingTop: "clamp(2rem, 4vw, 4rem)" }}>
      <div className="container">
        <div style={{ maxWidth: "600px", marginBottom: "2.5rem" }}>
          <span className="eyebrow">{dict.nav.reservation}</span>
          <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)", color: "var(--plum)", marginBlock: "0.4rem 0.6rem" }}>
            {dict.reservation.title}
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: "1.05rem" }}>
            {dict.reservation.lead}
          </p>
        </div>

        <ReservationForm lang={lang} settings={settings} />
      </div>
    </div>
  );
}
