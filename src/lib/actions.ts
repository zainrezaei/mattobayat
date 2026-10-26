"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer, isSupabaseConfigured } from "./supabase/server";
import { getAdminSession } from "./data";
import type { ReservationStatus } from "./types";

export type ActionState = {
  success?: boolean;
  error?: string;
  reference?: string;
};

// 1. Submit customer reservation
export async function submitReservation(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const message = String(formData.get("message") || "").trim() || null;
  const fulfilment = String(formData.get("fulfilment") || "pickup");
  const address = String(formData.get("address") || "").trim() || null;
  const itemsJson = String(formData.get("items") || "[]");
  const locale = String(formData.get("locale") || "fi");

  if (!name || name.length < 2) {
    return { error: "Name is required" };
  }
  if (!phone || phone.length < 5) {
    return { error: "Phone number is required" };
  }

  let items = [];
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: "Invalid reservation items" };
  }

  if (items.length === 0) {
    return { error: "Reservation list is empty" };
  }

  const total = items.reduce(
    (sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1),
    0
  );

  const referenceCode = `MB-${Date.now().toString().slice(-6)}`;

  if (isSupabaseConfigured) {
    try {
      const supabase = await createSupabaseServer();
      const { error } = await supabase.from("reservations").insert({
        name,
        phone,
        email,
        message,
        fulfilment,
        address,
        items,
        total,
        locale,
        status: "new",
      });

      if (error) {
        console.error("Supabase insert error", error);
        return { error: error.message };
      }
    } catch (e: any) {
      console.error("Failed to insert reservation", e);
      return { error: e.message || "Database connection error" };
    }
  }

  revalidatePath(`/${locale}/admin`);
  return { success: true, reference: referenceCode };
}

// 2. Submit contact message
export async function submitContactMessage(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const subject = String(formData.get("subject") || "").trim() || null;
  const body = String(formData.get("body") || "").trim();

  if (!name || !body) {
    return { error: "Name and message are required" };
  }

  if (isSupabaseConfigured) {
    try {
      const supabase = await createSupabaseServer();
      const { error } = await supabase.from("messages").insert({
        name,
        email,
        phone,
        subject,
        body,
        handled: false,
      });

      if (error) {
        return { error: error.message };
      }
    } catch (e: any) {
      return { error: e.message || "Failed to submit message" };
    }
  }

  return { success: true };
}

// 3. Admin: update reservation status
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
  adminNote?: string
): Promise<ActionState> {
  const session = await getAdminSession();
  if (session.status !== "admin" && session.status !== "demo") {
    return { error: "Unauthorized" };
  }

  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServer();
    const updateData: any = { status };
    if (adminNote !== undefined) updateData.admin_note = adminNote;
    const { error } = await supabase
      .from("reservations")
      .update(updateData)
      .eq("id", id);
    if (error) return { error: error.message };
  }

  revalidatePath("/[lang]/admin", "layout");
  return { success: true };
}

// 4. Admin: mark message as handled
export async function toggleMessageHandled(
  id: string,
  handled: boolean
): Promise<ActionState> {
  const session = await getAdminSession();
  if (session.status !== "admin" && session.status !== "demo") {
    return { error: "Unauthorized" };
  }

  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase
      .from("messages")
      .update({ handled })
      .eq("id", id);
    if (error) return { error: error.message };
  }

  revalidatePath("/[lang]/admin", "layout");
  return { success: true };
}

// 5. Admin: delete product
export async function deleteProduct(id: string): Promise<ActionState> {
  const session = await getAdminSession();
  if (session.status !== "admin" && session.status !== "demo") {
    return { error: "Unauthorized" };
  }

  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { error: error.message };
  }

  revalidatePath("/[lang]/products", "layout");
  revalidatePath("/[lang]/admin", "layout");
  return { success: true };
}

// 6. Admin: save/update product
export async function saveProduct(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getAdminSession();
  if (session.status !== "admin" && session.status !== "demo") {
    return { error: "Unauthorized" };
  }

  const id = String(formData.get("id") || "");
  const slug = String(formData.get("slug") || "").trim();
  const nameFi = String(formData.get("name_fi") || "").trim();
  const nameEn = String(formData.get("name_en") || "").trim();
  const nameFa = String(formData.get("name_fa") || "").trim();
  const descFi = String(formData.get("desc_fi") || "").trim();
  const descEn = String(formData.get("desc_en") || "").trim();
  const descFa = String(formData.get("desc_fa") || "").trim();

  const priceVal = formData.get("price");
  const price = priceVal ? Number(priceVal) : null;
  const compareVal = formData.get("compare_at_price");
  const compare_at_price = compareVal ? Number(compareVal) : null;

  const widthVal = formData.get("width_cm");
  const width_cm = widthVal ? Number(widthVal) : null;
  const lengthVal = formData.get("length_cm");
  const length_cm = lengthVal ? Number(lengthVal) : null;

  const shape = String(formData.get("shape") || "rectangle");
  const material = String(formData.get("material") || "wool");
  const origin = String(formData.get("origin") || "iran");
  const weave = String(formData.get("weave") || "machine-made");
  const category_id = String(formData.get("category_id") || "") || null;
  const stock = Number(formData.get("stock") || 1);
  const featured = formData.get("featured") === "on";
  const active = formData.get("active") === "on";

  const imagesRaw = formData.getAll("images").map(String).filter(Boolean);

  if (!slug || (!nameFi && !nameEn && !nameFa)) {
    return { error: "Slug and at least one language name are required" };
  }

  const productData = {
    slug,
    name: { fi: nameFi || nameEn || nameFa, en: nameEn || nameFi || nameFa, fa: nameFa || nameEn || nameFi },
    description: { fi: descFi, en: descEn, fa: descFa },
    price,
    compare_at_price,
    width_cm,
    length_cm,
    shape,
    material,
    origin,
    weave,
    category_id,
    stock,
    featured,
    active,
    images: imagesRaw.length > 0 ? imagesRaw : ["/images/products/tabriz-red.jpg"],
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServer();
    if (id) {
      const { error } = await supabase.from("products").update(productData).eq("id", id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("products").insert(productData);
      if (error) return { error: error.message };
    }
  }

  revalidatePath("/[lang]/products", "layout");
  revalidatePath("/[lang]/admin", "layout");
  return { success: true };
}

// 7. Admin: save settings
export async function saveSettings(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getAdminSession();
  if (session.status !== "admin" && session.status !== "demo") {
    return { error: "Unauthorized" };
  }

  const phone = String(formData.get("phone") || "");
  const whatsapp = String(formData.get("whatsapp") || "");
  const email = String(formData.get("email") || "");
  const address = String(formData.get("address") || "");
  const postal = String(formData.get("postal") || "");
  const city = String(formData.get("city") || "");
  const business_id = String(formData.get("business_id") || "");
  const instagram = String(formData.get("instagram") || "");
  const facebook = String(formData.get("facebook") || "");
  const tiktok = String(formData.get("tiktok") || "");

  const announcementFi = String(formData.get("announcement_fi") || "");
  const announcementEn = String(formData.get("announcement_en") || "");
  const announcementFa = String(formData.get("announcement_fa") || "");
  const announcement_active = formData.get("announcement_active") === "on";

  const mon_fri_open = String(formData.get("mon_fri_open") || "10:00");
  const mon_fri_close = String(formData.get("mon_fri_close") || "19:00");
  const sat_open = String(formData.get("sat_open") || "10:00");
  const sat_close = String(formData.get("sat_close") || "19:00");
  const sun_open = String(formData.get("sun_open") || "11:00");
  const sun_close = String(formData.get("sun_close") || "18:00");

  const settingsData = {
    phone,
    whatsapp,
    email,
    address,
    postal,
    city,
    business_id,
    instagram,
    facebook,
    tiktok,
    announcement: { fi: announcementFi, en: announcementEn, fa: announcementFa },
    announcement_active,
    hours: {
      mon_fri: { open: mon_fri_open, close: mon_fri_close, closed: false },
      sat: { open: sat_open, close: sat_close, closed: false },
      sun: { open: sun_open, close: sun_close, closed: false },
    },
  };

  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase
      .from("settings")
      .upsert({ id: 1, data: settingsData, updated_at: new Date().toISOString() });
    if (error) return { error: error.message };
  }

  revalidatePath("/[lang]", "layout");
  return { success: true };
}

// 8. Admin sign in
export async function adminSignIn(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/[lang]/admin", "layout");
  return { success: true };
}

// 9. Admin sign out
export async function adminSignOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
  }
  revalidatePath("/[lang]/admin", "layout");
}

