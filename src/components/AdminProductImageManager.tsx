"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import type { Locale } from "@/lib/types";

interface AdminProductImageManagerProps {
  initialImages: string[];
  lang: Locale;
  onChange?: (images: string[]) => void;
}

export default function AdminProductImageManager({
  initialImages,
  lang,
  onChange,
}: AdminProductImageManagerProps) {
  const [images, setImages] = useState<string[]>(
    initialImages && initialImages.length > 0
      ? initialImages
      : ["/images/products/tabriz-red.jpg"]
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateImages = (newImages: string[]) => {
    setImages(newImages);
    if (onChange) onChange(newImages);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "products");

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || `Tiedoston ${file.name} lataus epäonnistui`);
        }

        if (data.url) {
          uploadedUrls.push(data.url);
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        setUploadError(err.message || "Kuvan lataaminen epäonnistui.");
      }
    }

    if (uploadedUrls.length > 0) {
      // If previous list had only the fallback single placeholder, replace it
      const currentFiltered =
        images.length === 1 && images[0] === "/images/products/tabriz-red.jpg"
          ? []
          : [...images];
      updateImages([...currentFiltered, ...uploadedUrls]);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    updateImages([...images, trimmed]);
    setUrlInput("");
  };

  const handleMakePrimary = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    updateImages([item, ...rest]);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updateImages(updated);
  };

  const handleRemove = (index: number) => {
    if (images.length === 1) {
      if (
        confirm(
          lang === "fa"
            ? "حداقل یک تصویر برای محصول لازم است. آیا مایلید تصویر پیش‌فرض جایگزین شود؟"
            : lang === "en"
            ? "At least one image is required. Reset to default carpet image?"
            : "Tuotteella on oltava vähintään yksi kuva. Palautetaanko oletuskuva?"
        )
      ) {
        updateImages(["/images/products/tabriz-red.jpg"]);
      }
      return;
    }
    const updated = images.filter((_, idx) => idx !== index);
    updateImages(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Hidden JSON input that sends all image URLs with form submit */}
      <input type="hidden" name="images_json" value={JSON.stringify(images)} />
      {images.map((img, idx) => (
        <input key={idx} type="hidden" name="images" value={img} />
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <label className="label" style={{ marginBottom: "0.2rem" }}>
            {lang === "fa"
              ? "تصاویر محصول (چندین عکس قابل انتخاب است)"
              : lang === "en"
              ? "Product pictures (Multiple images allowed)"
              : "Tuotteen kuvat (Voit lisätä useita kuvia)"}
          </label>
          <span className="hint" style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
            {lang === "fa"
              ? "اولین تصویر به عنوان تصویر اصلی نمایش داده می‌شود. می‌توانید ترتیب تصاویر را جابجا کنید."
              : lang === "en"
              ? "The first image is the main cover. You can reorder and set any image as cover."
              : "Ensimmäinen kuva toimii pääkuvana. Voit muuttaa kuvien järjestystä napeilla."}
          </span>
        </div>

        {/* Upload Action Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn btn--gold btn--sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>
              {isUploading
                ? lang === "fa"
                  ? "در حال آپلود..."
                  : lang === "en"
                  ? "Uploading..."
                  : "Ladataan..."
                : lang === "fa"
                ? "+ آپلود عکس از دستگاه"
                : lang === "en"
                ? "+ Upload images"
                : "+ Lataa kuvia laitteelta"}
            </span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div style={{ padding: "0.6rem 0.9rem", backgroundColor: "var(--danger-50)", color: "var(--danger)", borderRadius: "6px", fontSize: "0.85rem" }}>
          ⚠️ {uploadError}
        </div>
      )}

      {/* Grid of Images */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: "0.85rem",
          padding: "1rem",
          backgroundColor: "var(--bg-alt)",
          borderRadius: "var(--radius)",
          border: "1px dashed var(--line-strong)",
          minHeight: "160px",
          alignItems: "start",
        }}
      >
        {images.map((imgUrl, idx) => (
          <div
            key={idx}
            style={{
              position: "relative",
              borderRadius: "8px",
              overflow: "hidden",
              border: idx === 0 ? "2.5px solid var(--plum)" : "1.5px solid var(--line)",
              backgroundColor: "var(--surface)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Image Preview */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 4", backgroundColor: "#000" }}>
              <Image
                src={imgUrl}
                alt={`Product image ${idx + 1}`}
                fill
                sizes="150px"
                style={{ objectFit: "cover" }}
              />

              {/* Cover badge */}
              {idx === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "6px",
                    insetInlineStart: "6px",
                    backgroundColor: "var(--plum)",
                    color: "#fff",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    zIndex: 2,
                  }}
                >
                  {lang === "fa" ? "تصویر اصلی" : lang === "en" ? "Cover" : "Pääkuva"}
                </div>
              )}

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                title={lang === "fa" ? "حذف عکس" : lang === "en" ? "Remove picture" : "Poista kuva"}
                aria-label="Remove picture"
                style={{
                  position: "absolute",
                  top: "6px",
                  insetInlineEnd: "6px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  border: "none",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  zIndex: 2,
                }}
              >
                ✕
              </button>
            </div>

            {/* Quick Actions (Move & Make Cover) */}
            <div
              style={{
                padding: "0.35rem 0.45rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "var(--surface)",
                borderTop: "1px solid var(--line)",
                fontSize: "0.75rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.2rem" }}>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: idx === 0 ? "default" : "pointer",
                    opacity: idx === 0 ? 0.3 : 1,
                    padding: "2px 4px",
                    fontSize: "0.85rem",
                  }}
                  title="Move earlier"
                >
                  ◀
                </button>
                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: idx === images.length - 1 ? "default" : "pointer",
                    opacity: idx === images.length - 1 ? 0.3 : 1,
                    padding: "2px 4px",
                    fontSize: "0.85rem",
                  }}
                  title="Move later"
                >
                  ▶
                </button>
              </div>

              {idx !== 0 && (
                <button
                  type="button"
                  onClick={() => handleMakePrimary(idx)}
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--plum)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.72rem",
                    padding: "2px 4px",
                  }}
                >
                  {lang === "fa" ? "اصلی" : lang === "en" ? "Make cover" : "Pääkuvaksi"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Manual URL input option (optional helper) */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={
            lang === "fa"
              ? "یا آدرس اینترنتی تصویر را اینجا وارد کنید (URL)..."
              : lang === "en"
              ? "Or paste image URL here..."
              : "Tai liitä kuvan verkko-osoite (URL) tähän..."
          }
          className="input"
          style={{ fontSize: "0.85rem", height: "38px" }}
        />
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlInput.trim()}
          className="btn btn--outline btn--sm"
          style={{ whiteSpace: "nowrap", height: "38px" }}
        >
          {lang === "fa" ? "افزودن" : lang === "en" ? "Add URL" : "Lisää linkki"}
        </button>
      </div>
    </div>
  );
}
