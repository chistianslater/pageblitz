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
 * WICHTIG: Der Text hier muss inhaltlich dem entsprechen, was `/` rendert.
 * Weicht er ab, ist das aus Google-Sicht Cloaking. Seit dem Klarstart-Relaunch
 * ist das `client/src/pages/landing-concepts/Klarstart.tsx` samt `BuildStory`,
 * `ClearFeatures` und `shared.tsx` — nicht mehr die alten Bausteine in
 * `client/src/components/landing/` (ProblemSection, HowItWorks, TrustSection,
 * Pricing), die `/` nicht mehr rendert. Reihenfolge und Überschriften unten
 * folgen Klarstart Abschnitt für Abschnitt.
 *
 * Was hier bewusst NICHT dupliziert wird: die Funktionsliste (kommt aus
 * shared/landingFeatures.ts), die FAQs (shared/faq.ts) und alle Preise
 * (shared/pricing.ts) — dieselben Quellen, aus denen die React-Seite liest.
 */
import { HOME_FAQ_VISIBLE } from "../../shared/faq";
import { LANDING_FEATURES } from "../../shared/landingFeatures";
import {
  ADDON_NAMES,
  PRICING,
  addonPrice,
  formatEuro,
} from "../../shared/pricing";
import { SEO_INDUSTRIES } from "./landingPages";
import { escapeHtml } from "./metaInjection";

// Einzige Preisquelle ist shared/pricing.ts (wie in shared.tsx `Price`) —
// Prerender und React-Landing dürfen hier nicht auseinanderlaufen
// (Cloaking-Risiko, siehe Kopfkommentar).
const PRICE_YEARLY = formatEuro(PRICING.base.yearly); // „19,90 €"
const PRICE_MONTHLY = formatEuro(PRICING.base.monthly); // „24,90 €"

// Muss den `.klarstart-live`-Tokens in
// client/src/pages/landing-concepts/clear-flow.css entsprechen, sonst blitzt
// beim Mount ein Theme-Wechsel auf.
const C = {
  bg: "#ffffff",
  panel: "#f5f6f0",
  ink: "#242424",
  muted: "#62675b",
  faint: "#62675b",
  line: "#d8ddce",
  volt: "#d5f330",
  voltInk: "#25300d",
};

/** Die drei Branchenbeispiele aus dem Klarstart-Hero (`choices`). */
const CHOICES = [
  { label: "Salon & Beauty", pack: "salon-noir", name: "NOIR Haarstudio" },
  { label: "Restaurant & Café", pack: "gusto", name: "Trattoria Lucia" },
  { label: "Architektur & Planung", pack: "raster", name: "Studio Raster" },
];

/** Vorteilsleiste unter dem Hero (`clear-benefit-strip`). */
const BENEFITS = [
  "Ohne Programmieren",
  "Für Handy & Desktop",
  "Entwurf kostenlos",
  "Hosting inklusive",
];

/** Die drei Schritte aus BuildStory.tsx (`steps`). */
const STEPS = [
  {
    title: "Deinen Betrieb finden.",
    desc: "Dein Name genügt für den Anfang. Vorhandene Informationen werden zum Ausgangspunkt.",
  },
  {
    title: "Deinen Entwurf ansehen.",
    desc: "Aus deinen Inhalten werden Design, Bilder und Texte. Dein erster Auftritt nimmt Form an.",
  },
  {
    title: "Mit gutem Gefühl online.",
    desc: "Alles prüfen, den letzten Schliff geben und freischalten. So könnte das Ergebnis aussehen.",
  },
];

/** Die Punkte aus dem Abschnitt „Deine Website bleibt deine Website". */
const CONTROL_POINTS = [
  "Texte und Bilder jederzeit anpassen",
  "Farben und Schriften selbst wählen",
  "Änderungen in der Vorschau prüfen",
];

/** Leistungen der Basis — wortgleich mit `Price` in shared.tsx. */
const PLAN_FEATURES = [
  "Deine Website mit individuellem Design",
  "Hosting und SSL inklusive",
  "Texte und Bilder im Studio bearbeiten",
  "Eigene Domain verbinden oder Subdomain nutzen",
];

/** „Schon in der Basis enthalten" aus ClearFeatures.tsx. */
const FOUNDATION = ["Hosting", "SSL-Verschlüsselung", "Handy & Desktop"];

/**
 * FAQPage-JSON-LD aus derselben Quelle wie der sichtbare FAQ-Block — und
 * bewusst nur die sichtbaren Fragen: Markup für Inhalt, den niemand sieht,
 * kostet die Rich Results (siehe HOME_FAQ_VISIBLE in shared/faq.ts).
 */
export function buildHomeFaqSchema(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ_VISIBLE.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
}

const H2 = `font-size:1.75rem;font-weight:700;letter-spacing:-.02em;margin:0 0 1rem;color:${C.ink}`;
const EYEBROW = `margin:0 0 .5rem;font-size:.72rem;letter-spacing:.07em;text-transform:uppercase;color:${C.voltInk}`;
const LEAD = `font-size:1rem;line-height:1.6;color:${C.muted};margin:0`;
const CARD = `border:1px solid ${C.line};border-radius:16px;padding:1.25rem`;

/**
 * HTML-Fragment für `#root`. Enthält bewusst Inline-Styles: Das CSS-Bundle ist
 * beim ersten Paint noch nicht da, und ohne Styles wäre der Prerender ein
 * unformatierter Textblock – schlecht für die wahrgenommene Ladezeit.
 */
export function generateHomePrerender(): string {
  const industryLinks = Object.values(SEO_INDUSTRIES)
    .map(
      i =>
        `<a href="/website-erstellen/${i.slug}" style="color:${C.muted};text-decoration:none;font-size:.875rem">Website für ${escapeHtml(i.displayName)}</a>`
    )
    .join("\n        ");

  const choices = CHOICES.map(
    c =>
      `<li style="${CARD}"><h3 style="font-size:1rem;font-weight:700;margin:0 0 .35rem;color:${C.ink}">${escapeHtml(c.label)}</h3><p style="font-size:.875rem;line-height:1.55;color:${C.muted};margin:0 0 .5rem">Beispielwebsite ${escapeHtml(c.name)}</p><a href="/demo/${c.pack}" style="font-size:.875rem;color:${C.ink}">Live ansehen</a></li>`
  ).join("\n          ");

  const benefits = BENEFITS.map(
    b =>
      `<li style="border:1px solid ${C.line};border-radius:999px;padding:.5rem 1rem;font-size:.85rem;color:${C.ink}">${escapeHtml(b)}</li>`
  ).join("\n          ");

  const steps = STEPS.map(
    (s, i) =>
      `<li style="display:flex;gap:1.5rem"><div style="color:${C.voltInk};font-size:.8rem;padding-top:.25rem">0${i + 1}</div><div><h3 style="font-size:1.125rem;font-weight:700;margin:0 0 .5rem;color:${C.ink}">${escapeHtml(s.title)}</h3><p style="font-size:.875rem;line-height:1.6;color:${C.muted};margin:0">${escapeHtml(s.desc)}</p></div></li>`
  ).join("\n          ");

  const features = LANDING_FEATURES.map(
    f =>
      `<li style="${CARD}"><p style="${EYEBROW}">${escapeHtml(ADDON_NAMES[f.id])}</p><h3 style="font-size:1.05rem;font-weight:700;margin:0 0 .5rem;color:${C.ink}">${escapeHtml(f.title)}</h3><p style="font-size:.875rem;line-height:1.55;color:${C.muted};margin:0 0 .75rem">${escapeHtml(f.text)}</p><p style="font-size:.8rem;color:${C.muted};margin:0">${escapeHtml(f.benefit)}</p><p style="font-size:.8rem;color:${C.ink};margin:.5rem 0 0">Optional · + ${escapeHtml(formatEuro(addonPrice(f.id)))}/Monat</p></li>`
  ).join("\n          ");

  const faqs = HOME_FAQ_VISIBLE.map(
    f =>
      `<div style="border-top:1px solid ${C.line};padding:1.25rem 0"><h3 style="font-size:1rem;font-weight:600;margin:0 0 .5rem;color:${C.ink}">${escapeHtml(f.q)}</h3><p style="margin:0;color:${C.muted};line-height:1.7;font-size:.9375rem">${escapeHtml(f.a)}</p></div>`
  ).join("\n        ");

  // Echtes GET-Formular: funktioniert identisch zu `StartForm` in shared.tsx,
  // aber auch ganz ohne JavaScript. /start liest ?name= aus und springt direkt
  // in die Google-My-Business-Suche.
  const startForm = (id: string) =>
    `<form action="/start" method="get" style="max-width:36rem;margin:0">
        <input type="hidden" name="billing" value="yearly"/>
        <label for="${id}" style="display:block;font-size:.875rem;color:${C.muted};margin:0 0 .5rem">Wie heißt dein Betrieb?</label>
        <div style="display:flex;flex-wrap:wrap;gap:.75rem">
          <input id="${id}" type="text" name="name" placeholder="Name deines Betriebs" autocomplete="organization"
                 style="flex:1 1 12rem;height:3.5rem;padding:0 1.25rem;border-radius:999px;border:1px solid ${C.line};background:${C.panel};font-size:1rem;color:${C.ink}"/>
          <button type="submit"
                  style="height:3.5rem;padding:0 1.5rem;border:0;border-radius:999px;background:${C.volt};color:${C.voltInk};font-size:1rem;font-weight:700;cursor:pointer">Meine Website ansehen</button>
        </div>
        <p style="font-size:.8rem;color:${C.faint};margin:.75rem 0 0">Vorschau kostenlos. Keine Kreditkarte. Du entscheidest danach.</p>
      </form>`;

  // Container-Breite/-Padding und die H1-Typografie spiegeln `.lc-width` und
  // `.clear-hero h1` aus den landing-concepts-Stylesheets (dort
  // clamp(48px,5.6vw,80px), unter 680px clamp(41px,10.9vw,60px) — hier in
  // einer Angabe, weil Inline-Styles keine Media Query kennen): Der
  // Prerender-H1 ist der LCP-Kandidat der Seite (erster Paint); die
  // React-Fassung derselben Überschrift ist beim Mount nicht größer. Die
  // Untergrenze muss auf 390px passen, sonst schiebt die Zeile die ganze
  // Seite seitlich raus. Bei Token-Änderungen mitziehen.
  return `<div id="prerender" style="background:${C.bg};color:${C.ink};font-family:'Space Grotesk',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased">
  <div style="max-width:1360px;margin:0 auto;padding:2rem clamp(1.25rem,4vw,3rem) 4rem">

    <header style="display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap;padding:1rem 0 4rem">
      <span style="font-size:1.25rem;font-weight:700;letter-spacing:-.02em;color:${C.ink}">Pageblitz</span>
      <nav style="display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;font-size:.875rem;color:${C.muted}">
        <a href="#entdecken" style="color:${C.muted};text-decoration:none">Beispiele</a>
        <a href="#ablauf" style="color:${C.muted};text-decoration:none">So geht’s</a>
        <a href="#funktionen" style="color:${C.muted};text-decoration:none">Funktionen</a>
        <a href="#preise" style="color:${C.muted};text-decoration:none">Preise</a>
        <a href="/login" style="color:${C.muted};text-decoration:none">Anmelden</a>
        <a href="/start" style="color:${C.ink};text-decoration:none;font-weight:600">Kostenlos starten</a>
      </nav>
    </header>

    <section>
      <p style="${EYEBROW}">Deine Website. Mit KI für deinen Betrieb.</p>
      <h1 style="font-size:clamp(2.5rem,5.6vw,5rem);font-weight:700;letter-spacing:-.03em;line-height:1.02;margin:0 0 1.5rem;text-wrap:balance;max-width:18ch">Deine Website?<br>Schon fast fertig.</h1>
      <p style="font-size:1.1rem;line-height:1.55;color:${C.muted};max-width:34rem;margin:1.5rem 0 2rem">Du kennst deinen Betrieb. Unsere KI macht deine Website daraus. Mit Texten für dein Angebot, deinen Bildern und einem Design, das nach dir aussieht.</p>
      ${startForm("prerender-start-hero")}
      <div id="entdecken" style="margin-top:3rem">
        <h2 style="${H2}">Was machst du?</h2>
        <p style="${LEAD};margin-bottom:1.5rem">Wähle eine Branche und entdecke, wie dein Auftritt aussehen könnte.</p>
        <ul style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;list-style:none;margin:0;padding:0">
          ${choices}
        </ul>
        <p style="${LEAD};margin-top:1rem">Deine Farben, deine Schriften, deine Inhalte. Du bestimmst den letzten Schliff.</p>
      </div>
      <ul style="display:flex;flex-wrap:wrap;gap:.75rem;list-style:none;margin:2rem 0 0;padding:0">
        ${benefits}
      </ul>
    </section>

    <section id="ablauf" style="padding:4rem 0">
      <p style="${EYEBROW}">Ein Name. Ein Entwurf. Dein Auftritt.</p>
      <h2 style="${H2}">Dein Alltag ist voll genug.<br>Das hier bleibt einfach.</h2>
      <ul style="display:grid;gap:1.75rem;max-width:640px;list-style:none;margin:2rem 0 0;padding:0">
        ${steps}
      </ul>
      <p style="font-size:.8rem;color:${C.faint};margin:1.5rem 0 0;max-width:60ch">Beispielhafte Darstellung. Die Google-Aufnahme erfolgt nicht sofort; Zeitpunkt und Platzierung bestimmt Google.</p>
    </section>

    <section style="padding:4rem 0">
      <p style="${EYEBROW}">Deine Website bleibt deine Website</p>
      <h2 style="${H2}">Neue Öffnungszeiten?<br>Änderst du einfach selbst.</h2>
      <p style="${LEAD};max-width:60ch">Du brauchst für jede Kleinigkeit weder eine Agentur noch einen Kurs. Im Designstudio bearbeitest du Texte und Bilder direkt – oder lässt dir von der KI helfen.</p>
      <ul style="margin:1.5rem 0 0;padding-left:1.25rem;color:${C.ink};line-height:2;max-width:60ch">
        ${CONTROL_POINTS.map(p => `<li>${escapeHtml(p)}</li>`).join("\n        ")}
      </ul>
    </section>

    <section id="funktionen" style="padding:4rem 0">
      <p style="${EYEBROW}">Eine Website, die dir Arbeit abnimmt</p>
      <h2 style="${H2}">Alles, was dein Betrieb braucht.<br>Und nur das, was du möchtest.</h2>
      <p style="${LEAD};margin-bottom:2rem">Starte mit deiner Website. Ergänze die Funktionen, die zu deinem Alltag passen.</p>
      <ul style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;list-style:none;margin:0;padding:0">
          ${features}
      </ul>
      <div style="margin-top:2rem;max-width:42rem;border:1px solid ${C.line};border-radius:16px;background:${C.panel};padding:1.25rem">
        <p style="${EYEBROW}">Schon in der Basis enthalten</p>
        <h3 style="font-size:1.05rem;font-weight:700;margin:0 0 .5rem;color:${C.ink}">Die Technik läuft. Du machst dein Geschäft.</h3>
        <p style="font-size:.875rem;line-height:1.55;color:${C.muted};margin:0 0 1rem">Hosting, SSL und ein Design für Handy und Desktop gehören dazu. Verbinde deine eigene Domain oder starte mit einer Pageblitz-Subdomain.</p>
        <ul style="display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;list-style:none;margin:0;padding:0;font-size:.85rem;color:${C.ink}">
          ${FOUNDATION.map(f => `<li>${escapeHtml(f)}</li>`).join("\n          ")}
        </ul>
      </div>
    </section>

    <section id="preise" style="padding:4rem 0">
      <p style="${EYEBROW}">Transparent von Anfang an</p>
      <h2 style="${H2}">Erst überzeugt.<br>Dann bezahlt.</h2>
      <p style="${LEAD};max-width:60ch">Deine Vorschau kostet nichts. Für den laufenden Betrieb wählst du deinen Tarif und nur die Extras, die du wirklich brauchst.</p>
      <p style="margin:1rem 0 2rem;color:${C.ink};max-width:60ch"><strong>Die Basis ist schon dabei.</strong> Kein separates Hosting suchen. Kein SSL einrichten. Kein Honorar für jede Textänderung.</p>
      <div style="max-width:32rem;border:1px solid ${C.line};border-radius:16px;padding:1.5rem">
        <p style="font-size:2.25rem;font-weight:700;letter-spacing:-.02em;margin:0;color:${C.ink}">${PRICE_YEARLY}/Monat</p>
        <p style="font-size:.875rem;color:${C.muted};margin:.25rem 0 1.25rem">Im Jahrestarif · Keine Einrichtungsgebühr. Bei monatlicher Abrechnung ${PRICE_MONTHLY}/Monat.</p>
        <ul style="margin:0;padding-left:1.25rem;color:${C.ink};line-height:2">
          ${PLAN_FEATURES.map(f => `<li>${escapeHtml(f)}</li>`).join("\n          ")}
        </ul>
        <p style="margin:1.25rem 0 0"><a href="/start?billing=yearly" style="display:inline-block;padding:.85rem 1.5rem;border-radius:999px;background:${C.volt};color:${C.voltInk};font-weight:700;text-decoration:none">Erst kostenlos ansehen</a></p>
        <p style="font-size:.8rem;color:${C.muted};margin:1rem 0 0">Optional: Galerie ab ${formatEuro(PRICING.addon)}/Monat, Terminbuchung ${formatEuro(PRICING.addonBooking)}/Monat, KI-Chat ${formatEuro(PRICING.addonAiChat)}/Monat.</p>
      </div>
    </section>

    <section style="padding:4rem 0">
      <h2 style="${H2}">Noch eine Frage?</h2>
      <div style="max-width:70ch">
        ${faqs}
      </div>
    </section>

    <section id="start" style="padding:4rem 0">
      <p style="${EYEBROW}">Der erste Schritt dauert nur einen Moment</p>
      <h2 style="${H2}">Wie würde deine<br>neue Website aussehen?</h2>
      ${startForm("prerender-start-final")}
    </section>

    <section style="padding:3rem 0;border-top:1px solid ${C.line}">
      <h2 style="font-size:.75rem;letter-spacing:.09em;text-transform:uppercase;font-weight:600;margin:0 0 1.25rem;color:${C.muted}">Website für deine Branche</h2>
      <div style="display:flex;flex-wrap:wrap;gap:.75rem 1.5rem">
        ${industryLinks}
      </div>
      <p style="margin:1.25rem 0 0"><a href="/website-erstellen" style="font-size:.875rem;font-weight:500;color:${C.ink}">Alle Branchen ansehen</a></p>
    </section>

    <footer style="padding:2rem 0;border-top:1px solid ${C.line};font-size:.875rem;color:${C.faint}">
      <p style="margin:0">Dein Geschäft. Deine Website. · © ${new Date().getFullYear()} Pageblitz · <a href="/impressum" style="color:${C.faint}">Impressum</a> · <a href="/datenschutz" style="color:${C.faint}">Datenschutz</a> · <a href="mailto:hallo@pageblitz.de" style="color:${C.faint}">Kontakt</a></p>
    </footer>

  </div>
</div>`;
}
