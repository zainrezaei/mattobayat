import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { getDictionary, hasLocale, t } from "@/i18n";
import { getCategories, getProducts } from "@/lib/data";
import { buildPageMetadata, SITE_URL, toAbsoluteUrl } from "@/lib/seo";
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

  const catalogSchema = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/${locale}/products#collection`,
      url: `${SITE_URL}/${locale}/products`,
      name: dict.meta.productsTitle,
      description: dict.meta.productsDescription,
      inLanguage: locale,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: products.length,
        itemListElement: products.slice(0, 30).map((p, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${SITE_URL}/${locale}/products/${p.slug}`,
          name: t(p.name, locale),
          image: toAbsoluteUrl(p.images?.[0]),
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: dict.nav.home,
          item: `${SITE_URL}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: dict.nav.products,
          item: `${SITE_URL}/${locale}/products`,
        },
      ],
    },
  ];

  return (
    <div className="section" style={{ paddingTop: "clamp(1.25rem, 2.5vw, 2rem)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }}
      />
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
