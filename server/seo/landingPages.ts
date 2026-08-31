import { escapeHtml } from "./metaInjection";

export interface SeoIndustry {
  slug: string;
  displayName: string;
  title: string;
  h1Template: string; // supports {city}
  description: string;
  keywords: string[];
  features: Array<{ icon: string; title: string; text: string }>;
  faqs: Array<{ q: string; a: string }>;
}

export interface SeoCity {
  name: string;
  slug: string;
  /** Bundesland – für Breadcrumb und lokalen Kontext */
  region: string;
  /** Stadtteile für ortsspezifische Textbausteine */
  districts: string[];
  /** 2–3 Sätze über die lokale Kleinunternehmer-/Wettbewerbslage. Muss pro Stadt
   *  wirklich unterschiedlich sein – sonst sind die Seiten wieder Duplikate. */
  intro: string;
  /**
   * Vertiefender Stadt-Text (~150 Wörter, 2 Absätze via \n\n) gegen das
   * Thin-Content-Risiko der City-Pages (Audit 2026-08-31: ~660 → 900+
   * eindeutige Wörter). Rendert als .local-detail unterhalb der drei
   * Feature-Karten — nur wenn gesetzt.
   */
  description?: string;
}

// ── 17 Branchen ───────────────────────────────────────────────────────────────

export const SEO_INDUSTRIES: Record<string, SeoIndustry> = {
  friseur: {
    slug: "friseur",
    displayName: "Friseur",
    title: "Website für Friseur erstellen",
    h1Template:
      "KI-Website für deinen Friseursalon{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Friseure ab 19,90 €/Monat. Mit Galerie, Leistungsübersicht und Kontaktformular. Von der KI erstellt – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Friseur",
      "Friseursalon Website erstellen",
      "Homepage Friseur",
    ],
    features: [
      {
        icon: "✂️",
        title: "Online-Terminanfrage",
        text: "Kunden können dir direkt über das Kontaktformular eine Terminanfrage schicken – ohne Telefon.",
      },
      {
        icon: "🖼️",
        title: "Galerie für Frisuren",
        text: "Präsentiere deine besten Arbeiten in einer professionellen Bildergalerie und überzeuge neue Kunden.",
      },
      {
        icon: "💈",
        title: "Leistungsübersicht",
        text: "Zeige deine Leistungen und Preise übersichtlich – von Damen- und Herrenhaarschnitt bis hin zu Coloration.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Friseur?",
        a: "Mit Pageblitz startest du ab 19,90 €/Monat – ohne Einrichtungsgebühr. Die ersten 7 Tage sind gratis.",
      },
      {
        q: "Wie schnell ist meine Friseur-Website online?",
        a: "In der Regel in 3 Minuten. Die KI generiert deine Website sofort nach der Eingabe deiner Unternehmensdaten.",
      },
      {
        q: "Brauche ich einen Webdesigner für meine Friseur-Website?",
        a: "Nein. Pageblitz erstellt die Website automatisch per KI. Du musst keine Programmierkenntnisse haben.",
      },
      {
        q: "Kann ich meine Friseur-Website nach der Erstellung noch anpassen?",
        a: "Ja. Im Kundenbereich kannst du Texte, Bilder, Öffnungszeiten und Preise jederzeit aktualisieren.",
      },
    ],
  },

  restaurant: {
    slug: "restaurant",
    displayName: "Restaurant",
    title: "Website für Restaurant erstellen",
    h1Template: "KI-Website für dein Restaurant{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Restaurants ab 19,90 €/Monat. Speisekarte, Öffnungszeiten, Tisch-Reservierung – alles von der KI erstellt.",
    keywords: [
      "Website Restaurant",
      "Restaurant Website erstellen",
      "Homepage Gastronomie",
    ],
    features: [
      {
        icon: "🍽️",
        title: "Digitale Speisekarte",
        text: "Zeige dein Menü ansprechend auf der Website – inkl. Preise und Beschreibungen deiner Gerichte.",
      },
      {
        icon: "📅",
        title: "Tisch-Reservierung",
        text: "Nimm Tischreservierungen über ein einfaches Kontaktformular entgegen – direkt per E-Mail.",
      },
      {
        icon: "📍",
        title: "Öffnungszeiten & Standort",
        text: "Öffnungszeiten, Adresse und Anfahrt immer aktuell und gut sichtbar für deine Gäste.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für ein Restaurant?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis testen, keine Einrichtungsgebühr.",
      },
      {
        q: "Kann ich die Speisekarte auf meiner Restaurant-Website selbst aktualisieren?",
        a: "Ja. Du kannst Texte und Inhalte jederzeit im Kundenbereich anpassen.",
      },
      {
        q: "Wie schnell ist meine Restaurant-Website online?",
        a: "In 3 Minuten. Die KI generiert deine individuelle Restaurant-Website sofort.",
      },
      {
        q: "Braucht mein Restaurant eine eigene Website, wenn ich schon bei Lieferdiensten bin?",
        a: "Ja – eine eigene Website stärkt dein Markenimage, spart Provisionen und hilft Gästen, dich direkt zu finden.",
      },
    ],
  },

  handwerk: {
    slug: "handwerk",
    displayName: "Handwerker",
    title: "Website für Handwerker erstellen",
    h1Template:
      "KI-Website für deinen Handwerksbetrieb{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Handwerker ab 19,90 €/Monat. Leistungen, Referenzen, Anfrage-Formular – von der KI erstellt, als Vorschau in 3 Minuten.",
    keywords: [
      "Website Handwerker",
      "Handwerksbetrieb Website erstellen",
      "Homepage Handwerk",
    ],
    features: [
      {
        icon: "🔧",
        title: "Leistungsübersicht",
        text: "Präsentiere deine Gewerke und Leistungen klar – ob Sanitär, Elektro, Maler oder Zimmermann.",
      },
      {
        icon: "📋",
        title: "Angebotsanfrage",
        text: "Kunden können dich direkt über ein Formular für ein Angebot oder einen Termin kontaktieren.",
      },
      {
        icon: "🏗️",
        title: "Referenzprojekte",
        text: "Zeige abgeschlossene Projekte in einer Galerie und überzeuge neue Kunden von deiner Arbeit.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Handwerksbetrieb?",
        a: "Mit Pageblitz ab 19,90 €/Monat – ohne Einrichtungsgebühr, 7 Tage gratis.",
      },
      {
        q: "Welche Informationen brauche ich für meine Handwerker-Website?",
        a: "Name des Betriebs, Leistungen, Kontaktdaten und optional Bilder deiner Referenzprojekte.",
      },
      {
        q: "Wie schnell ist die Handwerker-Website online?",
        a: "In 3 Minuten. Die KI erstellt eine fertige Website basierend auf deinen Unternehmensdaten.",
      },
      {
        q: "Kann ich als Handwerker meine Website selbst pflegen?",
        a: "Ja. Kein technisches Vorwissen nötig – Inhalte aktualisieren per einfachem Dashboard.",
      },
    ],
  },

  zahnarzt: {
    slug: "zahnarzt",
    displayName: "Zahnarzt",
    title: "Website für Zahnarztpraxis erstellen",
    h1Template:
      "KI-Website für deine Zahnarztpraxis{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Zahnarztpraxen ab 19,90 €/Monat. Praxis, Team, Leistungen, Online-Terminanfrage – von der KI erstellt.",
    keywords: [
      "Website Zahnarzt",
      "Zahnarztpraxis Website erstellen",
      "Homepage Zahnarzt",
    ],
    features: [
      {
        icon: "🦷",
        title: "Leistungsübersicht",
        text: "Stell deine Behandlungsangebote vor – von Prophylaxe und Füllungen bis zu Implantaten und Bleaching.",
      },
      {
        icon: "📆",
        title: "Online-Terminanfrage",
        text: "Patienten können über ein Formular bequem einen Termin anfragen – rund um die Uhr.",
      },
      {
        icon: "👨‍⚕️",
        title: "Praxis & Team",
        text: "Stelle dich und dein Team vor, um Vertrauen bei neuen Patienten aufzubauen.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für eine Zahnarztpraxis?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis testen, keine Mindestlaufzeit.",
      },
      {
        q: "Ist die Zahnarzt-Website DSGVO-konform?",
        a: "Ja. Alle Pageblitz-Websites enthalten Impressum, Datenschutzerklärung und Cookie-Banner.",
      },
      {
        q: "Wie schnell ist die Praxis-Website online?",
        a: "In 3 Minuten. Die KI erstellt deine individuelle Praxis-Website sofort.",
      },
      {
        q: "Kann ich die Öffnungszeiten meiner Zahnarztpraxis selbst aktualisieren?",
        a: "Ja. Alle Inhalte lassen sich jederzeit im Kundenbereich anpassen.",
      },
    ],
  },

  kosmetik: {
    slug: "kosmetik",
    displayName: "Kosmetikstudio",
    title: "Website für Kosmetikstudio erstellen",
    h1Template:
      "KI-Website für dein Kosmetikstudio{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Kosmetikerinnen ab 19,90 €/Monat. Behandlungen, Preise, Galerie und Terminanfrage – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Kosmetikstudio",
      "Kosmetikerin Website erstellen",
      "Homepage Kosmetik",
    ],
    features: [
      {
        icon: "💆",
        title: "Behandlungsübersicht",
        text: "Zeige deine Leistungen übersichtlich – von Gesichtsbehandlung und Make-up bis zu Waxing und Maniküre.",
      },
      {
        icon: "📸",
        title: "Vorher-Nachher-Galerie",
        text: "Überzeuge neue Kunden mit Vorher-Nachher-Bildern und Einblicken in deine Arbeit.",
      },
      {
        icon: "📱",
        title: "Online-Terminanfrage",
        text: "Lass Kunden direkt über die Website einen Termin anfragen – ohne Telefon.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für ein Kosmetikstudio?",
        a: "Mit Pageblitz ab 19,90 €/Monat – ohne Einrichtungsgebühr, 7 Tage gratis.",
      },
      {
        q: "Kann ich Behandlungspreise auf meiner Kosmetik-Website anzeigen?",
        a: "Ja. Du kannst Leistungen inklusive Preise im Kundenbereich pflegen und aktualisieren.",
      },
      {
        q: "Wie schnell ist meine Kosmetik-Website online?",
        a: "In 3 Minuten. Die KI erstellt deine individuelle Website sofort.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Kosmetik-Website?",
        a: "Nein. Pageblitz wurde für Menschen ohne Technik-Kenntnisse entwickelt.",
      },
    ],
  },

  fitness: {
    slug: "fitness",
    displayName: "Fitnessstudio",
    title: "Website für Fitnessstudio erstellen",
    h1Template:
      "KI-Website für dein Fitnessstudio{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Fitnessstudios und Personal Trainer ab 19,90 €/Monat. Kurspläne, Mitgliedschaft, Fotos – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Fitnessstudio",
      "Personal Trainer Website erstellen",
      "Homepage Gym",
    ],
    features: [
      {
        icon: "💪",
        title: "Kursplan & Angebote",
        text: "Präsentiere dein Kursangebot, Mitgliedschaftsmodelle und Öffnungszeiten übersichtlich.",
      },
      {
        icon: "🏋️",
        title: "Studio-Galerie",
        text: "Zeige dein Gym, Geräte und Atmosphäre mit professionellen Fotos.",
      },
      {
        icon: "📝",
        title: "Probe-Training anfragen",
        text: "Interessenten können direkt über die Website ein Probe-Training oder Infos anfragen.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für ein Fitnessstudio?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Kann ich als Personal Trainer eine eigene Website erstellen?",
        a: "Ja. Pageblitz eignet sich sowohl für große Studios als auch für einzelne Personal Trainer.",
      },
      {
        q: "Wie schnell ist meine Fitness-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich Kurspläne selbst aktualisieren?",
        a: "Ja. Alle Inhalte lassen sich jederzeit im Kundenbereich anpassen.",
      },
    ],
  },

  arzt: {
    slug: "arzt",
    displayName: "Arztpraxis",
    title: "Website für Arztpraxis erstellen",
    h1Template: "KI-Website für deine Arztpraxis{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Arztpraxen ab 19,90 €/Monat. Praxis, Team, Leistungen, Öffnungszeiten – DSGVO-konform und als Vorschau in 3 Minuten.",
    keywords: ["Website Arztpraxis", "Arzt Website erstellen", "Homepage Arzt"],
    features: [
      {
        icon: "🏥",
        title: "Praxis & Team vorstellen",
        text: "Stelle deine Praxis und dein Team professionell vor – für mehr Vertrauen bei neuen Patienten.",
      },
      {
        icon: "📞",
        title: "Terminanfrage & Kontakt",
        text: "Patienten finden Öffnungszeiten, Telefonnummer und können online Termine anfragen.",
      },
      {
        icon: "🩺",
        title: "Leistungsübersicht",
        text: "Zeige deine Fachgebiete und Behandlungsangebote klar und übersichtlich.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für eine Arztpraxis?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Ist die Praxis-Website DSGVO-konform?",
        a: "Ja. Alle Pageblitz-Websites enthalten Impressum, Datenschutzerklärung und Cookie-Banner.",
      },
      {
        q: "Wie schnell ist die Arztpraxis-Website online?",
        a: "In 3 Minuten. Die KI generiert deine Website sofort nach Eingabe deiner Praxisdaten.",
      },
      {
        q: "Kann ich Öffnungszeiten und Urlaubszeiten selbst aktualisieren?",
        a: "Ja. Alle Inhalte lassen sich jederzeit ohne technisches Wissen aktualisieren.",
      },
    ],
  },

  immobilien: {
    slug: "immobilien",
    displayName: "Immobilienmakler",
    title: "Website für Immobilienmakler erstellen",
    h1Template:
      "KI-Website für deinen Immobilienmakler-Betrieb{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Immobilienmakler ab 19,90 €/Monat. Referenzobjekte, Kontaktformular, Über-Mich – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Immobilienmakler",
      "Makler Website erstellen",
      "Homepage Immobilien",
    ],
    features: [
      {
        icon: "🏠",
        title: "Referenzobjekte präsentieren",
        text: "Zeige erfolgreich vermittelte Objekte und überzeuge Käufer und Verkäufer von deiner Erfahrung.",
      },
      {
        icon: "📬",
        title: "Kontaktformular für Anfragen",
        text: "Potenzielle Käufer und Verkäufer können direkt Kontakt aufnehmen – ohne lästige Umwege.",
      },
      {
        icon: "👤",
        title: "Persönliches Profil",
        text: "Stell dich persönlich vor und baue Vertrauen auf – entscheidend im Immobiliengeschäft.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Immobilienmakler?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis testen, keine Mindestvertragsdauer.",
      },
      {
        q: "Wie schnell ist meine Makler-Website online?",
        a: "In 3 Minuten. Die KI erstellt deine individuelle Website sofort.",
      },
      {
        q: "Kann ich Objekte auf meiner Makler-Website selbst pflegen?",
        a: "Ja. Texte und Bilder lassen sich jederzeit im Kundenbereich anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Immobilien-Website?",
        a: "Nein. Pageblitz wurde speziell für Menschen ohne IT-Kenntnisse entwickelt.",
      },
    ],
  },

  rechtsanwalt: {
    slug: "rechtsanwalt",
    displayName: "Rechtsanwalt",
    title: "Website für Anwaltskanzlei erstellen",
    h1Template:
      "KI-Website für deine Anwaltskanzlei{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Rechtsanwälte ab 19,90 €/Monat. Fachgebiete, Kontaktformular, Kanzleivorstellung – DSGVO-konform.",
    keywords: [
      "Website Rechtsanwalt",
      "Anwaltskanzlei Website erstellen",
      "Homepage Anwalt",
    ],
    features: [
      {
        icon: "⚖️",
        title: "Fachgebiete darstellen",
        text: "Stell deine Rechtsgebiete klar vor – von Familienrecht und Erbrecht bis hin zu Arbeitsrecht.",
      },
      {
        icon: "📩",
        title: "Erstberatung anfragen",
        text: "Mandanten können direkt über ein Kontaktformular eine Erstberatung anfragen.",
      },
      {
        icon: "🏛️",
        title: "Kanzlei & Team",
        text: "Präsentiere dich und dein Team seriös und professionell – entscheidend für das Mandantenvertrauen.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Rechtsanwalt?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Ist die Anwalts-Website DSGVO-konform?",
        a: "Ja. Alle Pageblitz-Websites enthalten Impressum, Datenschutzerklärung und Cookie-Banner.",
      },
      {
        q: "Wie schnell ist meine Kanzlei-Website online?",
        a: "In 3 Minuten. Die KI generiert deine Website sofort.",
      },
      {
        q: "Kann ich die Inhalte meiner Kanzlei-Website selbst pflegen?",
        a: "Ja. Alle Texte und Informationen lassen sich jederzeit im Kundenbereich aktualisieren.",
      },
    ],
  },

  steuerberater: {
    slug: "steuerberater",
    displayName: "Steuerberater",
    title: "Website für Steuerberater erstellen",
    h1Template:
      "KI-Website für deine Steuerkanzlei{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Steuerberater ab 19,90 €/Monat. Leistungen, Team, Kontaktformular – DSGVO-konform und als Vorschau in 3 Minuten.",
    keywords: [
      "Website Steuerberater",
      "Steuerkanzlei Website erstellen",
      "Homepage Steuerberater",
    ],
    features: [
      {
        icon: "📊",
        title: "Leistungsübersicht",
        text: "Präsentiere dein Angebot – von Buchhaltung und Jahresabschluss bis hin zu Lohnabrechnung und Steuerplanung.",
      },
      {
        icon: "📬",
        title: "Mandantenanfragen",
        text: "Neue Mandanten können direkt über die Website Kontakt aufnehmen und eine Beratung anfragen.",
      },
      {
        icon: "🧑‍💼",
        title: "Kanzlei & Team",
        text: "Stelle dich und dein Team seriös vor und gewinne das Vertrauen potenzieller Mandanten.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Steuerberater?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis testen, keine Mindestlaufzeit.",
      },
      {
        q: "Ist die Steuerberater-Website DSGVO-konform?",
        a: "Ja. Impressum, Datenschutzerklärung und Cookie-Hinweis sind standardmäßig enthalten.",
      },
      {
        q: "Wie schnell ist meine Steuerkanzlei-Website online?",
        a: "In 3 Minuten. Die KI erstellt deine individuelle Website sofort.",
      },
      {
        q: "Kann ich die Inhalte selbst aktualisieren?",
        a: "Ja. Im Kundenbereich kannst du Texte und Informationen jederzeit anpassen.",
      },
    ],
  },

  fotograf: {
    slug: "fotograf",
    displayName: "Fotograf",
    title: "Website für Fotografen erstellen",
    h1Template: "KI-Website für dein Fotostudio{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Portfolio-Website für Fotografen ab 19,90 €/Monat. Portfolio-Galerie, Preisliste, Buchungsanfrage – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Fotograf",
      "Fotografen Website erstellen",
      "Portfolio Website Fotograf",
    ],
    features: [
      {
        icon: "📷",
        title: "Portfolio-Galerie",
        text: "Präsentiere deine besten Aufnahmen in einer professionellen Bildergalerie – der wichtigste Verkaufsmoment.",
      },
      {
        icon: "💶",
        title: "Preisliste für Shootings",
        text: "Zeige deine Pakete und Preise für Portrait-, Hochzeits-, Event- oder Produktfotografie.",
      },
      {
        icon: "📆",
        title: "Buchungsanfragen",
        text: "Kunden können direkt über die Website eine Buchungsanfrage stellen – einfach und schnell.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Fotografen?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Kann ich mein Portfolio auf der Website selbst pflegen?",
        a: "Ja. Fotos und Texte lassen sich jederzeit im Kundenbereich aktualisieren.",
      },
      {
        q: "Wie schnell ist meine Fotografen-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Portfolio-Website.",
      },
      {
        q: "Brauche ich eine eigene Domain für meine Fotografen-Website?",
        a: "Eine eigene Domain ist als Add-on nutzbar. Du kannst auch mit der pageblitz.de-Subdomain starten.",
      },
    ],
  },

  physiotherapie: {
    slug: "physiotherapie",
    displayName: "Physiotherapeut",
    title: "Website für Physiotherapeut erstellen",
    h1Template:
      "KI-Website für deine Physiopraxis{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Physiotherapeuten ab 19,90 €/Monat. Behandlungen, Team, Online-Terminanfrage – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Physiotherapeut",
      "Physiopraxis Website erstellen",
      "Physiotherapie Homepage",
    ],
    features: [
      {
        icon: "🦴",
        title: "Behandlungsübersicht",
        text: "Stell deine Behandlungsangebote vor – von Krankengymnastik und Manuelle Therapie bis zu Sportphysiotherapie.",
      },
      {
        icon: "📆",
        title: "Online-Terminanfrage",
        text: "Patienten können bequem online einen Termin anfragen – ohne Wartezeit am Telefon.",
      },
      {
        icon: "👩‍⚕️",
        title: "Team & Praxis",
        text: "Stelle dich und dein Team vor und vermittle Vertrauen bei neuen Patienten.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für eine Physiopraxis?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis testen, keine Mindestlaufzeit.",
      },
      {
        q: "Ist die Physio-Website DSGVO-konform?",
        a: "Ja. Impressum, Datenschutzerklärung und Cookie-Banner sind standardmäßig enthalten.",
      },
      {
        q: "Wie schnell ist die Physiotherapie-Website online?",
        a: "In 3 Minuten. Die KI erstellt deine Website sofort nach Eingabe deiner Praxisdaten.",
      },
      {
        q: "Kann ich die Öffnungszeiten selbst aktualisieren?",
        a: "Ja. Alle Inhalte lassen sich jederzeit im Kundenbereich anpassen.",
      },
    ],
  },

  nagelstudio: {
    slug: "nagelstudio",
    displayName: "Nagelstudio",
    title: "Website für Nagelstudio erstellen",
    h1Template: "KI-Website für dein Nagelstudio{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Nagelstudios ab 19,90 €/Monat. Preisliste, Galerie, Terminanfrage – als Vorschau in 3 Minuten und ohne Technik.",
    keywords: [
      "Website Nagelstudio",
      "Nagelstylistin Website erstellen",
      "Nail Art Homepage",
    ],
    features: [
      {
        icon: "💅",
        title: "Preisliste & Leistungen",
        text: "Zeige deine Angebote – von Gel, Acryl und Shellac bis hin zu Nail Art übersichtlich mit Preisen.",
      },
      {
        icon: "🖼️",
        title: "Nail Art Galerie",
        text: "Präsentiere deine schönsten Arbeiten und überzeuge neue Kunden von deiner Handwerkskunst.",
      },
      {
        icon: "📱",
        title: "Online-Terminanfrage",
        text: "Kunden können direkt über die Website einen Termin anfragen – einfach und schnell.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für ein Nagelstudio?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Nagelstudio-Website online?",
        a: "In 3 Minuten. Die KI erstellt deine Website sofort.",
      },
      {
        q: "Kann ich meine Preisliste selbst aktualisieren?",
        a: "Ja. Alle Inhalte lassen sich jederzeit im Kundenbereich anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Nagelstudio-Website?",
        a: "Nein. Pageblitz ist so einfach zu bedienen wie eine App.",
      },
    ],
  },

  baeckerei: {
    slug: "baeckerei",
    displayName: "Bäckerei",
    title: "Website für Bäckerei erstellen",
    h1Template: "KI-Website für deine Bäckerei{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Bäckereien und Konditoreien ab 19,90 €/Monat. Angebote, Öffnungszeiten, Sonderbestellungen – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Bäckerei",
      "Bäckerei Homepage erstellen",
      "Konditorei Website",
    ],
    features: [
      {
        icon: "🥖",
        title: "Produkte & Angebote",
        text: "Zeige dein Sortiment – vom täglich frischen Brot über Torten bis hin zu saisonalen Spezialitäten.",
      },
      {
        icon: "🕐",
        title: "Öffnungszeiten & Standort",
        text: "Kunden finden sofort deine Öffnungszeiten, Adresse und Anfahrtsbeschreibung.",
      },
      {
        icon: "🎂",
        title: "Sonderbestellungen",
        text: "Kunden können Hochzeitstorten, Geburtstagskuchen und andere Sonderwünsche direkt anfragen.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für eine Bäckerei?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis testen, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Bäckerei-Website online?",
        a: "In 3 Minuten. Die KI erstellt deine individuelle Website sofort.",
      },
      {
        q: "Kann ich Angebote und Produkte selbst aktualisieren?",
        a: "Ja. Alle Inhalte lassen sich jederzeit im Kundenbereich anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Bäckerei-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  reinigung: {
    slug: "reinigung",
    displayName: "Reinigungsservice",
    title: "Website für Reinigungsservice erstellen",
    h1Template:
      "KI-Website für deinen Reinigungsservice{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Reinigungsunternehmen ab 19,90 €/Monat. Leistungen, Angebote, Kontaktformular – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Reinigungsservice",
      "Reinigungsunternehmen Website erstellen",
      "Hausreinigung Homepage",
    ],
    features: [
      {
        icon: "🧹",
        title: "Leistungsübersicht",
        text: "Zeige deine Dienstleistungen – Büroreinigung, Haushaltsreinigung, Fensterreinigung und mehr.",
      },
      {
        icon: "💶",
        title: "Angebote anfragen",
        text: "Interessenten können direkt über ein Formular ein unverbindliches Angebot anfragen.",
      },
      {
        icon: "⭐",
        title: "Referenzen",
        text: "Präsentiere zufriedene Kunden und Referenzprojekte für mehr Vertrauen.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Reinigungsservice?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist die Reinigungsservice-Website online?",
        a: "In 3 Minuten. Die KI erstellt deine Website sofort.",
      },
      {
        q: "Kann ich meine Leistungen selbst aktualisieren?",
        a: "Ja. Alle Inhalte lassen sich im Kundenbereich jederzeit anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen?",
        a: "Nein. Pageblitz ist für Menschen ohne IT-Kenntnisse gemacht.",
      },
    ],
  },

  hundesalon: {
    slug: "hundesalon",
    displayName: "Hundesalon",
    title: "Website für Hundesalon erstellen",
    h1Template:
      "KI-Website für deinen Hundesalon{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Hundesalons und Tierpfleger ab 19,90 €/Monat. Preisliste, Galerie, Terminanfrage – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Hundesalon",
      "Tierpfleger Website erstellen",
      "Hundefriseur Homepage",
    ],
    features: [
      {
        icon: "🐕",
        title: "Pflegeleistungen & Preise",
        text: "Zeige dein Angebot – von Waschen, Scheren und Trimmen bis hin zu Krallenpflege mit Preisen.",
      },
      {
        icon: "📸",
        title: "Galerie zufriedener Fellnasen",
        text: "Präsentiere gepflegte Hunde in deiner Galerie – der beste Beweis für deine Arbeit.",
      },
      {
        icon: "📅",
        title: "Online-Terminanfrage",
        text: "Tierbesitzer können bequem online einen Termin anfragen – rund um die Uhr.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Hundesalon?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis testen, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Hundesalon-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich die Preisliste selbst aktualisieren?",
        a: "Ja. Alle Inhalte lassen sich jederzeit im Kundenbereich anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  musikschule: {
    slug: "musikschule",
    displayName: "Musikschule",
    title: "Website für Musikschule erstellen",
    h1Template:
      "KI-Website für deine Musikschule{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Musikschulen und Musiklehrer ab 19,90 €/Monat. Kurse, Instrumente, Schnupperstunde – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Musikschule",
      "Musiklehrer Website erstellen",
      "Musikunterricht Homepage",
    ],
    features: [
      {
        icon: "🎵",
        title: "Kurse & Instrumente",
        text: "Stelle dein Angebot vor – Einzel- und Gruppenunterricht für Gitarre, Klavier, Gesang und mehr.",
      },
      {
        icon: "📝",
        title: "Schnupperstunde anfragen",
        text: "Interessenten können direkt über die Website eine Schnupperstunde oder Infos anfragen.",
      },
      {
        icon: "🎓",
        title: "Lehrer & Biografie",
        text: "Stelle dich und deine musikalische Ausbildung vor – persönlich und überzeugend.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für eine Musikschule?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Musikschule-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich Kurse und Angebote selbst aktualisieren?",
        a: "Ja. Alle Inhalte lassen sich jederzeit im Kundenbereich anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Musikschule-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  elektriker: {
    slug: "elektriker",
    displayName: "Elektriker",
    title: "Website für Elektriker erstellen",
    h1Template:
      "KI-Website für deinen Elektrobetrieb{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Elektriker ab 19,90 €/Monat. Mit Leistungsübersicht, Notdienst-Kontakt und Referenzen. Von der KI erstellt – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Elektriker",
      "Elektriker Website erstellen",
      "Homepage Elektrobetrieb",
    ],
    features: [
      {
        icon: "⚡",
        title: "Notdienst-Kontakt",
        text: "Hebe deinen 24/7-Notdienst hervor und stelle sicher, dass Kunden dich in dringenden Situationen schnell erreichen.",
      },
      {
        icon: "🔌",
        title: "Leistungsübersicht",
        text: "Präsentiere deine Leistungen – von Neuinstallationen über Reparaturen bis hin zu Smart-Home-Lösungen.",
      },
      {
        icon: "🏆",
        title: "Referenzprojekte",
        text: "Zeige abgeschlossene Projekte und Kundenbewertungen, um Vertrauen bei neuen Auftraggebern aufzubauen.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Elektriker?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Elektriker-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich meinen Notdienst auf der Website hervorheben?",
        a: "Ja. Notdienst-Hinweis, Telefonnummer und Kontaktformular sind per KI automatisch eingebunden.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Elektriker-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  maler: {
    slug: "maler",
    displayName: "Malerbetrieb",
    title: "Website für Malerbetrieb erstellen",
    h1Template:
      "KI-Website für deinen Malerbetrieb{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Malerbetriebe ab 19,90 €/Monat. Vorher-Nachher-Galerie, Leistungen und Kontaktformular – von der KI erstellt.",
    keywords: [
      "Website Maler",
      "Malerbetrieb Website erstellen",
      "Homepage Malermeister",
    ],
    features: [
      {
        icon: "🎨",
        title: "Vorher-Nachher-Galerie",
        text: "Überzeuge Interessenten mit beeindruckenden Vorher-Nachher-Fotos deiner Streich- und Renovierungsarbeiten.",
      },
      {
        icon: "🖌️",
        title: "Leistungsspektrum",
        text: "Präsentiere alle Angebote – Innen- und Außenanstrich, Tapezierarbeiten, Fassadensanierung und mehr.",
      },
      {
        icon: "📋",
        title: "Kostenvoranschlag-Anfrage",
        text: "Kunden können direkt über das Kontaktformular einen unverbindlichen Kostenvoranschlag anfordern.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Malerbetrieb?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Maler-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich eigene Fotos meiner Malerarbeiten hochladen?",
        a: "Ja. Im Kundenbereich lassen sich Bilder jederzeit ergänzen oder austauschen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Maler-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  klempner: {
    slug: "klempner",
    displayName: "Klempner",
    title: "Website für Klempner erstellen",
    h1Template:
      "KI-Website für deinen Klempnerbetrieb{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Klempner ab 19,90 €/Monat. Mit Notdienst-Bereich, Leistungsübersicht und schneller Kontaktmöglichkeit – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Klempner",
      "Klempner Website erstellen",
      "Homepage Sanitärbetrieb",
    ],
    features: [
      {
        icon: "🔧",
        title: "24/7-Notdienst sichtbar machen",
        text: "Zeige deine Notdienst-Nummer prominent – damit Kunden bei Rohrbruch oder Verstopfung sofort auf dich zählen.",
      },
      {
        icon: "🚿",
        title: "Leistungen klar darstellen",
        text: "Von Rohrreparatur über Heizungsservice bis hin zur Badsanierung – alle Angebote auf einen Blick.",
      },
      {
        icon: "⭐",
        title: "Kundenbewertungen einbinden",
        text: "Baue Vertrauen auf, indem du zufriedene Kundenstimmen und Referenzprojekte auf deiner Website präsentierst.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Klempner?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Klempner-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich meinen Notdienst auf der Website besonders betonen?",
        a: "Ja. Notdiensthinweis und direkte Telefonnummer werden automatisch prominent platziert.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Klempner-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  gaertner: {
    slug: "gaertner",
    displayName: "Gärtner",
    title: "Website für Gärtner erstellen",
    h1Template:
      "KI-Website für deinen Gärtnereibetrieb{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Gärtner ab 19,90 €/Monat. Mit Saisondiensten, Bildergalerie und Kontaktformular – von der KI in Minuten erstellt.",
    keywords: [
      "Website Gärtner",
      "Gärtnerei Website erstellen",
      "Homepage Gartenservice",
    ],
    features: [
      {
        icon: "🌿",
        title: "Saisonale Leistungen",
        text: "Präsentiere dein Angebot nach Jahreszeiten – Rasenpflege, Baum­schnitt, Winterdienst und Gartenneugestaltung.",
      },
      {
        icon: "📸",
        title: "Garten-Galerie",
        text: "Zeige angelegte Gärten und Referenzprojekte in einer ansprechenden Bildergalerie.",
      },
      {
        icon: "📅",
        title: "Anfrage für Saisonarbeiten",
        text: "Kunden buchen direkt über das Kontaktformular – ideal für wiederkehrende Pflege­aufträge.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Gärtner?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Gärtner-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich saisonale Angebote wie Winterdienst hervorheben?",
        a: "Ja. Texte und Angebote lassen sich im Kundenbereich jederzeit aktualisieren.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Gärtner-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  tierarzt: {
    slug: "tierarzt",
    displayName: "Tierarzt",
    title: "Website für Tierarzt erstellen",
    h1Template:
      "KI-Website für deine Tierarztpraxis{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Tierarztpraxen ab 19,90 €/Monat. Mit Leistungsübersicht, Öffnungszeiten und Notfallkontakt – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Tierarzt",
      "Tierarztpraxis Website erstellen",
      "Homepage Veterinär",
    ],
    features: [
      {
        icon: "🐾",
        title: "Behandlungsangebote",
        text: "Informiere Tierhalter über dein Leistungsspektrum – Vorsorge, Impfungen, Operationen und Zahnarztleistungen für Tiere.",
      },
      {
        icon: "🚨",
        title: "Notfallkontakt",
        text: "Stelle sicher, dass der Notfallkontakt und die Vertretungsregelung für Tierhalter immer gut sichtbar sind.",
      },
      {
        icon: "📝",
        title: "Online-Terminanfrage",
        text: "Kunden können unkompliziert über das Kontaktformular einen Termin anfragen – rund um die Uhr.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für eine Tierarztpraxis?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Tierarzt-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich Notfallzeiten und Vertretungen auf der Website angeben?",
        a: "Ja. Alle Texte, Öffnungszeiten und Kontaktdaten lassen sich jederzeit anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Tierarzt-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  apotheke: {
    slug: "apotheke",
    displayName: "Apotheke",
    title: "Website für Apotheke erstellen",
    h1Template: "KI-Website für deine Apotheke{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Apotheken ab 19,90 €/Monat. Mit Öffnungszeiten, Notdienst-Hinweis und Leistungsübersicht – von der KI erstellt.",
    keywords: [
      "Website Apotheke",
      "Apotheke Website erstellen",
      "Homepage Apotheke",
    ],
    features: [
      {
        icon: "💊",
        title: "Leistungen & Services",
        text: "Stelle deine Services vor – Medikamenten­bestellung, Blutdruckmessung, Reiseimpf­beratung und mehr.",
      },
      {
        icon: "🕐",
        title: "Öffnungszeiten & Notdienst",
        text: "Zeige aktuelle Öffnungszeiten und Notdienstinformationen prominent – damit Kunden immer informiert sind.",
      },
      {
        icon: "📍",
        title: "Standort & Anfahrt",
        text: "Integriere Adresse und Anfahrtsbeschreibung, damit Kunden dich schnell und einfach finden.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für eine Apotheke?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Apotheken-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich den Notdienst-Kalender auf der Website einbinden?",
        a: "Notdiensthinweise lassen sich als Text jederzeit im Kundenbereich aktualisieren.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Apotheken-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  yogastudio: {
    slug: "yogastudio",
    displayName: "Yogastudio",
    title: "Website für Yogastudio erstellen",
    h1Template: "KI-Website für dein Yogastudio{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Yogastudios ab 19,90 €/Monat. Mit Kursplan, Lehrer-Profilen und Online-Kursanfrage – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Yogastudio",
      "Yogastudio Website erstellen",
      "Homepage Yoga",
    ],
    features: [
      {
        icon: "🧘",
        title: "Kursübersicht",
        text: "Präsentiere dein Kursangebot übersichtlich – Hatha, Vinyasa, Yin Yoga und mehr inklusive Schwierigkeitsgrad.",
      },
      {
        icon: "👩‍🏫",
        title: "Lehrer-Profile",
        text: "Stelle dein Team mit kurzen Biografien vor und schaffe eine persönliche Verbindung zu potenziellen Teilnehmern.",
      },
      {
        icon: "📱",
        title: "Kursanfrage & Probestunde",
        text: "Interessenten können direkt eine Probestunde buchen – einfach über das integrierte Kontaktformular.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für ein Yogastudio?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Yogastudio-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich meinen Kursplan auf der Website veröffentlichen?",
        a: "Ja. Kursbeschreibungen und Zeiten lassen sich im Kundenbereich jederzeit aktualisieren.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Yogastudio-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  fahrschule: {
    slug: "fahrschule",
    displayName: "Fahrschule",
    title: "Website für Fahrschule erstellen",
    h1Template: "KI-Website für deine Fahrschule{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Fahrschulen ab 19,90 €/Monat. Mit Preisliste, Führerscheinklassen und Online-Anmeldeformular – von der KI erstellt.",
    keywords: [
      "Website Fahrschule",
      "Fahrschule Website erstellen",
      "Homepage Fahrlehrer",
    ],
    features: [
      {
        icon: "🚗",
        title: "Führerscheinklassen im Überblick",
        text: "Erkläre alle angebotenen Führerscheinklassen verständlich – von Klasse B über Motorrad bis hin zum LKW.",
      },
      {
        icon: "💰",
        title: "Transparente Preisliste",
        text: "Zeige Ausbildungspreise offen und nachvollziehbar – das erhöht das Vertrauen und senkt Hemmschwellen.",
      },
      {
        icon: "📝",
        title: "Online-Anmeldung",
        text: "Neue Fahrschüler können sich direkt über das Kontaktformular anmelden – einfach und ohne Telefonat.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für eine Fahrschule?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Fahrschul-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich meine Preisliste und Führerscheinklassen selbst pflegen?",
        a: "Ja. Alle Inhalte lassen sich jederzeit im Kundenbereich anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Fahrschul-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  "kfz-werkstatt": {
    slug: "kfz-werkstatt",
    displayName: "Kfz-Werkstatt",
    title: "Website für Kfz-Werkstatt erstellen",
    h1Template:
      "KI-Website für deine Kfz-Werkstatt{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Kfz-Werkstätten ab 19,90 €/Monat. Mit Leistungsübersicht, Terminbuchung und Kundenbewertungen – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Kfz-Werkstatt",
      "Autowerkstatt Website erstellen",
      "Homepage Kfz-Betrieb",
    ],
    features: [
      {
        icon: "🔩",
        title: "Leistungsübersicht",
        text: "Zeige alle Services übersichtlich – Inspektion, TÜV-Vorbereitung, Reifenwechsel, Unfallinstandsetzung und mehr.",
      },
      {
        icon: "📆",
        title: "Online-Terminanfrage",
        text: "Kunden buchen ihren Werkstatttermin direkt über die Website – spart Zeit und reduziert Telefonanfragen.",
      },
      {
        icon: "⭐",
        title: "Bewertungen & Vertrauen",
        text: "Hebe positive Kundenstimmen hervor und präsentiere Marken und Zertifizierungen deiner Werkstatt.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für eine Kfz-Werkstatt?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Werkstatt-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich Sonderaktionen wie Reifenwechsel-Aktionen bewerben?",
        a: "Ja. Aktionen und Angebote lassen sich im Kundenbereich jederzeit aktualisieren.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Werkstatt-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  schluesseldienst: {
    slug: "schluesseldienst",
    displayName: "Schlüsseldienst",
    title: "Website für Schlüsseldienst erstellen",
    h1Template:
      "KI-Website für deinen Schlüsseldienst{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Schlüsseldienste ab 19,90 €/Monat. Mit Notdienst-Bereich, transparenten Preishinweisen und Kontakt – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Schlüsseldienst",
      "Schlüsseldienst Website erstellen",
      "Homepage Schlüsselnotdienst",
    ],
    features: [
      {
        icon: "🔑",
        title: "24/7-Notdienst hervorheben",
        text: "Stelle deinen Rund-um-die-Uhr-Notdienst in den Mittelpunkt – damit Kunden in der Aussperrsituation sofort Hilfe finden.",
      },
      {
        icon: "💡",
        title: "Transparente Preisgestaltung",
        text: "Informiere über Preisrahmen und Leistungsumfang – das schafft Vertrauen und hebt dich von unseriösen Anbietern ab.",
      },
      {
        icon: "📍",
        title: "Einsatzgebiet auf einen Blick",
        text: "Zeige klar, in welchen Städten und Stadtteilen du tätig bist, damit Kunden sofort wissen, ob du für sie infrage kommst.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Schlüsseldienst?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Schlüsseldienst-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich mein Einsatzgebiet und meine Preise klar kommunizieren?",
        a: "Ja. Alle Texte lassen sich im Kundenbereich jederzeit anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Schlüsseldienst-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  architekt: {
    slug: "architekt",
    displayName: "Architekt",
    title: "Website für Architekt erstellen",
    h1Template:
      "KI-Website für dein Architekturbüro{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Architekturbüros ab 19,90 €/Monat. Mit Portfolio, Leistungsprofil und Kontaktmöglichkeit – von der KI erstellt.",
    keywords: [
      "Website Architekt",
      "Architekturbüro Website erstellen",
      "Homepage Architekt",
    ],
    features: [
      {
        icon: "🏛️",
        title: "Portfolio-Galerie",
        text: "Präsentiere realisierte Projekte mit hochwertigen Fotos – von Einfamilienhäusern bis zu Gewerbeobjekten.",
      },
      {
        icon: "📐",
        title: "Leistungsprofil",
        text: "Erkläre dein Leistungsspektrum – Planung, Baugenehmigung, Bauleitung und Innenraumgestaltung auf einen Blick.",
      },
      {
        icon: "✉️",
        title: "Projektanfrage",
        text: "Interessenten nehmen direkt über das Kontaktformular Kontakt auf – für Erstgespräche und Machbarkeitsprüfungen.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für ein Architekturbüro?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Architekten-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich mein Projektportfolio mit eigenen Fotos befüllen?",
        a: "Ja. Im Kundenbereich lassen sich Bilder und Beschreibungen jederzeit ergänzen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Architekten-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  innenarchitekt: {
    slug: "innenarchitekt",
    displayName: "Innenarchitekt",
    title: "Website für Innenarchitekt erstellen",
    h1Template:
      "KI-Website für dein Innenarchitekturbüro{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Innenarchitekten ab 19,90 €/Monat. Mit Designportfolio, Leistungsübersicht und Kontaktformular – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Innenarchitekt",
      "Innenarchitektur Website erstellen",
      "Homepage Raumgestaltung",
    ],
    features: [
      {
        icon: "🛋️",
        title: "Design-Portfolio",
        text: "Zeige realisierte Raumgestaltungen mit stilvollen Fotos – von Privatwohnungen bis zu Büro- und Gastronomieprojekten.",
      },
      {
        icon: "🎨",
        title: "Designphilosophie",
        text: "Erkläre deinen Stil und deine Herangehensweise, um die richtigen Kunden anzusprechen und zu begeistern.",
      },
      {
        icon: "📐",
        title: "Leistungen im Überblick",
        text: "Von der Konzeptentwicklung über Materialauswahl bis zur Ausführungsplanung – präsentiere jeden Schritt deiner Arbeit.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Innenarchitekten?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Innenarchitekten-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich mein Portfolio mit eigenen Raumfotos zeigen?",
        a: "Ja. Bilder und Projekttexte lassen sich im Kundenbereich jederzeit hochladen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Innenarchitekten-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  buchhaltung: {
    slug: "buchhaltung",
    displayName: "Buchhaltungsbüro",
    title: "Website für Buchhaltungsbüro erstellen",
    h1Template:
      "KI-Website für dein Buchhaltungsbüro{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Buchhaltungsbüros ab 19,90 €/Monat. Mit Leistungsangeboten, Beratungstermin-Anfrage und Vertrauenssignalen – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Buchhaltung",
      "Buchhaltungsbüro Website erstellen",
      "Homepage Buchhalter",
    ],
    features: [
      {
        icon: "📊",
        title: "Leistungsübersicht",
        text: "Erkläre dein Angebot verständlich – Finanzbuchhaltung, Lohnabrechnung, Jahresabschluss und Steuerberatung.",
      },
      {
        icon: "🤝",
        title: "Vertrauen aufbauen",
        text: "Präsentiere Qualifikationen, Berufsjahre und Kundenstimmen, um seriös und kompetent zu wirken.",
      },
      {
        icon: "📅",
        title: "Beratungstermin anfragen",
        text: "Interessenten können direkt ein Erstgespräch anfragen – per Kontaktformular, schnell und unkompliziert.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für ein Buchhaltungsbüro?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Buchhaltungs-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich meine Qualifikationen und Zertifikate auf der Website zeigen?",
        a: "Ja. Alle Inhalte lassen sich im Kundenbereich jederzeit anpassen und ergänzen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Buchhaltungs-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  logopaedie: {
    slug: "logopaedie",
    displayName: "Logopädie",
    title: "Website für Logopädie erstellen",
    h1Template:
      "KI-Website für deine Logopädiepraxis{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Logopädiepraxen ab 19,90 €/Monat. Mit Therapieangeboten, Terminanfrage und wichtigen Infos für Patienten – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Logopädie",
      "Logopädie Praxis Website",
      "Homepage Logopäde",
    ],
    features: [
      {
        icon: "🗣️",
        title: "Therapieangebote",
        text: "Erkläre dein Leistungsspektrum – Sprachtherapie für Kinder und Erwachsene, Stottern, Schlucktherapie und mehr.",
      },
      {
        icon: "📋",
        title: "Infos für Patienten",
        text: "Beantworte häufige Fragen rund um Rezept, Kassenzulassung und Ablauf der ersten Therapiestunde.",
      },
      {
        icon: "📅",
        title: "Terminanfrage",
        text: "Patienten können unkompliziert über das Kontaktformular einen Ersttermin anfragen.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für eine Logopädiepraxis?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Logopädie-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich auf der Website über Kassenzulassung und Rezept informieren?",
        a: "Ja. Alle Informationstexte lassen sich im Kundenbereich jederzeit anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Logopädie-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  ergotherapie: {
    slug: "ergotherapie",
    displayName: "Ergotherapie",
    title: "Website für Ergotherapie erstellen",
    h1Template:
      "KI-Website für deine Ergotherapiepraxis{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Ergotherapiepraxen ab 19,90 €/Monat. Mit Therapieangeboten, Patienteninfos und Kontaktformular – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Ergotherapie",
      "Ergotherapie Praxis Website",
      "Homepage Ergotherapeut",
    ],
    features: [
      {
        icon: "🤲",
        title: "Therapiebereiche vorstellen",
        text: "Erkläre deine Schwerpunkte – pädiatrische Ergotherapie, neurologie, Handtherapie, psychiatrische Versorgung.",
      },
      {
        icon: "📖",
        title: "Patienteninformationen",
        text: "Informiere über Rezeptpflicht, Kassenzulassung und den Ablauf der Therapie – verständlich und transparent.",
      },
      {
        icon: "✉️",
        title: "Terminanfrage",
        text: "Patienten und Eltern nehmen einfach per Kontaktformular Kontakt auf – für Ersttermine und Beratung.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für eine Ergotherapiepraxis?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Ergotherapie-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich meine Therapieschwerpunkte auf der Website erklären?",
        a: "Ja. Alle Texte lassen sich im Kundenbereich jederzeit anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Ergotherapie-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  hebamme: {
    slug: "hebamme",
    displayName: "Hebamme",
    title: "Website für Hebamme erstellen",
    h1Template:
      "KI-Website für deine Hebammenpraxis{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Hebammen ab 19,90 €/Monat. Mit Leistungsübersicht, Betreuungsangeboten und Kontaktformular für werdende Mütter – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Hebamme",
      "Hebamme Website erstellen",
      "Homepage Hebammenpraxis",
    ],
    features: [
      {
        icon: "👶",
        title: "Betreuungsangebote",
        text: "Erkläre dein Angebot – Geburtsvorbereitungskurse, Wochenbettbetreuung, Rückbildung und Stillberatung.",
      },
      {
        icon: "💛",
        title: "Persönliche Vorstellung",
        text: "Stelle dich mit einem herzlichen Kurzprofil vor und schaffe sofort Vertrauen bei werdenden Eltern.",
      },
      {
        icon: "📝",
        title: "Anfrage für freie Termine",
        text: "Werdende Mütter können frühzeitig über das Kontaktformular anfragen – ideal für Kapazitätsplanung.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für eine Hebamme?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Hebammen-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich meine freien Betreuungskapazitäten kommunizieren?",
        a: "Ja. Texte und Verfügbarkeitshinweise lassen sich im Kundenbereich jederzeit aktualisieren.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Hebammen-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  pilates: {
    slug: "pilates",
    displayName: "Pilatesstudio",
    title: "Website für Pilatesstudio erstellen",
    h1Template:
      "KI-Website für dein Pilatesstudio{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Pilatesstudios ab 19,90 €/Monat. Mit Kursplan, Lehrer-Profilen und Probestunden-Anfrage – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Pilatesstudio",
      "Pilates Studio Website erstellen",
      "Homepage Pilates",
    ],
    features: [
      {
        icon: "🧘",
        title: "Kursangebot",
        text: "Stelle deine Kurse vor – Mat Pilates, Reformer, Pre- und Postnatal sowie Einzel- und Gruppentraining.",
      },
      {
        icon: "💪",
        title: "Trainer-Profile",
        text: "Präsentiere dein Trainer-Team mit Qualifikationen und persönlicher Note – für mehr Vertrauen und Bindung.",
      },
      {
        icon: "🎟️",
        title: "Probestunde buchen",
        text: "Neukunden können unkompliziert eine Probestunde anfragen – direkt über das Kontaktformular.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für ein Pilatesstudio?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Pilates-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich meinen Kursplan und Preise selbst aktualisieren?",
        a: "Ja. Alle Inhalte lassen sich im Kundenbereich jederzeit anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Pilates-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  reisebuero: {
    slug: "reisebuero",
    displayName: "Reisebüro",
    title: "Website für Reisebüro erstellen",
    h1Template: "KI-Website für dein Reisebüro{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Reisebüros ab 19,90 €/Monat. Mit Reiseangeboten, Beratungsleistungen und Kontaktmöglichkeit – von der KI erstellt.",
    keywords: [
      "Website Reisebüro",
      "Reisebüro Website erstellen",
      "Homepage Reisevermittlung",
    ],
    features: [
      {
        icon: "✈️",
        title: "Reiseangebote präsentieren",
        text: "Zeige Highlights deines Angebots – Pauschalreisen, Kreuzfahrten, Rundreisen und individuelle Urlaubsplanung.",
      },
      {
        icon: "🌍",
        title: "Reiseberatung hervorheben",
        text: "Positioniere deine persönliche Beratungsleistung als Mehrwert gegenüber unpersönlichen Online-Buchungsportalen.",
      },
      {
        icon: "📞",
        title: "Einfache Kontaktaufnahme",
        text: "Kunden können Reisewünsche bequem per Kontaktformular oder Telefon anfragen – für individuelle Angebote.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für ein Reisebüro?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Reisebüro-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich aktuelle Reiseangebote auf der Website veröffentlichen?",
        a: "Ja. Angebote und Texte lassen sich im Kundenbereich jederzeit aktualisieren.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Reisebüro-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  hausreinigung: {
    slug: "hausreinigung",
    displayName: "Hausreinigung",
    title: "Website für Hausreinigung erstellen",
    h1Template:
      "KI-Website für deinen Hausreinigungsservice{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Hausreinigungsservices ab 19,90 €/Monat. Mit Leistungsübersicht, Preisangaben und Kontaktformular – als Vorschau in 3 Minuten.",
    keywords: [
      "Website Hausreinigung",
      "Reinigungsservice Website erstellen",
      "Homepage Haushaltsreinigung",
    ],
    features: [
      {
        icon: "🧹",
        title: "Leistungspaket im Überblick",
        text: "Zeige alle Angebote – Unterhaltsreinigung, Fensterreinigung, Endreinigung und regelmäßige Haushaltshilfe.",
      },
      {
        icon: "✅",
        title: "Vertrauen & Seriosität",
        text: "Präsentiere Kundenbewertungen, Referenzen und Versicherungshinweise für maximale Sicherheit beim Auftraggeber.",
      },
      {
        icon: "📋",
        title: "Angebot einholen",
        text: "Interessenten können direkt über das Kontaktformular ein individuelles Angebot anfragen.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für einen Reinigungsservice?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Reinigungsservice-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich mein Einsatzgebiet und meine Leistungspakete beschreiben?",
        a: "Ja. Alle Texte lassen sich im Kundenbereich jederzeit anpassen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Reinigungsservice-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },

  fotostudio: {
    slug: "fotostudio",
    displayName: "Fotostudio",
    title: "Website für Fotostudio erstellen",
    h1Template: "KI-Website für dein Fotostudio{city} – Vorschau in 3 Minuten",
    description:
      "Professionelle Website für Fotostudios ab 19,90 €/Monat. Mit Portfolio, Leistungsangeboten und Buchungsanfrage – von der KI erstellt.",
    keywords: [
      "Website Fotostudio",
      "Fotograf Website erstellen",
      "Homepage Fotografen",
    ],
    features: [
      {
        icon: "📷",
        title: "Portfolio-Galerie",
        text: "Präsentiere deine besten Aufnahmen – Porträtfotos, Businessfotos, Hochzeits- und Produktfotografie.",
      },
      {
        icon: "🎬",
        title: "Leistungsangebote",
        text: "Erkläre dein Angebot übersichtlich – Shooting-Pakete, Locations, Bearbeitungsleistungen und Lieferzeiten.",
      },
      {
        icon: "📅",
        title: "Shooting-Anfrage",
        text: "Kunden buchen ihren Termin direkt über das Kontaktformular – unkompliziert und ohne langes Hin und Her.",
      },
    ],
    faqs: [
      {
        q: "Was kostet eine Website für ein Fotostudio?",
        a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr.",
      },
      {
        q: "Wie schnell ist meine Fotostudio-Website online?",
        a: "In 3 Minuten erstellt die KI deine fertige Website.",
      },
      {
        q: "Kann ich mein Fotoportfolio mit eigenen Bildern befüllen?",
        a: "Ja. Im Kundenbereich lassen sich Fotos und Beschreibungen jederzeit hochladen.",
      },
      {
        q: "Brauche ich technisches Wissen für meine Fotostudio-Website?",
        a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse.",
      },
    ],
  },
};

// ── 30 deutsche Städte nach Einwohnerzahl ────────────────────────────────────

// Bewusst nur 6 Städte statt der früheren 45.
//
// 45 Städte × 37 Branchen = 1.665 Seiten, die sich zu 99,2 % glichen – nur der
// Städtename wurde ausgetauscht. Google wertet so etwas als Doorway Pages
// (Spam-Richtlinien), indexiert die Seiten nicht und zieht die Domain-Qualität
// insgesamt runter. Weniger Seiten mit echtem Ortsbezug ranken besser als
// tausend austauschbare.
//
// Wer hier eine Stadt ergänzt, schreibt `intro` und `districts` bitte wirklich
// neu. Nur den Namen einsetzen reproduziert exakt das alte Problem.
// Entfernte Städte werden in index.ts per 301 auf die Branchenseite geleitet.
export const DE_CITIES: SeoCity[] = [
  {
    name: "Berlin",
    slug: "berlin",
    region: "Berlin",
    districts: [
      "Mitte",
      "Prenzlauer Berg",
      "Kreuzberg",
      "Charlottenburg",
      "Neukölln",
    ],
    intro:
      "Berlin ist der härteste Kiez-Markt Deutschlands: In Prenzlauer Berg oder Neukölln liegen oft ein Dutzend Betriebe derselben Branche in Laufweite. Wer hier gefunden werden will, braucht vor allem eine Website, die den Stadtteil klar benennt – die meisten Suchanfragen laufen nicht über „Berlin“, sondern über den Kiez. Dazu kommt ein hoher Anteil an Neuzugezogenen, die einen Betrieb ausschließlich online auswählen.",
    description:
      "Berlin zählt mehr Kleinbetriebe als jede andere deutsche Stadt — und kaum irgendwo wechselt die Kundschaft so schnell. Wer neu in den Kiez zieht, kennt weder den Friseur an der Ecke noch die Werkstatt zwei Straßen weiter; entschieden wird am Handy, zwischen U-Bahn-Station und Haustür. Dabei zählen drei Dinge: taucht der Betrieb für den Stadtteil auf, wirken die Fotos echt, und steht da ein Preis oder wenigstens eine klare Leistung. Ein Google-Profil allein reicht in Berlin selten — zu viele Einträge sehen gleich aus.\n\nFür deine Website heißt das: Stadtteil und Straße gehören prominent auf die Startseite, nicht versteckt ins Impressum. Nenne die Kieze, aus denen deine Kundschaft wirklich kommt, zeig echte Bilder aus dem Laden und mach die Kontaktaufnahme zum Ein-Finger-Klick. Genau diese Struktur legt Pageblitz automatisch an — mit deinem Stadtteil in Titel und Überschriften.",
  },
  {
    name: "Hamburg",
    slug: "hamburg",
    region: "Hamburg",
    districts: ["Altona", "Eimsbüttel", "St. Pauli", "Winterhude", "Eppendorf"],
    intro:
      "Hamburg ist stark in Stadtteile segmentiert – Eppendorf tickt anders als St. Pauli, und das schlägt auf Preisniveau und Bildsprache durch. Weil die Elbe die Stadt teilt, spielt Erreichbarkeit eine größere Rolle als anderswo: Anfahrt, Parkplatz und ÖPNV-Anbindung gehören auf einer Hamburger Website sichtbar nach oben, nicht ins Impressum.",
    description:
      "Hamburg ist eine Stadt der klaren Reviere: Wer in Eppendorf wohnt, sucht selten einen Betrieb in Harburg — die Elbe und die weiten Wege sortieren die Kundschaft von selbst. Deshalb gewinnt hier nicht der lauteste Anbieter, sondern der, der sein Einzugsgebiet präzise benennt. Dazu kommt ein Publikum, das Wert auf Verlässlichkeit legt: Hanseatische Zurückhaltung gilt auch bei der Anbieterwahl, übertriebene Werbeversprechen schrecken eher ab als sie überzeugen.\n\nDeine Website sollte deshalb nüchtern und konkret sein: welche Stadtteile du bedienst, wie man dich erreicht, wo man parkt oder welche Bahn hält. Öffnungszeiten und Anfahrt gehören sichtbar nach oben — bei Hamburger Wetter wird die Entscheidung oft unterwegs am Handy getroffen. Pageblitz baut diese Angaben automatisch dorthin, wo Google und deine Kundschaft sie zuerst sehen.",
  },
  {
    name: "München",
    slug: "muenchen",
    region: "Bayern",
    districts: [
      "Schwabing",
      "Haidhausen",
      "Maxvorstadt",
      "Sendling",
      "Giesing",
    ],
    intro:
      "In München sind Gewerbemieten hoch, und das prägt die Kundenerwartung: Wer hier Premiumpreise aufruft, muss das auf der Website auch zeigen – über Referenzen, Qualifikationen und saubere Fotos statt über Rabatte. Gleichzeitig ist der Anteil englischsprachiger Kundschaft in Schwabing und der Maxvorstadt spürbar höher als im Bundesschnitt.",
    description:
      "München hat die höchste Kaufkraft der deutschen Großstädte — und die höchsten Erwartungen. Kundschaft, die für Miete und Handwerkerstunde Münchner Preise zahlt, erwartet auch online einen professionellen Auftritt: Eine Website mit verpixeltem Logo und toten Links kostet hier schneller Aufträge als anderswo. Gleichzeitig ist die Konkurrenz durch alteingesessene Betriebe groß, die sich auf Empfehlungen über Jahrzehnte verlassen konnten. Wer neu ist oder wachsen will, muss über die Suche gefunden werden.\n\nDer Hebel: eine Website, die Qualität ausstrahlt, bevor das erste Gespräch stattfindet — saubere Typografie, echte Referenzfotos, klare Leistungsbeschreibung, gern mit Preisrahmen. Und weil viele Münchner Termine online erwarten, lohnt sich eine direkte Anfrage- oder Buchungsmöglichkeit. Pageblitz liefert beides: ein Design, das zum Preisniveau der Stadt passt, und die Anfrage in einem Klick.",
  },
  {
    name: "Köln",
    slug: "koeln",
    region: "Nordrhein-Westfalen",
    districts: ["Ehrenfeld", "Nippes", "Sülz", "Lindenthal", "Deutz"],
    intro:
      "Köln funktioniert über Veedel und Stammkundschaft – Empfehlungen zählen mehr als Werbebudget. Der typische Weg: Jemand hört von deinem Betrieb, googelt den Namen und will in zehn Sekunden Öffnungszeiten, Adresse und eine Telefonnummer sehen. Genau daran scheitern die meisten Kölner Kleinbetriebe, weil sie nur eine Facebook-Seite haben.",
    description:
      "In Köln läuft vieles über das Veedel: Man kennt seinen Bäcker, seinen Elektriker, seine Friseurin — und empfiehlt sie weiter. Diese Empfehlungskultur ist eine Stärke für etablierte Betriebe, aber eine Hürde für alle, die neu sind oder deren Stammkundschaft wegzieht. Denn die Zugezogenen, die jedes Jahr in die Stadt kommen, haben kein Veedel-Netzwerk. Sie fragen nicht den Nachbarn, sie fragen Google — und landen bei dem Betrieb, der online am greifbarsten wirkt.\n\nEine Kölner Website sollte deshalb das leisten, was sonst die Mundpropaganda erledigt: Vertrauen aufbauen. Echte Google-Bewertungen sichtbar einbinden, das Team zeigen, das Veedel beim Namen nennen. Wer aus Ehrenfeld kommt, klickt eher auf einen Betrieb, der „Ehrenfeld“ schreibt, als auf einen anonymen Köln-Eintrag. Pageblitz zieht Bewertungen und Ortsangaben automatisch an die richtigen Stellen.",
  },
  {
    name: "Frankfurt am Main",
    slug: "frankfurt",
    region: "Hessen",
    districts: [
      "Bornheim",
      "Sachsenhausen",
      "Nordend",
      "Bockenheim",
      "Westend",
    ],
    intro:
      "Frankfurt hat einen ungewöhnlich hohen Anteil an Pendlern und Kurzzeit-Bewohnern. Für lokale Betriebe heißt das: Ein großer Teil der Kundschaft kennt die Stadt kaum und entscheidet rein über Google – ohne Empfehlung, ohne Vorgeschichte. Online-Terminbuchung und mehrsprachige Angaben wirken hier stärker als in vergleichbar großen Städten.",
    description:
      "Frankfurt ist Deutschlands Pendlerhauptstadt: Tagsüber verdoppelt sich die Stadt beinahe, abends leeren sich Bankenviertel und Innenstadt. Für lokale Betriebe heißt das: Die Kundschaft entscheidet in Zeitfenstern — in der Mittagspause, auf dem Heimweg, am Wochenende im Wohnviertel. Dazu kommt ein internationales Publikum, das oft auf Englisch sucht und Betriebe strikt nach Online-Auftritt vorsortiert, weil persönliche Empfehlungen fehlen.\n\nDeine Website muss deshalb vor allem zwei Fragen sofort beantworten: Wann hast du auf, und wie schnell bekomme ich einen Termin? Öffnungszeiten, die Berufstätigen entgegenkommen, gehören genauso prominent auf die Seite wie eine Anfrage, die ohne Anruf funktioniert. Und wer sein Wohnviertel — ob Bornheim, Bockenheim oder Sachsenhausen — klar benennt, fängt die Suche nach Feierabend genau dort ab, wo sie stattfindet. Pageblitz strukturiert die Seite genau so.",
  },
  {
    name: "Stuttgart",
    slug: "stuttgart",
    region: "Baden-Württemberg",
    districts: [
      "Bad Cannstatt",
      "Vaihingen",
      "Feuerbach",
      "Degerloch",
      "Stuttgart-West",
    ],
    intro:
      "Stuttgart liegt im Kessel, und die Topografie prägt das Suchverhalten: Wer in Degerloch wohnt, sucht selten einen Betrieb in Feuerbach. Lokale Sichtbarkeit im eigenen Stadtbezirk schlägt hier stadtweite Reichweite. Dazu kommt eine mittelständisch geprägte Kundschaft, die Wert auf Handwerksqualität und belastbare Angaben legt – Meisterbrief und Zertifikate gehören sichtbar auf die Seite.",
    description:
      "Stuttgart ist eine Stadt der Ingenieure und Handwerker — Qualität wird hier nicht versprochen, sondern vorausgesetzt. Die Kundschaft vergleicht gründlich, liest Bewertungen bis zum Ende und misstraut allem, was nach leerer Werbung klingt. Dazu kommt die Kessellage: Viele Aufträge kommen nicht aus der Kernstadt, sondern aus den Teilorten und dem Speckgürtel von Fellbach bis Leinfelden — wer nur „Stuttgart“ schreibt, verschenkt genau diese Suchen.\n\nEine Website für den Stuttgarter Markt sollte deshalb sachlich überzeugen: konkrete Leistungen statt Floskeln, Referenzen mit echten Fotos, Qualifikationen und Meistertitel sichtbar. Und sie sollte das Einzugsgebiet ehrlich benennen — samt Anfahrt und Parkmöglichkeit, denn in der Region Stuttgart kommt die Kundschaft mit dem Auto. Pageblitz setzt Ort, Leistungen und Nachweise automatisch dorthin, wo schwäbische Gründlichkeit sie sucht.",
  },
];

// ── Per-industry visual style + relevant add-ons ─────────────────────────────

// ── Icon-System (Relaunch 2026-08-29): Lucide-Linien-Icons statt OS-Emojis,
// passend zur Startseite. Schlüssel ohne Variation Selector (FE0F);
// unbekannte Emojis fallen auf das Funken-Icon zurück.
const ICON_PATHS: Record<string, string> = {
  "⚡": '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  "✂": '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88"/><path d="M14.47 14.48 20 20"/><path d="M8.12 8.12 12 12"/>',
  "🖼": '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  "📅": '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  "📆": '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  "📍": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  "🔧": '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  "🔩": '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  "📋": '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  "📝": '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  "✅": '<path d="M20 6 9 17l-5-5"/>',
  "✓": '<path d="M20 6 9 17l-5-5"/>',
  "📞": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
  "📷": '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  "📸": '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  "🔍": '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  "📱": '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  "👥": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  "👤": '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  "🍽": '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
  "💶": '<path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
  "💰": '<path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
  "🔒": '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  "🔑": '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  "🕐": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  "🌐": '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  "🌍": '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  "✉": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  "📩": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  "📬": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  "💛": '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  "🚗": '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  "🏠": '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  "🌿": '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  "🎨": '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
};
const ICON_FALLBACK =
  '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>';

function iconSvg(emoji: string): string {
  const key = emoji.replace(/[\uFE00-\uFE0F]/g, "").trim();
  const body = ICON_PATHS[key] ?? ICON_FALLBACK;
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

interface IndustryStyle {
  accent: string; // CTA + accent color
  heroBg: string; // gradient for mock-browser hero
  orb: string; // rgba for background orbs
  previewPhoto: string;
}

const INDUSTRY_STYLES: Record<string, IndustryStyle> = {
  friseur: {
    accent: "#c8a96e",
    heroBg: "linear-gradient(135deg,#1c1610 0%,#2d2212 100%)",
    orb: "rgba(200,169,110,.13)",
    previewPhoto:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80&auto=format&fit=crop",
  },
  restaurant: {
    accent: "#f97316",
    heroBg: "linear-gradient(135deg,#1c1008 0%,#2d1a0c 100%)",
    orb: "rgba(249,115,22,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80&auto=format&fit=crop",
  },
  handwerk: {
    accent: "#f59e0b",
    heroBg: "linear-gradient(135deg,#1c1508 0%,#2c1e08 100%)",
    orb: "rgba(245,158,11,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80&auto=format&fit=crop",
  },
  zahnarzt: {
    accent: "#38bdf8",
    heroBg: "linear-gradient(135deg,#061828 0%,#0f2440 100%)",
    orb: "rgba(56,189,248,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1200&q=80&auto=format&fit=crop",
  },
  kosmetik: {
    accent: "#f472b6",
    heroBg: "linear-gradient(135deg,#1c0a18 0%,#2d1028 100%)",
    orb: "rgba(244,114,182,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80&auto=format&fit=crop",
  },
  fitness: {
    accent: "#ef4444",
    heroBg: "linear-gradient(135deg,#1a0808 0%,#2d1010 100%)",
    orb: "rgba(239,68,68,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80&auto=format&fit=crop",
  },
  arzt: {
    accent: "#34d399",
    heroBg: "linear-gradient(135deg,#061614 0%,#0a2420 100%)",
    orb: "rgba(52,211,153,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1200&q=80&auto=format&fit=crop",
  },
  immobilien: {
    accent: "#818cf8",
    heroBg: "linear-gradient(135deg,#0c0c1e 0%,#141428 100%)",
    orb: "rgba(129,140,248,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80&auto=format&fit=crop",
  },
  rechtsanwalt: {
    accent: "#6366f1",
    heroBg: "linear-gradient(135deg,#0a0c20 0%,#121430 100%)",
    orb: "rgba(99,102,241,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=1200&q=80&auto=format&fit=crop",
  },
  steuerberater: {
    accent: "#60a5fa",
    heroBg: "linear-gradient(135deg,#080c18 0%,#101c2c 100%)",
    orb: "rgba(96,165,250,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&auto=format&fit=crop",
  },
  fotograf: {
    accent: "#fbbf24",
    heroBg: "linear-gradient(135deg,#161408 0%,#241e0c 100%)",
    orb: "rgba(251,191,36,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80&auto=format&fit=crop",
  },
  physiotherapie: {
    accent: "#22d3ee",
    heroBg: "linear-gradient(135deg,#060f14 0%,#0a1a20 100%)",
    orb: "rgba(34,211,238,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80&auto=format&fit=crop",
  },
  nagelstudio: {
    accent: "#c084fc",
    heroBg: "linear-gradient(135deg,#180a20 0%,#280e34 100%)",
    orb: "rgba(192,132,252,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=80&auto=format&fit=crop",
  },
  baeckerei: {
    accent: "#fbbf24",
    heroBg: "linear-gradient(135deg,#1c1208 0%,#2c1e08 100%)",
    orb: "rgba(251,191,36,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80&auto=format&fit=crop",
  },
  reinigung: {
    accent: "#60a5fa",
    heroBg: "linear-gradient(135deg,#08101c 0%,#0e2040 100%)",
    orb: "rgba(96,165,250,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80&auto=format&fit=crop",
  },
  hundesalon: {
    accent: "#a78bfa",
    heroBg: "linear-gradient(135deg,#100c1e 0%,#1e1434 100%)",
    orb: "rgba(167,139,250,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80&auto=format&fit=crop",
  },
  musikschule: {
    accent: "#fb923c",
    heroBg: "linear-gradient(135deg,#1c1008 0%,#2a1804 100%)",
    orb: "rgba(251,146,60,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&q=80&auto=format&fit=crop",
  },
  elektriker: {
    accent: "#f59e0b",
    heroBg: "linear-gradient(135deg,#1c1508 0%,#2c1a04 100%)",
    orb: "rgba(245,158,11,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80&auto=format&fit=crop",
  },
  maler: {
    accent: "#14b8a6",
    heroBg: "linear-gradient(135deg,#041414 0%,#082020 100%)",
    orb: "rgba(20,184,166,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&q=80&auto=format&fit=crop",
  },
  klempner: {
    accent: "#64748b",
    heroBg: "linear-gradient(135deg,#0c1018 0%,#141c28 100%)",
    orb: "rgba(100,116,139,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop",
  },
  gaertner: {
    accent: "#22c55e",
    heroBg: "linear-gradient(135deg,#061408 0%,#0a2010 100%)",
    orb: "rgba(34,197,94,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80&auto=format&fit=crop",
  },
  tierarzt: {
    accent: "#fb923c",
    heroBg: "linear-gradient(135deg,#1c1008 0%,#2c1808 100%)",
    orb: "rgba(251,146,60,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1200&q=80&auto=format&fit=crop",
  },
  apotheke: {
    accent: "#10b981",
    heroBg: "linear-gradient(135deg,#041410 0%,#082018 100%)",
    orb: "rgba(16,185,129,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80&auto=format&fit=crop",
  },
  fahrschule: {
    accent: "#6366f1",
    heroBg: "linear-gradient(135deg,#0a0c20 0%,#121428 100%)",
    orb: "rgba(99,102,241,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=1200&q=80&auto=format&fit=crop",
  },
  architekt: {
    accent: "#94a3b8",
    heroBg: "linear-gradient(135deg,#0c1014 0%,#141c24 100%)",
    orb: "rgba(148,163,184,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&auto=format&fit=crop",
  },
  buchhaltung: {
    accent: "#818cf8",
    heroBg: "linear-gradient(135deg,#0c0c1e 0%,#14142c 100%)",
    orb: "rgba(129,140,248,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80&auto=format&fit=crop",
  },
  ergotherapie: {
    accent: "#06b6d4",
    heroBg: "linear-gradient(135deg,#040e14 0%,#081820 100%)",
    orb: "rgba(6,182,212,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1594737626072-90dc274bc2bd?w=1200&q=80&auto=format&fit=crop",
  },
  hebamme: {
    accent: "#f9a8d4",
    heroBg: "linear-gradient(135deg,#1c0a14 0%,#2c1020 100%)",
    orb: "rgba(249,168,212,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&q=80&auto=format&fit=crop",
  },
  pilates: {
    accent: "#8b5cf6",
    heroBg: "linear-gradient(135deg,#100a1e 0%,#1c1030 100%)",
    orb: "rgba(139,92,246,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80&auto=format&fit=crop",
  },
  fotostudio: {
    accent: "#fbbf24",
    heroBg: "linear-gradient(135deg,#161408 0%,#24200c 100%)",
    orb: "rgba(251,191,36,.12)",
    previewPhoto:
      "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&q=80&auto=format&fit=crop",
  },
};

const DEFAULT_INDUSTRY_STYLE: IndustryStyle = {
  accent: "#e91e8c",
  heroBg: "linear-gradient(135deg,#1a0a14 0%,#2a1020 100%)",
  orb: "rgba(233,30,140,.12)",
  previewPhoto:
    "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=1200&q=80&auto=format&fit=crop",
};

// Add-ons relevant per industry – avoids e.g. "Speisekarte" for a Zahnarzt
interface AddonDef {
  icon: string;
  title: string;
  desc: string;
  price: string;
}

function getRelevantAddons(slug: string): AddonDef[] {
  const ALL: Record<string, AddonDef> = {
    aiChat: {
      icon: "🤖",
      title: "KI-Chat Assistent",
      desc: "Beantwortet Kundenfragen rund um die Uhr – automatisch auf dein Unternehmen trainiert.",
      price: "+ 9,90 €/Mo.",
    },
    booking: {
      icon: "📅",
      title: "Terminbuchung",
      desc: "Kunden buchen direkt auf deiner Website einen Termin – ohne Anruf, ohne Wartezeit.",
      price: "+ 4,90 €/Mo.",
    },
    contact: {
      icon: "✉️",
      title: "Kontaktformular",
      desc: "Kundenanfragen direkt per E-Mail – DSGVO-konform und sofort einsatzbereit.",
      price: "+ 3,90 €/Mo.",
    },
    gallery: {
      icon: "🖼️",
      title: "Bildergalerie",
      desc: "Präsentiere deine Arbeiten, Räumlichkeiten oder Produkte in einer professionellen Galerie.",
      price: "+ 3,90 €/Mo.",
    },
    team: {
      icon: "👥",
      title: "Team-Sektion",
      desc: "Stelle dein Team mit Fotos, Namen und Positionen professionell vor.",
      price: "+ 3,90 €/Mo.",
    },
    menu: {
      icon: "🍽️",
      title: "Speisekarte",
      desc: "Digitale Speisekarte mit Kategorien, Beschreibungen und Preisen – immer aktuell.",
      price: "+ 3,90 €/Mo.",
    },
    pricelist: {
      icon: "💶",
      title: "Preisliste",
      desc: "Zeige dein Leistungsangebot und deine Preise übersichtlich auf der Website.",
      price: "+ 3,90 €/Mo.",
    },
  };

  const SETS: Record<string, (keyof typeof ALL)[]> = {
    restaurant: [
      "aiChat",
      "booking",
      "contact",
      "gallery",
      "team",
      "menu",
      "pricelist",
    ],
    baeckerei: ["contact", "gallery", "team", "menu", "pricelist"],
    zahnarzt: ["aiChat", "booking", "contact", "gallery", "team", "pricelist"],
    arzt: ["aiChat", "booking", "contact", "team", "pricelist"],
    physiotherapie: ["aiChat", "booking", "contact", "team", "pricelist"],
    fitness: ["aiChat", "booking", "contact", "gallery", "team", "pricelist"],
    friseur: ["aiChat", "booking", "contact", "gallery", "team", "pricelist"],
    kosmetik: ["aiChat", "booking", "contact", "gallery", "team", "pricelist"],
    nagelstudio: [
      "aiChat",
      "booking",
      "contact",
      "gallery",
      "team",
      "pricelist",
    ],
    hundesalon: [
      "aiChat",
      "booking",
      "contact",
      "gallery",
      "team",
      "pricelist",
    ],
    handwerk: ["aiChat", "contact", "gallery", "team", "pricelist"],
    reinigung: ["aiChat", "contact", "team", "pricelist"],
    immobilien: ["aiChat", "contact", "gallery", "team"],
    rechtsanwalt: ["aiChat", "booking", "contact", "team"],
    steuerberater: ["aiChat", "booking", "contact", "team"],
    fotograf: ["aiChat", "booking", "contact", "gallery", "team", "pricelist"],
    musikschule: [
      "aiChat",
      "booking",
      "contact",
      "gallery",
      "team",
      "pricelist",
    ],
  };

  const keys = SETS[slug] ?? [
    "aiChat",
    "booking",
    "contact",
    "gallery",
    "team",
    "pricelist",
  ];
  return keys.map(k => ALL[k]);
}

// ── Inline CSS (shared across all landing pages) ─────────────────────────────

const SHARED_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#fff;background:#0a0a0a;line-height:1.6}
a{color:inherit;text-decoration:none}
img{max-width:100%;height:auto}
.container{max-width:1100px;margin:0 auto;padding:0 1.5rem}
/* Nav */
nav{background:rgba(10,10,10,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.06);padding:1rem 0;position:sticky;top:0;z-index:100}
.nav-inner{display:flex;align-items:center;justify-content:space-between}
.logo{font-size:1.125rem;font-weight:700;color:#fff;letter-spacing:-.5px;display:flex;align-items:center;gap:.5rem}
.nav-cta{background:linear-gradient(135deg,#e91e8c,#c8177a);color:#fff!important;padding:.5rem 1.25rem;border-radius:999px;font-size:.875rem;font-weight:600;transition:opacity .2s,transform .2s,background-color .2s}
.nav-cta:hover{opacity:.9;transform:translateY(-1px)}
/* Hero */
.hero{background:#0a0a0a;color:#fff;padding:5rem 0 4rem;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% -5%,var(--orb,rgba(233,30,140,.1)),transparent);pointer-events:none}
.hero-orb{position:absolute;border-radius:50%;pointer-events:none;filter:blur(80px);opacity:.6}
.hero-persona{position:absolute;bottom:0;right:max(1rem,calc((100% - 1100px)/2));height:min(82%,420px);width:auto;z-index:1;pointer-events:none;filter:drop-shadow(0 30px 60px rgba(0,0,0,.55))}
.hero-copy{text-align:center}
@media(max-width:1023px){.hero-persona{display:none}}
@media(min-width:1024px){
  .hero .hero-copy{text-align:left;padding-right:24rem}
  .hero .hero-copy h1{text-align:left}
  .hero .hero-copy p{margin-left:0;margin-right:0}
  .hero .hero-copy .hero-trust{justify-content:flex-start}
}
.orb-tl{width:500px;height:500px;top:-200px;left:-150px;background:var(--orb,rgba(233,30,140,.08))}
.orb-br{width:400px;height:400px;bottom:-150px;right:-100px;background:var(--orb,rgba(233,30,140,.06))}
.hero-inner{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;position:relative;z-index:1}
.hero-text{text-align:left}
.hero-badge{display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:.375rem 1rem;font-size:.8125rem;font-weight:600;margin-bottom:1.5rem;color:rgba(255,255,255,.7)}
.hero h1{font-size:clamp(1.875rem,3.5vw,2.75rem);font-weight:700;margin-bottom:1.25rem;line-height:1.15;letter-spacing:-.02em;color:#fff;text-align:center}
.hero p{font-size:1.0625rem;color:rgba(255,255,255,.5);max-width:520px;margin:0 auto 2.5rem;line-height:1.7}
.btn-primary{display:inline-block;background:linear-gradient(135deg,#e91e8c,#c8177a);color:#fff;padding:.9375rem 2.5rem;border-radius:999px;font-size:1rem;font-weight:700;transition:opacity .2s,transform .2s,background-color .2s,box-shadow .2s;box-shadow:0 4px 24px rgba(233,30,140,.3)}
.btn-primary:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 8px 32px rgba(233,30,140,.4)}
.hero-trust{margin-top:1.5rem;display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;font-size:.8125rem;color:rgba(255,255,255,.35);justify-content:center}
.hero-trust span{display:flex;align-items:center;gap:.375rem}
/* Hero right: mini browser */
.hero-browser{border-radius:12px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.08);background:#111;transform:perspective(1000px) rotateY(-6deg) rotateX(2deg);transition:transform .4s ease}
.hero-browser:hover{transform:perspective(1000px) rotateY(-2deg) rotateX(1deg)}
.hb-chrome{background:#1c1c1c;padding:.5rem .875rem;display:flex;align-items:center;gap:.625rem;border-bottom:1px solid rgba(255,255,255,.07)}
.hb-dots{display:flex;gap:.3rem;flex-shrink:0}
.hb-dot{width:.5rem;height:.5rem;border-radius:50%}
.hb-dot.r{background:#ff5f57}.hb-dot.a{background:#febc2e}.hb-dot.g{background:#28c840}
.hb-url{flex:1;background:rgba(255,255,255,.06);border-radius:5px;padding:.2rem .6rem;font-size:.6875rem;color:rgba(255,255,255,.35);display:flex;align-items:center;gap:.3rem;max-width:280px;margin:0 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hb-hero{position:relative;height:180px;overflow:hidden;background:#111}
.hb-hero-img{width:100%;height:100%;object-fit:cover;display:block;opacity:.85}
.hb-hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,.75) 0%,rgba(0,0,0,.35) 100%)}
.hb-hero-content{position:absolute;inset:0;padding:1.25rem 1.5rem;display:flex;flex-direction:column;justify-content:center}
.hb-eyebrow{height:.3rem;width:3.5rem;border-radius:99px;margin-bottom:.75rem;opacity:.9}
.hb-title{font-size:.875rem;font-weight:700;color:#fff;letter-spacing:-.01em;line-height:1.25;margin-bottom:.375rem}
.hb-sub{height:.3rem;width:65%;background:rgba(255,255,255,.2);border-radius:2px;margin-bottom:.25rem}
.hb-sub2{height:.3rem;width:48%;background:rgba(255,255,255,.12);border-radius:2px;margin-bottom:.875rem}
.hb-cta{display:inline-flex;align-items:center;border-radius:999px;padding:.3rem .875rem;font-size:.625rem;font-weight:700;color:#fff;width:fit-content}
.hb-services{display:grid;grid-template-columns:repeat(3,1fr);gap:.375rem;padding:.875rem 1rem;background:rgba(0,0,0,.25)}
.hb-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:.625rem .5rem}
.hb-card-icon{font-size:.875rem;margin-bottom:.375rem}
.hb-card-l1{height:.3rem;width:80%;background:rgba(255,255,255,.18);border-radius:2px;margin-bottom:.25rem}
.hb-card-l2{height:.275rem;width:60%;background:rgba(255,255,255,.1);border-radius:2px}
/* Stats */
.stats{padding:2.5rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;text-align:center}
.stat-value{font-size:1.875rem;font-weight:700;color:#fff;letter-spacing:-.03em}
.stat-label{font-size:.8125rem;color:rgba(255,255,255,.35);margin-top:.25rem}
/* Steps */
.steps{padding:5rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.section-label{text-align:center;font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.3);margin-bottom:1rem}
.section-title{text-align:center;font-size:clamp(1.5rem,3vw,2rem);font-weight:700;color:#fff;letter-spacing:-.02em;margin-bottom:.75rem}
.section-sub{text-align:center;color:rgba(255,255,255,.4);margin-bottom:3.5rem;max-width:560px;margin-left:auto;margin-right:auto;font-size:1rem}
.steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem}
.step{text-align:center;padding:1.5rem 1rem}
.step-num{width:2.75rem;height:2.75rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;margin:0 auto 1.25rem}
.step h3{font-size:1rem;font-weight:600;margin-bottom:.5rem;color:#fff}
.step p{color:rgba(255,255,255,.4);font-size:.9375rem;line-height:1.65}
/* Features */
.features{padding:5rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem}
.feature-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:2rem;transition:border-color .2s,background .2s}
.feature-card:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.14)}
.feature-icon{width:2.75rem;height:2.75rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;margin-bottom:1.25rem}
.feature-card h3{font-size:1rem;font-weight:600;margin-bottom:.5rem;color:#fff}
.feature-card p{color:rgba(255,255,255,.4);font-size:.9375rem;line-height:1.65}
.local-intro{max-width:760px;margin:0 auto 3rem;text-align:center;color:rgba(255,255,255,.55);font-size:1.0625rem;line-height:1.75}
.local-detail{max-width:760px;margin:3rem auto 0;color:rgba(255,255,255,.55);font-size:1rem;line-height:1.8}
.local-detail p{margin:0 0 1em}
.local-detail p:last-child{margin-bottom:0}
/* Add-ons */
.addons{padding:5rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.addons-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.75rem;margin-top:3.5rem}
.addon-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.5rem;text-align:center;transition:border-color .2s}
.addon-card:hover{border-color:rgba(255,255,255,.14)}
.addon-icon{font-size:1.5rem;margin-bottom:.75rem}
.addon-card h4{font-size:.9375rem;font-weight:600;color:#fff;margin-bottom:.375rem}
.addon-card p{font-size:.8125rem;color:rgba(255,255,255,.4);line-height:1.5}
.addon-price{display:inline-block;margin-top:.75rem;background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);font-size:.75rem;font-weight:700;padding:.25rem .75rem;border-radius:999px;border:1px solid rgba(255,255,255,.1)}
/* Addon expand */
.addon-more{display:none}
.addon-expand-btn{display:block;margin:1.25rem auto 0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.55);padding:.625rem 1.5rem;border-radius:999px;font-size:.875rem;cursor:pointer;transition:background-color .2s,color .2s,border-color .2s}
.addon-expand-btn:hover{background:rgba(255,255,255,.1);color:#fff}
/* Pricing */
.pricing{padding:5rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.pricing-wrapper{max-width:460px;margin:0 auto;margin-top:3.5rem}
.pricing-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:2.5rem;position:relative}
.pricing-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#e91e8c,#c8177a);color:#fff;font-size:.75rem;font-weight:700;padding:.3rem .875rem;border-radius:999px;white-space:nowrap}
.pricing-name{font-size:.75rem;font-weight:600;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:1rem}
.pricing-price{font-size:3.5rem;font-weight:700;color:#fff;letter-spacing:-.03em;line-height:1}
.pricing-price span{font-size:1rem;color:rgba(255,255,255,.4);font-weight:400}
.pricing-note{font-size:.875rem;color:rgba(255,255,255,.35);margin-top:.5rem;margin-bottom:2rem}
.pricing-features{list-style:none;margin-bottom:1.5rem}
.pricing-features li{padding:.625rem 0;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem;color:rgba(255,255,255,.65)}
.pricing-features li:last-child{border-bottom:none}
.pricing-features li::before{content:"✓";color:#22c55e;font-weight:700;flex-shrink:0;margin-top:.0625rem}
.pricing-addon-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:1.25rem;margin-bottom:2rem}
.pricing-addon-label{font-size:.6875rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.3);margin-bottom:.875rem}
.pricing-addon-row{display:flex;align-items:center;justify-content:space-between;padding:.375rem 0}
.pricing-addon-row span:first-child{font-size:.875rem;color:rgba(255,255,255,.55)}
.pricing-addon-row span:last-child{font-size:.75rem;color:rgba(255,255,255,.3);font-weight:500}
.pricing-cta{display:block;text-align:center;background:#fff;color:#0a0a0a;padding:1rem;border-radius:999px;font-weight:700;font-size:.9375rem;transition:background-color .2s,transform .2s;margin-top:1.5rem}
.pricing-cta:hover{background:rgba(255,255,255,.9);transform:translateY(-1px)}
.pricing-note-bottom{text-align:center;font-size:.75rem;color:rgba(255,255,255,.25);margin-top:.875rem}
/* Comparison */
.comparison{padding:5rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.comp-table{max-width:820px;margin:3.5rem auto 0;border:1px solid rgba(255,255,255,.08);border-radius:20px;overflow:hidden}
.comp-header{display:grid;grid-template-columns:1fr 1fr 1fr;background:rgba(255,255,255,.04);padding:1.25rem 2rem}
.comp-header div{text-align:center;font-size:.875rem;font-weight:600;color:rgba(255,255,255,.45)}
.comp-header div:first-child{text-align:left;color:rgba(255,255,255,.3)}
.comp-header div:last-child{color:#fff}
.comp-row{display:grid;grid-template-columns:1fr 1fr 1fr;padding:1rem 2rem;border-top:1px solid rgba(255,255,255,.05)}
.comp-row:nth-child(even){background:rgba(255,255,255,.015)}
.comp-row div{font-size:.875rem;text-align:center;color:rgba(255,255,255,.35);align-self:center}
.comp-row div:first-child{text-align:left;color:rgba(255,255,255,.55);font-weight:500}
.comp-row div:last-child{color:#22c55e;font-weight:600}
/* FAQ */
.faq{padding:5rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.faq-list{max-width:680px;margin:0 auto;margin-top:3.5rem}
details{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);border-radius:16px;margin-bottom:.5rem;overflow:hidden}
details[open]{border-color:rgba(255,255,255,.14)}
summary{padding:1.25rem 1.5rem;cursor:pointer;font-weight:600;font-size:.9375rem;list-style:none;display:flex;justify-content:space-between;align-items:center;color:#fff;-webkit-tap-highlight-color:transparent}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";font-size:1.25rem;color:rgba(255,255,255,.3);font-weight:300;flex-shrink:0;margin-left:.75rem}
details[open] summary::after{content:"−"}
.faq-answer{padding:0 1.5rem 1.25rem;color:rgba(255,255,255,.45);font-size:.9375rem;line-height:1.7}
/* CTA Banner */
.cta-banner{padding:6rem 0;text-align:center;position:relative;overflow:hidden}
.cta-banner::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 60% 60% at 50% 50%,rgba(233,30,140,.08),transparent);pointer-events:none}
.cta-banner h2{font-size:clamp(1.5rem,3vw,2.25rem);font-weight:700;color:#fff;margin-bottom:.75rem;letter-spacing:-.02em}
.cta-banner p{color:rgba(255,255,255,.4);max-width:500px;margin:0 auto 2rem;font-size:1rem;line-height:1.7}
.cta-note{margin-top:.875rem;font-size:.75rem;color:rgba(255,255,255,.2)}
/* Industries / Cities */
.industries,.cities{padding:2.5rem 0;border-top:1px solid rgba(255,255,255,.06)}
.industries h3,.cities h3{text-align:center;font-size:.75rem;font-weight:600;color:rgba(255,255,255,.3);margin-bottom:1.25rem;text-transform:uppercase;letter-spacing:.1em}
.industry-links,.city-links{display:flex;flex-wrap:wrap;gap:.375rem;justify-content:center;max-width:920px;margin:0 auto}
.industry-link,.city-link{display:inline-block;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:.3125rem .875rem;font-size:.8125rem;color:rgba(255,255,255,.45);transition:background-color .15s,border-color .15s,color .15s}
.industry-link:hover,.industry-link.active,.city-link:hover,.city-link.active{border-color:rgba(255,255,255,.2);color:rgba(255,255,255,.8);background:rgba(255,255,255,.07)}
/* Footer */
footer{background:#050505;color:rgba(255,255,255,.25);padding:2rem 0;text-align:center;font-size:.875rem;border-top:1px solid rgba(255,255,255,.06)}
footer a{color:rgba(255,255,255,.4);text-decoration:underline;margin:0 .5rem}
/* Mock Browser Preview */
.preview-section{padding:5rem 0;border-bottom:1px solid rgba(255,255,255,.06);position:relative;overflow:hidden}
.mock-browser{max-width:860px;margin:3.5rem auto 0;border-radius:16px;overflow:hidden;box-shadow:0 40px 90px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.08);background:#111}
.mock-chrome{background:#1c1c1c;padding:.625rem 1rem;display:flex;align-items:center;gap:.75rem;border-bottom:1px solid rgba(255,255,255,.07)}
.mock-dots{display:flex;gap:.375rem;flex-shrink:0}
.mock-dot{width:.625rem;height:.625rem;border-radius:50%}
.mock-dot.r{background:#ff5f57}.mock-dot.a{background:#febc2e}.mock-dot.g{background:#28c840}
.mock-url{flex:1;background:rgba(255,255,255,.06);border-radius:6px;padding:.25rem .75rem;font-size:.75rem;color:rgba(255,255,255,.4);display:flex;align-items:center;gap:.375rem;max-width:380px;margin:0 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* Inner mock website */
.mw-wrap{overflow:hidden}
.mw-nav{background:rgba(0,0,0,.35);padding:.625rem 1.25rem;display:flex;align-items:center;gap:.75rem}
.mw-logo-pill{width:5.5rem;height:.875rem;background:rgba(255,255,255,.18);border-radius:4px}
.mw-spacer{flex:1}
.mw-nav-link{width:2.75rem;height:.5rem;background:rgba(255,255,255,.1);border-radius:3px}
.mw-nav-links{display:flex;gap:.5rem}
.mw-btn{width:5rem;height:1.5rem;background:var(--accent,#e91e8c);border-radius:999px;opacity:.85}
.mw-hero{padding:2.25rem 1.5rem 2rem;position:relative;overflow:hidden;background:var(--hero-bg,#0f172a)}
.mw-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% -10%,var(--orb,rgba(56,189,248,.2)),transparent);pointer-events:none}
.mw-hero-eyebrow{display:inline-block;height:.5rem;width:6rem;background:rgba(255,255,255,.2);border-radius:999px;margin-bottom:.75rem}
.mw-hero-name{font-size:clamp(.875rem,2vw,1.375rem);font-weight:700;color:#fff;letter-spacing:-.02em;line-height:1.25;margin-bottom:.625rem;position:relative}
.mw-hero-sub{height:.4rem;width:72%;background:rgba(255,255,255,.18);border-radius:3px;margin-bottom:.3rem;position:relative}
.mw-hero-sub2{height:.4rem;width:55%;background:rgba(255,255,255,.12);border-radius:3px;margin-bottom:1.25rem;position:relative}
.mw-hero-cta{display:inline-flex;align-items:center;background:var(--accent,#e91e8c);color:#fff;border-radius:999px;padding:.375rem 1rem;font-size:.6875rem;font-weight:700;opacity:.9;position:relative}
.mw-services{background:rgba(0,0,0,.25);padding:1.25rem 1.5rem;display:grid;grid-template-columns:repeat(3,1fr);gap:.625rem}
.mw-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:.875rem .75rem}
.mw-card-icon{font-size:1.125rem;margin-bottom:.5rem}
.mw-card-line1{height:.4rem;width:80%;background:rgba(255,255,255,.2);border-radius:2px;margin-bottom:.3rem}
.mw-card-line2{height:.35rem;width:60%;background:rgba(255,255,255,.1);border-radius:2px}
/* Billing toggle */
.billing-toggle{display:flex;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:.25rem;gap:.25rem;max-width:340px;margin:0 auto 2.5rem}
.billing-btn{flex:1;padding:.5rem 1rem;border-radius:999px;border:none;background:transparent;color:rgba(255,255,255,.45);font-size:.875rem;font-weight:600;cursor:pointer;transition:background-color .2s,color .2s,box-shadow .2s;white-space:nowrap}
.billing-btn.active{background:#fff;color:#0a0a0a;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.billing-save{display:inline-block;background:linear-gradient(135deg,#e91e8c,#c8177a);color:#fff;font-size:.625rem;font-weight:700;padding:.15rem .5rem;border-radius:999px;margin-left:.375rem;vertical-align:middle}
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .nav-cta,.btn-primary,.hero-browser,.feature-card,.addon-card,.addon-expand-btn,.pricing-cta,.industry-link,.city-link,.billing-btn{transition:none!important}
  .nav-cta:hover,.btn-primary:hover,.pricing-cta:hover,.hero-browser,.hero-browser:hover{transform:none}
}
@media(hover:none),(pointer:coarse){
  .nav-cta:hover,.btn-primary:hover,.pricing-cta:hover,.hero-browser:hover{transform:none}
}
/* Responsive */
@media(max-width:768px){
  .hero-inner{grid-template-columns:1fr}
  .hero-browser{display:none}
  .hero h1,.hero p{text-align:center}
  .hero-trust{justify-content:center}
  .steps-grid{grid-template-columns:1fr}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  .comp-table{display:none}
  .mw-services{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:640px){
  .hero{padding:4rem 0 3rem}
  .hero h1{font-size:1.75rem}
  .hero-trust{gap:1rem;font-size:.75rem}
  .features,.addons,.pricing,.faq,.steps,.comparison,.preview-section{padding:3rem 0}
  .stats{padding:2rem 0}
}

/* ── Pageblitz Nachtschicht Skin (2026-08-29) ───────────────────────────
   Branchen-/Städte-Landingpages teilen Palette, Typografie, Hairlines und
   Kartenlogik mit der neuen Startseite (Kohle/Volt, Spec
   docs/superpowers/specs/2026-08-29-landing-relaunch-dark-volt-design.md).
   Die branchenspezifischen Akzentfarben und die HELLE Website-Vorschau
   (.mw-*, .mock-*) bleiben erhalten: dort demonstrieren sie das Ergebnis. */
@font-face{font-family:"Space Grotesk";font-style:normal;font-weight:300 700;font-display:swap;src:url("/fonts/space-grotesk-latin-wght.woff2") format("woff2")}
body{font-family:"Space Grotesk",system-ui,sans-serif;color:#f2f1ee;background:#0b0b0d}
.container{max-width:1200px}
nav{background:rgba(19,19,22,.88);border-color:rgba(255,255,255,.09);padding:.75rem 0}
.logo{color:#f2f1ee;font-weight:500}
.nav-cta,.btn-primary,.pricing-badge{background:#ccff00!important;color:#0b0b0d!important;box-shadow:none!important}
.nav-cta:hover,.btn-primary:hover{background:#b3e600!important;opacity:1}
.hero{background:#0b0b0d;color:#f2f1ee;padding:5rem 0 4.5rem;border-bottom:1px solid rgba(255,255,255,.09)}
.hero::before{background:radial-gradient(ellipse 55% 55% at 72% 20%,rgba(204,255,0,.09),transparent)}
.hero-orb{display:none}
.hero-badge{background:#131316;border-color:rgba(255,255,255,.09);color:#a4a39d;font-weight:500}
.hero h1{max-width:52rem;margin:0 auto 1.25rem;color:#f2f1ee;font-weight:500;font-size:clamp(2.25rem,4vw,4rem);line-height:1.03}
.hero p{color:#a4a39d}
.hero-trust{color:#a4a39d}
.btn-primary{font-weight:600}
.stats{background:#131316;border-color:rgba(255,255,255,.09)}
.stat-value{color:#f2f1ee;font-weight:500}
.stat-label{color:#a4a39d}
.steps,.features,.addons,.pricing,.comparison,.faq,.preview-section{padding:6rem 0;border-color:rgba(255,255,255,.09)}
.section-label{color:#ccff00;font-weight:500}
.section-title{color:#f2f1ee;font-weight:500;font-size:clamp(1.9rem,3vw,3rem)}
.section-sub,.local-intro,.local-detail{color:#a4a39d}
.steps-grid{gap:1rem}
.step{text-align:left;border-top:1px solid rgba(255,255,255,.09);padding:1.5rem 0}
.step-num{margin:0 0 1.25rem;background:#131316;border-color:rgba(255,255,255,.09);color:#ccff00}
.step h3,.feature-card h3,.addon-card h4{color:#f2f1ee}
.step p,.feature-card p,.addon-card p{color:#a4a39d}
.feature-card,.addon-card{background:#131316;border-color:rgba(255,255,255,.09);border-radius:12px}
.feature-card:hover,.addon-card:hover{background:#1a1a1e;border-color:rgba(255,255,255,.22)}
.feature-icon{background:rgba(204,255,0,.10);border-color:rgba(204,255,0,.32);color:#ccff00}
.addon-icon{color:#ccff00}
.pricing-addon-row svg{vertical-align:-4px;margin-right:.3rem;color:#ccff00}
.mw-card-icon svg{width:16px;height:16px}
.addon-price{background:rgba(204,255,0,.10);border-color:rgba(204,255,0,.32);color:#ccff00}
.addon-expand-btn{background:transparent;border-color:rgba(255,255,255,.22);color:#f2f1ee}
.addon-expand-btn:hover{background:#131316;color:#f2f1ee}
.pricing-wrapper{max-width:560px}
.pricing-card{background:#131316;border-color:rgba(255,255,255,.09);border-radius:18px;box-shadow:0 28px 60px -42px rgba(0,0,0,.55)}
.pricing-name,.pricing-note,.pricing-note-bottom{color:#a4a39d}
.pricing-price{color:#f2f1ee;font-weight:500}
.pricing-price span{color:#a4a39d}
.pricing-features li{color:#f2f1ee;border-color:rgba(255,255,255,.09)}
.pricing-features li::before{color:#ccff00}
.pricing-addon-box{background:#0b0b0d;border-color:rgba(255,255,255,.09)}
.pricing-addon-label,.pricing-addon-row span:last-child{color:#a4a39d}
.pricing-addon-row span:first-child{color:#f2f1ee}
.pricing-cta{background:#ccff00!important;color:#0b0b0d!important}
.pricing-cta:hover{background:#b3e600!important}
.billing-toggle{background:#131316;border-color:rgba(255,255,255,.09)}
.billing-btn{color:#a4a39d}
.billing-btn.active{background:#ccff00;color:#0b0b0d;box-shadow:none}
.billing-save{background:rgba(204,255,0,.10);color:#ccff00}
.comp-table{background:#131316;border-color:rgba(255,255,255,.09);border-radius:14px}
.comp-header{background:#0b0b0d}
.comp-header div{color:#a4a39d}
.comp-header div:first-child{color:#a4a39d}
.comp-header div:last-child{color:#ccff00;background:rgba(204,255,0,.10)}
.comp-row{border-color:rgba(255,255,255,.09)}
.comp-row:nth-child(even){background:#101013}
.comp-row div{color:#a4a39d}
.comp-row div:first-child{color:#f2f1ee}
.comp-row div:last-child{color:#ccff00;background:rgba(204,255,0,.10)}
details{background:#131316;border-color:rgba(255,255,255,.09);border-radius:10px}
details[open]{border-color:rgba(255,255,255,.22)}
summary{color:#f2f1ee}
summary::after{color:#a4a39d}
.faq-answer{color:#a4a39d}
.cta-banner{background:#131316;border-top:1px solid rgba(255,255,255,.09)}
.cta-banner::before{background:radial-gradient(ellipse 60% 60% at 50% 50%,rgba(204,255,0,.18),transparent)}
.cta-banner h2{color:#f2f1ee;font-weight:500}
.cta-banner p,.cta-note{color:#a4a39d}
.industries,.cities{border-color:rgba(255,255,255,.09);background:#131316}
.industries h3,.cities h3{color:#a4a39d}
.industry-link,.city-link{background:#0b0b0d;border-color:rgba(255,255,255,.09);color:#a4a39d}
.industry-link:hover,.industry-link.active,.city-link:hover,.city-link.active{border-color:#ccff00;color:#ccff00;background:rgba(204,255,0,.10)}
footer{background:#0b0b0d;color:#7c7b76;border-color:rgba(255,255,255,.09)}
footer a{color:#a4a39d}
.mock-browser{background:#fff;box-shadow:0 40px 90px -30px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.12)}
.mock-chrome,.hb-chrome{background:#fdfcfa;border-color:#ddd6c9}
.mock-url,.hb-url{background:#f7f5f1;color:#6b645b;border:1px solid #ddd6c9}
@media(max-width:768px){
  .nav-cta{padding:.55rem .85rem;font-size:.75rem;white-space:nowrap}
  .comp-table{display:block;overflow:visible}
  .comp-header{display:none}
  .comp-row{display:grid;grid-template-columns:1fr 1fr;padding:0}
  .comp-row div{padding:.85rem 1rem;text-align:left}
  .comp-row div:first-child{grid-column:1/-1;border-bottom:1px solid rgba(255,255,255,.09);background:#0b0b0d}
  .comp-row div:nth-child(2)::before,.comp-row div:nth-child(3)::before{display:block;margin-bottom:.25rem;font-size:.65rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#a4a39d}
  .comp-row div:nth-child(2)::before{content:"Webagentur"}
  .comp-row div:nth-child(3)::before{content:"Pageblitz";color:#ccff00}
}
`.trim();

// ── Schema.org helpers ────────────────────────────────────────────────────────

function buildFaqSchema(faqs: Array<{ q: string; a: string }>): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
}

function buildWebPageSchema(
  title: string,
  description: string,
  canonical: string
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonical,
    publisher: {
      "@type": "Organization",
      name: "Pageblitz",
      url: "https://pageblitz.de",
    },
  });
}

function buildBreadcrumbSchema(industry: SeoIndustry, city?: SeoCity): string {
  const items: Array<{ position: number; name: string; item?: string }> = [
    { position: 1, name: "Startseite", item: "https://pageblitz.de" },
    {
      position: 2,
      name: "Website erstellen",
      item: "https://pageblitz.de/website-erstellen",
    },
    {
      position: 3,
      name: `Website für ${industry.displayName}`,
      item: `https://pageblitz.de/website-erstellen/${industry.slug}`,
    },
  ];
  if (city) {
    items.push({ position: 4, name: city.name });
  }
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(i => ({
      "@type": "ListItem",
      position: i.position,
      name: i.name,
      ...(i.item ? { item: i.item } : {}),
    })),
  });
}

// ── HTML generator ────────────────────────────────────────────────────────────

// ── Hero-Personas (2026-08-29): pro Branche ein KI-Freisteller, in dem sich
// die Zielgruppe wiederfindet. Drei Branchen nutzen die bestehenden
// Landing-Personas, der Rest liegt unter /personas/seo/<slug>.webp
// (640×960, WebP mit Alpha). Rein dekorativ → alt="" im Markup.
const HERO_PERSONA_OVERRIDES: Record<string, string> = {
  friseur: "/personas/friseurin.webp",
  handwerk: "/personas/handwerker.webp",
  restaurant: "/personas/gastgeberin.webp",
};
function heroPersonaSrc(slug: string): string {
  return HERO_PERSONA_OVERRIDES[slug] ?? `/personas/seo/${slug}.webp`;
}

export function generateLandingPageHTML(
  industry: SeoIndustry,
  city?: SeoCity
): string {
  const cityStr = city ? ` in ${city.name}` : "";
  const cityFull = city ? ` in ${city.name}` : " in Deutschland";
  const canonical = `https://pageblitz.de/website-erstellen/${industry.slug}${city ? "/" + city.slug : ""}`;
  const title = city
    ? `Website für ${industry.displayName} in ${city.name} erstellen | Pageblitz`
    : `${industry.title} | Pageblitz`;
  // Stadt NACH VORN (Audit 2026-08-30, Punkt 4): die alte Fassung hängte
  // die Stadt ans Ende einer ~190-Zeichen-Description — Google schneidet
  // bei ~160 ab, in den SERPs sahen Branchen- und Stadt-Seite identisch aus.
  // Branchen-Meta: Suffix nur anhängen, wenn die 160-Zeichen-Grenze hält
  // (Vollgrade-Fund 2026-08-31: Friseur lag mit Suffix bei 177c).
  const branchSuffix = " 7 Tage gratis testen.";
  const metaDesc = city
    ? `Professionelle ${industry.displayName}-Website in ${city.name} ab 19,90 €/Monat – von der KI in 3 Minuten erstellt. Jetzt Vorschau ansehen und 7 Tage gratis testen.`
    : industry.description.length + branchSuffix.length <= 160
      ? `${industry.description}${branchSuffix}`
      : industry.description;
  const h1 = industry.h1Template.replace("{city}", cityStr);

  const otherIndustries = Object.values(SEO_INDUSTRIES).filter(
    i => i.slug !== industry.slug
  );
  const otherCities = city ? DE_CITIES.filter(c => c.slug !== city.slug) : [];

  const industryLinksHtml = otherIndustries
    .map(
      i =>
        `<a class="industry-link" href="/website-erstellen/${i.slug}${city ? "/" + city.slug : ""}">Website für ${i.displayName}</a>`
    )
    .join("\n    ");

  const cityLinksHtml = city
    ? `<div class="cities"><div class="container"><h3>${industry.displayName}-Website in anderen Städten</h3><div class="city-links">\n    ${otherCities
        .map(
          c =>
            `<a class="city-link" href="/website-erstellen/${industry.slug}/${c.slug}">${c.name}</a>`
        )
        .join("\n    ")}\n  </div></div></div>`
    : `<div class="cities"><div class="container"><h3>${industry.displayName}-Website in deiner Stadt</h3><div class="city-links">\n    ${DE_CITIES.map(
        c =>
          `<a class="city-link" href="/website-erstellen/${industry.slug}/${c.slug}">${c.name}</a>`
      ).join("\n    ")}\n  </div></div></div>`;

  // Ortsspezifischer Block. Kombiniert Stadt UND Branche, damit sich sowohl
  // friseur/berlin von friseur/hamburg unterscheidet (über city.intro und die
  // Stadtteile) als auch von restaurant/berlin (über den Branchennamen).
  // Ohne diesen Block wären die Städte-Seiten wieder nur Namens-Varianten.
  const [d0, d1, d2] = city?.districts ?? [];
  const localSectionHtml = city
    ? `
<section class="features local">
  <div class="container">
    <p class="section-label">${escapeHtml(city.name)} · ${escapeHtml(city.region)}</p>
    <h2 class="section-title">${escapeHtml(industry.displayName)}-Website in ${escapeHtml(city.name)}: worauf es hier ankommt</h2>
    <p class="local-intro">${escapeHtml(city.intro)}</p>
    <div class="features-grid">
      <div class="feature-card"><div class="feature-icon">${iconSvg("📍")}</div><h3>Sichtbar im Stadtteil</h3><p>Ob ${escapeHtml(d0)}, ${escapeHtml(d1)} oder ${escapeHtml(d2)} – deine Website nennt Stadtteil und Adresse genau dort, wo Google sie für die lokale Suche ausliest. Das entscheidet in ${escapeHtml(city.name)} mehr als jedes Werbebudget.</p></div>
      <div class="feature-card"><div class="feature-icon">${iconSvg("🔍")}</div><h3>„${escapeHtml(industry.displayName)} ${escapeHtml(city.name)}“</h3><p>Genau nach dieser Kombination sucht deine Kundschaft. Pageblitz setzt Titel, Überschriften und Meta-Angaben automatisch so, dass dein Betrieb für ${escapeHtml(industry.displayName.toLowerCase())}-Suchen in ${escapeHtml(city.name)} passend ausgezeichnet ist.</p></div>
      <div class="feature-card"><div class="feature-icon">${iconSvg("📱")}</div><h3>Unterwegs entschieden</h3><p>Lokale Suchen laufen fast immer über das Handy – oft direkt vor der Tür. Deine Seite lädt schnell, zeigt Öffnungszeiten und Route sofort und macht die Kontaktaufnahme zu einem Fingertipp.</p></div>
    </div>
    ${
      city.description
        ? `<div class="local-detail">${city.description
            .split(/\n{2,}/)
            .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`)
            .join("")}</div>`
        : ""
    }
  </div>
</section>`
    : "";

  // Industry visual style
  const style = INDUSTRY_STYLES[industry.slug] ?? DEFAULT_INDUSTRY_STYLE;

  // Industry-relevant add-ons
  const relevantAddons = getRelevantAddons(industry.slug);
  const addonsHtml = relevantAddons
    .map(
      (a, i) =>
        `<div class="addon-card${i >= 3 ? " addon-more" : ""}"><div class="addon-icon">${iconSvg(a.icon)}</div><h4>${escapeHtml(a.title)}</h4><p>${escapeHtml(a.desc)}</p><span class="addon-price">${escapeHtml(a.price)}</span></div>`
    )
    .join("\n      ");

  const showExpandBtn = relevantAddons.length > 3;

  // Pricing add-ons list (matches relevant ones)
  const pricingAddonsHtml = relevantAddons
    .map(
      a =>
        `<div class="pricing-addon-row"><span>${iconSvg(a.icon)} ${escapeHtml(a.title)}</span><span>${escapeHtml(a.price)}</span></div>`
    )
    .join("\n          ");

  const featuresHtml = industry.features
    .map(
      f =>
        `<div class="feature-card"><div class="feature-icon">${iconSvg(f.icon)}</div><h3>${escapeHtml(f.title)}</h3><p>${escapeHtml(f.text)}</p></div>`
    )
    .join("\n      ");

  // Auf Städte-Seiten kommen zwei ortsspezifische Fragen vor die Branchen-FAQs.
  // Die gehen auch ins FAQPage-Schema – damit unterscheiden sich die Rich
  // Results der Städte-Seiten voneinander statt identisch zu sein.
  const pageFaqs = city
    ? [
        {
          q: `Lohnt sich eine eigene Website für ${industry.displayName} in ${city.name}?`,
          a: `Ja – gerade dort. In ${city.name} entscheidet die lokale Google-Suche darüber, wer angerufen wird. Wer nur bei Google Maps oder auf Social Media auftaucht, verliert die Kundschaft, die vorher vergleicht. Eine eigene Website mit Adresse, Öffnungszeiten und Leistungen kostet bei Pageblitz ab 19,90 €/Monat.`,
        },
        {
          q: `Wird meine Website auch in meinem Stadtteil in ${city.name} gefunden?`,
          a: `Ja. Pageblitz trägt Stadtteil und Adresse an den Stellen ein, die Google für lokale Suchen auswertet – etwa in ${city.districts.slice(0, 3).join(", ")} oder jedem anderen Bezirk. Gerade in ${city.name} laufen die meisten Suchen über den Stadtteil, nicht über den Stadtnamen.`,
        },
        ...industry.faqs,
      ]
    : industry.faqs;

  const faqsHtml = pageFaqs
    .map(
      f =>
        `<details><summary>${escapeHtml(f.q)}</summary><div class="faq-answer"><p>${escapeHtml(f.a)}</p></div></details>`
    )
    .join("\n    ");

  // Mock browser – service cards from industry features
  const mockBusinessName = city
    ? `${industry.displayName} ${city.name}`
    : `${industry.displayName}`;
  const mockUrl = city
    ? `${industry.slug}-${city.slug}.pageblitz.de`
    : `${industry.slug}.pageblitz.de`;
  const mockCardsHtml = industry.features
    .slice(0, 3)
    .map(
      f =>
        `<div class="mw-card"><div class="mw-card-icon">${iconSvg(f.icon)}</div><div class="mw-card-line1"></div><div class="mw-card-line2"></div></div>`
    )
    .join("\n          ");

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(metaDesc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(metaDesc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="de_DE">
  <meta property="og:image" content="https://pageblitz.de/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(metaDesc)}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preload" href="/fonts/space-grotesk-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
  <script type="application/ld+json">${buildFaqSchema(pageFaqs)}</script>
  <script type="application/ld+json">${buildWebPageSchema(title, metaDesc, canonical)}</script>
  <script type="application/ld+json">${buildBreadcrumbSchema(industry, city)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body style="--accent:${style.accent};--orb:${style.orb};--hero-bg:${style.heroBg}">

<nav>
  <div class="container nav-inner">
    <a class="logo" href="/">
      <svg width="24" height="30" viewBox="480 380 1060 1360" fill="none" style="flex-shrink:0"><path fill="#ccff00" d="M 889.39 448.271 L 1027 448.389 C 1095.26 448.402 1154.86 444.93 1220.54 467.755 C 1441.18 544.436 1468.5 839.339 1248.65 943.253 C 1195 1000 1062 1038 954.752 1030.36 C 969.049 994.436 987.735 958.777 1002.94 923.08 C 1011.21 903.687 1020.46 883.279 1029.77 864.375 C 1077.42 864.484 1115.44 859.364 1153.94 827.092 C 1180.73 804.639 1196.69 773.181 1199.23 738.284 C 1199.31 734.894 1199.34 731.503 1199.31 728.112 C 1198.7 678.301 1167.03 637.505 1120.22 622.217 C 1092.14 613.044 1067.16 614.392 1038.07 614.653 C 1011.55 671.788 986.431 733.177 960.902 791.178 L 819.443 1113.34 C 905.629 1113.18 991.813 1112.4 1077.99 1110.98 C 1032.38 1160.99 985.77 1217.67 941.609 1269.32 L 738.53 1506.61 C 709.377 1541.1 680.035 1575.42 650.503 1609.58 C 631.107 1632.07 611.179 1655.76 590.625 1677.11 C 640.951 1539.68 697.528 1403.49 748.736 1266.29 C 687.357 1265.51 624.298 1266.35 562.693 1266.3 C 578.865 1222.21 598.131 1176.46 615.52 1132.68 L 739.197 823.33 L 836.91 577.647 L 865.589 506.36 C 873.185 487.231 880.738 466.851 889.39 448.271 z"/></svg>
      Pageblitz
    </a>
    <a class="nav-cta" href="https://pageblitz.de/start">Kostenlos erstellen</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-orb orb-tl"></div>
  <div class="hero-orb orb-br"></div>
  <img class="hero-persona" src="${heroPersonaSrc(industry.slug)}" alt="" width="640" height="960" loading="eager" fetchpriority="high" aria-hidden="true"/>
  <div class="container hero-copy" style="position:relative;z-index:1">
    <div class="hero-badge">Pageblitz · Vorschau in 3 Minuten</div>
    <h1>${escapeHtml(h1)}</h1>
    <p>${escapeHtml(industry.description)}</p>
    <a class="btn-primary" href="https://pageblitz.de/start">Website kostenlos erstellen</a>
    <div class="hero-trust">
      <span>✓ Keine Kreditkarte nötig</span>
      <span>✓ Keine Einrichtungsgebühr</span>
      <span>✓ Jederzeit kündbar</span>
    </div>
  </div>
</section>

<div class="stats">
  <div class="container">
    <div class="stats-grid">
      <div><div class="stat-value">3 Min.</div><div class="stat-label">Bis zur Vorschau</div></div>
      <div><div class="stat-value">Flexibel</div><div class="stat-label">Design &amp; Aufbau</div></div>
      <div><div class="stat-value">0 €</div><div class="stat-label">Einrichtungskosten</div></div>
      <div><div class="stat-value">19,90 €</div><div class="stat-label">Pro Monat</div></div>
    </div>
  </div>
</div>

<section class="preview-section">
  <div class="container">
    <p class="section-label">Beispiel</p>
    <h2 class="section-title">So könnte deine ${escapeHtml(industry.displayName)}-Website aussehen</h2>
    <p class="section-sub">Von der KI in 3 Minuten generiert – mit deinen echten Daten, deinem Namen, deiner Adresse</p>
    <div class="mock-browser">
      <div class="mock-chrome">
        <div class="mock-dots">
          <div class="mock-dot r"></div>
          <div class="mock-dot a"></div>
          <div class="mock-dot g"></div>
        </div>
        <div class="mock-url">
          <span><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
          <span>${escapeHtml(mockUrl)}</span>
        </div>
      </div>
      <div class="mw-wrap">
        <div class="mw-nav">
          <div class="mw-logo-pill"></div>
          <div class="mw-spacer"></div>
          <div class="mw-nav-links">
            <div class="mw-nav-link"></div>
            <div class="mw-nav-link"></div>
            <div class="mw-nav-link"></div>
          </div>
          <div class="mw-btn"></div>
        </div>
        <div class="mw-hero" style="position:relative;overflow:hidden;background:#111;padding:0">
          <img src="${style.previewPhoto}" alt="${escapeHtml(mockBusinessName)}" width="640" height="400" loading="lazy" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;opacity:.8;display:block">
          <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,.78) 0%,rgba(0,0,0,.35) 100%)"></div>
          <div style="position:relative;z-index:1;padding:2.25rem 1.5rem 2rem">
            <div class="mw-hero-eyebrow" style="background:${style.accent};opacity:1;height:.3rem;border-radius:99px;width:4rem;margin-bottom:.875rem"></div>
            <div class="mw-hero-name">${escapeHtml(mockBusinessName)}</div>
            <div class="mw-hero-sub"></div>
            <div class="mw-hero-sub2"></div>
            <div class="mw-hero-cta" style="background:${style.accent}">Jetzt Termin buchen →</div>
          </div>
        </div>
        <div class="mw-services">
          ${mockCardsHtml}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="steps">
  <div class="container">
    <p class="section-label">So funktioniert's</p>
    <h2 class="section-title">In 3 Schritten zur fertigen Website</h2>
    <p class="section-sub">Kein Webdesigner, kein Warten – die KI macht alles automatisch</p>
    <div class="steps-grid">
      <div class="step">
        <div class="step-num">1</div>
        <h3>Branche &amp; Daten eingeben</h3>
        <p>Wähle deine Branche und beantworte ein paar Fragen zu deinem ${escapeHtml(industry.displayName)}-Betrieb.</p>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <h3>KI erstellt deine Website</h3>
        <p>Unsere KI generiert Texte, Layout und Design automatisch – passend für ${escapeHtml(industry.displayName)}.</p>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <h3>Online &amp; fertig</h3>
        <p>Deine Website ist sofort erreichbar – DSGVO-konform, mobiloptimiert und SEO-ready.</p>
      </div>
    </div>
  </div>
</section>

<section class="features">
  <div class="container">
    <p class="section-label">Funktionen</p>
    <h2 class="section-title">Was Pageblitz für deinen ${escapeHtml(industry.displayName)}${escapeHtml(cityFull)} bietet</h2>
    <p class="section-sub">Alle Features, die du brauchst – ab 19,90 €/Monat, kein Technik-Know-how nötig</p>
    <div class="features-grid">
      ${featuresHtml}
    </div>
  </div>
</section>

${localSectionHtml}

<section class="addons">
  <div class="container">
    <p class="section-label">Optionale Add-ons</p>
    <h2 class="section-title">Mehr Funktionen mit einem Klick</h2>
    <p class="section-sub">Erweitere deine ${escapeHtml(industry.displayName)}-Website mit den passenden Extras – jederzeit zubuchbar</p>
    <div class="addons-grid">
      ${addonsHtml}
    </div>
    ${showExpandBtn ? `<button class="addon-expand-btn" id="addon-expand-btn" onclick="expandAddons()">Weitere Add-ons anzeigen ↓</button>` : ""}
  </div>
</section>

<section class="pricing">
  <div class="container">
    <p class="section-label">Preise</p>
    <h2 class="section-title">Ein Preis. Alles inklusive.</h2>
    <p class="section-sub">Professionelle ${escapeHtml(industry.displayName)}-Website ohne versteckte Kosten</p>
    <div class="pricing-wrapper">
      <div class="pricing-card">
        <div class="pricing-badge">✦ Beliebt</div>
        <div class="pricing-name">Pageblitz Pro</div>

        <div class="billing-toggle">
          <button class="billing-btn" id="btn-monthly" onclick="setBilling('monthly')">Monatlich</button>
          <button class="billing-btn active" id="btn-yearly" onclick="setBilling('yearly')">Jährlich <span class="billing-save">2 Monate gratis</span></button>
        </div>

        <div id="price-monthly" style="display:none">
          <div class="pricing-price">24,90 €<span>/Monat</span></div>
          <div class="pricing-note">Monatliche Abrechnung · Jederzeit kündbar.</div>
        </div>
        <div id="price-yearly">
          <div class="pricing-price">19,90 €<span>/Monat</span></div>
          <div class="pricing-note">238,80 €/Jahr · 2 Monate gespart · Jederzeit kündbar.</div>
        </div>
        <ul class="pricing-features">
          <li>KI-generierte ${escapeHtml(industry.displayName)}-Website</li>
          <li>SSL-Zertifikat</li>
          <li>DSGVO-konformer Datenschutz &amp; Impressum</li>
          <li>Premium Cloud Hosting</li>
          <li>Website-Inhalte jederzeit mit Studio-KI ändern</li>
          <li>Chat-Support</li>
        </ul>
        <div class="pricing-addon-box">
          <div class="pricing-addon-label">Optionale Add-ons für ${escapeHtml(industry.displayName)}</div>
          ${pricingAddonsHtml}
        </div>
        <a class="pricing-cta" href="https://pageblitz.de/start" style="background:${style.accent};color:#fff">Website kostenlos erstellen</a>
        <div class="pricing-note-bottom" id="note-bottom-monthly" style="display:none">7 Tage gratis · danach 24,90 €/Mo. · Jederzeit kündbar</div>
        <div class="pricing-note-bottom" id="note-bottom-yearly">7 Tage gratis · danach 19,90 €/Mo. (238,80 €/Jahr) · Jederzeit kündbar</div>
      </div>
    </div>
  </div>
</section>

<section class="comparison">
  <div class="container">
    <p class="section-label">Vergleich</p>
    <h2 class="section-title">Pageblitz vs. Webagentur</h2>
    <p class="section-sub">Warum immer mehr Kleinunternehmer auf KI statt auf Agenturen setzen</p>
    <div class="comp-table">
      <div class="comp-header">
        <div></div>
        <div>Webagentur</div>
        <div>Pageblitz ✦</div>
      </div>
      <div class="comp-row"><div>Einmalige Kosten</div><div>2.000 – 8.000 €</div><div>0 €</div></div>
      <div class="comp-row"><div>Zeit bis zur fertigen Website</div><div>4 – 12 Wochen</div><div>3 Minuten</div></div>
      <div class="comp-row"><div>Monatliche Kosten</div><div>50 – 150 € Hosting &amp; Wartung</div><div>19,90 €*</div></div>
      <div class="comp-row"><div>Änderungen &amp; Updates</div><div>Stundenabrechnung (~80 €/h)</div><div>Inklusive</div></div>
      <div class="comp-row"><div>Vertragslaufzeit</div><div>Oft 12–24 Monate</div><div>1 Monat</div></div>
      <div class="comp-row"><div>DSGVO &amp; Impressum</div><div>Meist kostenpflichtig extra</div><div>Automatisch inklusive</div></div>
      <div class="comp-row"><div>SSL &amp; Hosting</div><div>Oft extra berechnet</div><div>Inklusive</div></div>
    </div>
  </div>
</section>

<section class="faq">
  <div class="container">
    <p class="section-label">FAQ</p>
    <h2 class="section-title">Häufige Fragen zur ${escapeHtml(industry.displayName)}-Website</h2>
    <div class="faq-list">
    ${faqsHtml}
    </div>
  </div>
</section>

<section class="cta-banner">
  <div class="container">
    <h2>Jetzt ${escapeHtml(industry.displayName)}-Website erstellen${escapeHtml(cityStr)}</h2>
    <p>Vorschau in 3 Minuten. KI-generiert. Ab 19,90 €/Monat – die ersten 7 Tage komplett gratis.</p>
    <a class="btn-primary" href="https://pageblitz.de/start" style="background:linear-gradient(135deg,${style.accent},${style.accent}cc);box-shadow:0 4px 24px ${style.accent}40">Website kostenlos erstellen</a>
    <div class="cta-note">Keine Kreditkarte nötig · Keine Einrichtungsgebühr · Jederzeit kündbar</div>
  </div>
</section>

<section class="industries">
  <div class="container">
    <h3>Weitere Branchen – Website erstellen</h3>
    <div class="industry-links">
    ${industryLinksHtml}
    </div>
  </div>
</section>

${cityLinksHtml}

<footer>
  <div class="container">
    <p>© ${new Date().getFullYear()} Pageblitz · <a href="https://pageblitz.de/impressum">Impressum</a> · <a href="https://pageblitz.de/datenschutz">Datenschutz</a></p>
  </div>
</footer>

<script>
function setBilling(plan){
  var isYearly = plan === 'yearly';
  document.getElementById('btn-monthly').classList.toggle('active', !isYearly);
  document.getElementById('btn-yearly').classList.toggle('active', isYearly);
  document.getElementById('price-monthly').style.display = isYearly ? 'none' : 'block';
  document.getElementById('price-yearly').style.display = isYearly ? 'block' : 'none';
  document.getElementById('note-bottom-monthly').style.display = isYearly ? 'none' : 'block';
  document.getElementById('note-bottom-yearly').style.display = isYearly ? 'block' : 'none';
}
function expandAddons(){
  document.querySelectorAll('.addon-more').forEach(function(el){el.style.display='block'});
  var btn = document.getElementById('addon-expand-btn');
  if(btn) btn.style.display='none';
}
</script>
</body>
</html>`;
}

// ── Overview page ─────────────────────────────────────────────────────────────

export function generateOverviewHTML(): string {
  const canonical = "https://pageblitz.de/website-erstellen";
  const title =
    "Website erstellen für Kleinunternehmen | Pageblitz – KI-Website-Generator";
  const desc =
    "Mit Pageblitz erstellst du in 3 Minuten eine professionelle Website für dein Unternehmen. Über 17 Branchen – ab 19,90 €/Monat.";

  const overviewCss =
    SHARED_CSS +
    `
.overview-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.75rem;margin-top:3rem}
.industry-card{display:flex;flex-direction:column;align-items:center;background:#fdfcfa;border:1px solid #ddd6c9;border-radius:12px;padding:1.75rem 1.25rem;text-align:center;transition:background-color .2s,border-color .2s,transform .2s;color:#1d1a17}
.industry-card:hover{border-color:#1f5f4b;background:#fff;transform:translateY(-2px)}
.industry-card .icon{margin-bottom:.75rem;color:#ccff00}
.industry-card .icon svg{width:28px;height:28px}
.industry-card h3{font-size:.9375rem;font-weight:600;color:#1d1a17;margin-bottom:.375rem}
.industry-card p{font-size:.8125rem;color:#6b645b;line-height:1.5}
@media(prefers-reduced-motion:reduce),(hover:none),(pointer:coarse){.industry-card{transition:none}.industry-card:hover{transform:none}}
`;

  const industryCardsHtml = Object.values(SEO_INDUSTRIES)
    .map(
      i =>
        `<a class="industry-card" href="/website-erstellen/${i.slug}"><div class="icon">${iconSvg(i.features[0]?.icon ?? "🌐")}</div><h3>${escapeHtml(i.displayName)}</h3><p>${escapeHtml(i.title)}</p></a>`
    )
    .join("\n    ");

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wie erstelle ich eine Website für mein Unternehmen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mit Pageblitz in 3 Schritten: Branche wählen, Unternehmensdaten eingeben, fertige Website erhalten. Vorschau in 3 Minuten.",
        },
      },
      {
        "@type": "Question",
        name: "Was kostet eine professionelle Website für Kleinunternehmen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mit Pageblitz ab 19,90 €/Monat – ohne Einrichtungsgebühr und mit 7 Tagen gratis testen.",
        },
      },
      {
        "@type": "Question",
        name: "Brauche ich technische Kenntnisse für meine Website?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nein. Pageblitz erstellt deine Website automatisch per KI – ohne Programmierung oder Design-Kenntnisse.",
        },
      },
    ],
  });

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="de_DE">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preload" href="/fonts/space-grotesk-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
  <script type="application/ld+json">${faqSchema}</script>
  <style>${overviewCss}</style>
</head>
<body>

<nav>
  <div class="container nav-inner">
    <a class="logo" href="/">
      <svg width="24" height="30" viewBox="480 380 1060 1360" fill="none" style="flex-shrink:0"><path fill="#ccff00" d="M 889.39 448.271 L 1027 448.389 C 1095.26 448.402 1154.86 444.93 1220.54 467.755 C 1441.18 544.436 1468.5 839.339 1248.65 943.253 C 1195 1000 1062 1038 954.752 1030.36 C 969.049 994.436 987.735 958.777 1002.94 923.08 C 1011.21 903.687 1020.46 883.279 1029.77 864.375 C 1077.42 864.484 1115.44 859.364 1153.94 827.092 C 1180.73 804.639 1196.69 773.181 1199.23 738.284 C 1199.31 734.894 1199.34 731.503 1199.31 728.112 C 1198.7 678.301 1167.03 637.505 1120.22 622.217 C 1092.14 613.044 1067.16 614.392 1038.07 614.653 C 1011.55 671.788 986.431 733.177 960.902 791.178 L 819.443 1113.34 C 905.629 1113.18 991.813 1112.4 1077.99 1110.98 C 1032.38 1160.99 985.77 1217.67 941.609 1269.32 L 738.53 1506.61 C 709.377 1541.1 680.035 1575.42 650.503 1609.58 C 631.107 1632.07 611.179 1655.76 590.625 1677.11 C 640.951 1539.68 697.528 1403.49 748.736 1266.29 C 687.357 1265.51 624.298 1266.35 562.693 1266.3 C 578.865 1222.21 598.131 1176.46 615.52 1132.68 L 739.197 823.33 L 836.91 577.647 L 865.589 506.36 C 873.185 487.231 880.738 466.851 889.39 448.271 z"/></svg>
      Pageblitz
    </a>
    <a class="nav-cta" href="https://pageblitz.de/start">Kostenlos erstellen</a>
  </div>
</nav>

<section class="hero">
  <div class="container">
    <div class="hero-badge">Pageblitz · Vorschau in 3 Minuten</div>
    <h1>Website erstellen für dein Unternehmen – in 3 Minuten</h1>
    <p>Die KI erstellt deine professionelle Website automatisch. Branche wählen, Daten eingeben – fertig. Ab 19,90 €/Monat.</p>
    <a class="btn-primary" href="https://pageblitz.de/start">Website kostenlos erstellen</a>
    <div class="hero-trust">
      <span>✓ Keine Kreditkarte nötig</span>
      <span>✓ Keine Einrichtungsgebühr</span>
      <span>✓ Jederzeit kündbar</span>
    </div>
  </div>
</section>

<section class="features">
  <div class="container">
    <p class="section-label">Branchen</p>
    <h2 class="section-title">Wähle deine Branche</h2>
    <p class="section-sub">Über 17 spezialisierte Branchen – professionell, DSGVO-konform, als Vorschau in 3 Minuten.</p>
    <div class="overview-grid">
    ${industryCardsHtml}
    </div>
  </div>
</section>

<section class="cta-banner">
  <div class="container">
    <h2>Jetzt Website erstellen – 7 Tage gratis</h2>
    <p>Vorschau in 3 Minuten. KI-generiert. Ab 19,90 €/Monat – die ersten 7 Tage gratis testen.</p>
    <a class="btn-primary" href="https://pageblitz.de/start">Website kostenlos erstellen</a>
    <div class="cta-note">Keine Kreditkarte nötig · Keine Einrichtungsgebühr · Jederzeit kündbar</div>
  </div>
</section>

<footer>
  <div class="container">
    <p>© ${new Date().getFullYear()} Pageblitz · <a href="https://pageblitz.de/impressum">Impressum</a> · <a href="https://pageblitz.de/datenschutz">Datenschutz</a></p>
  </div>
</footer>

</body>
</html>`;
}
