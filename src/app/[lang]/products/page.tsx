import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDictionary, hasLocale } from "@/i18n";
import { getCategories, getProducts } from "@/lib/data";
import ProductCatalog from "@/components/ProductCatalog";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/products">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.products.title,
    description: dict.products.lead,
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { lang } = await params;
  const { category } = await searchParams;
  if (!hasLocale(lang as Locale)) notFound();

  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const categories = await getCategories();
  const products = await getProducts();

  return (
    <div className="section" style={{ paddingTop: "clamp(2rem, 4vw, 4rem)" }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <span className="eyebrow">{dict.nav.products}</span>
          <h1 style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.5rem)", color: "var(--plum)", marginBlock: "0.4rem 0.6rem" }}>
            {dict.products.title}
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: "1.05rem", maxWidth: "56ch" }}>
            {dict.products.lead}
          </p>
        </div>

        {/* Interactive Catalog */}
        <ProductCatalog
          initialProducts={products}
          categories={categories}
          lang={locale}
          initialCategory={category}
        />
      </div>
    </div>
  );
}
