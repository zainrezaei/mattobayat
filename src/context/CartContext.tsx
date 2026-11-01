"use client";

import React, { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import type { ReservationItem } from "@/lib/types";

interface CartContextType {
  items: ReservationItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<ReservationItem, "qty">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  totalCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "matto_bayat_reservation_v1";

/* ------------------------------------------------------------------
   Tiny localStorage-backed store.
   Using useSyncExternalStore (instead of setState inside an effect)
   gives a hydration-safe empty list on the server, avoids an extra
   cascading render on mount, and keeps several open tabs in sync.
   ------------------------------------------------------------------ */
const EMPTY: ReservationItem[] = [];
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedItems: ReservationItem[] = EMPTY;

function readItems(): ReservationItem[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return cachedItems;
  }
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedItems = Array.isArray(parsed) ? (parsed as ReservationItem[]) : EMPTY;
  } catch {
    cachedItems = EMPTY;
  }
  return cachedItems;
}

function writeItems(next: ReservationItem[]) {
  cachedItems = next;
  try {
    cachedRaw = JSON.stringify(next);
    localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch (e) {
    console.error("Failed to save cart", e);
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getServerSnapshot = () => EMPTY;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readItems, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  const update = useCallback((fn: (prev: ReservationItem[]) => ReservationItem[]) => {
    writeItems(fn(readItems()));
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback(
    (item: Omit<ReservationItem, "qty">, qty = 1) => {
      update((prev) => {
        const existing = prev.find((i) => i.product_id === item.product_id);
        if (existing) {
          return prev.map((i) => (i.product_id === item.product_id ? { ...i, qty: i.qty + qty } : i));
        }
        return [...prev, { ...item, qty }];
      });
      setIsOpen(true);
    },
    [update]
  );

  const removeItem = useCallback(
    (productId: string) => update((prev) => prev.filter((i) => i.product_id !== productId)),
    [update]
  );

  const updateQty = useCallback(
    (productId: string, qty: number) => {
      update((prev) =>
        qty <= 0
          ? prev.filter((i) => i.product_id !== productId)
          : prev.map((i) => (i.product_id === productId ? { ...i, qty } : i))
      );
    },
    [update]
  );

  const clearCart = useCallback(() => update(() => []), [update]);

  const value = useMemo<CartContextType>(() => {
    const totalCount = items.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);
    return {
      items,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      isInCart: (productId: string) => items.some((i) => i.product_id === productId),
      totalCount,
      totalPrice,
    };
  }, [items, isOpen, openCart, closeCart, toggleCart, addItem, removeItem, updateQty, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
