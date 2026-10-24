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

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/products/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const title = t(product.name, lang);
  const description = t(product.description, lang);
  return {
    title,
    description: description || `${title} - Matto Bayat Helsinki`,
    openGraph: {
      title,
      description,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
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

  return (
    <div className="section" style={{ paddingTop: "clamp(1.5rem, 3vw, 3rem)" }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
            color: "var(--muted)",
            marginBottom: "2rem",
          }}
        >
          <Link href={`/${lang}`} style={{ color: "inherit" }}>
            {dict.nav.home}
          </Link>
          <span>/</span>
          <Link href={`/${lang}/products`} style={{ color: "inherit" }}>
            {dict.nav.products}
          </Link>
          <span>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>{title}</span>
        </nav>

        {/* Product Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))",
            gap: "clamp(2rem, 5vw, 4.5rem)",
            alignItems: "start",
            marginBottom: "5rem",
          }}
        >
          {/* Images Gallery */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                position: "relative",
                aspectRatio: "3 / 4",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                backgroundColor: "var(--bg-alt)",
                boxShadow: "var(--shadow)",
                border: "1px solid var(--line)",
              }}
            >
              <Image
                src={product.images[0] || "/images/products/tabriz-red.jpg"}
                alt={title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />

              {product.compare_at_price && (
                <div style={{ position: "absolute", top: "1rem", insetInlineStart: "1rem" }}>
                  <span className="badge badge--danger" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>
                    {dict.common.sale}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail row if multiple images */}
            {product.images.length > 1 && (
              <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto" }}>
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      width: "80px",
                      height: "100px",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      border: idx === 0 ? "2px solid var(--plum)" : "1px solid var(--line)",
                      flexShrink: 0,
                    }}
                  >
                    <Image src={img} alt={`${title} ${idx + 1}`} fill sizes="80px" style={{ objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
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

              <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--plum)", lineHeight: 1.15, margin: 0 }}>
                {title}
              </h1>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginTop: "1rem" }}>
                {product.price ? (
                  <>
                    <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--plum)" }}>
                      {formatPrice(product.price, lang)}
                    </span>
                    {product.compare_at_price && (
                      <span style={{ fontSize: "1.2rem", color: "var(--muted)", textDecoration: "line-through" }}>
                        {formatPrice(product.compare_at_price, lang)}
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--gold-600)" }}>
                    {dict.common.priceOnRequest}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <p style={{ color: "var(--ink-soft)", fontSize: "1.05rem", lineHeight: 1.7, margin: 0 }}>
                {description}
              </p>
            )}

            {/* Specifications Table */}
            <div
              style={{
                borderRadius: "var(--radius)",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--line)",
                padding: "1.25rem",
              }}
            >
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--plum)", marginBottom: "0.75rem" }}>
                {dict.product.specs}
              </h3>
              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: "0.6rem 1rem",
                  fontSize: "0.92rem",
                  margin: 0,
                }}
              >
                {sizeText && (
                  <>
                    <dt style={{ color: "var(--muted)" }}>{dict.product.size}:</dt>
                    <dd style={{ fontWeight: 600, margin: 0 }}>{sizeText}</dd>
                  </>
                )}
                <dt style={{ color: "var(--muted)" }}>{dict.product.material}:</dt>
                <dd style={{ fontWeight: 600, margin: 0 }}>
                  {dict.attrs.material[product.material] || product.material}
                </dd>

                <dt style={{ color: "var(--muted)" }}>{dict.product.origin}:</dt>
                <dd style={{ fontWeight: 600, margin: 0 }}>
                  {dict.attrs.origin[product.origin] || product.origin}
                </dd>

                <dt style={{ color: "var(--muted)" }}>{dict.product.weave}:</dt>
                <dd style={{ fontWeight: 600, margin: 0 }}>
                  {dict.attrs.weave[product.weave] || product.weave}
                </dd>

                <dt style={{ color: "var(--muted)" }}>{dict.product.shape}:</dt>
                <dd style={{ fontWeight: 600, margin: 0 }}>
                  {dict.attrs.shape[product.shape] || product.shape}
                </dd>
              </dl>
            </div>

            {/* Interactive Actions (Add to Reservation, WhatsApp) */}
            <ProductDetailActions product={product} lang={lang} settings={settings} />

            {/* Store Pickup Notice Box */}
            <div
              style={{
                padding: "1.25rem",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--bg-alt)",
                border: "1px solid var(--line-strong)",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                fontSize: "0.88rem",
                color: "var(--ink-soft)",
              }}
            >
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.1rem" }}>🏪</span>
                <div>
                  <strong>{lang === "fi" ? "Maksu vasta myymälässä" : lang === "fa" ? "پرداخت در فروشگاه" : "Pay at store upon pickup"}</strong>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                    {dict.product.payInStore}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.1rem" }}>🚚</span>
                <div>
                  <strong>{dict.product.freeDelivery.replace("{amount}", String(settings.free_delivery_threshold))}</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.1rem" }}>📍</span>
                <div>
                  <strong>{dict.product.visitToSee}</strong>
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
    </div>
  );
}
