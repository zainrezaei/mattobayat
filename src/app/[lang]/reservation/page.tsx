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
    robots: { index: false, follow: false },
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
    <div className="section" style={{ paddingTop: "clamp(1.5rem, 3vw, 2.5rem)" }}>
      <div className="container">
        <h1 className="visually-hidden">{dict.reservation.title}</h1>

        <ReservationForm lang={lang} settings={settings} />
      </div>
    </div>
  );
}
