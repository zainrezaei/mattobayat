import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { formatPrice, formatSize, getDictionary, hasLocale, t } from "@/i18n";
import { getProductBySlug, getProducts, getSettings } from "@/lib/data";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductCard from "@/components/ProductCard";
import ProductImageGallery from "@/components/ProductImageGallery";
import { buildAlternates, SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/products/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const dict = getDictionary(lang);
  const productName = t(product.name, lang);
  const material = dict.attrs.material[product.material] || product.material;
  const origin = dict.attrs.origin[product.origin] || product.origin;
  const weave = dict.attrs.weave[product.weave] || product.weave;
  const dimensions = `${product.width_cm} × ${product.length_cm} ${dict.common.cm}`;
  const priceString = product.price ? formatPrice(product.price, lang) : dict.common.priceOnRequest;

  const pageTitle = `${productName} – ${dimensions} | Matto Bayat Helsinki`;
  const pageDescription = `${productName} (${origin}, ${material}, ${weave}, ${dimensions}) – ${priceString}. Matto Bayat Putkitie 6, Helsinki.`;
  const primaryImage = product.images[0] || `${SITE_URL}/images/site/hero.jpg`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: buildAlternates(lang, `/products/${slug}`),
    openGraph: {
      type: "website",
      siteName: "Matto Bayat",
      title: pageTitle,
      description: pageDescription,
      locale: lang === "fa" ? "fa_AF" : lang === "en" ? "en_GB" : "fi_FI",
      images: [{ url: primaryImage }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/[lang]/products/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const dict = getDictionary(lang);
  const settings = await getSettings();
  const allProducts = await getProducts();
  const related = allProducts
    .filter((p) => p.id !== product.id && (p.category_id === product.category_id || p.origin === product.origin))
    .slice(0, 3);

  const title = t(product.name, lang);
  const description = t(product.description, lang);
  const sizeText = formatSize(product.width_cm, product.length_cm, lang);
  const materialLabel = dict.attrs.material[product.material] || product.material;
  const originLabel = dict.attrs.origin[product.origin] || product.origin;
  const weaveLabel = dict.attrs.weave[product.weave] || product.weave;
  const richAlt = `${title} – ${weaveLabel} ${materialLabel} (${product.width_cm}×${product.length_cm} ${dict.common.cm}) | Matto Bayat Helsinki`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: description || `${title} - Matto Bayat Helsinki`,
    sku: product.code || product.slug,
    image: product.images && product.images.length > 0 ? product.images : [`${SITE_URL}/images/site/hero.jpg`],
    material: materialLabel,
    countryOfOrigin: originLabel,
    size: `${product.width_cm} x ${product.length_cm} cm`,
    ...(product.price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: product.price,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${SITE_URL}/${lang}/products/${product.slug}`,
            availableDeliveryMethod: [
              "https://schema.org/OnSitePickup",
              "https://schema.org/ParcelDelivery",
            ],
          },
        }
      : {}),
  };

  return (
    <div className="section product-detail-section" style={{ paddingTop: "clamp(1.5rem, 3vw, 3rem)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className="container">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            fontSize: "0.84rem",
            color: "var(--muted)",
            marginBottom: "1.25rem",
            overflow: "hidden",
          }}
        >
          <Link href={`/${lang}`} style={{ color: "inherit", flexShrink: 0 }}>
            {dict.nav.home}
          </Link>
          <span style={{ flexShrink: 0 }}>/</span>
          <Link href={`/${lang}/products`} style={{ color: "inherit", flexShrink: 0 }}>
            {dict.nav.products}
          </Link>
          <span style={{ flexShrink: 0 }}>/</span>
          <span
            style={{
              color: "var(--ink)",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
        </nav>

        {/* Product Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))",
            gap: "clamp(1.5rem, 4.5vw, 4rem)",
            alignItems: "start",
            marginBottom: "4rem",
          }}
        >
          {/* Images Gallery */}
          <ProductImageGallery
            images={product.images}
            title={title}
            altText={richAlt}
            hasDiscount={Boolean(product.compare_at_price)}
            saleLabel={dict.common.sale}
            lang={lang}
          />

          {/* Product Info & Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "0.6rem" }}>
                <span className="badge badge--gold">
                  {dict.attrs.origin[product.origin] || product.origin}
                </span>
                <span className="badge">
                  {dict.attrs.weave[product.weave] || product.weave}
                </span>
                {product.stock <= 2 && product.stock > 0 && (
                  <span className="badge badge--warning">{dict.common.lowStock}</span>
                )}
              </div>

              <h1 style={{ fontSize: "clamp(1.75rem, 3.8vw, 2.75rem)", color: "var(--plum)", lineHeight: 1.15, margin: 0 }}>
                {title}
              </h1>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.85rem", marginTop: "0.75rem" }}>
                {product.price ? (
                  <>
                    <span style={{ fontSize: "1.85rem", fontWeight: 700, color: "var(--plum)" }}>
                      {formatPrice(product.price, lang)}
                    </span>
                    {product.compare_at_price && (
                      <span style={{ fontSize: "1.1rem", color: "var(--muted)", textDecoration: "line-through" }}>
                        {formatPrice(product.compare_at_price, lang)}
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--gold-600)" }}>
                    {dict.common.priceOnRequest}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <p style={{ color: "var(--ink-soft)", fontSize: "0.98rem", lineHeight: 1.65, margin: 0 }}>
                {description}
              </p>
            )}

            {/* Interactive Actions (Add to Reservation, WhatsApp) */}
            <ProductDetailActions product={product} lang={lang} settings={settings} />

            {/* Compact 2x2 Specifications Grid */}
            <div
              style={{
                borderRadius: "var(--radius)",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--line)",
                padding: "1.1rem 1.25rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "0.85rem 1rem",
                  fontSize: "0.88rem",
                }}
              >
                {sizeText && (
                  <div>
                    <span style={{ color: "var(--muted)", fontSize: "0.78rem", display: "block" }}>{dict.product.size}</span>
                    <strong style={{ color: "var(--ink)" }}>{sizeText}</strong>
                  </div>
                )}
                <div>
                  <span style={{ color: "var(--muted)", fontSize: "0.78rem", display: "block" }}>{dict.product.material}</span>
                  <strong style={{ color: "var(--ink)" }}>{dict.attrs.material[product.material] || product.material}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", fontSize: "0.78rem", display: "block" }}>{dict.product.origin}</span>
                  <strong style={{ color: "var(--ink)" }}>{dict.attrs.origin[product.origin] || product.origin}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", fontSize: "0.78rem", display: "block" }}>{dict.product.weave}</span>
                  <strong style={{ color: "var(--ink)" }}>{dict.attrs.weave[product.weave] || product.weave}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: "4rem" }}>
            <h2 style={{ fontSize: "2rem", color: "var(--plum)", marginBottom: "2rem" }}>
              {dict.product.related}
            </h2>
            <div
              className="related-products-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
                gap: "2rem",
              }}
            >
              {related.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} />
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .product-detail-section {
            padding-bottom: 5.5rem !important;
          }
        }
        @media (max-width: 560px) {
          .related-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.85rem !important;
          }
        }
      `}</style>
    </div>
  );
}
