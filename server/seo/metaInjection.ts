import type { Business, GeneratedWebsite } from "../../drizzle/schema";

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildSitemapXml(
  urls: Array<{ loc: string; priority: string; changefreq: string }>
): string {
  const urlElements = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlElements}\n</urlset>`;
}

/** Extract city name from a German address string like "Musterstraße 1, 80331 München, Deutschland" */
export function extractCity(address: string | null | undefined): string | null {
  if (!address) return null;
  const parts = address.split(",");
  if (parts.length >= 2) {
    // Second-to-last part usually contains "PLZ City"
    const candidate = parts[parts.length - 2]?.trim() ?? parts[parts.length - 1]?.trim();
    if (candidate) {
      const withoutPlz = candidate.replace(/^\d{5}\s*/, "").trim();
      if (withoutPlz.length > 0 && withoutPlz.length <= 60) return withoutPlz;
    }
  }
  return null;
}

export function buildLocalBusinessSchema(
  business: Business | null | undefined,
  website: GeneratedWebsite
): string {
  if (!business) return "";

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    url: `https://pageblitz.de/site/${website.slug}`,
  };

  if (business.address) schema.address = business.address;
  if (business.phone) schema.telephone = business.phone;
  if (business.email) schema.email = business.email;

  if (business.openingHours && Array.isArray(business.openingHours)) {
    schema.openingHours = business.openingHours;
  }

  if (business.rating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(business.rating),
      reviewCount: business.reviewCount ?? 0,
    };
  }

  return JSON.stringify(schema);
}
