import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/types";
import { getProducts } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const staticRoutes = ["", "/products", "/guide", "/about", "/contact"];

  const staticEntries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    for (const lang of LOCALES) {
      staticEntries.push({
        url: `${SITE_URL}/${lang}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : route === "/products" ? 0.9 : 0.8,
        alternates: {
          languages: {
            "fi-FI": `${SITE_URL}/fi${route}`,
            en: `${SITE_URL}/en${route}`,
            "fa-AF": `${SITE_URL}/fa${route}`,
            "x-default": `${SITE_URL}/fi${route}`,
          },
        },
      });
    }
  }

  const productEntries: MetadataRoute.Sitemap = [];

  for (const product of products) {
    const lastMod = product.updated_at ? new Date(product.updated_at) : new Date();
    for (const lang of LOCALES) {
      productEntries.push({
        url: `${SITE_URL}/${lang}/products/${product.slug}`,
        lastModified: lastMod,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            "fi-FI": `${SITE_URL}/fi/products/${product.slug}`,
            en: `${SITE_URL}/en/products/${product.slug}`,
            "fa-AF": `${SITE_URL}/fa/products/${product.slug}`,
            "x-default": `${SITE_URL}/fi/products/${product.slug}`,
          },
        },
      });
    }
  }

  return [...staticEntries, ...productEntries];
}
