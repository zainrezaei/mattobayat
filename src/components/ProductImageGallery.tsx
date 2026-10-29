"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
  hasDiscount?: boolean;
  saleLabel?: string;
}

export default function ProductImageGallery({
  images,
  title,
  hasDiscount,
  saleLabel = "Tarjous",
}: ProductImageGalleryProps) {
  const safeImages = images && images.length > 0 ? images : ["/images/products/tabriz-red.jpg"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Keep index within bounds if images change
  useEffect(() => {
    if (activeIndex >= safeImages.length) {
      setActiveIndex(0);
    }
  }, [safeImages.length, activeIndex]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % safeImages.length);
  }, [safeImages.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  }, [safeImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape" && isLightboxOpen) setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, isLightboxOpen]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    setTouchStartX(null);
  };

  const currentImage = safeImages[activeIndex] || safeImages[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Main Image Frame */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative",
          aspectRatio: "3 / 4",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          backgroundColor: "var(--bg-alt)",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--line)",
          cursor: "zoom-in",
          userSelect: "none",
        }}
        onClick={() => setIsLightboxOpen(true)}
      >
        <Image
          src={currentImage}
          alt={`${title} - ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover", transition: "opacity 0.25s ease" }}
        />

        {/* Sale badge */}
        {hasDiscount && (
          <div style={{ position: "absolute", top: "1rem", insetInlineStart: "1rem", zIndex: 2 }}>
            <span className="badge badge--danger" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>
              {saleLabel}
            </span>
          </div>
        )}

        {/* Image index counter badge */}
        {safeImages.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "1rem",
              insetInlineEnd: "1rem",
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(6px)",
              color: "#fff",
              fontSize: "0.78rem",
              fontWeight: 600,
              padding: "0.3rem 0.65rem",
              borderRadius: "999px",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            {activeIndex + 1} / {safeImages.length}
          </div>
        )}

        {/* Zoom hint icon button */}
        <button
          type="button"
          aria-label="Avaa suuri kuva"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          style={{
            position: "absolute",
            top: "1rem",
            insetInlineEnd: "1rem",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(4px)",
            border: "1px solid var(--line)",
            display: "grid",
            placeItems: "center",
            color: "var(--ink)",
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
            zIndex: 2,
            transition: "transform 0.15s ease",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>

        {/* Previous / Next Arrow buttons on main image */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Edellinen kuva"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              style={{
                position: "absolute",
                top: "50%",
                insetInlineStart: "0.75rem",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.88)",
                backdropFilter: "blur(6px)",
                border: "1px solid var(--line)",
                display: "grid",
                placeItems: "center",
                color: "var(--ink)",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                zIndex: 2,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Seuraava kuva"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              style={{
                position: "absolute",
                top: "50%",
                insetInlineEnd: "0.75rem",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.88)",
                backdropFilter: "blur(6px)",
                border: "1px solid var(--line)",
                display: "grid",
                placeItems: "center",
                color: "var(--ink)",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                zIndex: 2,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails row */}
      {safeImages.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            overflowX: "auto",
            paddingBottom: "0.25rem",
          }}
        >
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              style={{
                position: "relative",
                width: "80px",
                height: "100px",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                border: idx === activeIndex ? "2.5px solid var(--plum)" : "1.5px solid var(--line)",
                opacity: idx === activeIndex ? 1 : 0.7,
                cursor: "pointer",
                flexShrink: 0,
                padding: 0,
                backgroundColor: "var(--bg-alt)",
                transition: "all 0.15s ease",
              }}
            >
              <Image src={img} alt={`${title} thumbnail ${idx + 1}`} fill sizes="80px" style={{ objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.92)",
            backdropFilter: "blur(10px)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Sulje"
            style={{
              position: "absolute",
              top: "1.5rem",
              insetInlineEnd: "1.5rem",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              display: "grid",
              placeItems: "center",
              fontSize: "1.5rem",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            ✕
          </button>

          {/* Large Image Container */}
          <div
            style={{
              position: "relative",
              width: "min(90vw, 1000px)",
              height: "min(80vh, 800px)",
              maxWidth: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage}
              alt={`${title} large view`}
              fill
              sizes="90vw"
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Lightbox Navigation */}
          {safeImages.length > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                marginTop: "1.5rem",
                color: "#fff",
                zIndex: 10,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handlePrev}
                className="btn btn--outline"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)", minHeight: "40px" }}
              >
                ‹ Edellinen
              </button>
              <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                {activeIndex + 1} / {safeImages.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="btn btn--outline"
                style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)", minHeight: "40px" }}
              >
                Seuraava ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
