/**
 * Blog (SEO-Task 2, 2026-08-31): SSR-HTML wie die programmatischen
 * Landing-Pages — kein SPA-Bundle, Crawler bekommen fertiges HTML.
 * Nachtschicht-Look (Kohle/Volt) passend zu Landing und SEO-Seiten.
 *
 * Artikel leben als Daten in BLOG_POSTS; `bodyHtml` ist Autoren-HTML aus
 * diesem Repo (kein User-Input — kein Sanitizing nötig, aber NIEMALS
 * Fremdinhalte hier einfügen).
 */

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  /** ISO-Datum (YYYY-MM-DD) für sichtbares Datum + Schema. */
  publishedAt: string;
  updatedAt: string;
  teaser: string;
  readingMinutes: number;
  bodyHtml: string;
  faq: { question: string; answer: string }[];
}

const IMPRESSUM_POST: BlogPost = {
  slug: "impressum-fuer-kleinunternehmer",
  title:
    "Impressum für Kleinunternehmer: Pflichtangaben, Muster und häufige Fehler",
  metaTitle: "Impressum für Kleinunternehmer erstellen | Pageblitz",
  metaDescription:
    "Welche Angaben ins Impressum gehören, was für Kleinunternehmer gilt und welche Fehler abgemahnt werden – mit Muster und Checkliste (Stand 2026).",
  publishedAt: "2026-08-31",
  updatedAt: "2026-08-31",
  readingMinutes: 7,
  teaser:
    "Fast jede geschäftliche Website braucht ein Impressum – auch die von Kleinunternehmern. Welche Angaben Pflicht sind, was du weglassen darfst und welche Fehler wirklich teuer werden.",
  bodyHtml: `
<p>Wer in Deutschland eine geschäftliche Website betreibt, braucht ein Impressum – das gilt für die GmbH genauso wie für den Ein-Personen-Betrieb mit Kleinunternehmerregelung. Die Rechtsgrundlage ist seit Mai 2024 <strong>§ 5 des Digitale-Dienste-Gesetzes (DDG)</strong>; vorher stand die Pflicht fast wortgleich in § 5 TMG. Für dich ändert das inhaltlich wenig – aber wenn dein Impressum noch „gemäß § 5 TMG“ zitiert, ist das ein Zeichen, dass es länger nicht aktualisiert wurde.</p>

<h2>Wer braucht überhaupt ein Impressum?</h2>
<p>Kurz gesagt: jeder, der seine Website nicht rein privat betreibt. Sobald du Leistungen anbietest, für deinen Betrieb wirbst oder auch nur deine Öffnungszeiten für Kundschaft zeigst, ist die Seite „geschäftsmäßig“ – und damit impressumspflichtig. Auf die Größe kommt es nicht an: Auch als Kleinunternehmer nach § 19 UStG, als Freiberufler oder im Nebengewerbe brauchst du die Anbieterkennzeichnung. Eine Ausnahme gilt nur für rein persönliche oder familiäre Seiten ohne jeden geschäftlichen Bezug.</p>

<h2>Diese Angaben sind Pflicht</h2>
<p>Für Einzelunternehmer und Kleinunternehmer sieht die Pflichtliste überschaubar aus:</p>
<ul>
<li><strong>Vollständiger Name</strong> – Vor- und Nachname, kein Künstler- oder reiner Firmenname. Führst du eine Geschäftsbezeichnung („Salon Anna“), steht sie zusätzlich dabei, ersetzt den Namen aber nicht.</li>
<li><strong>Ladungsfähige Anschrift</strong> – Straße, Hausnummer, PLZ, Ort. Ein Postfach genügt nicht; unter der Adresse muss dir Post förmlich zugestellt werden können.</li>
<li><strong>Schnelle Kontaktmöglichkeit</strong> – eine E-Mail-Adresse ist Pflicht. Dazu ein zweiter schneller Weg, in der Praxis die Telefonnummer.</li>
<li><strong>Umsatzsteuer-Identifikationsnummer</strong> – aber nur, wenn du eine hast. Als Kleinunternehmer ohne USt-IdNr. lässt du die Angabe einfach weg. Wichtig: Deine <em>Steuernummer</em> gehört nicht ins Impressum – sie ist keine Pflichtangabe, und du gibst ohne Not ein Datum preis, das für Identitätsmissbrauch taugt.</li>
<li><strong>Registereinträge</strong> – nur relevant, wenn dein Betrieb im Handels-, Vereins- oder Genossenschaftsregister steht. Der typische Kleinunternehmer ist das nicht.</li>
<li><strong>Aufsichtsbehörde</strong> – nur bei erlaubnispflichtigen Tätigkeiten (etwa Gastronomie mit Ausschank, Makler, Bewachungsgewerbe): Behörde mit Anschrift nennen.</li>
<li><strong>Kammer und Berufsbezeichnung</strong> – bei reglementierten Berufen (z. B. Meisterbetriebe im zulassungspflichtigen Handwerk, Heilberufe): zuständige Kammer, gesetzliche Berufsbezeichnung und der Staat, der sie verliehen hat.</li>
</ul>

<h2>Was gilt speziell für Kleinunternehmer?</h2>
<p>Die Kleinunternehmerregelung nach § 19 UStG ist eine reine Umsatzsteuer-Frage – ins Impressum gehört dazu <strong>kein</strong> Hinweis. Der Satz „Als Kleinunternehmer wird keine Umsatzsteuer ausgewiesen“ gehört auf deine <em>Rechnungen</em>, nicht auf die Website. Fürs Impressum bedeutet die Regelung nur: Du hast meist keine USt-IdNr. und lässt das Feld weg. Alles andere – Name, Anschrift, Kontakt – gilt für dich in vollem Umfang.</p>

<h2>Wohin mit dem Impressum?</h2>
<p>Das Gesetz verlangt, dass die Angaben „leicht erkennbar, unmittelbar erreichbar und ständig verfügbar“ sind. Bewährt hat sich der Link „Impressum“ im Footer, sichtbar auf jeder Seite – maximal zwei Klicks von jeder Unterseite entfernt. Verstecke ihn nicht hinter kreativen Namen wie „Über diese Seite“: Gerichte erwarten die üblichen Bezeichnungen „Impressum“ oder „Anbieterkennzeichnung“. Das gilt übrigens auch für deine geschäftlichen Social-Media-Profile – dort genügt ein gut erreichbarer Link auf das Impressum deiner Website.</p>

<h2>Diese Fehler werden wirklich abgemahnt</h2>
<ul>
<li><strong>Gar kein Impressum</strong> – der Klassiker bei „ist ja nur eine kleine Seite“. Ein fehlendes Impressum ist ein Wettbewerbsverstoß und kann von Konkurrenten kostenpflichtig abgemahnt werden; zusätzlich drohen Bußgelder.</li>
<li><strong>Postfach statt Adresse</strong> – die Anschrift muss ladungsfähig sein.</li>
<li><strong>Kontaktformular statt E-Mail-Adresse</strong> – ein Formular allein reicht nicht, die E-Mail-Adresse muss genannt sein.</li>
<li><strong>Veralteter Streitschlichtungs-Link</strong> – der jahrelang übliche Link zur EU-Streitbeilegungsplattform (ec.europa.eu/consumers/odr) ist überholt: Die Plattform wurde im Juli 2025 abgeschaltet. Der tote Link macht dein Impressum angreifbar – raus damit. Was bleibt: Betriebe mit mehr als zehn Beschäftigten müssen nach § 36 VSBG angeben, ob sie an Verbraucherschlichtung teilnehmen; kleinere Betriebe trifft diese Pflicht nicht.</li>
<li><strong>Copy-Paste von der Konkurrenz</strong> – fremde Impressen enthalten fremde Registerangaben und Formulierungen, die auf dich nicht zutreffen. Falsche Pflichtangaben sind schlimmer als schlicht formulierte richtige.</li>
</ul>

<h2>Muster: Impressum für einen Kleinunternehmer</h2>
<pre class="blog-muster">Impressum

Angaben gemäß § 5 DDG

Max Mustermann
Malerbetrieb Mustermann
Musterstraße 12
12345 Musterstadt

Telefon: 01234 567890
E-Mail: kontakt@musterbetrieb.de

Zuständige Handwerkskammer: HWK Musterstadt
Berufsbezeichnung: Maler- und Lackierermeister
(verliehen in Deutschland)</pre>
<p>Die letzten drei Zeilen brauchst du nur bei Kammerberufen; die USt-IdNr. ergänzt du, sobald du eine hast. Prüfe jede Zeile gegen deine echten Daten – ein Muster ersetzt keine Kontrolle.</p>

<h2>Der schnellste Weg zum fertigen Impressum</h2>
<p>Wenn du deine Website mit <a href="/">Pageblitz</a> erstellst, fragt das Studio die nötigen Angaben einmal ab und erzeugt Impressum und Datenschutzerklärung automatisch als eigene Seiten – korrekt verlinkt im Footer, auf jeder Unterseite erreichbar. Änderungen an Adresse oder Kontakt pflegst du an einer Stelle, die Rechtsseiten ziehen nach.</p>

<p class="blog-disclaimer">Dieser Artikel ist eine sorgfältig recherchierte Orientierung, aber keine Rechtsberatung. Bei Sonderfällen – etwa reglementierten Berufen oder Auslandsbezug – hilft eine kurze Prüfung durch eine Kanzlei oder deine Kammer.</p>
`,
  faq: [
    {
      question: "Brauche ich als Kleinunternehmer wirklich ein Impressum?",
      answer:
        "Ja. Die Impressumspflicht nach § 5 DDG hängt nicht von der Unternehmensgröße oder der Kleinunternehmerregelung ab, sondern davon, dass die Website geschäftsmäßig betrieben wird – und das ist bei jeder Betriebs-Website der Fall.",
    },
    {
      question: "Muss meine Steuernummer ins Impressum?",
      answer:
        "Nein. Die Steuernummer ist keine Pflichtangabe und sollte aus Datenschutzgründen nicht veröffentlicht werden. Pflicht ist nur die Umsatzsteuer-Identifikationsnummer – und auch die nur, wenn du eine besitzt.",
    },
    {
      question: "Muss ich auf die Kleinunternehmerregelung hinweisen?",
      answer:
        "Nicht im Impressum. Der Hinweis nach § 19 UStG, dass keine Umsatzsteuer ausgewiesen wird, gehört auf deine Rechnungen – auf der Website ist er nicht vorgeschrieben.",
    },
    {
      question: "Reicht ein Kontaktformular statt einer E-Mail-Adresse?",
      answer:
        "Nein. Das Impressum muss eine E-Mail-Adresse nennen. Ein Kontaktformular darfst du zusätzlich anbieten, es ersetzt die Pflichtangabe aber nicht.",
    },
    {
      question: "Was ist mit dem Link zur EU-Streitschlichtungsplattform?",
      answer:
        "Die EU-Plattform zur Online-Streitbeilegung wurde im Juli 2025 eingestellt – der früher übliche Link gehört nicht mehr ins Impressum. Betriebe mit mehr als zehn Beschäftigten geben weiterhin nach § 36 VSBG an, ob sie an Verbraucherschlichtungsverfahren teilnehmen.",
    },
  ],
};

export const BLOG_POSTS: BlogPost[] = [IMPRESSUM_POST];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(post => post.slug === slug);
}

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

const BLOG_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Space Grotesk',system-ui,-apple-system,sans-serif;background:#0b0b0d;color:#f2f1ee;line-height:1.7;-webkit-font-smoothing:antialiased}
a{color:#ccff00;text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:720px;margin:0 auto;padding:0 20px}
header.site{border-bottom:1px solid rgba(255,255,255,.09);padding:1rem 0}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;gap:1rem}
.brand{display:flex;align-items:center;gap:.6rem;color:#f2f1ee;font-weight:600}
.brand-bolt{display:grid;place-items:center;width:2rem;height:2rem;border-radius:7px;background:#ccff00;color:#0b0b0d;font-weight:700}
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
.post-card{display:block;background:#131316;border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:1.5rem;margin-bottom:1rem;color:inherit}
.post-card:hover{border-color:rgba(255,255,255,.22);text-decoration:none}
.post-card h2{font-size:1.25rem;font-weight:600;margin:.4rem 0 .6rem;color:#f2f1ee}
.post-card p{color:#a4a39d;font-size:.95rem}
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
  <a class="brand" href="/"><span class="brand-bolt">↯</span>Pageblitz</a>
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
  const cards = BLOG_POSTS.map(
    post => `
  <a class="post-card" href="/blog/${post.slug}">
    <span class="kicker">${formatDate(post.publishedAt)} · ${post.readingMinutes} Min. Lesezeit</span>
    <h2>${escapeHtml(post.title)}</h2>
    <p>${escapeHtml(post.teaser)}</p>
  </a>`
  ).join("\n");
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
    body: `<main><div class="wrap">
  <p class="kicker">Pageblitz Blog</p>
  <h1>Website-Wissen für Kleinunternehmer.</h1>
  <p class="meta">Anleitungen ohne Juristendeutsch — geschrieben für Betriebe, nicht für Konzerne.</p>
${cards}
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
  <p class="kicker"><a href="/blog">Blog</a> · ${formatDate(post.publishedAt)} · ${post.readingMinutes} Min. Lesezeit</p>
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
