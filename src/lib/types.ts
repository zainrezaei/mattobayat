export const LOCALES = ["fi", "en", "fa"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fi";

export type Localized = { fi: string; en: string; fa: string };

export const MATERIALS = ["wool", "silk", "wool-silk", "cotton", "viscose", "polyester", "acrylic", "mixed"] as const;
export type Material = (typeof MATERIALS)[number];

export const ORIGINS = ["iran", "turkey", "afghanistan", "other"] as const;
export type Origin = (typeof ORIGINS)[number];

export const SHAPES = ["rectangle", "runner", "round", "square"] as const;
export type Shape = (typeof SHAPES)[number];

export const WEAVES = ["hand-knotted", "machine-made", "flatweave", "other"] as const;
export type Weave = (typeof WEAVES)[number];

export const COLORS = ["red", "plum", "navy", "blue", "beige", "ivory", "grey", "green", "gold", "black", "multi"] as const;
export type Color = (typeof COLORS)[number];

export const COLOR_SWATCH: Record<Color, string> = {
  red: "#9b2226",
  plum: "#5b2a5e",
  navy: "#1d2b4f",
  blue: "#6c8fb3",
  beige: "#d9c7a7",
  ivory: "#f4ecdc",
  grey: "#9a9a9a",
  green: "#8aa08a",
  gold: "#c39a4b",
  black: "#1c1c1c",
  multi: "conic-gradient(#9b2226, #c39a4b, #1d2b4f, #8aa08a, #5b2a5e, #9b2226)",
};

export type Category = {
  id: string;
  slug: string;
  name: Localized;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  category_id: string | null;
  name: Localized;
  description: Localized;
  price: number | null; // EUR, null = price on request
  compare_at_price: number | null;
  width_cm: number | null;
  length_cm: number | null;
  shape: Shape;
  material: Material;
  origin: Origin;
  weave: Weave;
  colors: Color[];
  stock: number;
  featured: boolean;
  active: boolean;
  images: string[];
  created_at: string;
};

export const RESERVATION_STATUSES = ["new", "confirmed", "ready", "completed", "cancelled"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export type ReservationItem = {
  product_id: string;
  slug: string;
  name: string;
  price: number | null;
  qty: number;
  image: string | null;
};

export type Reservation = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  fulfilment: "pickup" | "delivery";
  address: string | null;
  items: ReservationItem[];
  total: number;
  status: ReservationStatus;
  locale: Locale;
  admin_note: string | null;
};

export type Message = {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  email: string | null;
  subject: string | null;
  body: string;
  handled: boolean;
};

export type DayHours = { open: string; close: string; closed: boolean };

export type Settings = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  postal: string;
  city: string;
  business_id: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  announcement: Localized;
  announcement_active: boolean;
  hours: {
    mon_fri: DayHours;
    sat: DayHours;
    sun: DayHours;
  };
};
