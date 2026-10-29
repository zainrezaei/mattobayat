"use client";

import React, { useState, useTransition } from "react";
import type { Locale, Review, Settings } from "@/lib/types";
import { DEMO_REVIEWS } from "@/lib/demo-data";
import { saveSettings } from "@/lib/actions";
import ArrowIcon from "@/components/ArrowIcon";

type AdminReviewsManagerProps = {
  settings: Settings;
  lang: Locale;
};

export default function AdminReviewsManager({ settings, lang }: AdminReviewsManagerProps) {
  const [reviews, setReviews] = useState<Review[]>(
    settings.reviews && settings.reviews.length > 0 ? settings.reviews : DEMO_REVIEWS
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const isFa = lang === "fa";
  const isEn = lang === "en";

  const handleAddReview = () => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: isFa ? "مشتری جدید" : isEn ? "New Reviewer" : "Uusi Asiakas",
      rating: 5,
      date: {
        fi: "Hiljattain",
        en: "Recently",
        fa: "اخیراً",
      },
      highlight: {
        fi: "Erinomainen palvelu ja upeat matot",
        en: "Excellent service and stunning rugs",
        fa: "خدمات عالی و فرش‌های بسیار زیبا",
      },
      text: {
        fi: "Kirjoita asiakkaan aito palaute tähän...",
        en: "Write customer's feedback here...",
        fa: "نظر واقعی مشتری را اینجا بنویسید...",
      },
      source: "google",
    };
    setReviews([newRev, ...reviews]);
    setEditingId(newRev.id);
  };

  const handleDelete = (id: string) => {
    if (confirm(isFa ? "آیا از حذف این نظر مطمئن هستید؟" : isEn ? "Delete this review?" : "Poistetaanko tämä arvostelu?")) {
      setReviews(reviews.filter((r) => r.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const handleUpdate = (id: string, patch: Partial<Review>) => {
    setReviews(
      reviews.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          ...patch,
          date: { ...r.date, ...(patch.date || {}) },
          highlight: { ...(r.highlight || { fi: "", en: "", fa: "" }), ...(patch.highlight || {}) },
          text: { ...r.text, ...(patch.text || {}) },
        };
      })
    );
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reviews.length) return;
    const updated = [...reviews];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setReviews(updated);
  };

  const handleSaveAll = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("phone", settings.phone);
      formData.append("whatsapp", settings.whatsapp);
      formData.append("email", settings.email);
      formData.append("address", settings.address);
      formData.append("postal", settings.postal);
      formData.append("city", settings.city);
      formData.append("business_id", settings.business_id);
      formData.append("instagram", settings.instagram);
      formData.append("facebook", settings.facebook);
      formData.append("tiktok", settings.tiktok);

      formData.append("announcement_fi", settings.announcement.fi);
      formData.append("announcement_en", settings.announcement.en);
      formData.append("announcement_fa", settings.announcement.fa);
      if (settings.announcement_active) formData.append("announcement_active", "on");

      formData.append("mon_fri_open", settings.hours.mon_fri.open);
      formData.append("mon_fri_close", settings.hours.mon_fri.close);
      if (settings.hours.mon_fri.closed) formData.append("mon_fri_closed", "true");

      formData.append("sat_open", settings.hours.sat.open);
      formData.append("sat_close", settings.hours.sat.close);
      if (settings.hours.sat.closed) formData.append("sat_closed", "true");

      formData.append("sun_open", settings.hours.sun.open);
      formData.append("sun_close", settings.hours.sun.close);
      if (settings.hours.sun.closed) formData.append("sun_closed", "true");

      formData.append("site_images_json", JSON.stringify(settings.site_images || {}));
      formData.append("reviews_json", JSON.stringify(reviews));

      const res = await saveSettings({}, formData);
      if (res?.error) {
        setFeedback(`Virhe: ${res.error}`);
      } else {
        setFeedback(
          isFa
            ? "نظرات با موفقیت ذخیره شدند و در صفحه اصلی نمایش داده می‌شوند!"
            : isEn
            ? "Reviews saved successfully and updated on the homepage!"
            : "Arvostelut tallennettu onnistuneesti ja päivitetty etusivulle!"
        );
        setTimeout(() => setFeedback(null), 4000);
      }
    });
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `Matto Bayat, ${settings.address}, ${settings.postal} ${settings.city}`
  )}`;

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        padding: "clamp(1.5rem, 3vw, 2.5rem)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "1.75rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.5rem", color: "var(--plum)", margin: 0 }}>
            {isFa ? "مدیریت نظرات گوگل مپ و مشتریان" : isEn ? "Customer & Google Maps Reviews" : "Google Maps -arvostelut ja asiakaspalautteet"}
          </h2>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", marginTop: "0.35rem", marginBottom: 0 }}>
            {isFa
              ? "نظرات نمایش‌داده‌شده در کاروسل صفحه اصلی را مدیریت و ویرایش کنید. می‌توانید بازخوردهای جدید گوگل را اضافه کنید."
              : isEn
              ? "Manage reviews shown in the homepage carousel. You can add, edit, or reorder real reviews from Google Maps."
              : "Hallinnoi etusivun karusellissa näkyviä Google Maps -arvosteluja. Voit lisätä uusia palautteita suoraan Google Mapsista ja järjestää niitä."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--outline"
            style={{ fontSize: "0.88rem" }}
          >
            <span>Google Maps</span> ↗
          </a>
          <button
            type="button"
            onClick={handleAddReview}
            className="btn btn--gold"
            style={{ fontSize: "0.88rem" }}
          >
            + {isFa ? "افزودن نظر جدید" : isEn ? "Add New Review" : "Lisää uusi arvostelu"}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: feedback.startsWith("Virhe") ? "var(--danger-50)" : "var(--success-50)",
            color: feedback.startsWith("Virhe") ? "var(--danger)" : "var(--success)",
            fontWeight: 600,
            fontSize: "0.95rem",
            border: `1px solid ${feedback.startsWith("Virhe") ? "rgba(164, 51, 54, 0.2)" : "rgba(40, 109, 76, 0.2)"}`,
          }}
        >
          {feedback}
        </div>
      )}

      {/* Reviews List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--muted)" }}>
            {isFa ? "هنوز نظری ثبت نشده است." : isEn ? "No reviews yet." : "Ei vielä arvosteluja."}
          </div>
        ) : (
          reviews.map((rev, index) => {
            const isEditing = editingId === rev.id;

            return (
              <div
                key={rev.id}
                style={{
                  border: `1.5px solid ${isEditing ? "var(--plum)" : "var(--line)"}`,
                  borderRadius: "var(--radius)",
                  padding: "1.25rem 1.5rem",
                  backgroundColor: isEditing ? "var(--bg-alt)" : "var(--surface)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Summary Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    {/* Position and Star Badge */}
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "var(--gold-50)",
                        color: "var(--gold)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </span>

                    <div>
                      <strong style={{ fontSize: "1.05rem", color: "var(--ink)", display: "block" }}>
                        {rev.author}
                      </strong>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "var(--muted)" }}>
                        <span>{"★".repeat(rev.rating)}</span>
                        <span>•</span>
                        <span>{rev.date.fi || rev.date.en || rev.date.fa}</span>
                        <span>•</span>
                        <span style={{ color: "var(--success)", fontWeight: 600 }}>Google Maps</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      style={{
                        padding: "0.3rem 0.6rem",
                        border: "1px solid var(--line-strong)",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--surface)",
                        cursor: index === 0 ? "not-allowed" : "pointer",
                        opacity: index === 0 ? 0.4 : 1,
                      }}
                      title="Siirrä ylemmäs"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={index === reviews.length - 1}
                      onClick={() => handleMove(index, "down")}
                      style={{
                        padding: "0.3rem 0.6rem",
                        border: "1px solid var(--line-strong)",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--surface)",
                        cursor: index === reviews.length - 1 ? "not-allowed" : "pointer",
                        opacity: index === reviews.length - 1 ? 0.4 : 1,
                      }}
                      title="Siirrä alemmas"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(isEditing ? null : rev.id)}
                      className="btn btn--outline"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.82rem" }}
                    >
                      {isEditing
                        ? isFa
                          ? "بستن ویرایش"
                          : isEn
                          ? "Done"
                          : "Sulje"
                        : isFa
                        ? "ویرایش"
                        : isEn
                        ? "Edit"
                        : "Muokkaa"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id)}
                      style={{
                        padding: "0.35rem 0.6rem",
                        border: "1px solid rgba(164, 51, 54, 0.2)",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--danger-50)",
                        color: "var(--danger)",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                      }}
                      title="Poista"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Edit Form when expanded */}
                {isEditing && (
                  <div
                    style={{
                      marginTop: "1.25rem",
                      paddingTop: "1.25rem",
                      borderTop: "1px solid var(--line)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div className="field-row">
                      <div className="field">
                        <label className="label">
                          {isFa ? "نام نویسنده / مشتری" : isEn ? "Author / Customer Name" : "Kirjoittajan nimi"}
                        </label>
                        <input
                          type="text"
                          value={rev.author}
                          onChange={(e) => handleUpdate(rev.id, { author: e.target.value })}
                          className="input"
                        />
                      </div>

                      <div className="field" style={{ maxWidth: "160px" }}>
                        <label className="label">
                          {isFa ? "امتیاز (ستاره)" : isEn ? "Rating (stars)" : "Arvosana (tähdet)"}
                        </label>
                        <select
                          value={rev.rating}
                          onChange={(e) => handleUpdate(rev.id, { rating: Number(e.target.value) })}
                          className="select"
                        >
                          <option value={5}>★★★★★ (5)</option>
                          <option value={4}>★★★★☆ (4)</option>
                          <option value={3}>★★★☆☆ (3)</option>
                          <option value={2}>★★☆☆☆ (2)</option>
                          <option value={1}>★☆☆☆☆ (1)</option>
                        </select>
                      </div>
                    </div>

                    {/* Date strings */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                      <div className="field">
                        <label className="label">Päivämäärä (Suomi)</label>
                        <input
                          type="text"
                          value={rev.date.fi || ""}
                          placeholder="esim. 2 viikkoa sitten"
                          onChange={(e) => handleUpdate(rev.id, { date: { ...rev.date, fi: e.target.value } })}
                          className="input"
                        />
                      </div>
                      <div className="field">
                        <label className="label">Date (English)</label>
                        <input
                          type="text"
                          value={rev.date.en || ""}
                          placeholder="e.g. 2 weeks ago"
                          onChange={(e) => handleUpdate(rev.id, { date: { ...rev.date, en: e.target.value } })}
                          className="input"
                        />
                      </div>
                      <div className="field">
                        <label className="label">تاریخ (فارسی)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={rev.date.fa || ""}
                          placeholder="مثلاً ۲ هفته پیش"
                          onChange={(e) => handleUpdate(rev.id, { date: { ...rev.date, fa: e.target.value } })}
                          className="input"
                        />
                      </div>
                    </div>

                    {/* Highlight quotes */}
                    {(() => {
                      const hl = rev.highlight || { fi: "", en: "", fa: "" };
                      return (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                          <div className="field">
                            <label className="label">Otsikko / Tiivistelmä (Suomi)</label>
                            <input
                              type="text"
                              value={hl.fi}
                              placeholder="esim. Upea valikoima ja erinomainen palvelu"
                              onChange={(e) => handleUpdate(rev.id, { highlight: { ...hl, fi: e.target.value } })}
                              className="input"
                            />
                          </div>
                          <div className="field">
                            <label className="label">Highlight / Title (English)</label>
                            <input
                              type="text"
                              value={hl.en}
                              placeholder="e.g. Stunning selection and great service"
                              onChange={(e) => handleUpdate(rev.id, { highlight: { ...hl, en: e.target.value } })}
                              className="input"
                            />
                          </div>
                          <div className="field">
                            <label className="label">تیتر کوتاه (فارسی)</label>
                            <input
                              type="text"
                              dir="rtl"
                              value={hl.fa}
                              placeholder="مثلاً تنوع بی‌نظیر و برخورد عالی"
                              onChange={(e) => handleUpdate(rev.id, { highlight: { ...hl, fa: e.target.value } })}
                              className="input"
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Review texts */}
                    <div className="field">
                      <label className="label">Arvosteluteksti (Suomi)</label>
                      <textarea
                        rows={3}
                        value={rev.text.fi || ""}
                        onChange={(e) => handleUpdate(rev.id, { text: { ...rev.text, fi: e.target.value } })}
                        className="textarea"
                      />
                    </div>
                    <div className="field">
                      <label className="label">Review Text (English)</label>
                      <textarea
                        rows={3}
                        value={rev.text.en || ""}
                        onChange={(e) => handleUpdate(rev.id, { text: { ...rev.text, en: e.target.value } })}
                        className="textarea"
                      />
                    </div>
                    <div className="field">
                      <label className="label">متن نظر (فارسی)</label>
                      <textarea
                        rows={3}
                        dir="rtl"
                        value={rev.text.fa || ""}
                        onChange={(e) => handleUpdate(rev.id, { text: { ...rev.text, fa: e.target.value } })}
                        className="textarea"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Save Button */}
      <div
        style={{
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--line)",
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
        }}
      >
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isPending}
          className="btn btn--gold btn--lg"
        >
          {isPending ? (
            isFa ? "در حال ذخیره..." : isEn ? "Saving..." : "Tallennetaan..."
          ) : (
            <>
              <span>{isFa ? "ذخیره تغییرات نظرات" : isEn ? "Save All Reviews" : "Tallenna kaikki arvostelut"}</span>
              <ArrowIcon direction="forward" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
