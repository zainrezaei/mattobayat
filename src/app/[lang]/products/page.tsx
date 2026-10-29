import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDictionary, hasLocale } from "@/i18n";
import { getCategories, getProducts } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import ProductCatalog from "@/components/ProductCatalog";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/products">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return buildPageMetadata({
    lang,
    path: "/products",
    title: dict.meta.productsTitle,
    description: dict.meta.productsDescription,
  });
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string; size?: string }>;
}) {
  const { lang } = await params;
  const { category, size } = await searchParams;
  if (!hasLocale(lang as Locale)) notFound();

  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const categories = await getCategories();
  const products = await getProducts();

  return (
    <div className="section" style={{ paddingTop: "clamp(1.25rem, 2.5vw, 2rem)" }}>
      <div className="container">
        <h1 className="visually-hidden">{dict.products.title}</h1>

        {/* Interactive Catalog */}
        <ProductCatalog
          initialProducts={products}
          categories={categories}
          lang={locale}
          initialCategory={category}
          initialSize={size}
        />
      </div>
    </div>
  );
}
