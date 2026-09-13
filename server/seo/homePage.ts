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
 * an der Landingpage diese Datei mitziehen. Stand: Nachtschicht-Relaunch
 * 2026-08-29 (docs/superpowers/specs/2026-08-29-landing-relaunch-dark-volt-design.md).
 */
import { HOME_FAQ_ITEMS } from "../../shared/faq";
import {
  ADDON_NAMES,
  BOOKABLE_ADDON_KEYS,
  PRICING,
  addonPrice,
  formatEuro,
} from "../../shared/pricing";
import { PACK_SUMMARY } from "../../shared/stylePacks/summary";
import { SEO_INDUSTRIES } from "./landingPages";
import { escapeHtml } from "./metaInjection";

// Einzige Preisquelle ist shared/pricing.ts (wie PRICE_YEARLY/PRICE_MONTHLY in
// client/src/components/landing/primitives.tsx) — Prerender und React-Landing
// dürfen hier nicht auseinanderlaufen (Cloaking-Risiko, siehe Kopfkommentar).
const PRICE_YEARLY = formatEuro(PRICING.base.yearly); // „19,90 €"
const PRICE_MONTHLY = formatEuro(PRICING.base.monthly); // „24,90 €"

// Nachtschicht-Farbwerte — müssen den `.lp`-Tokens in client/src/index.css
// entsprechen, sonst blitzt beim Mount ein Theme-Wechsel auf.
const C = {
  bg: "#ffffff",
  panel: "#f5f6f0",
  ink: "#242424",
  muted: "#62675b",
  faint: "#62675b",
  line: "#d8ddce",
  volt: "#d5f330",
  voltInk: "#0b0b0d",
};

// Muss den Karten in client/src/components/landing/ProblemSection.tsx entsprechen.
const LOSSES = [
  {
    title: "Ein Auftritt, der nach dir aussieht.",
    desc: "Farben, Schriften und Aufbau passen zu deinem Betrieb. Deine Bilder und Texte machen den Unterschied.",
  },
  {
    title: "Alles Wichtige an einem Ort.",
    desc: "Was du anbietest, wann du da bist und wie man dich erreicht. Klar verständlich, auch auf dem Smartphone.",
  },
  {
    title: "Du behältst die Kontrolle.",
    desc: "Eine neue Leistung? Andere Öffnungszeiten? Im Designstudio bearbeitest du deine Website selbst – mit KI-Unterstützung, wenn du möchtest.",
  },
];

// Muss den Schritten in client/src/components/landing/HowItWorks.tsx entsprechen.
const STEPS = [
  {
    n: "01",
    title: "Firmenname eingeben – oder Google-Profil übernehmen",
    desc: "Name, Adresse, Öffnungszeiten, Fotos und Bewertungen werden automatisch übernommen.",
  },
  {
    n: "02",
    title: "Designrichtung bestimmen",
    desc: "Pageblitz startet mit einer kuratierten Richtung; Farben, Schriften und Bildwirkung passt du an.",
  },
  {
    n: "03",
    title: "Texte und Bilder prüfen",
    desc: "Links die Checkliste, rechts deine Website — live. Die KI hilft beim Formulieren.",
  },
  {
    n: "04",
    title: "Freischalten – und live",
    desc: "Gefällt dir die Vorschau, schaltest du sie mit einem Klick unter deiner Domain frei.",
  },
];

// Muss dem Anker-Block in client/src/components/landing/Pricing.tsx entsprechen.
const ANCHORS = [
  {
    kicker: "01 / Erst das Ergebnis",
    title: "Dein Entwurf kostet nichts.",
    text: "Sieh dir deine Website an und prüfe, ob sie zu deinem Betrieb passt. Ohne Kreditkarte.",
  },
  {
    kicker: "02 / Dann dein Tarif",
    title: "Die Basis steht. Du wählst die Extras.",
    text: "Hosting, SSL und das Designstudio sind dabei. Galerie, Terminbuchung oder KI-Chat buchst du nach Bedarf hinzu.",
  },
  {
    kicker: "03 / Auch danach",
    title: "Deine Website bleibt in deiner Hand.",
    text: "Texte und Bilder änderst du selbst im Studio. Ohne für jede kleine Anpassung einen Auftrag zu vergeben.",
  },
];

// Muss der Leistungsliste (INCLUDED) in client/src/components/landing/Pricing.tsx entsprechen.
const PLAN_FEATURES = [
  "KI-generierte Website",
  "SSL-Zertifikat",
  "DSGVO-konformer Datenschutz & Impressum",
  "Premium Cloud Hosting",
  "Website-Inhalte jederzeit mit Studio-KI ändern",
  "Chat-Support",
];

// Muss den Karten in client/src/components/landing/TrustSection.tsx entsprechen.
const TRUST_ITEMS = [
  {
    title: "Rechtliche Seiten vorbereitet",
    desc: "Impressum, Datenschutzerklärung und Cookie-Banner werden aus deinen Angaben erzeugt. Du prüfst die Angaben vor der Veröffentlichung.",
  },
  {
    title: "SSL & Hosting immer dabei",
    desc: "Verschlüsselte Verbindung und Cloud-Hosting sind inklusive. Verbinde deine eigene Domain oder nutze eine kostenlose Pageblitz-Subdomain.",
  },
  {
    title: "Deine Inhalte gehören dir",
    desc: "Texte, Fotos und Daten stammen von dir — und bleiben deins. Änderungen machst du jederzeit im Studio, auf Wunsch mit KI-Unterstützung.",
  },
  {
    title: "Monatlich kündbar",
    desc: "Keine Mindestlaufzeit, keine Kündigungsgebühr, kein Kleingedrucktes. Wenn Pageblitz nichts für dich ist, gehst du einfach.",
  },
];

/** FAQPage-JSON-LD aus derselben Quelle wie der sichtbare FAQ-Block. */
export function buildHomeFaqSchema(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ_ITEMS.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
}

const H2 = `font-size:1.75rem;font-weight:700;letter-spacing:-.02em;margin:0 0 1.5rem;color:${C.ink}`;

/**
 * HTML-Fragment für `#root`. Enthält bewusst Inline-Styles: Das CSS-Bundle ist
 * beim ersten Paint noch nicht da, und ohne Styles wäre der Prerender ein
 * unformatierter Textblock – schlecht für die wahrgenommene Ladezeit.
 * Dunkles Theme („Nachtschicht"), weil LandingPage.tsx dunkel mountet.
 */
export function generateHomePrerender(): string {
  const industryLinks = Object.values(SEO_INDUSTRIES)
    .map(
      i =>
        `<a href="/website-erstellen/${i.slug}" style="color:${C.muted};text-decoration:none;font-size:.875rem">Website für ${escapeHtml(i.displayName)}</a>`
    )
    .join("\n        ");

  const anchors = ANCHORS.map(
    ({ kicker: label, title: pb, text: agency }) =>
      `<div style="border-top:1px solid ${C.line};padding:1rem 0"><p style="margin:0;font-size:.72rem;letter-spacing:.07em;text-transform:uppercase;color:${C.volt}">${escapeHtml(label)}</p><p style="margin:.25rem 0 0;color:${C.faint}">${escapeHtml(agency)}</p><p style="margin:0;font-weight:700;color:${C.ink}">${escapeHtml(pb)}</p></div>`
  ).join("\n        ");

  const losses = LOSSES.map(
    l =>
      `<div style="border:1px solid ${C.line};border-radius:16px;padding:1.25rem"><h3 style="font-size:1.05rem;font-weight:700;margin:0 0 .5rem;color:${C.ink}">${escapeHtml(l.title)}</h3><p style="font-size:.875rem;line-height:1.55;color:${C.muted};margin:0">${escapeHtml(l.desc)}</p></div>`
  ).join("\n        ");

  const steps = STEPS.map(
    s =>
      `<div style="display:flex;gap:1.5rem"><div style="color:${C.volt};font-size:.8rem;padding-top:.25rem">${s.n}</div><div><h3 style="font-size:1.125rem;font-weight:700;margin:0 0 .5rem;color:${C.ink}">${escapeHtml(s.title)}</h3><p style="font-size:.875rem;line-height:1.6;color:${C.muted};margin:0">${escapeHtml(s.desc)}</p></div></div>`
  ).join("\n        ");

  const packs = PACK_SUMMARY.map(
    p =>
      `<div style="border:1px solid ${C.line};border-radius:16px;padding:1rem"><h3 style="font-size:1rem;font-weight:700;margin:0 0 .35rem;color:${C.ink}">${escapeHtml(p.name)}</h3><p style="font-size:.85rem;line-height:1.5;color:${C.muted};margin:0">${escapeHtml(p.essence)}</p></div>`
  ).join("\n        ");

  const trust = TRUST_ITEMS.map(
    t =>
      `<div style="border:1px solid ${C.line};border-radius:16px;padding:1.25rem"><h3 style="font-size:1.05rem;font-weight:700;margin:0 0 .5rem;color:${C.ink}">${escapeHtml(t.title)}</h3><p style="font-size:.875rem;line-height:1.55;color:${C.muted};margin:0">${escapeHtml(t.desc)}</p></div>`
  ).join("\n        ");

  const faqs = HOME_FAQ_ITEMS.map(
    f =>
      `<div style="border-top:1px solid ${C.line};padding:1.25rem 0"><h3 style="font-size:1rem;font-weight:600;margin:0 0 .5rem;color:${C.ink}">${escapeHtml(f.q)}</h3><p style="margin:0;color:${C.muted};line-height:1.7;font-size:.9375rem">${escapeHtml(f.a)}</p></div>`
  ).join("\n        ");

  // Container-Breite/-Padding und die H1-Typografie spiegeln `.lp-container`
  // und `.lp-h1--hero` aus client/src/index.css: Der Prerender-H1 ist der
  // LCP-Kandidat der Seite (erster Paint); die React-Fassung derselben
  // Überschrift ist beim Mount nicht größer. Bei Token-Änderungen mitziehen.
  return `<div id="prerender" style="background:${C.bg};color:${C.ink};font-family:'Space Grotesk',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased">
  <div style="max-width:1360px;margin:0 auto;padding:2rem clamp(1.25rem,4vw,3rem) 4rem">

    <header style="display:flex;align-items:center;justify-content:space-between;padding:1rem 0 4rem">
      <span style="font-size:1.25rem;font-weight:700;letter-spacing:-.02em;color:${C.ink}">Pageblitz</span>
      <nav style="display:flex;gap:1.5rem;font-size:.875rem;color:${C.muted}">
        <a href="/website-erstellen" style="color:${C.muted};text-decoration:none">Branchen</a>
        <a href="/login" style="color:${C.muted};text-decoration:none">Login</a>
        <a href="/start" style="color:${C.volt};text-decoration:none;font-weight:600">Kostenlos starten</a>
      </nav>
    </header>

    <section>
      <h1 style="font-size:clamp(3.25rem,6.5vw,6.4rem);font-weight:700;letter-spacing:-.03em;line-height:1.02;margin:0 0 1.5rem;text-wrap:balance;max-width:18ch">Deine Website?<br>Schon fast fertig.</h1>
      <p style="font-size:1.1rem;line-height:1.55;color:${C.muted};max-width:30rem;margin:1.5rem 0 2rem">Du bringst dein Geschäft mit. Pageblitz macht die Website daraus. Mit passenden Texten, deinen Bildern und einem Design, das nach dir aussieht.</p>
      <!-- Echtes GET-Formular: funktioniert identisch zum React-Hero, aber auch
           ganz ohne JavaScript. /start liest ?name= aus und springt direkt in
           die Google-My-Business-Suche. -->
      <form action="/start" method="get" style="display:flex;flex-wrap:wrap;gap:.75rem;max-width:32rem;margin:0 0 1rem">
        <input type="hidden" name="billing" value="yearly"/><input type="text" name="name" placeholder="Wie heißt dein Betrieb?" aria-label="Firmenname"
               autocomplete="organization"
               style="flex:1 1 16rem;height:3.5rem;padding:0 1.25rem;border-radius:999px;border:1px solid ${C.line};background:${C.panel};font-size:1rem;color:${C.ink}"/>
        <button type="submit"
                style="height:3.5rem;padding:0 1.5rem;border:0;border-radius:999px;background:${C.volt};color:${C.voltInk};font-size:1rem;font-weight:700;cursor:pointer">Meine Website ansehen</button>
      </form>
      <p style="font-size:.8rem;color:${C.faint};margin:0;letter-spacing:.02em;text-transform:uppercase"><span style="color:${C.volt}">Kostenlos ansehen</span> · Ohne Kreditkarte</p>
      <div style="margin-top:2.5rem;max-width:42rem">
        ${anchors}
      </div>
    </section>

    <section style="padding:4rem 0">
      <h2 style="${H2}">Du kümmerst dich um dein Geschäft. Deine Website steht schon.</h2>
      <div style="display:grid;gap:1rem;max-width:720px">
        ${losses}
      </div>
      <p style="font-size:1.35rem;font-weight:700;letter-spacing:-.02em;margin:2rem 0 0;max-width:34ch;color:${C.ink}">Kein leeres Blatt. Kein Technikprojekt. Ein fertiger erster Entwurf, den du zu deinem machst.</p>
    </section>

    <section style="padding:4rem 0">
      <h2 style="${H2}">Vier Schritte. Keine Technik.</h2>
      <div style="display:grid;gap:1.75rem;max-width:640px">
        ${steps}
      </div>
    </section>

    <section style="padding:4rem 0">
      <h2 style="${H2}">So unterschiedlich wie die Menschen dahinter.</h2>
      <p style="color:${C.muted};margin:0 0 2rem;max-width:36rem">Ein Friseursalon ist kein Architekturbüro. Und auch zwei Salons sind nie gleich. Entdecke unsere Designrichtungen – Farben, Typografie und Inhalte machen daraus deinen Auftritt.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem">
        ${packs}
      </div>
    </section>

    <section style="padding:4rem 0">
      <h2 style="${H2}">Ein guter Auftritt. Ein klarer Preis.</h2>
      <p style="color:${C.muted};margin:0 0 2rem">${PRICE_YEARLY}/Monat im Jahrestarif, ${PRICE_MONTHLY}/Monat bei monatlicher Zahlung. Die ersten 7 Tage sind kostenlos.</p>
      <ul style="margin:0;padding-left:1.25rem;color:${C.ink};line-height:2;max-width:60ch">
        ${PLAN_FEATURES.map(f => `<li>${escapeHtml(f)}</li>`).join("\n        ")}
      </ul>
      <div style="margin-top:2rem;max-width:42rem;border:1px solid ${C.line};border-radius:16px;background:${C.panel};padding:1.25rem">
        <h3 style="font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;margin:0 0 .5rem;color:${C.volt}">Optionale Extras</h3>
        <p style="font-size:.85rem;color:${C.muted};margin:0 0 1rem">Nur auswählen, was dein Betrieb wirklich braucht.</p>
        <ul style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 1.5rem;list-style:none;margin:0;padding:0">
          ${BOOKABLE_ADDON_KEYS.map(
            key =>
              `<li style="display:flex;justify-content:space-between;gap:.75rem;border-top:1px solid ${C.line};padding:.6rem 0;font-size:.85rem;color:${C.ink}"><span>${escapeHtml(ADDON_NAMES[key])}</span><span style="color:${C.muted};white-space:nowrap">+ ${escapeHtml(formatEuro(addonPrice(key)))}</span></li>`
          ).join("\n          ")}
        </ul>
      </div>
      <p style="margin:1.5rem 0 0;font-weight:700;color:${C.ink}">Keine Einrichtungsgebühr. Keine Kosten für den ersten Entwurf.</p>
    </section>

    <section style="padding:4rem 0">
      <h2 style="${H2}">Eine gute Entscheidung fühlt sich klar an.</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;max-width:900px">
        ${trust}
      </div>
    </section>

    <section style="padding:4rem 0">
      <h2 style="${H2}">Häufige Fragen.</h2>
      <div style="max-width:70ch">
        ${faqs}
      </div>
    </section>

    <section style="padding:3rem 0;border-top:1px solid ${C.line}">
      <h2 style="font-size:.75rem;letter-spacing:.07em;text-transform:uppercase;font-weight:500;margin:0 0 1.25rem;color:${C.volt}">Website erstellen – nach Branche</h2>
      <div style="display:flex;flex-wrap:wrap;gap:.75rem 1.5rem">
        ${industryLinks}
      </div>
    </section>

    <footer style="padding:2rem 0;border-top:1px solid ${C.line};font-size:.875rem;color:${C.faint}">
      <p style="margin:0">© ${new Date().getFullYear()} Pageblitz · <a href="/impressum" style="color:${C.faint}">Impressum</a> · <a href="/datenschutz" style="color:${C.faint}">Datenschutz</a></p>
    </footer>

  </div>
</div>`;
}
