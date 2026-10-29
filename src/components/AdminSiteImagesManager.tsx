"use client";

import React, { useState, useRef, useTransition } from "react";
import Image from "next/image";
import type { Locale, Settings, SiteImages } from "@/lib/types";
import { saveSettings } from "@/lib/actions";

interface AdminSiteImagesManagerProps {
  settings: Settings;
  lang: Locale;
}

type ImageSlot = {
  key: string;
  labelFi: string;
  labelEn: string;
  labelFa: string;
  descFi: string;
  descEn: string;
  descFa: string;
  defaultPath: string;
  recommendedAspect: string;
};

const SITE_IMAGE_SLOTS: ImageSlot[] = [
  {
    key: "hero",
    labelFi: "Etusivun Hero-kuva",
    labelEn: "Homepage Hero Banner",
    labelFa: "تصویر بنر اصلی صفحه نخست (Hero)",
    descFi: "Näkyy etusivun yläosassa pääbannerina sekä sosiaalisen median jakokuvana (OpenGraph).",
    descEn: "Appears at the top of the homepage hero section and social share preview (OpenGraph).",
    descFa: "در بالای صفحه اصلی و همچنین تصویر پیش‌نمایش اشتراک‌گذاری در شبکه‌های اجتماعی نمایش داده می‌شود.",
    defaultPath: "/images/site/hero.jpg",
    recommendedAspect: "4:3 tai 16:9",
  },
  {
    key: "showroom",
    labelFi: "Myymälän pääkuva (Putkitie 6)",
    labelEn: "Main Showroom Photo",
    labelFa: "تصویر اصلی فروشگاه (Putkitie 6)",
    descFi: "Näkyy etusivun myymäläesittelyssä sekä 'Tietoa meistä' -sivulla.",
    descEn: "Displayed in the homepage showroom showcase and on the 'About us' page.",
    descFa: "در بخش معرفی فروشگاه در صفحه اصلی و صفحه 'درباره ما' نمایش داده می‌شود.",
    defaultPath: "/images/site/showroom.jpg",
    recommendedAspect: "4:3",
  },
  {
    key: "rolls",
    labelFi: "Mattorullat & Varasto",
    labelEn: "Carpet Rolls & Stock",
    labelFa: "رول‌های فرش و انبار",
    descFi: "Näkyy etusivun myymäläosion kuvagalleriassa.",
    descEn: "Appears in the showroom gallery grid on the homepage.",
    descFa: "در گالری معرفی فروشگاه در صفحه اصلی نمایش داده می‌شود.",
    defaultPath: "/images/site/rolls.jpg",
    recommendedAspect: "1:1 (Neliö)",
  },
  {
    key: "detail",
    labelFi: "Käsityö & Solmut (Yksityiskohta)",
    labelEn: "Craft & Knot Texture Detail",
    labelFa: "جزئیات بافت و گره‌های دستباف",
    descFi: "Näkyy etusivun myymälägallerian yksityiskohtana sekä 'Matto-oppaassa'.",
    descEn: "Displayed in the homepage gallery and in the 'Carpet Care Guide'.",
    descFa: "در گالری صفحه اصلی و همچنین در راهنمای مراقبت از فرش نمایش داده می‌شود.",
    defaultPath: "/images/site/detail.jpg",
    recommendedAspect: "1:1 tai 4:3",
  },
  {
    key: "boutique",
    labelFi: "Boutique & Sisäänkäynti",
    labelEn: "Boutique & Storefront",
    labelFa: "ورودی و ویترین بوتیک",
    descFi: "Käytetään myymälän tunnelmakuvana ja kampanjamateriaaleissa.",
    descEn: "Used for showroom atmosphere and boutique promotional sections.",
    descFa: "برای نمایش فضای داخلی فروشگاه و بنرهای معرفی استفاده می‌شود.",
    defaultPath: "/images/site/boutique.jpg",
    recommendedAspect: "4:3",
  },
];

export default function AdminSiteImagesManager({
  settings,
  lang,
}: AdminSiteImagesManagerProps) {
  const [siteImages, setSiteImages] = useState<Record<string, string>>({
    hero: settings.site_images?.hero || "/images/site/hero.jpg",
    showroom: settings.site_images?.showroom || "/images/site/showroom.jpg",
    rolls: settings.site_images?.rolls || "/images/site/rolls.jpg",
    detail: settings.site_images?.detail || "/images/site/detail.jpg",
    boutique: settings.site_images?.boutique || "/images/site/boutique.jpg",
    ...(settings.site_images || {}),
  });

  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUploadForSlot = async (slotKey: string, file: File) => {
    setUploadingSlot(slotKey);
    setNotification(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "site");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Kuvan lataus epäonnistui");
      }

      if (data.url) {
        setSiteImages((prev) => ({
          ...prev,
          [slotKey]: data.url,
        }));
        setNotification({
          type: "success",
          msg:
            lang === "fa"
              ? "تصویر با موفقیت بارگذاری شد! برای اعمال تغییرات، دکمه ذخیره را بزنید."
              : lang === "en"
              ? "Image uploaded successfully! Click save to apply changes."
              : "Kuva ladattu onnistuneesti! Napsauta 'Tallenna' ottaaksesi muutokset käyttöön.",
        });
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setNotification({
        type: "error",
        msg: err.message || "Latausvirhe",
      });
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleResetSlot = (slotKey: string, defaultPath: string) => {
    setSiteImages((prev) => ({
      ...prev,
      [slotKey]: defaultPath,
    }));
  };

  const handleUrlChange = (slotKey: string, url: string) => {
    setSiteImages((prev) => ({
      ...prev,
      [slotKey]: url,
    }));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // Build form data preserving current settings and updating site_images
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
      if (settings.hours.mon_fri.closed) formData.append("mon_fri_closed", "on");

      formData.append("sat_open", settings.hours.sat.open);
      formData.append("sat_close", settings.hours.sat.close);
      if (settings.hours.sat.closed) formData.append("sat_closed", "on");

      formData.append("sun_open", settings.hours.sun.open);
      formData.append("sun_close", settings.hours.sun.close);
      if (settings.hours.sun.closed) formData.append("sun_closed", "on");

      formData.append("site_images_json", JSON.stringify(siteImages));

      const res = await saveSettings({}, formData);
      if (res.error) {
        setNotification({ type: "error", msg: res.error });
      } else {
        setNotification({
          type: "success",
          msg:
            lang === "fa"
              ? "تصاویر سایت با موفقیت ذخیره شدند و اکنون در صفحات سایت فعال هستند."
              : lang === "en"
              ? "Site pictures saved successfully and are now live across all pages."
              : "Sivuston kuvat tallennettu onnistuneesti ja päivitetty sivuille!",
        });
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          padding: "1.75rem",
          borderRadius: "var(--radius)",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.5rem", color: "var(--plum)", margin: 0 }}>
            {lang === "fa"
              ? "مدیریت تصاویر کل وب‌سایت"
              : lang === "en"
              ? "Website Media & Pictures Manager"
              : "Sivuston kuvien hallinta"}
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.92rem", margin: "0.35rem 0 0 0" }}>
            {lang === "fa"
              ? "تمام تصاویر وب‌سایت (تصویر بنر اصلی، فروشگاه، رول‌های فرش و...) را از اینجا بدون نیاز به سوپابیس ویرایش و تعویض کنید."
              : lang === "en"
              ? "Edit and replace all site pictures (hero banner, showroom, carpet rolls, texture details) right here."
              : "Vaihda sivuston pääkuvat (hero-banneri, myymälä, rullat, käsityön yksityiskohdat) suoraan tästä."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isPending}
          className="btn btn--gold btn--lg"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>
            {isPending
              ? lang === "fa"
                ? "در حال ذخیره..."
                : lang === "en"
                ? "Saving..."
                : "Tallennetaan..."
              : lang === "fa"
              ? "ذخیره تغییرات تصاویر"
              : lang === "en"
              ? "Save all picture changes"
              : "Tallenna sivuston kuvat"}
          </span>
        </button>
      </div>

      {notification && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: notification.type === "success" ? "var(--success-50)" : "var(--danger-50)",
            color: notification.type === "success" ? "var(--success)" : "var(--danger)",
            border: `1px solid ${notification.type === "success" ? "rgba(31,143,95,0.3)" : "rgba(224,49,49,0.3)"}`,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.95rem",
            fontWeight: 500,
          }}
        >
          <span>{notification.type === "success" ? "✓" : "⚠️"}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Grid of Site Image Slots */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
          gap: "1.75rem",
        }}
      >
        {SITE_IMAGE_SLOTS.map((slot) => {
          const currentUrl = siteImages[slot.key] || slot.defaultPath;
          const isSlotUploading = uploadingSlot === slot.key;

          return (
            <div
              key={slot.key}
              style={{
                backgroundColor: "var(--surface)",
                borderRadius: "var(--radius)",
                border: "1.5px solid var(--line)",
                overflow: "hidden",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Visual Preview */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 10",
                  backgroundColor: "var(--bg-alt)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <Image
                  src={currentUrl}
                  alt={slot.labelEn}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />

                {isSlotUploading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.65)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      gap: "0.5rem",
                      zIndex: 3,
                    }}
                  >
                    <span>⏳ {lang === "fa" ? "در حال آپلود..." : "Ladataan kuvaa..."}</span>
                  </div>
                )}
              </div>

              {/* Slot Details and Controls */}
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.15rem", color: "var(--plum)", margin: 0, fontWeight: 700 }}>
                      {lang === "fa" ? slot.labelFa : lang === "en" ? slot.labelEn : slot.labelFi}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        padding: "2px 8px",
                        backgroundColor: "var(--bg-alt)",
                        color: "var(--muted)",
                        borderRadius: "999px",
                        border: "1px solid var(--line)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {slot.recommendedAspect}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", margin: "0.35rem 0 0 0", lineHeight: 1.5 }}>
                    {lang === "fa" ? slot.descFa : lang === "en" ? slot.descEn : slot.descFi}
                  </p>
                </div>

                {/* Upload Button & Reset */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    ref={(el) => {
                      fileInputRefs.current[slot.key] = el;
                    }}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadForSlot(slot.key, file);
                    }}
                  />

                  <button
                    type="button"
                    disabled={isSlotUploading}
                    onClick={() => fileInputRefs.current[slot.key]?.click()}
                    className="btn btn--gold btn--sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>
                      {isSlotUploading
                        ? lang === "fa"
                          ? "در حال آپلود..."
                          : "Ladataan..."
                        : lang === "fa"
                        ? "انتخاب و آپلود عکس جدید"
                        : lang === "en"
                        ? "Upload new picture"
                        : "Lataa uusi kuva"}
                    </span>
                  </button>

                  {currentUrl !== slot.defaultPath && (
                    <button
                      type="button"
                      onClick={() => handleResetSlot(slot.key, slot.defaultPath)}
                      className="btn btn--outline btn--sm"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {lang === "fa" ? "بازنشانی به پیش‌فرض" : lang === "en" ? "Reset default" : "Palauta oletus"}
                    </button>
                  )}
                </div>

                {/* Direct URL input */}
                <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                  <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: "0.2rem" }}>
                    {lang === "fa" ? "آدرس مستقیم فایل (URL):" : lang === "en" ? "Image URL / Path:" : "Kuvan osoite / polku:"}
                  </label>
                  <input
                    type="text"
                    value={currentUrl}
                    onChange={(e) => handleUrlChange(slot.key, e.target.value)}
                    className="input"
                    style={{ fontSize: "0.82rem", height: "34px", backgroundColor: "var(--bg-alt)" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
