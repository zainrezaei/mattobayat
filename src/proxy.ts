import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const LOCALES = ["fi", "en", "fa"];
const DEFAULT_LOCALE = "fi";

function pickLocale(request: NextRequest): string {
  const saved = request.cookies.get("lang")?.value;
  if (saved && LOCALES.includes(saved)) return saved;
  const header = request.headers.get("accept-language") ?? "";
  const prefs = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { lang } of prefs) {
    if (lang === "fa" || lang === "prs" || lang === "ps") return "fa";
    if (lang === "fi" || lang === "sv") return "fi";
    if (lang === "en") return "en";
  }
  return DEFAULT_LOCALE;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  // 1) Ensure every page lives under /fi, /en or /fa
  if (!LOCALES.includes(first)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  response.cookies.set("lang", first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });

  // 2) Keep the admin's Supabase session fresh
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key && pathname.split("/")[2] === "admin") {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          response.cookies.set("lang", first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico|icon|apple-icon|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]+$).*)"],
};
