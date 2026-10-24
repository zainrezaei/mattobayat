import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDictionary, hasLocale } from "@/i18n";
import {
  getAdminSession,
  getCategories,
  getMessages,
  getProducts,
  getReservations,
  getSettings,
} from "@/lib/data";
import AdminDashboard from "@/components/AdminDashboard";
import AdminLoginCard from "@/components/AdminLoginCard";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: `${dict.admin.title} – Matto Bayat`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminPage({
  params,
}: PageProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const session = await getAdminSession();

  // If Supabase is configured and the user is not authenticated as admin, show login
  if (session.status === "signed-out" || session.status === "not-admin") {
    return (
      <AdminLoginCard
        lang={lang as Locale}
        signedInEmail={session.status === "not-admin" ? session.email : undefined}
        notAdmin={session.status === "not-admin"}
      />
    );
  }

  // Authenticated admin OR running in Demo mode
  const [products, categories, reservations, messages, settings] = await Promise.all([
    getProducts({ includeHidden: true }),
    getCategories(),
    getReservations(),
    getMessages(),
    getSettings(),
  ]);

  return (
    <AdminDashboard
      lang={lang as Locale}
      products={products}
      categories={categories}
      reservations={reservations}
      messages={messages}
      settings={settings}
      isDemo={session.status === "demo"}
    />
  );
}
