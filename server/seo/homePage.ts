/**
 * Server-Prerender für die Startseite.
 *
 * Ausgangslage: `/` lieferte ein leeres <div id="root"> aus – null Zeichen Text,
 * keine Überschrift, kein Link. Google rendert zwar JavaScript, teilt einer
 * jungen Domain dafür aber wenig Budget zu; die AI-Crawler (ChatGPT, Perplexity,
 * Claude) rendern gar keins. Die wichtigste Seite der Domain war damit für einen
 * relevanten Teil der Suchlandschaft unsichtbar.
 *
 * Dieses Modul erzeugt eine statische HTML-Fassung des Landingpage-Inhalts, die
 * in `#root` ausgeliefert wird. React ersetzt sie beim Mounten (createRoot leert
 * den Container) – Crawler sehen also vollständigen Inhalt, Nutzer sehen sofort
 * einen echten First Paint statt einer weißen Seite.
 *
 * WICHTIG: Der Text hier muss inhaltlich dem entsprechen, was LandingPage.tsx
 * rendert. Weicht er ab, ist das aus Google-Sicht Cloaking. Bei Textänderungen
 * an der Landingpage diese Datei mitziehen.
 */
import { HOME_FAQ_ITEMS } from "../../shared/faq";
import { SEO_INDUSTRIES } from "./landingPages";
import { escapeHtml } from "./metaInjection";

const STEPS = [
  { n: "01", title: "Link eingeben", desc: "Füge deinen Google My Business Link ein oder starte manuell." },
  { n: "02", title: "KI analysiert", desc: "Unsere KI liest deine Daten und erstellt passende Inhalte." },
  { n: "03", title: "Anpassen", desc: "Ändere Texte, Farben und Bilder im Chat-Interface." },
  { n: "04", title: "Veröffentlichen", desc: "Mit einem Klick ist deine Website live." },
];

// Muss zeilengleich zur Vergleichstabelle in LandingPage.tsx sein.
const COMPARISON: Array<[string, string, string]> = [
  ["Einmalige Kosten", "2.000 – 8.000 €", "0 €"],
  ["Zeit bis zur fertigen Website", "4 – 12 Wochen", "3 Minuten"],
  ["Monatliche Kosten", "50 – 150 € Hosting & Wartung", "19,90 €*"],
  ["Änderungen & Updates", "Stundenabrechnung (~80 €/h)", "Inklusive"],
  ["Vertragslaufzeit", "Oft 12–24 Monate", "1 Monat"],
];

// Muss der Leistungsliste im Pricing-Block von LandingPage.tsx entsprechen.
const PLAN_FEATURES = [
  "KI-generierte Website",
  "SSL-Zertifikat",
  "DSGVO-konformer Datenschutz & Impressum",
  "Premium Cloud Hosting",
  "Änderungen jederzeit per Chat",
  "Chat-Support",
];

/** FAQPage-JSON-LD aus derselben Quelle wie der sichtbare FAQ-Block. */
export function buildHomeFaqSchema(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ_ITEMS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
}

/**
 * HTML-Fragment für `#root`. Enthält bewusst Inline-Styles: Das CSS-Bundle ist
 * beim ersten Paint noch nicht da, und ohne Styles wäre der Prerender ein
 * unformatierter Textblock – schlecht für die wahrgenommene Ladezeit.
 * Helles Theme, weil LandingPage.tsx ohne gespeicherte Auswahl hell startet.
 */
export function generateHomePrerender(): string {
  const industryLinks = Object.values(SEO_INDUSTRIES)
    .map(
      (i) =>
        `<a href="/website-erstellen/${i.slug}" style="color:#4d7c0f;text-decoration:none;font-size:.875rem">Website für ${escapeHtml(i.displayName)}</a>`
    )
    .join("\n        ");

  const steps = STEPS.map(
    (s) =>
      `<div style="display:flex;gap:1.5rem"><div style="color:#d6d3d1;font-size:.875rem;padding-top:.25rem">${s.n}</div><div><h3 style="font-size:1.125rem;font-weight:500;margin:0 0 .5rem;color:#111827">${escapeHtml(s.title)}</h3><p style="font-size:.875rem;line-height:1.6;color:#6b7280;margin:0">${escapeHtml(s.desc)}</p></div></div>`
  ).join("\n        ");

  const comparison = COMPARISON.map(
    ([label, agency, pb]) =>
      `<tr><td style="padding:.875rem 1rem;color:#6b7280;border-top:1px solid #e7e5e4">${escapeHtml(label)}</td><td style="padding:.875rem 1rem;color:#6b7280;border-top:1px solid #e7e5e4">${escapeHtml(agency)}</td><td style="padding:.875rem 1rem;color:#111827;font-weight:600;border-top:1px solid #e7e5e4">${escapeHtml(pb)}</td></tr>`
  ).join("\n          ");

  const faqs = HOME_FAQ_ITEMS.map(
    (f) =>
      `<div style="border-top:1px solid #e7e5e4;padding:1.25rem 0"><h3 style="font-size:1rem;font-weight:600;margin:0 0 .5rem;color:#111827">${escapeHtml(f.q)}</h3><p style="margin:0;color:#6b7280;line-height:1.7;font-size:.9375rem">${escapeHtml(f.a)}</p></div>`
  ).join("\n        ");

  return `<div id="prerender" style="background:#fafaf9;color:#111827;font-family:'Plus Jakarta Sans',Inter,system-ui,sans-serif;min-height:100vh">
  <div style="max-width:1100px;margin:0 auto;padding:2rem 1.5rem 4rem">

    <header style="display:flex;align-items:center;justify-content:space-between;padding:1rem 0 4rem">
      <span style="font-size:1.25rem;font-weight:700;letter-spacing:-.02em">Pageblitz</span>
      <nav style="display:flex;gap:1.5rem;font-size:.875rem;color:#6b7280">
        <a href="/website-erstellen" style="color:#6b7280;text-decoration:none">Branchen</a>
        <a href="/login" style="color:#6b7280;text-decoration:none">Login</a>
        <a href="/start" style="color:#111827;text-decoration:none;font-weight:600">Gratis starten</a>
      </nav>
    </header>

    <section>
      <p style="display:inline-block;background:#ecfccb;border:1px solid #d9f99d;color:#3f6212;border-radius:999px;padding:.5rem 1rem;font-size:.875rem;margin:0 0 2rem">Webagentur kostet 3.000 €+ – Pageblitz ab 19,90 €/Monat</p>
      <h1 style="font-size:clamp(2.25rem,6vw,3.75rem);font-weight:600;letter-spacing:-.03em;line-height:1.1;margin:0 0 1.5rem;max-width:15ch">Deine professionelle Website in 3 Minuten.</h1>
      <p style="font-size:1.125rem;line-height:1.7;color:#4b5563;max-width:52ch;margin:0 0 2rem">Kein Webdesigner. Kein monatelanges Warten. Kein 4-stelliges Budget. Pageblitz erstellt deine Website automatisch – du musst nur dein Business beschreiben.</p>
      <p style="margin:0 0 1rem"><a href="/start" style="display:inline-block;background:#111827;color:#fff;padding:.875rem 1.75rem;border-radius:999px;text-decoration:none;font-weight:600">7 Tage gratis starten</a></p>
      <p style="font-size:.875rem;color:#6b7280;margin:0">Keine Kreditkarte nötig · Keine Einrichtungsgebühr · Jederzeit kündbar</p>
    </section>

    <section style="padding:4rem 0">
      <h2 style="font-size:1.75rem;font-weight:600;letter-spacing:-.02em;margin:0 0 2.5rem">So einfach geht's.</h2>
      <div style="display:grid;gap:1.75rem;max-width:640px">
        ${steps}
      </div>
    </section>

    <section style="padding:4rem 0">
      <h2 style="font-size:1.75rem;font-weight:600;letter-spacing:-.02em;margin:0 0 .75rem">Ein Preis. Alles inklusive.</h2>
      <p style="color:#6b7280;margin:0 0 2rem">19,90 €/Monat bei jährlicher Zahlung, 24,90 €/Monat bei monatlicher Zahlung. Die ersten 7 Tage sind kostenlos.</p>
      <ul style="margin:0;padding-left:1.25rem;color:#4b5563;line-height:2;max-width:60ch">
        ${PLAN_FEATURES.map((f) => `<li>${escapeHtml(f)}</li>`).join("\n        ")}
      </ul>
    </section>

    <section style="padding:4rem 0">
      <h2 style="font-size:1.75rem;font-weight:600;letter-spacing:-.02em;margin:0 0 2rem">Pageblitz vs. Webagentur</h2>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.9375rem;min-width:480px">
          <thead><tr>
            <th style="text-align:left;padding:.5rem 1rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af"></th>
            <th style="text-align:left;padding:.5rem 1rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af">Webagentur</th>
            <th style="text-align:left;padding:.5rem 1rem;font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af">Pageblitz</th>
          </tr></thead>
          <tbody>
          ${comparison}
          </tbody>
        </table>
      </div>
    </section>

    <section style="padding:4rem 0">
      <h2 style="font-size:1.75rem;font-weight:600;letter-spacing:-.02em;margin:0 0 1.5rem">Häufige Fragen</h2>
      <div style="max-width:70ch">
        ${faqs}
      </div>
    </section>

    <section style="padding:3rem 0;border-top:1px solid #e7e5e4">
      <h2 style="font-size:1rem;font-weight:600;margin:0 0 1.25rem;color:#374151">Website erstellen – nach Branche</h2>
      <div style="display:flex;flex-wrap:wrap;gap:.75rem 1.5rem">
        ${industryLinks}
      </div>
    </section>

    <footer style="padding:2rem 0;border-top:1px solid #e7e5e4;font-size:.875rem;color:#9ca3af">
      <p style="margin:0">© ${new Date().getFullYear()} Pageblitz · <a href="/impressum" style="color:#9ca3af">Impressum</a> · <a href="/datenschutz" style="color:#9ca3af">Datenschutz</a></p>
    </footer>

  </div>
</div>`;
}
