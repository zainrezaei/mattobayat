"use client";

import React, { useState, useMemo, useEffect, useDeferredValue } from "react";
import type { Category, Color, Locale, Product } from "@/lib/types";
import { COLORS } from "@/lib/types";
import { getDictionary, t } from "@/i18n";
import ProductCard from "./ProductCard";

type SizeTier = "all" | "small" | "medium" | "large";
type PriceTier = "all" | "under300" | "300to700" | "over700";
type SortOption = "featured" | "newest" | "priceAsc" | "priceDesc" | "sizeDesc";

const SIZE_TIERS: SizeTier[] = ["all", "small", "medium", "large"];
const PRICE_TIERS: PriceTier[] = ["all", "under300", "300to700", "over700"];
const SORTS: SortOption[] = ["featured", "newest", "priceAsc", "priceDesc", "sizeDesc"];

function pick<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Lower-case + strip diacritics so "matto" matches "Mattö" and "kilim" matches "Kilím". */
function normalize(s: string) {
  return s.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function ProductCatalog({
  initialProducts,
  categories,
  lang,
  initialCategory,
  initialSize,
  initialColor,
  initialPrice,
  initialSort,
  initialQuery,
}: {
  initialProducts: Product[];
  categories: Category[];
  lang: Locale;
  initialCategory?: string;
  initialSize?: string;
  initialColor?: string;
  initialPrice?: string;
  initialSort?: string;
  initialQuery?: string;
}) {
  const dict = getDictionary(lang);

  const validInitialSize = pick(initialSize, SIZE_TIERS, "all");

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");
  const [sizeTier, setSizeTier] = useState<SizeTier>(validInitialSize);
  const [selectedColor, setSelectedColor] = useState<Color | "all">(
    pick<Color | "all">(initialColor, ["all", ...COLORS], "all")
  );
  const [priceTier, setPriceTier] = useState<PriceTier>(pick(initialPrice, PRICE_TIERS, "all"));
  const [sortBy, setSortBy] = useState<SortOption>(pick(initialSort, SORTS, "featured"));
  const [query, setQuery] = useState(initialQuery ?? "");
  // Keep typing snappy: filtering runs on a deferred copy of the query.
  const deferredQuery = useDeferredValue(query);

  // Sync state if URL query props change on navigation (e.g. clicking a
  // category link in the footer while already on this page). Adjusting
  // state during render avoids the extra commit of a setState-in-effect.
  const [prevInitial, setPrevInitial] = useState({ c: initialCategory, s: validInitialSize });
  if (prevInitial.c !== initialCategory || prevInitial.s !== validInitialSize) {
    setPrevInitial({ c: initialCategory, s: validInitialSize });
    setSelectedCategory(initialCategory || "all");
    setSizeTier(validInitialSize);
  }

  // Keep URL query params in sync so sharing a link / browser Back preserves filters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const setOrDelete = (key: string, value: string, empty: string) => {
      if (value && value !== empty) params.set(key, value);
      else params.delete(key);
    };
    setOrDelete("category", selectedCategory, "all");
    setOrDelete("size", sizeTier, "all");
    setOrDelete("color", selectedColor, "all");
    setOrDelete("price", priceTier, "all");
    setOrDelete("sort", sortBy, "featured");
    setOrDelete("q", deferredQuery.trim(), "");
    const qs = params.toString();
    const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    if (nextUrl !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }, [selectedCategory, sizeTier, selectedColor, priceTier, sortBy, deferredQuery]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    const needle = normalize(deferredQuery.trim());
    return initialProducts
      .filter((p) => {
        // Free-text search across every language + attributes
        if (needle) {
          const haystack = normalize(
            [
              p.name.fi,
              p.name.en,
              p.name.fa,
              p.code ?? "",
              p.slug,
              dict.attrs.origin[p.origin],
              dict.attrs.material[p.material],
              dict.attrs.weave[p.weave],
              ...p.colors.map((c) => dict.attrs.color[c]),
              p.width_cm && p.length_cm ? `${p.width_cm}x${p.length_cm} ${p.width_cm}×${p.length_cm}` : "",
            ].join(" ")
          );
          if (!needle.split(/\s+/).every((word) => haystack.includes(word))) return false;
        }

        // Category
        if (selectedCategory !== "all") {
          const cat = categories.find((c) => c.slug === selectedCategory);
          if (cat && p.category_id !== cat.id) return false;
        }

        // Size Tier (area in cm²: < 2 m² = 20000, 2-5 m² = 20000..50000, > 5 m² = > 50000)
        if (sizeTier !== "all") {
          const area = (p.width_cm || 0) * (p.length_cm || 0);
          if (sizeTier === "small" && area >= 20000) return false;
          if (sizeTier === "medium" && (area < 20000 || area > 50000)) return false;
          if (sizeTier === "large" && area <= 50000) return false;
        }

        // Color
        if (selectedColor !== "all" && !p.colors.includes(selectedColor)) return false;

        // Price Tier
        if (priceTier === "under300" && (p.price === null || p.price >= 300)) return false;
        if (priceTier === "300to700" && (p.price === null || p.price < 300 || p.price > 700)) return false;
        if (priceTier === "over700" && (p.price === null || p.price <= 700)) return false;

        return true;
      })
      .sort((a, b) => {
        // Sold-out pieces always sink to the bottom
        const soldDiff = (a.stock <= 0 ? 1 : 0) - (b.stock <= 0 ? 1 : 0);
        if (soldDiff !== 0) return soldDiff;
        if (sortBy === "priceAsc") return (a.price || 999999) - (b.price || 999999);
        if (sortBy === "priceDesc") return (b.price || 0) - (a.price || 0);
        if (sortBy === "sizeDesc")
          return (b.width_cm || 0) * (b.length_cm || 0) - (a.width_cm || 0) * (a.length_cm || 0);
        if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [initialProducts, selectedCategory, sizeTier, selectedColor, priceTier, sortBy, categories, deferredQuery, dict]);

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (sizeTier !== "all" ? 1 : 0) +
    (selectedColor !== "all" ? 1 : 0) +
    (priceTier !== "all" ? 1 : 0) +
    (query.trim() ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSizeTier("all");
    setSelectedColor("all");
    setPriceTier("all");
    setQuery("");
  };

  const isStale = query !== deferredQuery;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {/* 0. Search */}
      <search className="catalog-search">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.products.search}
          aria-label={dict.products.search}
          className="catalog-search-input"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="catalog-search-clear"
            aria-label={dict.products.clearSearch}
          >
            ✕
          </button>
        )}
      </search>
      {/* 1. Category Pills Strip */}
      <div className="catalog-scroll-row">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`chip catalog-chip ${selectedCategory === "all" ? "active" : ""}`}
          aria-pressed={selectedCategory === "all"}
        >
          {dict.products.all}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.slug)}
            className={`chip catalog-chip ${selectedCategory === cat.slug ? "active" : ""}`}
            aria-pressed={selectedCategory === cat.slug}
          >
            {t(cat.name, lang)}
          </button>
        ))}
      </div>

      {/* 2. Sleek Single-Line Pill Dropdowns Strip */}
      <div className="catalog-filter-strip">
        <div className="catalog-scroll-row" style={{ flex: 1 }}>
          {/* Size Pill Dropdown */}
          <select
            value={sizeTier}
            onChange={(e) => setSizeTier(e.target.value as SizeTier)}
            aria-label={dict.products.size}
            className={`select catalog-pill-select ${sizeTier !== "all" ? "is-active" : ""}`}
          >
            <option value="all">{dict.products.size}: {dict.products.all}</option>
            <option value="small">{dict.products.sizeSmall}</option>
            <option value="medium">{dict.products.sizeMedium}</option>
            <option value="large">{dict.products.sizeLarge}</option>
          </select>

          {/* Color Pill Dropdown */}
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value as Color | "all")}
            aria-label={dict.products.color}
            className={`select catalog-pill-select ${selectedColor !== "all" ? "is-active" : ""}`}
          >
            <option value="all">{dict.products.color}: {dict.products.all}</option>
            {COLORS.map((color) => (
              <option key={color} value={color}>
                {dict.attrs.color[color]}
              </option>
            ))}
          </select>

          {/* Price Pill Dropdown */}
          <select
            value={priceTier}
            onChange={(e) => setPriceTier(e.target.value as PriceTier)}
            aria-label={dict.products.price}
            className={`select catalog-pill-select ${priceTier !== "all" ? "is-active" : ""}`}
          >
            <option value="all">{dict.products.price}: {dict.products.all}</option>
            <option value="under300">&lt; 300 €</option>
            <option value="300to700">300 – 700 €</option>
            <option value="over700">&gt; 700 €</option>
          </select>

          {/* Sort Pill Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label={dict.products.sort}
            className="select catalog-pill-select"
          >
            <option value="featured">{dict.products.sortFeatured}</option>
            <option value="newest">{dict.products.sortNewest}</option>
            <option value="priceAsc">{dict.products.sortPriceAsc}</option>
            <option value="priceDesc">{dict.products.sortPriceDesc}</option>
            <option value="sizeDesc">{dict.products.sortSize}</option>
          </select>

          {/* Clear Active Filters Pill */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="catalog-clear-btn"
            >
              <span aria-hidden="true">✕</span> {dict.products.clear} ({activeFiltersCount})
            </button>
          )}
        </div>

        <span className="catalog-count" role="status" aria-live="polite">
          <strong>{filteredProducts.length}</strong> {dict.products.results}
        </span>
      </div>

      {/* 3. Full-Width Products Grid */}
      {filteredProducts.length === 0 ? (
        <div
          style={{
            backgroundColor: "var(--surface)",
            padding: "3.5rem 1.5rem",
            borderRadius: "var(--radius)",
            textAlign: "center",
            border: "1px solid var(--line)",
            marginTop: "0.5rem",
          }}
        >
          <p style={{ fontSize: "1.1rem", color: "var(--ink)", fontWeight: 600, marginBottom: "0.5rem" }}>
            {dict.products.noResults}
          </p>
          <button type="button" onClick={clearAllFilters} className="btn btn--gold btn--sm" style={{ marginTop: "0.75rem" }}>
            {dict.products.clear}
          </button>
        </div>
      ) : (
        <div
          className="catalog-products-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
            gap: "1.75rem",
            marginTop: "0.25rem",
            opacity: isStale ? 0.6 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} lang={lang} />
          ))}
        </div>
      )}

      <style>{`
        .catalog-search {
          position: relative;
          display: flex;
          align-items: center;
          color: var(--muted);
        }
        .catalog-search > svg {
          position: absolute;
          inset-inline-start: 0.95rem;
          pointer-events: none;
        }
        .catalog-search-input {
          inline-size: 100%;
          min-block-size: 44px;
          padding-block: 0.55rem;
          padding-inline: 2.7rem 2.6rem;
          border-radius: 999px;
          border: 1.5px solid var(--line-strong);
          background: var(--surface);
          font-size: 0.95rem;
          color: var(--ink);
          transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
        }
        .catalog-search-input::-webkit-search-cancel-button {
          appearance: none;
        }
        .catalog-search-input:focus {
          outline: none;
          border-color: var(--plum);
          box-shadow: 0 0 0 4px rgb(91 37 89 / 0.12);
        }
        .catalog-search-clear {
          position: absolute;
          inset-inline-end: 0.4rem;
          inline-size: 34px;
          block-size: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: var(--ink-soft);
          font-size: 0.85rem;
        }
        .catalog-search-clear:hover {
          background: var(--plum-50);
          color: var(--plum);
        }
        .catalog-scroll-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding-block: 2px;
        }
        .catalog-scroll-row::-webkit-scrollbar {
          display: none;
        }
        .catalog-chip {
          min-block-size: 36px;
          padding: 0.35rem 0.9rem;
          font-size: 0.84rem;
        }
        .catalog-filter-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding-bottom: 0.35rem;
          border-bottom: 1px solid var(--line);
        }
        .catalog-pill-select {
          width: auto !important;
          inline-size: auto !important;
          flex-shrink: 0;
          min-block-size: 34px !important;
          padding-block: 0.25rem !important;
          padding-inline-start: 0.75rem !important;
          padding-inline-end: 1.85rem !important;
          border-radius: 999px !important;
          border: 1px solid var(--line-strong) !important;
          background-color: var(--surface) !important;
          background-position: right 0.65rem center !important;
          font-size: 0.8rem !important;
          font-weight: 500 !important;
          color: var(--ink) !important;
          cursor: pointer;
          white-space: nowrap;
        }
        [dir="rtl"] .catalog-pill-select {
          background-position: left 0.65rem center !important;
        }
        .catalog-pill-select.is-active {
          border-color: var(--plum) !important;
          background-color: var(--plum-50) !important;
          color: var(--plum) !important;
          font-weight: 600 !important;
        }
        .catalog-clear-btn {
          flex-shrink: 0;
          min-block-size: 32px;
          padding: 0.2rem 0.7rem;
          border-radius: 999px;
          background: var(--danger-50);
          color: var(--danger);
          font-size: 0.78rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
        }
        .catalog-count {
          font-size: 0.82rem;
          color: var(--muted);
          white-space: nowrap;
          flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .catalog-scroll-row {
            margin-inline: calc(-1 * var(--gutter));
            padding-inline: var(--gutter);
          }
          .catalog-filter-strip {
            flex-direction: column;
            align-items: stretch;
            gap: 0.4rem;
          }
          .catalog-count {
            font-size: 0.78rem;
          }
        }
        @media (max-width: 560px) {
          .catalog-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.85rem !important;
          }
        }
      `}</style>
    </div>
  );
}
