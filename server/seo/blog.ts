/**
 * Blog (SEO-Task 2, 2026-08-31): SSR-HTML wie die programmatischen
 * Landing-Pages — kein SPA-Bundle, Crawler bekommen fertiges HTML.
 * Nachtschicht-Look (Kohle/Volt) passend zu Landing und SEO-Seiten.
 *
 * Artikel leben als Daten in BLOG_POSTS; `bodyHtml` ist Autoren-HTML aus
 * diesem Repo (kein User-Input — kein Sanitizing nötig, aber NIEMALS
 * Fremdinhalte hier einfügen).
 */


export {
  BLOG_POSTS,
  getBlogPost,
  type BlogPost,
} from "./blogPosts";
import { BLOG_POSTS, type BlogPost } from "./blogPosts";

// ── Rendering ────────────────────────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Echtes Pageblitz-BrandMark (gleiche Pfaddaten wie client/src/components/landing/primitives.tsx). */
const BRAND_MARK_SVG = `<svg viewBox="480 380 1060 1360" aria-hidden="true"><path fill="currentColor" d="M 889.39 448.271 L 1027 448.389 C 1095.26 448.402 1154.86 444.93 1220.54 467.755 C 1441.18 544.436 1468.5 839.339 1248.65 943.253 C 1195 1000 1062 1038 954.752 1030.36 C 969.049 994.436 987.735 958.777 1002.94 923.08 C 1011.21 903.687 1020.46 883.279 1029.77 864.375 C 1077.42 864.484 1115.44 859.364 1153.94 827.092 C 1180.73 804.639 1196.69 773.181 1199.23 738.284 C 1199.31 734.894 1199.34 731.503 1199.31 728.112 C 1198.7 678.301 1167.03 637.505 1120.22 622.217 C 1092.14 613.044 1067.16 614.392 1038.07 614.653 C 1011.55 671.788 986.431 733.177 960.902 791.178 L 819.443 1113.34 C 905.629 1113.18 991.813 1112.4 1077.99 1110.98 C 1032.38 1160.99 985.77 1217.67 941.609 1269.32 L 738.53 1506.61 C 709.377 1541.1 680.035 1575.42 650.503 1609.58 C 631.107 1632.07 611.179 1655.76 590.625 1677.11 C 640.951 1539.68 697.528 1403.49 748.736 1266.29 C 687.357 1265.51 624.298 1266.35 562.693 1266.3 C 578.865 1222.21 598.131 1176.46 615.52 1132.68 L 739.197 823.33 L 836.91 577.647 L 865.589 506.36 C 873.185 487.231 880.738 466.851 889.39 448.271 z"/></svg>`;

const BLOG_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Space Grotesk',system-ui,-apple-system,sans-serif;background:#0b0b0d;color:#f2f1ee;line-height:1.7;-webkit-font-smoothing:antialiased}
a{color:#ccff00;text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:720px;margin:0 auto;padding:0 20px}
header.site{border-bottom:1px solid rgba(255,255,255,.09);padding:1rem 0}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;gap:1rem}
.brand{display:flex;align-items:center;gap:.6rem;color:#f2f1ee;font-weight:600;font-size:1.08rem;letter-spacing:-.01em}
.brand svg{height:1.6rem;width:auto;color:#ccff00}
.cta{display:inline-block;background:#ccff00;color:#0b0b0d;font-weight:600;padding:.6rem 1.1rem;border-radius:999px}
.cta:hover{text-decoration:none;filter:brightness(1.05)}
main{padding:3.5rem 0 5rem}
.kicker{color:#ccff00;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;font-weight:500}
h1{font-size:clamp(1.9rem,4.5vw,2.8rem);line-height:1.15;letter-spacing:-.02em;margin:.75rem 0 1rem;font-weight:600}
.meta{color:#a4a39d;font-size:.88rem;margin-bottom:2.5rem}
article h2{font-size:1.45rem;font-weight:600;margin:2.5rem 0 .9rem;letter-spacing:-.01em}
article p{color:#c9c8c2;margin:0 0 1.1rem}
article ul{color:#c9c8c2;margin:0 0 1.1rem;padding-left:1.2rem}
article li{margin-bottom:.6rem}
article strong{color:#f2f1ee}
.blog-muster{background:#131316;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:1.25rem;font-family:ui-monospace,monospace;font-size:.85rem;line-height:1.7;color:#c9c8c2;overflow-x:auto;white-space:pre;margin:0 0 1.1rem}
.blog-disclaimer{font-size:.82rem;color:#a4a39d;border-top:1px solid rgba(255,255,255,.09);padding-top:1.25rem;margin-top:2.5rem}
.faq{margin-top:3rem}
.faq h2{font-size:1.45rem;font-weight:600;margin-bottom:1rem}
.faq details{background:#131316;border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:1rem 1.25rem;margin-bottom:.6rem}
.faq summary{cursor:pointer;font-weight:500;color:#f2f1ee}
.faq details p{color:#a4a39d;margin:.75rem 0 0}
.wrap-wide{max-width:1080px;margin:0 auto;padding:0 20px}
.blog-head{border-bottom:1px solid rgba(255,255,255,.09);padding-bottom:2.5rem;margin-bottom:2.5rem}
.blog-head h1{max-width:16ch}
.blog-head .meta{margin-bottom:0;max-width:44ch}
.tag{display:inline-block;font-family:ui-monospace,SFMono-Regular,monospace;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:#ccff00;border:1px solid rgba(204,255,0,.32);border-radius:999px;padding:.28rem .7rem}
.post-featured{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:clamp(1.5rem,4vw,3.5rem);align-items:end;background:#131316;border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:clamp(1.5rem,3.5vw,2.75rem);margin-bottom:2.5rem;color:inherit;position:relative;transition:border-color .2s ease}
.post-featured:hover{border-color:rgba(204,255,0,.45);text-decoration:none}
.post-featured h2{font-size:clamp(1.5rem,3.2vw,2.3rem);line-height:1.15;letter-spacing:-.02em;font-weight:600;color:#f2f1ee;margin:.9rem 0 0;text-wrap:balance}
.post-featured .post-side{display:flex;flex-direction:column;gap:1rem}
.post-featured .post-side p{color:#a4a39d;font-size:.98rem;margin:0}
.post-featured:hover .post-arrow{background:#ccff00;color:#0b0b0d}
.post-meta{font-family:ui-monospace,SFMono-Regular,monospace;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#a4a39d}
.post-arrow{display:inline-grid;place-items:center;width:2.4rem;height:2.4rem;border-radius:999px;border:1px solid rgba(255,255,255,.18);color:#f2f1ee;font-size:1.05rem;transition:background .2s ease,color .2s ease;align-self:flex-start}
.post-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:1rem}
.post-card{display:flex;flex-direction:column;gap:.85rem;background:#131316;border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:1.6rem;color:inherit;position:relative;transition:border-color .2s ease,transform .2s ease}
.post-card .tag{align-self:flex-start}
.post-card:hover{border-color:rgba(204,255,0,.45);text-decoration:none;transform:translateY(-3px)}
.post-card h2{font-size:1.18rem;font-weight:600;line-height:1.3;margin:0;color:#f2f1ee;text-wrap:balance}
.post-card p{color:#a4a39d;font-size:.92rem;margin:0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.post-card .post-foot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:.85rem;border-top:1px solid rgba(255,255,255,.07)}
.post-card:hover .post-arrow{background:#ccff00;color:#0b0b0d}
@media(max-width:720px){.post-featured{grid-template-columns:1fr;align-items:start}}
@media(prefers-reduced-motion:reduce){.post-card,.post-card:hover{transform:none;transition:none}}
.post-cta{background:#131316;border:1px solid rgba(204,255,0,.32);border-radius:14px;padding:1.5rem;margin-top:3rem;text-align:center}
.post-cta p{color:#c9c8c2;margin-bottom:1rem}
footer.site{border-top:1px solid rgba(255,255,255,.09);padding:2rem 0;color:#a4a39d;font-size:.85rem}
footer.site .wrap{display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between}
`;

function pageShell(opts: {
  title: string;
  description: string;
  canonical: string;
  schema: string;
  body: string;
}): string {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.title)}</title>
<meta name="description" content="${escapeHtml(opts.description)}">
<link rel="canonical" href="${opts.canonical}">
<meta property="og:title" content="${escapeHtml(opts.title)}">
<meta property="og:description" content="${escapeHtml(opts.description)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${opts.canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<style>${BLOG_CSS}</style>
${opts.schema}
</head>
<body>
<header class="site"><div class="wrap">
  <a class="brand" href="/">${BRAND_MARK_SVG}Pageblitz</a>
  <a class="cta" href="/start">Website erstellen</a>
</div></header>
${opts.body}
<footer class="site"><div class="wrap">
  <span>© Pageblitz · <a href="/blog">Blog</a></span>
  <span><a href="/impressum">Impressum</a> · <a href="/datenschutz">Datenschutz</a></span>
</div></footer>
</body>
</html>`;
}

export function renderBlogIndexHTML(): string {
  // Neuester Artikel als Featured-Karte, Rest im Grid (Index nach Datum,
  // neueste zuerst; bei gleichem Datum entscheidet die Array-Reihenfolge).
  const sorted = [...BLOG_POSTS].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
  const [featured, ...rest] = sorted;
  const featuredHtml = featured
    ? `
  <a class="post-featured" href="/blog/${featured.slug}">
    <div>
      <span class="tag">${escapeHtml(featured.category)}</span>
      <h2>${escapeHtml(featured.title)}</h2>
    </div>
    <div class="post-side">
      <p>${escapeHtml(featured.teaser)}</p>
      <span class="post-meta">${formatDate(featured.publishedAt)} · ${featured.readingMinutes} Min. Lesezeit</span>
      <span class="post-arrow" aria-hidden="true">→</span>
    </div>
  </a>`
    : "";
  const cards = rest
    .map(
      post => `
    <a class="post-card" href="/blog/${post.slug}">
      <span class="tag">${escapeHtml(post.category)}</span>
      <h2>${escapeHtml(post.title)}</h2>
      <p>${escapeHtml(post.teaser)}</p>
      <span class="post-foot">
        <span class="post-meta">${formatDate(post.publishedAt)} · ${post.readingMinutes} Min.</span>
        <span class="post-arrow" aria-hidden="true">→</span>
      </span>
    </a>`
    )
    .join("\n");
  const schema = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Pageblitz Blog",
    url: "https://pageblitz.de/blog",
    description:
      "Praktisches Wissen für Kleinunternehmer: Website, Recht und Sichtbarkeit.",
  })}</script>`;
  return pageShell({
    title: "Blog: Website-Wissen für Kleinunternehmer | Pageblitz",
    description:
      "Praktische Anleitungen für Kleinunternehmer: Impressum, Website-Pflichten und lokale Sichtbarkeit – ohne Juristendeutsch.",
    canonical: "https://pageblitz.de/blog",
    schema,
    body: `<main><div class="wrap-wide">
  <div class="blog-head">
    <p class="kicker">Pageblitz Blog</p>
    <h1>Website-Wissen für Kleinunternehmer.</h1>
    <p class="meta">Anleitungen ohne Juristendeutsch — geschrieben für Betriebe, nicht für Konzerne.</p>
  </div>
${featuredHtml}
  <div class="post-grid">
${cards}
  </div>
</div></main>`,
  });
}

export function renderBlogPostHTML(post: BlogPost): string {
  const canonical = `https://pageblitz.de/blog/${post.slug}`;
  const schema = `<script type="application/ld+json">${JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.metaDescription,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      inLanguage: "de",
      mainEntityOfPage: canonical,
      author: { "@type": "Organization", name: "Pageblitz" },
      publisher: { "@type": "Organization", name: "Pageblitz" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map(item => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          position: 1,
          "@type": "ListItem",
          name: "Startseite",
          item: "https://pageblitz.de",
        },
        {
          position: 2,
          "@type": "ListItem",
          name: "Blog",
          item: "https://pageblitz.de/blog",
        },
        { position: 3, "@type": "ListItem", name: post.title },
      ],
    },
  ])}</script>`;
  const faqHtml = post.faq
    .map(
      item => `
    <details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`
    )
    .join("\n");
  return pageShell({
    title: post.metaTitle,
    description: post.metaDescription,
    canonical,
    schema,
    body: `<main><div class="wrap">
  <p class="kicker"><a href="/blog">Blog</a> · ${escapeHtml(post.category)} · ${formatDate(post.publishedAt)} · ${post.readingMinutes} Min. Lesezeit</p>
  <h1>${escapeHtml(post.title)}</h1>
  <p class="meta">Zuletzt aktualisiert am ${formatDate(post.updatedAt)}</p>
  <article>${post.bodyHtml}</article>
  <section class="faq" aria-label="Häufige Fragen">
    <h2>Häufige Fragen</h2>${faqHtml}
  </section>
  <div class="post-cta">
    <p>Impressum, Datenschutz und die ganze Website — in 3 Minuten fertig zur Vorschau.</p>
    <a class="cta" href="/start">Website kostenlos erstellen</a>
  </div>
</div></main>`,
  });
}
