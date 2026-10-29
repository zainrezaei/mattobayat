"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Category, Locale, Message, Product, Reservation, ReservationStatus, Settings } from "@/lib/types";
import { formatPrice, formatSize, getDictionary, t, formatDate } from "@/i18n";
import { adminSignOut, deleteProduct, saveProduct, saveSettings, toggleMessageHandled, updateReservationStatus } from "@/lib/actions";
import { telLink } from "@/lib/utils";
import ArrowIcon from "@/components/ArrowIcon";
import AdminProductImageManager from "@/components/AdminProductImageManager";
import AdminSiteImagesManager from "@/components/AdminSiteImagesManager";
import AdminReviewsManager from "@/components/AdminReviewsManager";

export default function AdminDashboard({
  lang,
  products,
  categories,
  reservations,
  messages,
  settings,
  isDemo,
}: {
  lang: Locale;
  products: Product[];
  categories: Category[];
  reservations: Reservation[];
  messages: Message[];
  settings: Settings;
  isDemo: boolean;
}) {
  const dict = getDictionary(lang);
  const [tab, setTab] = useState<"reservations" | "products" | "messages" | "settings" | "media" | "reviews">("reservations");
  const [isPending, startTransition] = useTransition();

  // Product modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Opening hours state
  const [monFriClosed, setMonFriClosed] = useState(settings.hours.mon_fri.closed ?? false);
  const [satClosed, setSatClosed] = useState(settings.hours.sat.closed ?? false);
  const [sunClosed, setSunClosed] = useState(settings.hours.sun.closed ?? false);

  // Stats
  const newReservationsCount = reservations.filter((r) => r.status === "new").length;
  const activeProductsCount = products.filter((p) => p.active).length;
  const lowStockCount = products.filter((p) => p.stock <= 2 && p.stock > 0).length;
  const unhandledMessagesCount = messages.filter((m) => !m.handled).length;

  const handleStatusChange = (id: string, status: ReservationStatus) => {
    startTransition(async () => {
      await updateReservationStatus(id, status);
    });
  };

  const handleToggleMessage = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleMessageHandled(id, !current);
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm(dict.admin.confirmDelete)) {
      startTransition(async () => {
        await deleteProduct(id);
      });
    }
  };

  return (
    <div style={{ paddingBottom: "5rem" }}>
      {/* Demo Mode Notice */}
      {isDemo && (
        <div
          style={{
            backgroundColor: "var(--warning-50)",
            borderBottom: "1px solid #f0dcb4",
            padding: "0.85rem var(--gutter)",
            fontSize: "0.88rem",
            color: "var(--warning)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>⚠️</span>
            <strong>{dict.admin.demoMode}:</strong>
            <span>{dict.admin.demoText}</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            Supabase: schema.sql &amp; .env.local
          </span>
        </div>
      )}

      <div className="container" style={{ paddingTop: "2.5rem" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <span className="eyebrow">{dict.admin.title}</span>
            <h1 style={{ fontSize: "2.2rem", color: "var(--plum)", margin: 0 }}>
              {dict.admin.welcome}
            </h1>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link
              href={`/${lang}`}
              className="btn btn--outline btn--sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <ArrowIcon direction="back" size={14} />
              <span>{dict.admin.viewSite}</span>
            </Link>
            {!isDemo && (
              <button
                type="button"
                onClick={() => adminSignOut()}
                className="btn btn--outline btn--sm"
              >
                {lang === "fa" ? "خروج" : lang === "en" ? "Sign out" : "Kirjaudu ulos"}
              </button>
            )}
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsNewProduct(true);
                setTab("products");
              }}
              className="btn btn--gold btn--sm"
            >
              + {dict.admin.addProduct}
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
            gap: "1.25rem",
            marginBottom: "2.5rem",
          }}
        >
          <div
            onClick={() => setTab("reservations")}
            style={{
              backgroundColor: "var(--surface)",
              padding: "1.5rem",
              borderRadius: "var(--radius)",
              border: `1.5px solid ${tab === "reservations" ? "var(--plum)" : "var(--line)"}`,
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{dict.admin.statNewReservations}</div>
            <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--plum)", marginTop: "0.25rem" }}>
              {newReservationsCount}
            </div>
          </div>

          <div
            onClick={() => setTab("products")}
            style={{
              backgroundColor: "var(--surface)",
              padding: "1.5rem",
              borderRadius: "var(--radius)",
              border: `1.5px solid ${tab === "products" ? "var(--plum)" : "var(--line)"}`,
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{dict.admin.statActiveProducts}</div>
            <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--ink)", marginTop: "0.25rem" }}>
              {activeProductsCount}
            </div>
          </div>

          <div
            onClick={() => setTab("products")}
            style={{
              backgroundColor: "var(--surface)",
              padding: "1.5rem",
              borderRadius: "var(--radius)",
              border: "1.5px solid var(--line)",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{dict.admin.statLowStock}</div>
            <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--warning)", marginTop: "0.25rem" }}>
              {lowStockCount}
            </div>
          </div>

          <div
            onClick={() => setTab("messages")}
            style={{
              backgroundColor: "var(--surface)",
              padding: "1.5rem",
              borderRadius: "var(--radius)",
              border: `1.5px solid ${tab === "messages" ? "var(--plum)" : "var(--line)"}`,
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{dict.admin.statMessages}</div>
            <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--plum)", marginTop: "0.25rem" }}>
              {unhandledMessagesCount}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            borderBottom: "1px solid var(--line-strong)",
            marginBottom: "2rem",
            overflowX: "auto",
          }}
        >
          {[
            { id: "reservations", label: `${dict.admin.reservations} (${reservations.length})` },
            { id: "products", label: `${dict.admin.products} (${products.length})` },
            { id: "messages", label: `${dict.admin.messages} (${messages.length})` },
            { id: "settings", label: dict.admin.settings },
            { id: "media", label: lang === "fa" ? "تصاویر سایت" : lang === "en" ? "Site Pictures" : "Sivuston kuvat" },
            { id: "reviews", label: lang === "fa" ? "نظرات مشتریان" : lang === "en" ? "Reviews" : "Arvostelut" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as any)}
              style={{
                padding: "0.75rem 1.25rem",
                fontWeight: 600,
                fontSize: "0.95rem",
                borderBottom: `2px solid ${tab === item.id ? "var(--plum)" : "transparent"}`,
                color: tab === item.id ? "var(--plum)" : "var(--ink-soft)",
                backgroundColor: "transparent",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* TAB 1: RESERVATIONS */}
        {tab === "reservations" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {reservations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "var(--surface)", borderRadius: "var(--radius)" }}>
                <p style={{ color: "var(--muted)" }}>{dict.admin.none}</p>
              </div>
            ) : (
              reservations.map((res) => (
                <div
                  key={res.id}
                  style={{
                    backgroundColor: "var(--surface)",
                    padding: "1.5rem",
                    borderRadius: "var(--radius)",
                    border: `1.5px solid ${res.status === "new" ? "var(--plum)" : "var(--line)"}`,
                    boxShadow: "var(--shadow-sm)",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))",
                    gap: "1.5rem",
                    alignItems: "start",
                  }}
                >
                  {/* Customer info */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <span className={`badge badge--${res.status === "new" ? "plum" : res.status === "confirmed" ? "gold" : "success"}`}>
                        {dict.admin.status[res.status]}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {formatDate(res.created_at, lang)}
                      </span>
                    </div>

                    <strong style={{ fontSize: "1.2rem", display: "block", color: "var(--ink)" }}>
                      {res.name}
                    </strong>

                    <div style={{ marginTop: "0.5rem" }}>
                      <a
                        href={telLink(res.phone)}
                        className="btn btn--sm btn--gold"
                        style={{ display: "inline-flex", marginTop: "0.25rem", gap: "0.4rem" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{dict.admin.call}: {res.phone}</span>
                      </a>
                    </div>

                    {res.email && (
                      <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <span>{res.email}</span>
                      </div>
                    )}

                    <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: "0.4rem", display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
                        <polyline points="21 8 21 21 3 21 3 8" />
                        <rect x="1" y="3" width="22" height="5" />
                        <line x1="10" y1="12" x2="14" y2="12" />
                      </svg>
                      <div>
                        <strong>{res.fulfilment === "delivery" ? dict.reservation.delivery : dict.reservation.pickup}</strong>
                        {res.address && <div style={{ color: "var(--muted)" }}>{res.address}</div>}
                      </div>
                    </div>

                    {res.message && (
                      <div
                        style={{
                          marginTop: "0.75rem",
                          padding: "0.6rem 0.85rem",
                          backgroundColor: "var(--bg-alt)",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          fontStyle: "italic",
                        }}
                      >
                        &ldquo;{res.message}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Reserved items */}
                  <div>
                    <strong style={{ fontSize: "0.95rem", color: "var(--ink-soft)", display: "block", marginBottom: "0.5rem" }}>
                      {dict.admin.items} ({res.items.length})
                    </strong>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {res.items.map((it, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                          <span>
                            {it.qty} × {it.name}
                          </span>
                          <strong style={{ color: "var(--plum)" }}>
                            {it.price ? formatPrice(it.price * it.qty, lang) : dict.common.priceOnRequest}
                          </strong>
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "1px solid var(--line)",
                        paddingTop: "0.5rem",
                        marginTop: "0.75rem",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--plum)",
                      }}
                    >
                      <span>{dict.admin.total}:</span>
                      <span>{formatPrice(res.total, lang)}</span>
                    </div>
                  </div>

                  {/* Status Controller */}
                  <div>
                    <label className="label" style={{ marginBottom: "0.4rem", display: "block" }}>
                      {lang === "fi" ? "Päivitä tila" : lang === "fa" ? "وضعیت رزرو" : "Update Status"}
                    </label>
                    <select
                      value={res.status}
                      disabled={isPending}
                      onChange={(e) => handleStatusChange(res.id, e.target.value as ReservationStatus)}
                      className="select"
                    >
                      <option value="new">{dict.admin.status.new}</option>
                      <option value="confirmed">{dict.admin.status.confirmed}</option>
                      <option value="ready">{dict.admin.status.ready}</option>
                      <option value="completed">{dict.admin.status.completed}</option>
                      <option value="cancelled">{dict.admin.status.cancelled}</option>
                    </select>

                    {res.admin_note && (
                      <div style={{ marginTop: "0.5rem", fontSize: "0.82rem", color: "var(--muted)" }}>
                        📝 {res.admin_note}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {tab === "products" && (
          <div>
            {/* New / Edit Product Form */}
            {(isNewProduct || editingProduct) && (
              <div
                style={{
                  backgroundColor: "var(--surface)",
                  padding: "2rem",
                  borderRadius: "var(--radius)",
                  border: "2px solid var(--plum)",
                  marginBottom: "2.5rem",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.4rem", color: "var(--plum)", margin: 0 }}>
                    {editingProduct ? dict.admin.editProduct : dict.admin.newProduct}
                  </h3>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsNewProduct(false);
                    }}
                    className="btn btn--outline btn--sm"
                  >
                    ✕ {dict.admin.cancel}
                  </button>
                </div>

                <form
                  action={async (formData) => {
                    startTransition(async () => {
                      await saveProduct({}, formData);
                      setEditingProduct(null);
                      setIsNewProduct(false);
                    });
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
                >
                  <input type="hidden" name="id" value={editingProduct?.id || ""} />

                  {/* Slug */}
                  <div className="field">
                    <label className="label">
                      {dict.admin.slug} <span className="req">*</span>
                    </label>
                    <input
                      name="slug"
                      type="text"
                      required
                      defaultValue={editingProduct?.slug || ""}
                      className="input"
                      placeholder="esim. kashan-luumu-medaljonki"
                    />
                  </div>

                  {/* Multilingual Names */}
                  <div className="field-row">
                    <div className="field">
                      <label className="label">{dict.admin.name} (Suomi)</label>
                      <input
                        name="name_fi"
                        type="text"
                        defaultValue={editingProduct?.name.fi || ""}
                        className="input"
                        placeholder="Nimi suomeksi"
                      />
                    </div>
                    <div className="field">
                      <label className="label">{dict.admin.name} (English)</label>
                      <input
                        name="name_en"
                        type="text"
                        defaultValue={editingProduct?.name.en || ""}
                        className="input"
                        placeholder="Name in English"
                      />
                    </div>
                    <div className="field">
                      <label className="label">{dict.admin.name} (فارسی)</label>
                      <input
                        name="name_fa"
                        type="text"
                        defaultValue={editingProduct?.name.fa || ""}
                        className="input"
                        placeholder="نام به فارسی"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="field-row">
                    <div className="field">
                      <label className="label">{dict.admin.description} (Suomi)</label>
                      <textarea
                        name="desc_fi"
                        defaultValue={editingProduct?.description.fi || ""}
                        className="textarea"
                        style={{ minHeight: "70px" }}
                      />
                    </div>
                    <div className="field">
                      <label className="label">{dict.admin.description} (English)</label>
                      <textarea
                        name="desc_en"
                        defaultValue={editingProduct?.description.en || ""}
                        className="textarea"
                        style={{ minHeight: "70px" }}
                      />
                    </div>
                    <div className="field">
                      <label className="label">{dict.admin.description} (فارسی)</label>
                      <textarea
                        name="desc_fa"
                        defaultValue={editingProduct?.description.fa || ""}
                        className="textarea"
                        style={{ minHeight: "70px" }}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Pricing and Dimensions */}
                  <div className="field-row">
                    <div className="field">
                      <label className="label">{dict.admin.price}</label>
                      <input
                        name="price"
                        type="number"
                        step="1"
                        defaultValue={editingProduct?.price || ""}
                        className="input"
                        placeholder="esim. 450"
                      />
                    </div>
                    <div className="field">
                      <label className="label">{dict.admin.comparePrice}</label>
                      <input
                        name="compare_at_price"
                        type="number"
                        step="1"
                        defaultValue={editingProduct?.compare_at_price || ""}
                        className="input"
                        placeholder="esim. 550"
                      />
                    </div>
                    <div className="field">
                      <label className="label">{dict.admin.width}</label>
                      <input
                        name="width_cm"
                        type="number"
                        defaultValue={editingProduct?.width_cm || ""}
                        className="input"
                        placeholder="cm"
                      />
                    </div>
                    <div className="field">
                      <label className="label">{dict.admin.length}</label>
                      <input
                        name="length_cm"
                        type="number"
                        defaultValue={editingProduct?.length_cm || ""}
                        className="input"
                        placeholder="cm"
                      />
                    </div>
                  </div>

                  {/* Attributes: Category, Origin, Material, Shape */}
                  <div className="field-row">
                    <div className="field">
                      <label className="label">{dict.admin.category}</label>
                      <select name="category_id" defaultValue={editingProduct?.category_id || ""} className="select">
                        <option value="">{dict.admin.noCategory}</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {t(c.name, lang)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label className="label">{dict.products.origin}</label>
                      <select name="origin" defaultValue={editingProduct?.origin || "iran"} className="select">
                        <option value="iran">Iran</option>
                        <option value="turkey">Turkey</option>
                        <option value="afghanistan">Afghanistan</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="field">
                      <label className="label">{dict.products.material}</label>
                      <select name="material" defaultValue={editingProduct?.material || "wool"} className="select">
                        <option value="wool">Wool</option>
                        <option value="silk">Silk</option>
                        <option value="wool-silk">Wool &amp; Silk</option>
                        <option value="cotton">Cotton</option>
                        <option value="polyester">Polyester</option>
                        <option value="acrylic">Acrylic</option>
                      </select>
                    </div>

                    <div className="field">
                      <label className="label">{dict.products.shape}</label>
                      <select name="shape" defaultValue={editingProduct?.shape || "rectangle"} className="select">
                        <option value="rectangle">Rectangle</option>
                        <option value="runner">Runner</option>
                        <option value="round">Round</option>
                        <option value="square">Square</option>
                      </select>
                    </div>
                  </div>

                  {/* Multiple Product Images Manager */}
                  <div className="field">
                    <AdminProductImageManager
                      key={editingProduct?.id || (isNewProduct ? "new" : "none")}
                      initialImages={editingProduct?.images || []}
                      lang={lang}
                    />
                  </div>

                  {/* Stock & Switches */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center", paddingTop: "0.5rem" }}>
                    <div className="field" style={{ width: "120px" }}>
                      <label className="label">{dict.admin.stock}</label>
                      <input
                        name="stock"
                        type="number"
                        min="0"
                        defaultValue={editingProduct?.stock ?? 1}
                        className="input"
                      />
                    </div>

                    <label className="choice" style={{ cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        name="active"
                        defaultChecked={editingProduct ? editingProduct.active : true}
                        className="checkbox"
                      />
                      <strong>{dict.admin.visible}</strong>
                    </label>

                    <label className="choice" style={{ cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        name="featured"
                        defaultChecked={editingProduct ? editingProduct.featured : false}
                        className="checkbox"
                      />
                      <strong>{dict.admin.featured}</strong>
                    </label>
                  </div>

                  {/* Submit */}
                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button type="submit" disabled={isPending} className="btn btn--gold btn--lg">
                      {isPending ? dict.admin.saving : dict.admin.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setIsNewProduct(false);
                      }}
                      className="btn btn--outline btn--lg"
                    >
                      {dict.admin.cancel}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products List Table */}
            <div
              style={{
                backgroundColor: "var(--surface)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--line)",
                overflow: "hidden",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "start", fontSize: "0.92rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-alt)", borderBottom: "1px solid var(--line-strong)" }}>
                      <th style={{ padding: "0.85rem 1rem", textAlign: "start" }}>{dict.admin.images}</th>
                      <th style={{ padding: "0.85rem 1rem", textAlign: "start" }}>{dict.admin.name}</th>
                      <th style={{ padding: "0.85rem 1rem", textAlign: "start" }}>{dict.product.size}</th>
                      <th style={{ padding: "0.85rem 1rem", textAlign: "start" }}>{dict.admin.price}</th>
                      <th style={{ padding: "0.85rem 1rem", textAlign: "start" }}>{dict.admin.stock}</th>
                      <th style={{ padding: "0.85rem 1rem", textAlign: "start" }}>{dict.admin.visibility}</th>
                      <th style={{ padding: "0.85rem 1rem", textAlign: "end" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "0.75rem 1rem", width: "64px" }}>
                          <div style={{ position: "relative", width: "48px", height: "60px", borderRadius: "6px", overflow: "hidden", backgroundColor: "var(--bg-alt)" }}>
                            <Image src={p.images[0] || "/images/products/tabriz-red.jpg"} alt={t(p.name, lang)} fill sizes="48px" style={{ objectFit: "cover" }} />
                            {p.images.length > 1 && (
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: "2px",
                                  insetInlineEnd: "2px",
                                  backgroundColor: "rgba(0,0,0,0.75)",
                                  color: "#fff",
                                  fontSize: "0.62rem",
                                  fontWeight: 700,
                                  padding: "1px 4px",
                                  borderRadius: "3px",
                                  lineHeight: 1.1,
                                }}
                              >
                                {p.images.length}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <strong style={{ display: "block", color: "var(--ink)" }}>{t(p.name, lang)}</strong>
                          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>/{p.slug}</span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "var(--ink-soft)" }}>
                          {formatSize(p.width_cm, p.length_cm, lang)}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "var(--plum)" }}>
                          {p.price ? formatPrice(p.price, lang) : dict.common.priceOnRequest}
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span className={`badge ${p.stock <= 2 ? "badge--warning" : ""}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span className={`badge ${p.active ? "badge--success" : "badge--danger"}`}>
                            {p.active ? dict.admin.visible : dict.admin.hidden}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "end" }}>
                          <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsNewProduct(false);
                              }}
                              className="btn btn--outline btn--sm"
                            >
                              {dict.admin.edit}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="btn btn--danger btn--sm"
                            >
                              {dict.admin.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MESSAGES */}
        {tab === "messages" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "var(--surface)", borderRadius: "var(--radius)" }}>
                <p style={{ color: "var(--muted)" }}>{dict.admin.none}</p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    backgroundColor: "var(--surface)",
                    padding: "1.5rem",
                    borderRadius: "var(--radius)",
                    border: `1.5px solid ${m.handled ? "var(--line)" : "var(--plum)"}`,
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div>
                      <span className={`badge ${m.handled ? "" : "badge--plum"}`}>
                        {m.handled ? dict.admin.handled : dict.admin.unhandled}
                      </span>
                      <strong style={{ fontSize: "1.1rem", display: "block", color: "var(--ink)", marginTop: "0.3rem" }}>
                        {m.name} {m.subject ? `– ${m.subject}` : ""}
                      </strong>
                      <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                        {formatDate(m.created_at, lang)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleMessage(m.id, m.handled)}
                      className="btn btn--outline btn--sm"
                    >
                      {m.handled ? dict.admin.unhandled : dict.admin.markHandled}
                    </button>
                  </div>

                  <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
                    {m.body}
                  </p>

                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                    {m.phone && (
                      <a href={telLink(m.phone)} className="btn btn--gold btn--sm">
                        📞 {m.phone}
                      </a>
                    )}
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="btn btn--outline btn--sm">
                        ✉️ {m.email}
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {tab === "settings" && (
          <div
            style={{
              backgroundColor: "var(--surface)",
              padding: "2rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-sm)",
              maxWidth: "800px",
            }}
          >
            <form
              action={async (formData) => {
                startTransition(async () => {
                  await saveSettings({}, formData);
                  alert(dict.admin.saved);
                });
              }}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <h3 style={{ fontSize: "1.3rem", color: "var(--plum)", margin: 0 }}>
                {dict.admin.shopInfo}
              </h3>

              <div className="field-row">
                <div className="field">
                  <label className="label">{dict.admin.phone}</label>
                  <input name="phone" defaultValue={settings.phone} className="input" />
                </div>
                <div className="field">
                  <label className="label">{dict.admin.whatsapp}</label>
                  <input name="whatsapp" defaultValue={settings.whatsapp} className="input" />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="label">{dict.contact.email}</label>
                  <input name="email" defaultValue={settings.email} className="input" />
                </div>
                <div className="field">
                  <label className="label">{dict.admin.businessId}</label>
                  <input name="business_id" defaultValue={settings.business_id} className="input" />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="label">{dict.admin.address}</label>
                  <input name="address" defaultValue={settings.address} className="input" />
                </div>
                <div className="field">
                  <label className="label">{dict.admin.postal}</label>
                  <input name="postal" defaultValue={settings.postal} className="input" />
                </div>
                <div className="field">
                  <label className="label">{dict.admin.city}</label>
                  <input name="city" defaultValue={settings.city} className="input" />
                </div>
              </div>

              <h3 style={{ fontSize: "1.3rem", color: "var(--plum)", marginBlock: "1rem 0" }}>
                {dict.admin.openingHours}
              </h3>

              <div style={{ display: "grid", gap: "1.25rem" }}>
                {/* Mon - Fri */}
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: monFriClosed ? "var(--bg-alt)" : "var(--surface)",
                    border: "1px solid var(--line)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.95rem", color: "var(--ink)" }}>{dict.hours.monFri}</strong>
                    <label className="choice" style={{ cursor: "pointer", margin: 0 }}>
                      <input
                        type="checkbox"
                        name="mon_fri_closed"
                        checked={monFriClosed}
                        onChange={(e) => setMonFriClosed(e.target.checked)}
                        className="checkbox"
                      />
                      <span style={{ fontSize: "0.85rem", color: monFriClosed ? "var(--danger)" : "var(--ink-soft)", fontWeight: monFriClosed ? 700 : 500 }}>
                        {dict.hours.closed}
                      </span>
                    </label>
                  </div>
                  {!monFriClosed ? (
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>{dict.admin.open}</span>
                        <input name="mon_fri_open" defaultValue={settings.hours.mon_fri.open} className="input" placeholder="10:00" />
                      </div>
                      <span style={{ color: "var(--muted)", marginTop: "1rem" }}>–</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>{dict.admin.close}</span>
                        <input name="mon_fri_close" defaultValue={settings.hours.mon_fri.close} className="input" placeholder="19:00" />
                      </div>
                    </div>
                  ) : (
                    <input type="hidden" name="mon_fri_open" value={settings.hours.mon_fri.open} />
                  )}
                  {monFriClosed && <input type="hidden" name="mon_fri_close" value={settings.hours.mon_fri.close} />}
                </div>

                {/* Saturday */}
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: satClosed ? "var(--bg-alt)" : "var(--surface)",
                    border: "1px solid var(--line)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.95rem", color: "var(--ink)" }}>{dict.hours.sat}</strong>
                    <label className="choice" style={{ cursor: "pointer", margin: 0 }}>
                      <input
                        type="checkbox"
                        name="sat_closed"
                        checked={satClosed}
                        onChange={(e) => setSatClosed(e.target.checked)}
                        className="checkbox"
                      />
                      <span style={{ fontSize: "0.85rem", color: satClosed ? "var(--danger)" : "var(--ink-soft)", fontWeight: satClosed ? 700 : 500 }}>
                        {dict.hours.closed}
                      </span>
                    </label>
                  </div>
                  {!satClosed ? (
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>{dict.admin.open}</span>
                        <input name="sat_open" defaultValue={settings.hours.sat.open} className="input" placeholder="10:00" />
                      </div>
                      <span style={{ color: "var(--muted)", marginTop: "1rem" }}>–</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>{dict.admin.close}</span>
                        <input name="sat_close" defaultValue={settings.hours.sat.close} className="input" placeholder="19:00" />
                      </div>
                    </div>
                  ) : (
                    <input type="hidden" name="sat_open" value={settings.hours.sat.open} />
                  )}
                  {satClosed && <input type="hidden" name="sat_close" value={settings.hours.sat.close} />}
                </div>

                {/* Sunday */}
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: sunClosed ? "var(--bg-alt)" : "var(--surface)",
                    border: "1px solid var(--line)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.95rem", color: "var(--ink)" }}>{dict.hours.sun}</strong>
                    <label className="choice" style={{ cursor: "pointer", margin: 0 }}>
                      <input
                        type="checkbox"
                        name="sun_closed"
                        checked={sunClosed}
                        onChange={(e) => setSunClosed(e.target.checked)}
                        className="checkbox"
                      />
                      <span style={{ fontSize: "0.85rem", color: sunClosed ? "var(--danger)" : "var(--ink-soft)", fontWeight: sunClosed ? 700 : 500 }}>
                        {dict.hours.closed}
                      </span>
                    </label>
                  </div>
                  {!sunClosed ? (
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>{dict.admin.open}</span>
                        <input name="sun_open" defaultValue={settings.hours.sun.open} className="input" placeholder="11:00" />
                      </div>
                      <span style={{ color: "var(--muted)", marginTop: "1rem" }}>–</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>{dict.admin.close}</span>
                        <input name="sun_close" defaultValue={settings.hours.sun.close} className="input" placeholder="18:00" />
                      </div>
                    </div>
                  ) : (
                    <input type="hidden" name="sun_open" value={settings.hours.sun.open} />
                  )}
                  {sunClosed && <input type="hidden" name="sun_close" value={settings.hours.sun.close} />}
                </div>
              </div>

              <h3 style={{ fontSize: "1.3rem", color: "var(--plum)", marginBlock: "1rem 0" }}>
                {dict.admin.announcement}
              </h3>

              <label className="choice" style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="announcement_active"
                  defaultChecked={settings.announcement_active}
                  className="checkbox"
                />
                <strong>{dict.admin.showAnnouncement}</strong>
              </label>

              <div className="field">
                <label className="label">{dict.admin.announcement} (Suomi)</label>
                <input name="announcement_fi" defaultValue={settings.announcement.fi} className="input" />
              </div>
              <div className="field">
                <label className="label">{dict.admin.announcement} (English)</label>
                <input name="announcement_en" defaultValue={settings.announcement.en} className="input" />
              </div>
              <div className="field">
                <label className="label">{dict.admin.announcement} (فارسی)</label>
                <input name="announcement_fa" defaultValue={settings.announcement.fa} dir="rtl" className="input" />
              </div>

              <button type="submit" disabled={isPending} className="btn btn--gold btn--lg" style={{ alignSelf: "flex-start" }}>
                {isPending ? dict.admin.saving : dict.admin.save}
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: MEDIA / SITE PICTURES */}
        {tab === "media" && (
          <AdminSiteImagesManager settings={settings} lang={lang} />
        )}

        {/* TAB 6: CUSTOMER & GOOGLE REVIEWS */}
        {tab === "reviews" && (
          <AdminReviewsManager settings={settings} lang={lang} />
        )}
      </div>
    </div>
  );
}
