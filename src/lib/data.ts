import "server-only";
import { cache } from "react";
import { createSupabaseServer, isSupabaseConfigured } from "./supabase/server";
import { DEFAULT_SETTINGS, DEMO_CATEGORIES, DEMO_MESSAGES, DEMO_PRODUCTS, DEMO_RESERVATIONS } from "./demo-data";
import type { Category, Message, Product, Reservation, Settings } from "./types";

function mergeSettings(data: Partial<Settings> | null | undefined): Settings {
  if (!data) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    announcement: { ...DEFAULT_SETTINGS.announcement, ...(data.announcement ?? {}) },
    hours: { ...DEFAULT_SETTINGS.hours, ...(data.hours ?? {}) },
    site_images: { ...DEFAULT_SETTINGS.site_images, ...(data.site_images ?? {}) },
    reviews: data.reviews && data.reviews.length > 0 ? data.reviews : DEFAULT_SETTINGS.reviews,
  };
}

export const getSettings = cache(async (): Promise<Settings> => {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("settings").select("data").eq("id", 1).maybeSingle();
  return mergeSettings(data?.data as Partial<Settings> | undefined);
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return DEMO_CATEGORIES;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
  return data && data.length > 0 ? (data as Category[]) : DEMO_CATEGORIES;
});

export const getProducts = cache(async (opts?: { includeHidden?: boolean }): Promise<Product[]> => {
  const includeHidden = opts?.includeHidden ?? false;
  if (!isSupabaseConfigured) {
    return includeHidden ? DEMO_PRODUCTS : DEMO_PRODUCTS.filter((p) => p.active);
  }
  const supabase = await createSupabaseServer();
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });
  if (!includeHidden) query = query.eq("active", true);
  const { data } = await query;
  return (data as Product[]) ?? [];
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!isSupabaseConfigured) return DEMO_PRODUCTS.find((p) => p.slug === slug && p.active) ?? null;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("products").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  return (data as Product) ?? null;
});

export async function getProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured) return DEMO_PRODUCTS.find((p) => p.id === id) ?? null;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  return (data as Product) ?? null;
}

export async function getReservations(): Promise<Reservation[]> {
  if (!isSupabaseConfigured) return DEMO_RESERVATIONS;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("reservations").select("*").order("created_at", { ascending: false }).limit(300);
  return (data as Reservation[]) ?? [];
}

export async function getMessages(): Promise<Message[]> {
  if (!isSupabaseConfigured) return DEMO_MESSAGES;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(300);
  return (data as Message[]) ?? [];
}

export type AdminSession =
  | { status: "demo" }
  | { status: "signed-out" }
  | { status: "not-admin"; email: string }
  | { status: "admin"; email: string; userId: string };

export const getAdminSession = cache(async (): Promise<AdminSession> => {
  if (!isSupabaseConfigured) return { status: "demo" };
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "signed-out" };
  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) return { status: "not-admin", email: user.email ?? "" };
  return { status: "admin", email: user.email ?? "", userId: user.id };
});
