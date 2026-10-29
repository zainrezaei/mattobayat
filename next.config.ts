import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Using the classic (dynamic-by-default) caching model: product data is read
  // live from Supabase so the owner's edits appear instantly.
  cacheComponents: false,
  images: {
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "15mb" },
  },
};

export default nextConfig;
