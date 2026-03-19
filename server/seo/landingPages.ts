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

  elektriker: {
    slug: "elektriker",
    displayName: "Elektriker",
    title: "Website für Elektriker erstellen",
    h1Template: "KI-Website für deinen Elektrobetrieb{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Elektriker ab 19,90 €/Monat. Mit Leistungsübersicht, Notdienst-Kontakt und Referenzen. Von der KI erstellt – sofort online.",
    keywords: ["Website Elektriker", "Elektriker Website erstellen", "Homepage Elektrobetrieb"],
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
      { q: "Was kostet eine Website für einen Elektriker?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Elektriker-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich meinen Notdienst auf der Website hervorheben?", a: "Ja. Notdienst-Hinweis, Telefonnummer und Kontaktformular sind per KI automatisch eingebunden." },
      { q: "Brauche ich technisches Wissen für meine Elektriker-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  maler: {
    slug: "maler",
    displayName: "Malerbetrieb",
    title: "Website für Malerbetrieb erstellen",
    h1Template: "KI-Website für deinen Malerbetrieb{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Malerbetriebe ab 19,90 €/Monat. Vorher-Nachher-Galerie, Leistungen und Kontaktformular – von der KI erstellt.",
    keywords: ["Website Maler", "Malerbetrieb Website erstellen", "Homepage Malermeister"],
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
      { q: "Was kostet eine Website für einen Malerbetrieb?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Maler-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich eigene Fotos meiner Malerarbeiten hochladen?", a: "Ja. Im Kundenbereich lassen sich Bilder jederzeit ergänzen oder austauschen." },
      { q: "Brauche ich technisches Wissen für meine Maler-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  klempner: {
    slug: "klempner",
    displayName: "Klempner",
    title: "Website für Klempner erstellen",
    h1Template: "KI-Website für deinen Klempnerbetrieb{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Klempner ab 19,90 €/Monat. Mit Notdienst-Bereich, Leistungsübersicht und schneller Kontaktmöglichkeit – sofort online.",
    keywords: ["Website Klempner", "Klempner Website erstellen", "Homepage Sanitärbetrieb"],
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
      { q: "Was kostet eine Website für einen Klempner?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Klempner-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich meinen Notdienst auf der Website besonders betonen?", a: "Ja. Notdiensthinweis und direkte Telefonnummer werden automatisch prominent platziert." },
      { q: "Brauche ich technisches Wissen für meine Klempner-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  gaertner: {
    slug: "gaertner",
    displayName: "Gärtner",
    title: "Website für Gärtner erstellen",
    h1Template: "KI-Website für deinen Gärtnereibetrieb{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Gärtner ab 19,90 €/Monat. Mit Saisondiensten, Bildergalerie und Kontaktformular – von der KI in Minuten erstellt.",
    keywords: ["Website Gärtner", "Gärtnerei Website erstellen", "Homepage Gartenservice"],
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
      { q: "Was kostet eine Website für einen Gärtner?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Gärtner-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich saisonale Angebote wie Winterdienst hervorheben?", a: "Ja. Texte und Angebote lassen sich im Kundenbereich jederzeit aktualisieren." },
      { q: "Brauche ich technisches Wissen für meine Gärtner-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  tierarzt: {
    slug: "tierarzt",
    displayName: "Tierarzt",
    title: "Website für Tierarzt erstellen",
    h1Template: "KI-Website für deine Tierarztpraxis{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Tierarztpraxen ab 19,90 €/Monat. Mit Leistungsübersicht, Öffnungszeiten und Notfallkontakt – sofort online.",
    keywords: ["Website Tierarzt", "Tierarztpraxis Website erstellen", "Homepage Veterinär"],
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
      { q: "Was kostet eine Website für eine Tierarztpraxis?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Tierarzt-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich Notfallzeiten und Vertretungen auf der Website angeben?", a: "Ja. Alle Texte, Öffnungszeiten und Kontaktdaten lassen sich jederzeit anpassen." },
      { q: "Brauche ich technisches Wissen für meine Tierarzt-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  apotheke: {
    slug: "apotheke",
    displayName: "Apotheke",
    title: "Website für Apotheke erstellen",
    h1Template: "KI-Website für deine Apotheke{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Apotheken ab 19,90 €/Monat. Mit Öffnungszeiten, Notdienst-Hinweis und Leistungsübersicht – von der KI erstellt.",
    keywords: ["Website Apotheke", "Apotheke Website erstellen", "Homepage Apotheke"],
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
      { q: "Was kostet eine Website für eine Apotheke?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Apotheken-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich den Notdienst-Kalender auf der Website einbinden?", a: "Notdiensthinweise lassen sich als Text jederzeit im Kundenbereich aktualisieren." },
      { q: "Brauche ich technisches Wissen für meine Apotheken-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  yogastudio: {
    slug: "yogastudio",
    displayName: "Yogastudio",
    title: "Website für Yogastudio erstellen",
    h1Template: "KI-Website für dein Yogastudio{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Yogastudios ab 19,90 €/Monat. Mit Kursplan, Lehrer-Profilen und Online-Kursanfrage – sofort online.",
    keywords: ["Website Yogastudio", "Yogastudio Website erstellen", "Homepage Yoga"],
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
      { q: "Was kostet eine Website für ein Yogastudio?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Yogastudio-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich meinen Kursplan auf der Website veröffentlichen?", a: "Ja. Kursbeschreibungen und Zeiten lassen sich im Kundenbereich jederzeit aktualisieren." },
      { q: "Brauche ich technisches Wissen für meine Yogastudio-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  fahrschule: {
    slug: "fahrschule",
    displayName: "Fahrschule",
    title: "Website für Fahrschule erstellen",
    h1Template: "KI-Website für deine Fahrschule{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Fahrschulen ab 19,90 €/Monat. Mit Preisliste, Führerscheinklassen und Online-Anmeldeformular – von der KI erstellt.",
    keywords: ["Website Fahrschule", "Fahrschule Website erstellen", "Homepage Fahrlehrer"],
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
      { q: "Was kostet eine Website für eine Fahrschule?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Fahrschul-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich meine Preisliste und Führerscheinklassen selbst pflegen?", a: "Ja. Alle Inhalte lassen sich jederzeit im Kundenbereich anpassen." },
      { q: "Brauche ich technisches Wissen für meine Fahrschul-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  "kfz-werkstatt": {
    slug: "kfz-werkstatt",
    displayName: "Kfz-Werkstatt",
    title: "Website für Kfz-Werkstatt erstellen",
    h1Template: "KI-Website für deine Kfz-Werkstatt{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Kfz-Werkstätten ab 19,90 €/Monat. Mit Leistungsübersicht, Terminbuchung und Kundenbewertungen – sofort online.",
    keywords: ["Website Kfz-Werkstatt", "Autowerkstatt Website erstellen", "Homepage Kfz-Betrieb"],
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
      { q: "Was kostet eine Website für eine Kfz-Werkstatt?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Werkstatt-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich Sonderaktionen wie Reifenwechsel-Aktionen bewerben?", a: "Ja. Aktionen und Angebote lassen sich im Kundenbereich jederzeit aktualisieren." },
      { q: "Brauche ich technisches Wissen für meine Werkstatt-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  schluesseldienst: {
    slug: "schluesseldienst",
    displayName: "Schlüsseldienst",
    title: "Website für Schlüsseldienst erstellen",
    h1Template: "KI-Website für deinen Schlüsseldienst{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Schlüsseldienste ab 19,90 €/Monat. Mit Notdienst-Bereich, transparenten Preishinweisen und Kontakt – sofort online.",
    keywords: ["Website Schlüsseldienst", "Schlüsseldienst Website erstellen", "Homepage Schlüsselnotdienst"],
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
      { q: "Was kostet eine Website für einen Schlüsseldienst?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Schlüsseldienst-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich mein Einsatzgebiet und meine Preise klar kommunizieren?", a: "Ja. Alle Texte lassen sich im Kundenbereich jederzeit anpassen." },
      { q: "Brauche ich technisches Wissen für meine Schlüsseldienst-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  architekt: {
    slug: "architekt",
    displayName: "Architekt",
    title: "Website für Architekt erstellen",
    h1Template: "KI-Website für dein Architekturbüro{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Architekturbüros ab 19,90 €/Monat. Mit Portfolio, Leistungsprofil und Kontaktmöglichkeit – von der KI erstellt.",
    keywords: ["Website Architekt", "Architekturbüro Website erstellen", "Homepage Architekt"],
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
      { q: "Was kostet eine Website für ein Architekturbüro?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Architekten-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich mein Projektportfolio mit eigenen Fotos befüllen?", a: "Ja. Im Kundenbereich lassen sich Bilder und Beschreibungen jederzeit ergänzen." },
      { q: "Brauche ich technisches Wissen für meine Architekten-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  innenarchitekt: {
    slug: "innenarchitekt",
    displayName: "Innenarchitekt",
    title: "Website für Innenarchitekt erstellen",
    h1Template: "KI-Website für dein Innenarchitekturbüro{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Innenarchitekten ab 19,90 €/Monat. Mit Designportfolio, Leistungsübersicht und Kontaktformular – sofort online.",
    keywords: ["Website Innenarchitekt", "Innenarchitektur Website erstellen", "Homepage Raumgestaltung"],
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
      { q: "Was kostet eine Website für einen Innenarchitekten?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Innenarchitekten-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich mein Portfolio mit eigenen Raumfotos zeigen?", a: "Ja. Bilder und Projekttexte lassen sich im Kundenbereich jederzeit hochladen." },
      { q: "Brauche ich technisches Wissen für meine Innenarchitekten-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  buchhaltung: {
    slug: "buchhaltung",
    displayName: "Buchhaltungsbüro",
    title: "Website für Buchhaltungsbüro erstellen",
    h1Template: "KI-Website für dein Buchhaltungsbüro{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Buchhaltungsbüros ab 19,90 €/Monat. Mit Leistungsangeboten, Beratungstermin-Anfrage und Vertrauenssignalen – sofort online.",
    keywords: ["Website Buchhaltung", "Buchhaltungsbüro Website erstellen", "Homepage Buchhalter"],
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
      { q: "Was kostet eine Website für ein Buchhaltungsbüro?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Buchhaltungs-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich meine Qualifikationen und Zertifikate auf der Website zeigen?", a: "Ja. Alle Inhalte lassen sich im Kundenbereich jederzeit anpassen und ergänzen." },
      { q: "Brauche ich technisches Wissen für meine Buchhaltungs-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  logopaedie: {
    slug: "logopaedie",
    displayName: "Logopädie",
    title: "Website für Logopädie erstellen",
    h1Template: "KI-Website für deine Logopädiepraxis{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Logopädiepraxen ab 19,90 €/Monat. Mit Therapieangeboten, Terminanfrage und wichtigen Infos für Patienten – sofort online.",
    keywords: ["Website Logopädie", "Logopädie Praxis Website", "Homepage Logopäde"],
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
      { q: "Was kostet eine Website für eine Logopädiepraxis?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Logopädie-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich auf der Website über Kassenzulassung und Rezept informieren?", a: "Ja. Alle Informationstexte lassen sich im Kundenbereich jederzeit anpassen." },
      { q: "Brauche ich technisches Wissen für meine Logopädie-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  ergotherapie: {
    slug: "ergotherapie",
    displayName: "Ergotherapie",
    title: "Website für Ergotherapie erstellen",
    h1Template: "KI-Website für deine Ergotherapiepraxis{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Ergotherapiepraxen ab 19,90 €/Monat. Mit Therapieangeboten, Patienteninfos und Kontaktformular – sofort online.",
    keywords: ["Website Ergotherapie", "Ergotherapie Praxis Website", "Homepage Ergotherapeut"],
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
      { q: "Was kostet eine Website für eine Ergotherapiepraxis?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Ergotherapie-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich meine Therapieschwerpunkte auf der Website erklären?", a: "Ja. Alle Texte lassen sich im Kundenbereich jederzeit anpassen." },
      { q: "Brauche ich technisches Wissen für meine Ergotherapie-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  hebamme: {
    slug: "hebamme",
    displayName: "Hebamme",
    title: "Website für Hebamme erstellen",
    h1Template: "KI-Website für deine Hebammenpraxis{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Hebammen ab 19,90 €/Monat. Mit Leistungsübersicht, Betreuungsangeboten und Kontaktformular für werdende Mütter – sofort online.",
    keywords: ["Website Hebamme", "Hebamme Website erstellen", "Homepage Hebammenpraxis"],
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
      { q: "Was kostet eine Website für eine Hebamme?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Hebammen-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich meine freien Betreuungskapazitäten kommunizieren?", a: "Ja. Texte und Verfügbarkeitshinweise lassen sich im Kundenbereich jederzeit aktualisieren." },
      { q: "Brauche ich technisches Wissen für meine Hebammen-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  pilates: {
    slug: "pilates",
    displayName: "Pilatesstudio",
    title: "Website für Pilatesstudio erstellen",
    h1Template: "KI-Website für dein Pilatesstudio{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Pilatesstudios ab 19,90 €/Monat. Mit Kursplan, Lehrer-Profilen und Probestunden-Anfrage – sofort online.",
    keywords: ["Website Pilatesstudio", "Pilates Studio Website erstellen", "Homepage Pilates"],
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
      { q: "Was kostet eine Website für ein Pilatesstudio?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Pilates-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich meinen Kursplan und Preise selbst aktualisieren?", a: "Ja. Alle Inhalte lassen sich im Kundenbereich jederzeit anpassen." },
      { q: "Brauche ich technisches Wissen für meine Pilates-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  reisebuero: {
    slug: "reisebuero",
    displayName: "Reisebüro",
    title: "Website für Reisebüro erstellen",
    h1Template: "KI-Website für dein Reisebüro{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Reisebüros ab 19,90 €/Monat. Mit Reiseangeboten, Beratungsleistungen und Kontaktmöglichkeit – von der KI erstellt.",
    keywords: ["Website Reisebüro", "Reisebüro Website erstellen", "Homepage Reisevermittlung"],
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
      { q: "Was kostet eine Website für ein Reisebüro?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Reisebüro-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich aktuelle Reiseangebote auf der Website veröffentlichen?", a: "Ja. Angebote und Texte lassen sich im Kundenbereich jederzeit aktualisieren." },
      { q: "Brauche ich technisches Wissen für meine Reisebüro-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  hausreinigung: {
    slug: "hausreinigung",
    displayName: "Hausreinigung",
    title: "Website für Hausreinigung erstellen",
    h1Template: "KI-Website für deinen Hausreinigungsservice{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Hausreinigungsservices ab 19,90 €/Monat. Mit Leistungsübersicht, Preisangaben und Kontaktformular – sofort online.",
    keywords: ["Website Hausreinigung", "Reinigungsservice Website erstellen", "Homepage Haushaltsreinigung"],
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
      { q: "Was kostet eine Website für einen Reinigungsservice?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Reinigungsservice-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich mein Einsatzgebiet und meine Leistungspakete beschreiben?", a: "Ja. Alle Texte lassen sich im Kundenbereich jederzeit anpassen." },
      { q: "Brauche ich technisches Wissen für meine Reinigungsservice-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
    ],
  },

  fotostudio: {
    slug: "fotostudio",
    displayName: "Fotostudio",
    title: "Website für Fotostudio erstellen",
    h1Template: "KI-Website für dein Fotostudio{city} – in 3 Minuten online",
    description:
      "Professionelle Website für Fotostudios ab 19,90 €/Monat. Mit Portfolio, Leistungsangeboten und Buchungsanfrage – von der KI erstellt.",
    keywords: ["Website Fotostudio", "Fotograf Website erstellen", "Homepage Fotografen"],
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
      { q: "Was kostet eine Website für ein Fotostudio?", a: "Mit Pageblitz ab 19,90 €/Monat – 7 Tage gratis, keine Einrichtungsgebühr." },
      { q: "Wie schnell ist meine Fotostudio-Website online?", a: "In 3 Minuten erstellt die KI deine fertige Website." },
      { q: "Kann ich mein Fotoportfolio mit eigenen Bildern befüllen?", a: "Ja. Im Kundenbereich lassen sich Fotos und Beschreibungen jederzeit hochladen." },
      { q: "Brauche ich technisches Wissen für meine Fotostudio-Website?", a: "Nein. Pageblitz funktioniert ohne jegliche IT-Kenntnisse." },
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
  { name: "Erfurt", slug: "erfurt" },
  { name: "Lübeck", slug: "luebeck" },
  { name: "Ulm", slug: "ulm" },
  { name: "Heidelberg", slug: "heidelberg" },
  { name: "Darmstadt", slug: "darmstadt" },
  { name: "Kassel", slug: "kassel" },
  { name: "Hamm", slug: "hamm" },
  { name: "Saarbrücken", slug: "saarbruecken" },
  { name: "Mülheim", slug: "muelheim" },
  { name: "Krefeld", slug: "krefeld" },
  { name: "Oberhausen", slug: "oberhausen" },
  { name: "Mainz", slug: "mainz" },
  { name: "Osnabrück", slug: "osnabrueck" },
  { name: "Solingen", slug: "solingen" },
  { name: "Herne", slug: "herne" },
];

// ── Per-industry visual style + relevant add-ons ─────────────────────────────

interface IndustryStyle {
  accent: string;     // CTA + accent color
  heroBg: string;     // gradient for mock-browser hero
  orb: string;        // rgba for background orbs
  previewPhoto: string;
}

const INDUSTRY_STYLES: Record<string, IndustryStyle> = {
  friseur:        { accent: "#c8a96e", heroBg: "linear-gradient(135deg,#1c1610 0%,#2d2212 100%)", orb: "rgba(200,169,110,.13)", previewPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80&auto=format&fit=crop" },
  restaurant:     { accent: "#f97316", heroBg: "linear-gradient(135deg,#1c1008 0%,#2d1a0c 100%)", orb: "rgba(249,115,22,.12)",  previewPhoto: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80&auto=format&fit=crop" },
  handwerk:       { accent: "#f59e0b", heroBg: "linear-gradient(135deg,#1c1508 0%,#2c1e08 100%)", orb: "rgba(245,158,11,.12)",  previewPhoto: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80&auto=format&fit=crop" },
  zahnarzt:       { accent: "#38bdf8", heroBg: "linear-gradient(135deg,#061828 0%,#0f2440 100%)", orb: "rgba(56,189,248,.12)",  previewPhoto: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1200&q=80&auto=format&fit=crop" },
  kosmetik:       { accent: "#f472b6", heroBg: "linear-gradient(135deg,#1c0a18 0%,#2d1028 100%)", orb: "rgba(244,114,182,.12)", previewPhoto: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80&auto=format&fit=crop" },
  fitness:        { accent: "#ef4444", heroBg: "linear-gradient(135deg,#1a0808 0%,#2d1010 100%)", orb: "rgba(239,68,68,.12)",   previewPhoto: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80&auto=format&fit=crop" },
  arzt:           { accent: "#34d399", heroBg: "linear-gradient(135deg,#061614 0%,#0a2420 100%)", orb: "rgba(52,211,153,.12)",  previewPhoto: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1200&q=80&auto=format&fit=crop" },
  immobilien:     { accent: "#818cf8", heroBg: "linear-gradient(135deg,#0c0c1e 0%,#141428 100%)", orb: "rgba(129,140,248,.12)", previewPhoto: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80&auto=format&fit=crop" },
  rechtsanwalt:   { accent: "#6366f1", heroBg: "linear-gradient(135deg,#0a0c20 0%,#121430 100%)", orb: "rgba(99,102,241,.12)",  previewPhoto: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=1200&q=80&auto=format&fit=crop" },
  steuerberater:  { accent: "#60a5fa", heroBg: "linear-gradient(135deg,#080c18 0%,#101c2c 100%)", orb: "rgba(96,165,250,.12)",  previewPhoto: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&auto=format&fit=crop" },
  fotograf:       { accent: "#fbbf24", heroBg: "linear-gradient(135deg,#161408 0%,#241e0c 100%)", orb: "rgba(251,191,36,.12)",  previewPhoto: "https://images.unsplash.com/photo-1452780212405-6f5b9509da51?w=1200&q=80&auto=format&fit=crop" },
  physiotherapie: { accent: "#22d3ee", heroBg: "linear-gradient(135deg,#060f14 0%,#0a1a20 100%)", orb: "rgba(34,211,238,.12)",  previewPhoto: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80&auto=format&fit=crop" },
  nagelstudio:    { accent: "#c084fc", heroBg: "linear-gradient(135deg,#180a20 0%,#280e34 100%)", orb: "rgba(192,132,252,.12)", previewPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=80&auto=format&fit=crop" },
  baeckerei:      { accent: "#fbbf24", heroBg: "linear-gradient(135deg,#1c1208 0%,#2c1e08 100%)", orb: "rgba(251,191,36,.12)",  previewPhoto: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80&auto=format&fit=crop" },
  reinigung:      { accent: "#60a5fa", heroBg: "linear-gradient(135deg,#08101c 0%,#0e2040 100%)", orb: "rgba(96,165,250,.12)",  previewPhoto: "https://images.unsplash.com/photo-1527515545081-5db817172677?w=1200&q=80&auto=format&fit=crop" },
  hundesalon:     { accent: "#a78bfa", heroBg: "linear-gradient(135deg,#100c1e 0%,#1e1434 100%)", orb: "rgba(167,139,250,.12)", previewPhoto: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80&auto=format&fit=crop" },
  musikschule:    { accent: "#fb923c", heroBg: "linear-gradient(135deg,#1c1008 0%,#2a1804 100%)", orb: "rgba(251,146,60,.12)",  previewPhoto: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80&auto=format&fit=crop" },
};

const DEFAULT_INDUSTRY_STYLE: IndustryStyle = {
  accent: "#e91e8c",
  heroBg: "linear-gradient(135deg,#1a0a14 0%,#2a1020 100%)",
  orb: "rgba(233,30,140,.12)",
  previewPhoto: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop",
};

// Add-ons relevant per industry – avoids e.g. "Speisekarte" for a Zahnarzt
interface AddonDef { icon: string; title: string; desc: string; price: string }

function getRelevantAddons(slug: string): AddonDef[] {
  const ALL: Record<string, AddonDef> = {
    aiChat:    { icon: "🤖", title: "KI-Chat Assistent",  desc: "Beantwortet Kundenfragen rund um die Uhr – automatisch auf dein Unternehmen trainiert.", price: "+ 9,90 €/Mo." },
    booking:   { icon: "📅", title: "Terminbuchung",       desc: "Kunden buchen direkt auf deiner Website einen Termin – ohne Anruf, ohne Wartezeit.",      price: "+ 4,90 €/Mo." },
    contact:   { icon: "✉️", title: "Kontaktformular",     desc: "Kundenanfragen direkt per E-Mail – DSGVO-konform und sofort einsatzbereit.",               price: "+ 3,90 €/Mo." },
    gallery:   { icon: "🖼️", title: "Bildergalerie",       desc: "Präsentiere deine Arbeiten, Räumlichkeiten oder Produkte in einer professionellen Galerie.", price: "+ 3,90 €/Mo." },
    menu:      { icon: "🍽️", title: "Speisekarte",         desc: "Digitale Speisekarte mit Kategorien, Beschreibungen und Preisen – immer aktuell.",          price: "+ 3,90 €/Mo." },
    pricelist: { icon: "💶", title: "Preisliste",           desc: "Zeige dein Leistungsangebot und deine Preise übersichtlich auf der Website.",               price: "+ 3,90 €/Mo." },
  };

  const SETS: Record<string, (keyof typeof ALL)[]> = {
    restaurant:     ["aiChat", "booking", "contact", "gallery", "menu", "pricelist"],
    baeckerei:      ["contact", "gallery", "menu", "pricelist"],
    zahnarzt:       ["aiChat", "booking", "contact", "gallery", "pricelist"],
    arzt:           ["aiChat", "booking", "contact", "pricelist"],
    physiotherapie: ["aiChat", "booking", "contact", "pricelist"],
    fitness:        ["aiChat", "booking", "contact", "gallery", "pricelist"],
    friseur:        ["aiChat", "booking", "contact", "gallery", "pricelist"],
    kosmetik:       ["aiChat", "booking", "contact", "gallery", "pricelist"],
    nagelstudio:    ["aiChat", "booking", "contact", "gallery", "pricelist"],
    hundesalon:     ["aiChat", "booking", "contact", "gallery", "pricelist"],
    handwerk:       ["aiChat", "contact", "gallery", "pricelist"],
    reinigung:      ["aiChat", "contact", "pricelist"],
    immobilien:     ["aiChat", "contact", "gallery"],
    rechtsanwalt:   ["aiChat", "booking", "contact"],
    steuerberater:  ["aiChat", "booking", "contact"],
    fotograf:       ["aiChat", "booking", "contact", "gallery", "pricelist"],
    musikschule:    ["aiChat", "booking", "contact", "gallery", "pricelist"],
  };

  const keys = SETS[slug] ?? ["aiChat", "booking", "contact", "gallery", "pricelist"];
  return keys.map((k) => ALL[k]);
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
.nav-cta{background:linear-gradient(135deg,#e91e8c,#c8177a);color:#fff!important;padding:.5rem 1.25rem;border-radius:999px;font-size:.875rem;font-weight:600;transition:all .2s}
.nav-cta:hover{opacity:.9;transform:translateY(-1px)}
/* Hero */
.hero{background:#0a0a0a;color:#fff;padding:5rem 0 4rem;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% -5%,var(--orb,rgba(233,30,140,.1)),transparent);pointer-events:none}
.hero-orb{position:absolute;border-radius:50%;pointer-events:none;filter:blur(80px);opacity:.6}
.orb-tl{width:500px;height:500px;top:-200px;left:-150px;background:var(--orb,rgba(233,30,140,.08))}
.orb-br{width:400px;height:400px;bottom:-150px;right:-100px;background:var(--orb,rgba(233,30,140,.06))}
.hero-inner{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;position:relative;z-index:1}
.hero-text{text-align:left}
.hero-badge{display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:.375rem 1rem;font-size:.8125rem;font-weight:600;margin-bottom:1.5rem;color:rgba(255,255,255,.7)}
.hero h1{font-size:clamp(1.875rem,3.5vw,2.75rem);font-weight:700;margin-bottom:1.25rem;line-height:1.15;letter-spacing:-.02em;color:#fff;text-align:left}
.hero p{font-size:1.0625rem;color:rgba(255,255,255,.5);max-width:520px;margin:0 0 2.5rem;line-height:1.7}
.btn-primary{display:inline-block;background:linear-gradient(135deg,#e91e8c,#c8177a);color:#fff;padding:.9375rem 2.5rem;border-radius:999px;font-size:1rem;font-weight:700;transition:all .2s;box-shadow:0 4px 24px rgba(233,30,140,.3)}
.btn-primary:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 8px 32px rgba(233,30,140,.4)}
.hero-trust{margin-top:1.5rem;display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;font-size:.8125rem;color:rgba(255,255,255,.35)}
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
/* Add-ons */
.addons{padding:5rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.addons-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.75rem;margin-top:3.5rem}
.addon-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.5rem;text-align:center;transition:border-color .2s}
.addon-card:hover{border-color:rgba(255,255,255,.14)}
.addon-icon{font-size:1.5rem;margin-bottom:.75rem}
.addon-card h4{font-size:.9375rem;font-weight:600;color:#fff;margin-bottom:.375rem}
.addon-card p{font-size:.8125rem;color:rgba(255,255,255,.4);line-height:1.5}
.addon-price{display:inline-block;margin-top:.75rem;background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);font-size:.75rem;font-weight:700;padding:.25rem .75rem;border-radius:999px;border:1px solid rgba(255,255,255,.1)}
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
.pricing-cta{display:block;text-align:center;background:#fff;color:#0a0a0a;padding:1rem;border-radius:999px;font-weight:700;font-size:.9375rem;transition:all .2s;margin-top:1.5rem}
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
.industry-link,.city-link{display:inline-block;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:.3125rem .875rem;font-size:.8125rem;color:rgba(255,255,255,.45);transition:all .15s}
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
.billing-btn{flex:1;padding:.5rem 1rem;border-radius:999px;border:none;background:transparent;color:rgba(255,255,255,.45);font-size:.875rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
.billing-btn.active{background:#fff;color:#0a0a0a;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.billing-save{display:inline-block;background:linear-gradient(135deg,#e91e8c,#c8177a);color:#fff;font-size:.625rem;font-weight:700;padding:.15rem .5rem;border-radius:999px;margin-left:.375rem;vertical-align:middle}
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

  // Industry visual style
  const style = INDUSTRY_STYLES[industry.slug] ?? DEFAULT_INDUSTRY_STYLE;

  // Industry-relevant add-ons
  const relevantAddons = getRelevantAddons(industry.slug);
  const addonsHtml = relevantAddons
    .map(
      (a) =>
        `<div class="addon-card"><div class="addon-icon">${a.icon}</div><h4>${escapeHtml(a.title)}</h4><p>${escapeHtml(a.desc)}</p><span class="addon-price">${escapeHtml(a.price)}</span></div>`
    )
    .join("\n      ");

  // Pricing add-ons list (matches relevant ones)
  const pricingAddonsHtml = relevantAddons
    .map(
      (a) =>
        `<div class="pricing-addon-row"><span>${a.icon} ${escapeHtml(a.title)}</span><span>${escapeHtml(a.price)}</span></div>`
    )
    .join("\n          ");

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
      (f) => `<div class="mw-card"><div class="mw-card-icon">${f.icon}</div><div class="mw-card-line1"></div><div class="mw-card-line2"></div></div>`
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script type="application/ld+json">${buildFaqSchema(industry.faqs)}</script>
  <script type="application/ld+json">${buildWebPageSchema(title, metaDesc, canonical)}</script>
  <script type="application/ld+json">${buildBreadcrumbSchema(industry, city)}</script>
  <style>${SHARED_CSS}</style>
</head>
<body style="--accent:${style.accent};--orb:${style.orb};--hero-bg:${style.heroBg}">

<nav>
  <div class="container nav-inner">
    <a class="logo" href="/">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style="flex-shrink:0"><rect width="32" height="32" rx="7" fill="#18181b"/><path d="M18 4L8 18h8l-2 10 12-14h-8l2-10z" fill="#fff"/></svg>
      Pageblitz
    </a>
    <a class="nav-cta" href="https://pageblitz.de/start" style="background:linear-gradient(135deg,${style.accent},${style.accent}cc)">Website erstellen ✦</a>
  </div>
</nav>

<section class="hero">
  <div class="hero-orb orb-tl"></div>
  <div class="hero-orb orb-br"></div>
  <div class="container">
    <div class="hero-inner">
      <div class="hero-text">
        <div class="hero-badge">⚡ KI-generiert · In 3 Minuten online</div>
        <h1>${escapeHtml(h1)}</h1>
        <p>${escapeHtml(industry.description)}</p>
        <a class="btn-primary" href="https://pageblitz.de/start" style="background:linear-gradient(135deg,${style.accent},${style.accent}cc);box-shadow:0 4px 24px ${style.accent}40">7 Tage gratis starten</a>
        <div class="hero-trust">
          <span>✓ Keine Kreditkarte nötig</span>
          <span>✓ Keine Einrichtungsgebühr</span>
          <span>✓ Jederzeit kündbar</span>
        </div>
      </div>
      <div class="hero-browser" aria-hidden="true">
        <div class="hb-chrome">
          <div class="hb-dots">
            <div class="hb-dot r"></div>
            <div class="hb-dot a"></div>
            <div class="hb-dot g"></div>
          </div>
          <div class="hb-url">
            <span>🔒</span>
            <span>${escapeHtml(mockUrl)}</span>
          </div>
        </div>
        <div class="hb-hero">
          <img class="hb-hero-img" src="${style.previewPhoto}" alt="${escapeHtml(mockBusinessName)}" loading="lazy">
          <div class="hb-hero-overlay"></div>
          <div class="hb-hero-content">
            <div class="hb-eyebrow" style="background:${style.accent}"></div>
            <div class="hb-title">${escapeHtml(mockBusinessName)}</div>
            <div class="hb-sub"></div>
            <div class="hb-sub2"></div>
            <div class="hb-cta" style="background:${style.accent}">Jetzt Termin buchen →</div>
          </div>
        </div>
        <div class="hb-services">
          ${industry.features.slice(0, 3).map(f => `<div class="hb-card"><div class="hb-card-icon">${f.icon}</div><div class="hb-card-l1"></div><div class="hb-card-l2"></div></div>`).join('\n          ')}
        </div>
      </div>
    </div>
  </div>
</section>

<div class="stats">
  <div class="container">
    <div class="stats-grid">
      <div><div class="stat-value">1.200+</div><div class="stat-label">Websites erstellt</div></div>
      <div><div class="stat-value">3 Min.</div><div class="stat-label">Durchschnittliche Zeit</div></div>
      <div><div class="stat-value">97%</div><div class="stat-label">Zufriedene Kunden</div></div>
      <div><div class="stat-value">19,90€</div><div class="stat-label">Pro Monat</div></div>
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
          <span>🔒</span>
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
          <img src="${style.previewPhoto}" alt="${escapeHtml(mockBusinessName)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;opacity:.8;display:block">
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

<section class="addons">
  <div class="container">
    <p class="section-label">Optionale Add-ons</p>
    <h2 class="section-title">Mehr Funktionen mit einem Klick</h2>
    <p class="section-sub">Erweitere deine ${escapeHtml(industry.displayName)}-Website mit den passenden Extras – jederzeit zubuchbar</p>
    <div class="addons-grid">
      ${addonsHtml}
    </div>
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
          <div class="pricing-price">19,90 €<span>/Monat</span></div>
          <div class="pricing-note">Monatliche Abrechnung · Jederzeit kündbar.</div>
        </div>
        <div id="price-yearly">
          <div class="pricing-price">15,92 €<span>/Monat</span></div>
          <div class="pricing-note">190,99 €/Jahr · 2 Monate geschenkt · Jederzeit kündbar.</div>
        </div>
        <ul class="pricing-features">
          <li>KI-generierte ${escapeHtml(industry.displayName)}-Website</li>
          <li>SSL-Zertifikat</li>
          <li>DSGVO-konformer Datenschutz &amp; Impressum</li>
          <li>Premium Cloud Hosting</li>
          <li>Änderungen jederzeit per Chat</li>
          <li>Chat-Support</li>
        </ul>
        <div class="pricing-addon-box">
          <div class="pricing-addon-label">Optionale Add-ons für ${escapeHtml(industry.displayName)}</div>
          ${pricingAddonsHtml}
        </div>
        <a class="pricing-cta" href="https://pageblitz.de/start" style="background:${style.accent};color:#fff">7 Tage gratis starten</a>
        <div class="pricing-note-bottom" id="note-bottom-monthly" style="display:none">7 Tage gratis · danach 19,90 €/Mo. · Jederzeit kündbar</div>
        <div class="pricing-note-bottom" id="note-bottom-yearly">7 Tage gratis · danach 15,92 €/Mo. (190,99 €/Jahr) · Jederzeit kündbar</div>
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
    <p>In 3 Minuten online. KI-generiert. Ab 19,90 €/Monat – die ersten 7 Tage komplett gratis.</p>
    <a class="btn-primary" href="https://pageblitz.de/start" style="background:linear-gradient(135deg,${style.accent},${style.accent}cc);box-shadow:0 4px 24px ${style.accent}40">7 Tage gratis starten</a>
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
</script>
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
.overview-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.75rem;margin-top:3rem}
.industry-card{display:flex;flex-direction:column;align-items:center;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.75rem 1.25rem;text-align:center;transition:all .2s;color:#fff}
.industry-card:hover{border-color:rgba(255,255,255,.16);background:rgba(255,255,255,.04);transform:translateY(-2px)}
.industry-card .icon{font-size:2rem;margin-bottom:.75rem}
.industry-card h3{font-size:.9375rem;font-weight:600;color:#fff;margin-bottom:.375rem}
.industry-card p{font-size:.8125rem;color:rgba(255,255,255,.4);line-height:1.5}
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
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script type="application/ld+json">${faqSchema}</script>
  <style>${overviewCss}</style>
</head>
<body>

<nav>
  <div class="container nav-inner">
    <a class="logo" href="/">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style="flex-shrink:0"><rect width="32" height="32" rx="7" fill="#18181b"/><path d="M18 4L8 18h8l-2 10 12-14h-8l2-10z" fill="#fff"/></svg>
      Pageblitz
    </a>
    <a class="nav-cta" href="https://pageblitz.de/start">Website erstellen ✦</a>
  </div>
</nav>

<section class="hero">
  <div class="container">
    <div class="hero-badge">⚡ KI-generiert · In 3 Minuten online</div>
    <h1>Website erstellen für dein Unternehmen – in 3 Minuten</h1>
    <p>Die KI erstellt deine professionelle Website automatisch. Branche wählen, Daten eingeben – fertig. Ab 19,90 €/Monat.</p>
    <a class="btn-primary" href="https://pageblitz.de/start">7 Tage gratis starten</a>
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
    <p class="section-sub">Über 17 spezialisierte Branchen – professionell, DSGVO-konform, sofort online.</p>
    <div class="overview-grid">
    ${industryCardsHtml}
    </div>
  </div>
</section>

<section class="cta-banner">
  <div class="container">
    <h2>Jetzt Website erstellen – 7 Tage gratis</h2>
    <p>In 3 Minuten online. KI-generiert. Ab 19,90 €/Monat – die ersten 7 Tage gratis testen.</p>
    <a class="btn-primary" href="https://pageblitz.de/start">7 Tage gratis starten</a>
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
