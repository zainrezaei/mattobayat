"use client";

import React, { useState, useMemo } from "react";
import type { Category, Color, Locale, Material, Origin, Product, Shape } from "@/lib/types";
import { COLOR_SWATCH, COLORS } from "@/lib/types";
import { getDictionary, t } from "@/i18n";
import ProductCard from "./ProductCard";

export default function ProductCatalog({
  initialProducts,
  categories,
  lang,
  initialCategory,
}: {
  initialProducts: Product[];
  categories: Category[];
  lang: Locale;
  initialCategory?: string;
}) {
  const dict = getDictionary(lang);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");
  const [selectedOrigin, setSelectedOrigin] = useState<Origin | "all">("all");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | "all">("all");
  const [selectedShape, setSelectedShape] = useState<Shape | "all">("all");
  const [selectedColor, setSelectedColor] = useState<Color | "all">("all");
  const [priceTier, setPriceTier] = useState<"all" | "under300" | "300to700" | "over700">("all");
  const [sortBy, setSortBy] = useState<"featured" | "newest" | "priceAsc" | "priceDesc">("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const name = t(p.name, lang).toLowerCase();
          const desc = t(p.description, lang).toLowerCase();
          if (!name.includes(q) && !desc.includes(q)) return false;
        }

        // Category
        if (selectedCategory !== "all") {
          const cat = categories.find((c) => c.slug === selectedCategory);
          if (cat && p.category_id !== cat.id) return false;
        }

        // Origin
        if (selectedOrigin !== "all" && p.origin !== selectedOrigin) return false;

        // Material
        if (selectedMaterial !== "all" && p.material !== selectedMaterial) return false;

        // Shape
        if (selectedShape !== "all" && p.shape !== selectedShape) return false;

        // Color
        if (selectedColor !== "all" && !p.colors.includes(selectedColor)) return false;

        // Price Tier
        if (priceTier === "under300" && (p.price === null || p.price >= 300)) return false;
        if (priceTier === "300to700" && (p.price === null || p.price < 300 || p.price > 700)) return false;
        if (priceTier === "over700" && (p.price === null || p.price <= 700)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priceAsc") return (a.price || 999999) - (b.price || 999999);
        if (sortBy === "priceDesc") return (b.price || 0) - (a.price || 0);
        if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        // Featured
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [
    initialProducts,
    search,
    selectedCategory,
    selectedOrigin,
    selectedMaterial,
    selectedShape,
    selectedColor,
    priceTier,
    sortBy,
    categories,
    lang,
  ]);

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedOrigin !== "all" ? 1 : 0) +
    (selectedMaterial !== "all" ? 1 : 0) +
    (selectedShape !== "all" ? 1 : 0) +
    (selectedColor !== "all" ? 1 : 0) +
    (priceTier !== "all" ? 1 : 0) +
    (search ? 1 : 0);

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedOrigin("all");
    setSelectedMaterial("all");
    setSelectedShape("all");
    setSelectedColor("all");
    setPriceTier("all");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Category Pills Bar */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          scrollbarWidth: "none",
        }}
      >
        <button
          onClick={() => setSelectedCategory("all")}
          className={`chip ${selectedCategory === "all" ? "active" : ""}`}
          aria-pressed={selectedCategory === "all"}
        >
          {dict.products.all}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`chip ${selectedCategory === cat.slug ? "active" : ""}`}
            aria-pressed={selectedCategory === cat.slug}
          >
            {t(cat.name, lang)}
          </button>
        ))}
      </div>

      {/* Search & Top Action Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: "440px" }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.products.search}
            className="input"
            style={{
              paddingInlineStart: "2.6rem",
              borderRadius: "var(--radius-btn)",
              minHeight: "44px",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: "50%",
              insetInlineStart: "1rem",
              transform: "translateY(-50%)",
              color: "var(--muted)",
              pointerEvents: "none",
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                top: "50%",
                insetInlineEnd: "1rem",
                transform: "translateY(-50%)",
                color: "var(--muted)",
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="btn btn--outline btn--sm mobile-filter-btn"
            style={{ display: "none" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>{dict.products.filters}</span>
            {activeFiltersCount > 0 && (
              <span className="badge badge--plum">{activeFiltersCount}</span>
            )}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{dict.products.sort}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="select"
              style={{
                minHeight: "42px",
                padding: "0.35rem 2.2rem 0.35rem 0.85rem",
                borderRadius: "var(--radius-btn)",
                fontSize: "0.85rem",
              }}
            >
              <option value="featured">{dict.products.sortFeatured}</option>
              <option value="newest">{dict.products.sortNewest}</option>
              <option value="priceAsc">{dict.products.sortPriceAsc}</option>
              <option value="priceDesc">{dict.products.sortPriceDesc}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout (Sidebar Filters + Products Grid) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "2.5rem",
          alignItems: "start",
        }}
        className="catalog-grid-layout"
      >
        {/* Desktop Sidebar Filters */}
        <aside
          className={`filter-sidebar ${mobileFiltersOpen ? "open" : ""}`}
          style={{
            backgroundColor: "var(--surface)",
            padding: "1.5rem",
            borderRadius: "var(--radius)",
            border: "1px solid var(--line)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.15rem", margin: 0, color: "var(--plum)" }}>
              {dict.products.filters}
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                style={{ fontSize: "0.8rem", color: "var(--danger)", textDecoration: "underline" }}
              >
                {dict.products.clear} ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Origin filter */}
          <div>
            <label className="label" style={{ marginBottom: "0.5rem", display: "block" }}>
              {dict.products.origin}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {(["all", "iran", "turkey", "afghanistan"] as const).map((origin) => (
                <button
                  key={origin}
                  onClick={() => setSelectedOrigin(origin)}
                  className={`chip ${selectedOrigin === origin ? "active" : ""}`}
                  style={{ fontSize: "0.8rem", padding: "0.25rem 0.7rem", minHeight: "32px" }}
                >
                  {origin === "all" ? dict.products.all : dict.attrs.origin[origin]}
                </button>
              ))}
            </div>
          </div>

          {/* Shape filter */}
          <div>
            <label className="label" style={{ marginBottom: "0.5rem", display: "block" }}>
              {dict.products.shape}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {(["all", "rectangle", "runner", "round"] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() => setSelectedShape(shape)}
                  className={`chip ${selectedShape === shape ? "active" : ""}`}
                  style={{ fontSize: "0.8rem", padding: "0.25rem 0.7rem", minHeight: "32px" }}
                >
                  {shape === "all" ? dict.products.all : dict.attrs.shape[shape]}
                </button>
              ))}
            </div>
          </div>

          {/* Color Swatches */}
          <div>
            <label className="label" style={{ marginBottom: "0.5rem", display: "block" }}>
              {dict.products.color}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <button
                onClick={() => setSelectedColor("all")}
                style={{
                  fontSize: "0.78rem",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "999px",
                  border: `1.5px solid ${selectedColor === "all" ? "var(--plum)" : "var(--line)"}`,
                  backgroundColor: selectedColor === "all" ? "var(--plum)" : "var(--surface)",
                  color: selectedColor === "all" ? "#fff" : "var(--ink-soft)",
                }}
              >
                {dict.products.all}
              </button>
              {COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(isSelected ? "all" : color)}
                    title={dict.attrs.color[color]}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: COLOR_SWATCH[color],
                      border: isSelected ? "3px solid var(--plum)" : "1.5px solid var(--line-strong)",
                      outlineOffset: "2px",
                      boxShadow: isSelected ? "0 0 0 2px var(--plum)" : "none",
                      transition: "transform 0.15s ease",
                      cursor: "pointer",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Price Tiers */}
          <div>
            <label className="label" style={{ marginBottom: "0.5rem", display: "block" }}>
              {dict.products.price}
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {[
                { id: "all", label: dict.products.all },
                { id: "under300", label: "< 300 €" },
                { id: "300to700", label: "300 € – 700 €" },
                { id: "over700", label: "> 700 €" },
              ].map((tier) => (
                <label key={tier.id} className="choice" style={{ fontSize: "0.85rem" }}>
                  <input
                    type="radio"
                    name="priceTier"
                    checked={priceTier === tier.id}
                    onChange={() => setPriceTier(tier.id as any)}
                    className="radio"
                  />
                  <span>{tier.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Material */}
          <div>
            <label className="label" style={{ marginBottom: "0.5rem", display: "block" }}>
              {dict.products.material}
            </label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value as any)}
              className="select"
              style={{ fontSize: "0.85rem", minHeight: "40px" }}
            >
              <option value="all">{dict.products.all}</option>
              <option value="wool">{dict.attrs.material.wool}</option>
              <option value="silk">{dict.attrs.material.silk}</option>
              <option value="wool-silk">{dict.attrs.material["wool-silk"]}</option>
              <option value="cotton">{dict.attrs.material.cotton}</option>
              <option value="polyester">{dict.attrs.material.polyester}</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <div>
          {/* Results header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
              fontSize: "0.9rem",
              color: "var(--ink-soft)",
            }}
          >
            <span>
              <strong>{filteredProducts.length}</strong> {dict.products.results}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div
              style={{
                backgroundColor: "var(--surface)",
                padding: "4rem 2rem",
                borderRadius: "var(--radius)",
                textAlign: "center",
                border: "1px solid var(--line)",
              }}
            >
              <p style={{ fontSize: "1.2rem", color: "var(--ink)", fontWeight: 600, marginBottom: "0.5rem" }}>
                {dict.products.noResults}
              </p>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
                {lang === "fi"
                  ? "Kokeile poistaa jokin suodattimista tai hae toisella hakusanalla."
                  : lang === "fa"
                  ? "فیلترها را تغییر دهید یا واژه دیگری را جستجو کنید."
                  : "Try clearing some filters or searching for another term."}
              </p>
              <button onClick={clearAllFilters} className="btn btn--gold btn--sm">
                {dict.products.clear}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
                gap: "1.75rem",
              }}
            >
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .catalog-grid-layout {
            grid-template-columns: 1fr !important;
          }
          .mobile-filter-btn {
            display: inline-flex !important;
          }
          .filter-sidebar {
            display: none !important;
          }
          .filter-sidebar.open {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
