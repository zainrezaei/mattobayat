import type { DayHours, Product, Settings } from "./types";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function areaM2(p: Pick<Product, "width_cm" | "length_cm">): number {
  if (!p.width_cm || !p.length_cm) return 0;
  return (p.width_cm * p.length_cm) / 10000;
}

export function whatsappLink(number: string, text?: string): string {
  const n = number.replace(/[^0-9]/g, "");
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

export function mapsLink(s: Settings): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Matto Bayat, ${s.address}, ${s.postal} ${s.city}`)}`;
}

export function mapsEmbed(s: Settings): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(`${s.address}, ${s.postal} ${s.city}`)}&z=15&output=embed`;
}

/** Is the shop open right now (Helsinki time)? */
export function isOpenNow(s: Settings, date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Helsinki",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  const day: DayHours = wd === "Sat" ? s.hours.sat : wd === "Sun" ? s.hours.sun : s.hours.mon_fri;
  if (day.closed) return false;
  const nowMin = Number(hh) * 60 + Number(mm);
  const [oh, om] = day.open.split(":").map(Number);
  const [ch, cm] = day.close.split(":").map(Number);
  return nowMin >= oh * 60 + om && nowMin < ch * 60 + cm;
}
