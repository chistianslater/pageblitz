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
}

// ── 17 Branchen ───────────────────────────────────────────────────────────────

export const SEO_INDUSTRIES: Record<string, SeoIndustry> = {
  friseur: {
    slug: "friseur",
    displayName: "Friseur",
    title: "Website für Friseur erstellen",
    h1Template: "KI-Website für deinen Friseursalon{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Friseure ab 19,90 €/Monat. Mit Galerie, Leistungsübersicht und Kontaktformular. Von der KI erstellt – sofort online.",
    keywords: ["Website Friseur", "Friseursalon Website erstellen", "Homepage Friseur"],
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
    h1Template: "KI-Website für dein Restaurant{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Restaurants ab 19,90 €/Monat. Speisekarte, Öffnungszeiten, Tisch-Reservierung – alles von der KI erstellt.",
    keywords: ["Website Restaurant", "Restaurant Website erstellen", "Homepage Gastronomie"],
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
    h1Template: "KI-Website für deinen Handwerksbetrieb{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Handwerker ab 19,90 €/Monat. Leistungen, Referenzen, Anfrage-Formular – von der KI erstellt, sofort online.",
    keywords: ["Website Handwerker", "Handwerksbetrieb Website erstellen", "Homepage Handwerk"],
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
    h1Template: "KI-Website für deine Zahnarztpraxis{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Zahnarztpraxen ab 19,90 €/Monat. Praxis, Team, Leistungen, Online-Terminanfrage – von der KI erstellt.",
    keywords: ["Website Zahnarzt", "Zahnarztpraxis Website erstellen", "Homepage Zahnarzt"],
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
    h1Template: "KI-Website für dein Kosmetikstudio{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Kosmetikerinnen ab 19,90 €/Monat. Behandlungen, Preise, Galerie und Terminanfrage – sofort online.",
    keywords: ["Website Kosmetikstudio", "Kosmetikerin Website erstellen", "Homepage Kosmetik"],
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
    h1Template: "KI-Website für dein Fitnessstudio{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Fitnessstudios und Personal Trainer ab 19,90 €/Monat. Kurspläne, Mitgliedschaft, Fotos – sofort online.",
    keywords: ["Website Fitnessstudio", "Personal Trainer Website erstellen", "Homepage Gym"],
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
    h1Template: "KI-Website für deine Arztpraxis{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Arztpraxen ab 19,90 €/Monat. Praxis, Team, Leistungen, Öffnungszeiten – DSGVO-konform und sofort online.",
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
    h1Template: "KI-Website für deinen Immobilienmakler-Betrieb{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Immobilienmakler ab 19,90 €/Monat. Referenzobjekte, Kontaktformular, Über-Mich – sofort online.",
    keywords: ["Website Immobilienmakler", "Makler Website erstellen", "Homepage Immobilien"],
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
    h1Template: "KI-Website für deine Anwaltskanzlei{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Rechtsanwälte ab 19,90 €/Monat. Fachgebiete, Kontaktformular, Kanzleivorstellung – DSGVO-konform.",
    keywords: ["Website Rechtsanwalt", "Anwaltskanzlei Website erstellen", "Homepage Anwalt"],
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
    h1Template: "KI-Website für deine Steuerkanzlei{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Steuerberater ab 19,90 €/Monat. Leistungen, Team, Kontaktformular – DSGVO-konform und sofort online.",
    keywords: ["Website Steuerberater", "Steuerkanzlei Website erstellen", "Homepage Steuerberater"],
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
    h1Template: "KI-Website für dein Fotostudio{city} – in 3 Minuten online",
    description:
      "Professionelle Portfolio-Website für Fotografen ab 19,90 €/Monat. Portfolio-Galerie, Preisliste, Buchungsanfrage – sofort online.",
    keywords: ["Website Fotograf", "Fotografen Website erstellen", "Portfolio Website Fotograf"],
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
    h1Template: "KI-Website für deine Physiopraxis{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Physiotherapeuten ab 19,90 €/Monat. Behandlungen, Team, Online-Terminanfrage – sofort online.",
    keywords: ["Website Physiotherapeut", "Physiopraxis Website erstellen", "Physiotherapie Homepage"],
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
    h1Template: "KI-Website für dein Nagelstudio{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Nagelstudios ab 19,90 €/Monat. Preisliste, Galerie, Terminanfrage – sofort online und ohne Technik.",
    keywords: ["Website Nagelstudio", "Nagelstylistin Website erstellen", "Nail Art Homepage"],
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
    h1Template: "KI-Website für deine Bäckerei{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Bäckereien und Konditoreien ab 19,90 €/Monat. Angebote, Öffnungszeiten, Sonderbestellungen – sofort online.",
    keywords: ["Website Bäckerei", "Bäckerei Homepage erstellen", "Konditorei Website"],
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
    h1Template: "KI-Website für deinen Reinigungsservice{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Reinigungsunternehmen ab 19,90 €/Monat. Leistungen, Angebote, Kontaktformular – sofort online.",
    keywords: ["Website Reinigungsservice", "Reinigungsunternehmen Website erstellen", "Hausreinigung Homepage"],
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
    h1Template: "KI-Website für deinen Hundesalon{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Hundesalons und Tierpfleger ab 19,90 €/Monat. Preisliste, Galerie, Terminanfrage – sofort online.",
    keywords: ["Website Hundesalon", "Tierpfleger Website erstellen", "Hundefriseur Homepage"],
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
    h1Template: "KI-Website für deine Musikschule{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Musikschulen und Musiklehrer ab 19,90 €/Monat. Kurse, Instrumente, Schnupperstunde – sofort online.",
    keywords: ["Website Musikschule", "Musiklehrer Website erstellen", "Musikunterricht Homepage"],
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
};

// ── 30 deutsche Städte nach Einwohnerzahl ────────────────────────────────────

export const DE_CITIES: SeoCity[] = [
  { name: "Berlin", slug: "berlin" },
  { name: "Hamburg", slug: "hamburg" },
  { name: "München", slug: "muenchen" },
  { name: "Köln", slug: "koeln" },
  { name: "Frankfurt", slug: "frankfurt" },
  { name: "Stuttgart", slug: "stuttgart" },
  { name: "Düsseldorf", slug: "duesseldorf" },
  { name: "Leipzig", slug: "leipzig" },
  { name: "Dortmund", slug: "dortmund" },
  { name: "Essen", slug: "essen" },
  { name: "Bremen", slug: "bremen" },
  { name: "Dresden", slug: "dresden" },
  { name: "Hannover", slug: "hannover" },
  { name: "Nürnberg", slug: "nuernberg" },
  { name: "Duisburg", slug: "duisburg" },
  { name: "Bochum", slug: "bochum" },
  { name: "Wuppertal", slug: "wuppertal" },
  { name: "Bielefeld", slug: "bielefeld" },
  { name: "Bonn", slug: "bonn" },
  { name: "Münster", slug: "muenster" },
  { name: "Karlsruhe", slug: "karlsruhe" },
  { name: "Mannheim", slug: "mannheim" },
  { name: "Augsburg", slug: "augsburg" },
  { name: "Wiesbaden", slug: "wiesbaden" },
  { name: "Aachen", slug: "aachen" },
  { name: "Mönchengladbach", slug: "moenchengladbach" },
  { name: "Braunschweig", slug: "braunschweig" },
  { name: "Kiel", slug: "kiel" },
  { name: "Rostock", slug: "rostock" },
  { name: "Freiburg", slug: "freiburg" },
];

// ── Inline CSS (shared across all landing pages) ─────────────────────────────

const SHARED_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,Roboto,sans-serif;color:#111827;background:#fff;line-height:1.6}
a{color:inherit;text-decoration:none}
img{max-width:100%;height:auto}
.container{max-width:1100px;margin:0 auto;padding:0 1.5rem}
/* Nav */
nav{background:rgba(255,255,255,.97);backdrop-filter:blur(8px);border-bottom:1px solid #e5e7eb;padding:.875rem 0;position:sticky;top:0;z-index:100}
.nav-inner{display:flex;align-items:center;justify-content:space-between}
.logo{font-size:1.25rem;font-weight:800;color:#2563eb;letter-spacing:-.5px;display:flex;align-items:center;gap:.375rem}
.nav-cta{background:#2563eb;color:#fff!important;padding:.5rem 1.25rem;border-radius:8px;font-size:.875rem;font-weight:600;transition:background .2s}
.nav-cta:hover{background:#1d4ed8}
/* Hero */
.hero{background:linear-gradient(145deg,#0f172a 0%,#1e3a8a 50%,#1d4ed8 100%);color:#fff;padding:5rem 0 4rem;text-align:center;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(59,130,246,.25),transparent);pointer-events:none}
.hero-badge{display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:.375rem 1rem;font-size:.8125rem;font-weight:600;margin-bottom:1.5rem;color:rgba(255,255,255,.9)}
.hero h1{font-size:clamp(1.875rem,4.5vw,3rem);font-weight:800;margin-bottom:1.25rem;line-height:1.15;letter-spacing:-.02em}
.hero p{font-size:1.0625rem;opacity:.85;max-width:680px;margin:0 auto 2rem;line-height:1.7}
.btn-primary{display:inline-block;background:#16a34a;color:#fff;padding:.9375rem 2.5rem;border-radius:10px;font-size:1.0625rem;font-weight:700;transition:all .2s;box-shadow:0 4px 14px rgba(22,163,74,.4)}
.btn-primary:hover{background:#15803d;transform:translateY(-1px);box-shadow:0 6px 20px rgba(22,163,74,.45)}
.hero-trust{margin-top:1.5rem;display:flex;align-items:center;justify-content:center;gap:1.5rem;flex-wrap:wrap;font-size:.8125rem;opacity:.75}
.hero-trust span{display:flex;align-items:center;gap:.375rem}
/* Steps */
.steps{padding:4.5rem 0;background:#f8fafc}
.steps-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:2rem;margin-top:3rem}
.step{text-align:center;padding:1.5rem 1rem}
.step-num{width:3rem;height:3rem;background:#2563eb;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.125rem;font-weight:800;margin:0 auto 1.25rem}
.step h3{font-size:1.0625rem;font-weight:700;margin-bottom:.5rem;color:#111827}
.step p{color:#4b5563;font-size:.9375rem;line-height:1.65}
/* Features */
.features{padding:4.5rem 0}
.section-title{text-align:center;font-size:clamp(1.5rem,3vw,2.125rem);font-weight:800;margin-bottom:.75rem;color:#111827;letter-spacing:-.02em}
.section-sub{text-align:center;color:#6b7280;margin-bottom:3rem;max-width:600px;margin-left:auto;margin-right:auto;font-size:1.0625rem}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:1.5rem}
.feature-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:2rem;transition:box-shadow .2s,border-color .2s}
.feature-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.08);border-color:#bfdbfe}
.feature-icon{font-size:2.25rem;margin-bottom:1rem}
.feature-card h3{font-size:1.0625rem;font-weight:700;margin-bottom:.5rem;color:#1d4ed8}
.feature-card p{color:#4b5563;font-size:.9375rem;line-height:1.65}
/* Add-ons */
.addons{padding:4.5rem 0;background:#f0f9ff}
.addons-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.25rem;margin-top:3rem}
.addon-card{background:#fff;border:1px solid #bae6fd;border-radius:12px;padding:1.5rem;text-align:center}
.addon-icon{font-size:1.75rem;margin-bottom:.75rem}
.addon-card h4{font-size:.9375rem;font-weight:700;color:#0c4a6e;margin-bottom:.375rem}
.addon-card p{font-size:.8125rem;color:#0369a1;line-height:1.5}
.addon-price{display:inline-block;margin-top:.75rem;background:#e0f2fe;color:#0284c7;font-size:.75rem;font-weight:700;padding:.25rem .625rem;border-radius:999px}
/* Pricing */
.pricing{padding:4.5rem 0}
.pricing-wrapper{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;max-width:820px;margin:3rem auto 0}
.pricing-card{background:#fff;border:2px solid #e5e7eb;border-radius:18px;padding:2.25rem;position:relative}
.pricing-card.featured{border-color:#2563eb;box-shadow:0 8px 32px rgba(37,99,235,.15)}
.pricing-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:#2563eb;color:#fff;font-size:.75rem;font-weight:700;padding:.3rem .875rem;border-radius:999px;white-space:nowrap}
.pricing-name{font-size:.875rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px}
.pricing-price{font-size:2.5rem;font-weight:800;color:#111827;margin:.5rem 0;letter-spacing:-.03em}
.pricing-price span{font-size:1rem;color:#6b7280;font-weight:400}
.pricing-note{font-size:.875rem;color:#6b7280;margin-bottom:1.5rem}
.pricing-features{list-style:none}
.pricing-features li{padding:.5rem 0;border-bottom:1px solid #f1f5f9;display:flex;align-items:flex-start;gap:.625rem;font-size:.9375rem;color:#374151}
.pricing-features li:last-child{border-bottom:none}
.pricing-features li::before{content:"✓";color:#16a34a;font-weight:700;flex-shrink:0;margin-top:.125rem}
.pricing-cta{display:block;margin-top:1.75rem;text-align:center;background:#2563eb;color:#fff;padding:.875rem;border-radius:10px;font-weight:700;font-size:.9375rem;transition:background .2s}
.pricing-cta:hover{background:#1d4ed8}
.pricing-cta.secondary{background:#f1f5f9;color:#374151}
.pricing-cta.secondary:hover{background:#e2e8f0}
/* FAQ */
.faq{padding:4.5rem 0;background:#f8fafc}
.faq-list{max-width:760px;margin:0 auto}
details{background:#fff;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:.75rem;overflow:hidden}
details[open]{border-color:#93c5fd}
summary{padding:1.25rem 1.5rem;cursor:pointer;font-weight:600;font-size:.9375rem;list-style:none;display:flex;justify-content:space-between;align-items:center;color:#111827;-webkit-tap-highlight-color:transparent}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";font-size:1.25rem;color:#2563eb;font-weight:300;flex-shrink:0;margin-left:.75rem}
details[open] summary::after{content:"−"}
.faq-answer{padding:0 1.5rem 1.25rem;color:#4b5563;font-size:.9375rem;line-height:1.7}
/* CTA Banner */
.cta-banner{background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#fff;padding:5rem 0;text-align:center}
.cta-banner h2{font-size:clamp(1.5rem,3vw,2.25rem);font-weight:800;margin-bottom:1rem;letter-spacing:-.02em}
.cta-banner p{opacity:.75;max-width:560px;margin:0 auto 2rem;font-size:1.0625rem;line-height:1.7}
/* Industries */
.industries{padding:3rem 0;background:#f9fafb;border-top:1px solid #e5e7eb}
.industries h3{text-align:center;font-size:1.125rem;font-weight:700;margin-bottom:1.5rem;color:#374151}
.industry-links{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;max-width:880px;margin:0 auto}
.industry-link{display:inline-block;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:.4375rem .875rem;font-size:.875rem;color:#374151;transition:all .15s}
.industry-link:hover,.industry-link.active{border-color:#2563eb;color:#2563eb;background:#eff6ff}
.industry-link.active{font-weight:600}
/* Cities */
.cities{padding:2.5rem 0;border-top:1px solid #e5e7eb}
.cities h3{text-align:center;font-size:1rem;font-weight:700;margin-bottom:1.25rem;color:#374151}
.city-links{display:flex;flex-wrap:wrap;gap:.375rem;justify-content:center;max-width:880px;margin:0 auto}
.city-link{display:inline-block;background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:.3125rem .75rem;font-size:.8125rem;color:#374151;transition:all .15s}
.city-link:hover,.city-link.active{border-color:#2563eb;color:#2563eb;background:#eff6ff}
/* Footer */
footer{background:#0f172a;color:#64748b;padding:2.5rem 0;text-align:center;font-size:.875rem}
footer a{color:#94a3b8;text-decoration:underline;margin:0 .5rem}
/* Responsive */
@media(max-width:640px){
  .hero{padding:3rem 0 2.5rem}
  .features,.addons,.pricing,.faq,.industries,.cities{padding:2.5rem 0}
  .hero h1{font-size:1.75rem}
  .hero-trust{gap:1rem;font-size:.75rem}
  .pricing-wrapper{grid-template-columns:1fr}
  .steps-grid{gap:1.25rem}
}
`.trim();

// ── Schema.org helpers ────────────────────────────────────────────────────────

function buildFaqSchema(faqs: Array<{ q: string; a: string }>): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
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
    { position: 2, name: "Website erstellen", item: "https://pageblitz.de/website-erstellen" },
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
    itemListElement: items.map((i) => ({
      "@type": "ListItem",
      position: i.position,
      name: i.name,
      ...(i.item ? { item: i.item } : {}),
    })),
  });
}

// ── HTML generator ────────────────────────────────────────────────────────────

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
  const metaDesc = city
    ? `${industry.description} Jetzt in ${city.name} starten – 7 Tage gratis.`
    : `${industry.description} 7 Tage gratis testen.`;
  const h1 = industry.h1Template.replace("{city}", cityStr);

  const otherIndustries = Object.values(SEO_INDUSTRIES).filter(
    (i) => i.slug !== industry.slug
  );
  const otherCities = city ? DE_CITIES.filter((c) => c.slug !== city.slug) : [];

  const industryLinksHtml = otherIndustries
    .map(
      (i) =>
        `<a class="industry-link" href="/website-erstellen/${i.slug}${city ? "/" + city.slug : ""}">Website für ${i.displayName}</a>`
    )
    .join("\n    ");

  const cityLinksHtml = city
    ? `<div class="cities"><div class="container"><h3>${industry.displayName}-Website in anderen Städten</h3><div class="city-links">\n    ${otherCities
        .map(
          (c) =>
            `<a class="city-link" href="/website-erstellen/${industry.slug}/${c.slug}">${c.name}</a>`
        )
        .join("\n    ")}\n  </div></div></div>`
    : `<div class="cities"><div class="container"><h3>${industry.displayName}-Website in deiner Stadt</h3><div class="city-links">\n    ${DE_CITIES.map(
        (c) =>
          `<a class="city-link" href="/website-erstellen/${industry.slug}/${c.slug}">${c.name}</a>`
      ).join("\n    ")}\n  </div></div></div>`;

  const featuresHtml = industry.features
    .map(
      (f) =>
        `<div class="feature-card"><div class="feature-icon">${f.icon}</div><h3>${escapeHtml(f.title)}</h3><p>${escapeHtml(f.text)}</p></div>`
    )
    .join("\n      ");

  const faqsHtml = industry.faqs
    .map(
      (f) =>
        `<details><summary>${escapeHtml(f.q)}</summary><div class="faq-answer"><p>${escapeHtml(f.a)}</p></div></details>`
    )
    .join("\n    ");

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
  <script type="application/ld+json">${buildFaqSchema(industry.faqs)}</script>
  <script type="application/ld+json">${buildWebPageSchema(title, metaDesc, canonical)}</script>
  <script type="application/ld+json">${buildBreadcrumbSchema(industry, city)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body>

<nav>
  <div class="container nav-inner">
    <a class="logo" href="/"><svg width="20" height="20" viewBox="0 0 32 32" fill="none" style="flex-shrink:0"><rect width="32" height="32" rx="7" fill="#2563eb"/><path d="M18 4L8 18h8l-2 10 12-14h-8l2-10z" fill="#fff"/></svg> Pageblitz</a>
    <a class="nav-cta" href="https://pageblitz.de/start">Kostenlos starten</a>
  </div>
</nav>

<section class="hero">
  <div class="container">
    <div class="hero-badge">⚡ KI-generiert · In 3 Minuten online</div>
    <h1>${escapeHtml(h1)}</h1>
    <p>${escapeHtml(industry.description)}</p>
    <a class="btn-primary" href="https://pageblitz.de/start">7 Tage gratis starten →</a>
    <div class="hero-trust">
      <span>✓ Keine Kreditkarte nötig</span>
      <span>✓ Keine Einrichtungsgebühr</span>
      <span>✓ Jederzeit kündbar</span>
    </div>
  </div>
</section>

<section class="steps">
  <div class="container">
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
        <p>Deine Website ist sofort unter deiner eigenen Adresse erreichbar – DSGVO-konform und mobiloptimiert.</p>
      </div>
    </div>
  </div>
</section>

<section class="features">
  <div class="container">
    <h2 class="section-title">Was Pageblitz für deinen ${escapeHtml(industry.displayName)}${escapeHtml(cityFull)} bietet</h2>
    <p class="section-sub">Alle Funktionen, die du brauchst – ab 19,90 €/Monat, kein Technik-Know-how nötig</p>
    <div class="features-grid">
      ${featuresHtml}
    </div>
  </div>
</section>

<section class="addons">
  <div class="container">
    <h2 class="section-title">Optionale Add-ons für noch mehr Funktionen</h2>
    <p class="section-sub">Erweitere deine ${escapeHtml(industry.displayName)}-Website mit leistungsstarken Extras – aktivierbar mit einem Klick</p>
    <div class="addons-grid">
      <div class="addon-card">
        <div class="addon-icon">💬</div>
        <h4>KI-Chat</h4>
        <p>Ein KI-Assistent beantwortet Kundenfragen rund um die Uhr – automatisch und auf dein Unternehmen trainiert.</p>
        <span class="addon-price">+ 9,90 €/Mo</span>
      </div>
      <div class="addon-card">
        <div class="addon-icon">📅</div>
        <h4>Terminbuchung</h4>
        <p>Kunden buchen direkt auf deiner Website einen Termin – ohne Anruf, ohne Wartezeit.</p>
        <span class="addon-price">+ 4,90 €/Mo</span>
      </div>
      <div class="addon-card">
        <div class="addon-icon">🖼️</div>
        <h4>Bildergalerie</h4>
        <p>Präsentiere deine Arbeiten, Produkte oder Räumlichkeiten in einer professionellen Galerie.</p>
        <span class="addon-price">+ 3,90 €/Mo</span>
      </div>
      <div class="addon-card">
        <div class="addon-icon">📋</div>
        <h4>Kontaktformular</h4>
        <p>Kundenanfragen direkt per E-Mail empfangen – mit DSGVO-konformem Formular.</p>
        <span class="addon-price">+ 3,90 €/Mo</span>
      </div>
    </div>
  </div>
</section>

<section class="pricing">
  <div class="container">
    <h2 class="section-title">Faire Preise – transparent &amp; ohne Überraschungen</h2>
    <p class="section-sub">Professionelle ${escapeHtml(industry.displayName)}-Website ohne versteckte Kosten</p>
    <div class="pricing-wrapper">
      <div class="pricing-card">
        <div class="pricing-name">Basis-Paket</div>
        <div class="pricing-price">19,90 €<span>/Monat</span></div>
        <div class="pricing-note">Inkl. 7 Tage gratis · Keine Einrichtungsgebühr</div>
        <ul class="pricing-features">
          <li>Professionelle ${escapeHtml(industry.displayName)}-Website</li>
          <li>Von der KI in 3 Minuten erstellt</li>
          <li>Impressum &amp; Datenschutzerklärung</li>
          <li>Öffnungszeiten &amp; Kontaktdaten</li>
          <li>Mobiloptimiertes Design</li>
          <li>SSL &amp; DSGVO-konform</li>
          <li>Subdomain (deinname.pageblitz.de)</li>
        </ul>
        <a class="pricing-cta secondary" href="https://pageblitz.de/start">Gratis testen</a>
      </div>
      <div class="pricing-card featured">
        <div class="pricing-badge">⚡ Beliebt</div>
        <div class="pricing-name">Basis + Add-ons</div>
        <div class="pricing-price">ab 23,80 €<span>/Monat</span></div>
        <div class="pricing-note">Alle Basis-Features plus deine Wunsch-Extras</div>
        <ul class="pricing-features">
          <li>Alles aus Basis-Paket</li>
          <li>KI-Chat (+ 9,90 €/Mo)</li>
          <li>Terminbuchung (+ 4,90 €/Mo)</li>
          <li>Bildergalerie (+ 3,90 €/Mo)</li>
          <li>Kontaktformular (+ 3,90 €/Mo)</li>
          <li>Speisekarte / Preisliste (+ 3,90 €/Mo)</li>
          <li>Nur zahlen was du nutzt</li>
        </ul>
        <a class="pricing-cta" href="https://pageblitz.de/start">Jetzt starten →</a>
      </div>
    </div>
  </div>
</section>

<section class="faq">
  <div class="container">
    <h2 class="section-title">Häufige Fragen zur ${escapeHtml(industry.displayName)}-Website</h2>
    <p class="section-sub">Alles, was du wissen musst – auf einen Blick</p>
    <div class="faq-list">
    ${faqsHtml}
    </div>
  </div>
</section>

<section class="cta-banner">
  <div class="container">
    <h2>Jetzt ${escapeHtml(industry.displayName)}-Website erstellen${escapeHtml(cityStr)}</h2>
    <p>In 3 Minuten online. KI-generiert. Ab 19,90 €/Monat – die ersten 7 Tage komplett gratis.</p>
    <a class="btn-primary" href="https://pageblitz.de/start">Kostenlos starten →</a>
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

</body>
</html>`;
}

// ── Overview page ─────────────────────────────────────────────────────────────

export function generateOverviewHTML(): string {
  const canonical = "https://pageblitz.de/website-erstellen";
  const title = "Website erstellen für Kleinunternehmen | Pageblitz – KI-Website-Generator";
  const desc =
    "Mit Pageblitz erstellst du in 3 Minuten eine professionelle Website für dein Unternehmen. Über 17 Branchen – ab 19,90 €/Monat.";

  const overviewCss = SHARED_CSS + `
.overview-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-top:2.5rem}
.industry-card{display:flex;flex-direction:column;align-items:center;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1.75rem 1.25rem;text-align:center;transition:all .2s}
.industry-card:hover{border-color:#2563eb;box-shadow:0 4px 16px rgba(37,99,235,.1);transform:translateY(-2px)}
.industry-card .icon{font-size:2.5rem;margin-bottom:.75rem}
.industry-card h3{font-size:.9375rem;font-weight:700;color:#111827;margin-bottom:.375rem}
.industry-card p{font-size:.8125rem;color:#6b7280;line-height:1.5}
`;

  const industryCardsHtml = Object.values(SEO_INDUSTRIES)
    .map(
      (i) =>
        `<a class="industry-card" href="/website-erstellen/${i.slug}"><div class="icon">${i.features[0]?.icon ?? "🌐"}</div><h3>${escapeHtml(i.displayName)}</h3><p>${escapeHtml(i.title)}</p></a>`
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
          text: "Mit Pageblitz in 3 Schritten: Branche wählen, Unternehmensdaten eingeben, fertige Website erhalten. In 3 Minuten online.",
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
  <script type="application/ld+json">${faqSchema}</script>
  <style>${overviewCss}</style>
</head>
<body>

<nav>
  <div class="container nav-inner">
    <a class="logo" href="/">⚡ Pageblitz</a>
    <a class="nav-cta" href="https://pageblitz.de/start">Kostenlos starten</a>
  </div>
</nav>

<section class="hero">
  <div class="container">
    <h1>Website erstellen für dein Unternehmen – in 3 Minuten</h1>
    <p>Die KI erstellt deine professionelle Website automatisch. Einfach Branche wählen, Daten eingeben – fertig. Ab 19,90 €/Monat.</p>
    <a class="btn-primary" href="https://pageblitz.de/start">7 Tage gratis starten →</a>
    <p class="social-proof">Keine Kreditkarte nötig · Keine Einrichtungsgebühr · Jederzeit kündbar</p>
  </div>
</section>

<section class="features">
  <div class="container">
    <h2 class="section-title">Wähle deine Branche</h2>
    <p class="section-sub">Wir haben für über 17 Branchen spezialisierte Website-Vorlagen – professionell, DSGVO-konform, sofort online.</p>
    <div class="overview-grid">
    ${industryCardsHtml}
    </div>
  </div>
</section>

<section class="cta-banner">
  <div class="container">
    <h2>Jetzt Website erstellen – 7 Tage gratis</h2>
    <p>In 3 Minuten online. KI-generiert. Ab 19,90 €/Monat – die ersten 7 Tage gratis testen.</p>
    <a class="btn-primary" href="https://pageblitz.de/start">Kostenlos starten →</a>
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
