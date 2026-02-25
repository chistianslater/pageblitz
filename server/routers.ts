import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  upsertBusiness, getBusinessById, listBusinesses, countBusinesses, updateBusiness,
  createGeneratedWebsite, getWebsiteById, getWebsiteBySlug, getWebsiteByToken, getWebsiteByBusinessId,
  listWebsites, countWebsites, updateWebsite,
  createOutreachEmail, listOutreachEmails, countOutreachEmails,
  getDashboardStats,
  createTemplateUpload, listTemplateUploads, listTemplateUploadsByIndustry, listTemplateUploadsByPool, deleteTemplateUpload,
  updateTemplateUpload, getTemplateUploadById, parseIndustries,
} from "./db";
import { makeRequest, type PlacesSearchResult, type PlaceDetailsResult } from "./_core/map";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";
import { getHeroImageUrl, getGalleryImages, getIndustryColorScheme, getLayoutStyle } from "./industryImages";
import { selectTemplatesForIndustry, getTemplateStyleDescription, getTemplateImageUrls } from "./templateSelector";
import { analyzeWebsite } from "./websiteAnalysis";

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[äöüß]/g, m => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[m] || m))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

// ── Design Archetype Definitions ─────────────────────
const DESIGN_ARCHETYPES: Record<string, { name: string; aesthetic: string; colors: { primary: string; background: string; accent: string; text: string }; typography: { headers: string; body: string }; patterns: string[]; microInteractions: string[] }> = {
  elegant: {
    name: "The Luxury Minimalist",
    aesthetic: "Großzügiger Weißraum, klassische Serifenschriften, hochwertige Bilder, neutrale Farbpaletten",
    colors: { primary: "#1A1A1A", background: "#FDFBF7", accent: "#D4AF37", text: "#1A1A1A" },
    typography: { headers: "Playfair Display, serif", body: "Lora, serif" },
    patterns: ["editorial-grid", "full-bleed-images", "generous-whitespace"],
    microInteractions: ["elegant-hover", "smooth-transitions", "subtle-reveal"]
  },
  fresh: {
    name: "The Warm Connector",
    aesthetic: "Warme einladende Farben, freundliche runde Formen, authentische Fotografie, viele Testimonials",
    colors: { primary: "#E07B53", background: "#FDF8F4", accent: "#F4A261", text: "#2D3436" },
    typography: { headers: "Nunito, sans-serif", body: "Open Sans, sans-serif" },
    patterns: ["card-grid", "testimonial-slider", "feature-sections"],
    microInteractions: ["gentle-hover", "smooth-scroll", "fade-in"]
  },
  luxury: {
    name: "The Immersive Storyteller",
    aesthetic: "Filmisch, emotional, atmosphärische Farbpaletten, sanfte fließende Animationen",
    colors: { primary: "#0F141A", background: "#0F141A", accent: "#C9A84C", text: "#E8E2DA" },
    typography: { headers: "Playfair Display, serif", body: "Inter, sans-serif" },
    patterns: ["video-hero", "parallax-sections", "cinematic-scroll"],
    microInteractions: ["cursor-effects", "parallax", "fade-sequences"]
  },
  bold: {
    name: "The Bold Experimentalist",
    aesthetic: "Kraftvoll, direkt, starke Kontraste, große Typografie, asymmetrische Layouts",
    colors: { primary: "#FF4500", background: "#0A0A0A", accent: "#FF4500", text: "#FFFFFF" },
    typography: { headers: "Space Grotesk, sans-serif", body: "Inter, sans-serif" },
    patterns: ["asymmetric-split", "full-screen-sections", "broken-grid"],
    microInteractions: ["magnetic-buttons", "image-distortion", "marquee"]
  },
  craft: {
    name: "The Retro Revivalist",
    aesthetic: "Authentisch, handwerklich, texturierte Hintergründe, illustrative Elemente",
    colors: { primary: "#D4A574", background: "#FFF8DC", accent: "#CD5C5C", text: "#3E2723" },
    typography: { headers: "Abril Fatface, serif", body: "Crimson Text, serif" },
    patterns: ["classic-layout", "vintage-cards", "decorative-borders"],
    microInteractions: ["subtle-hover", "paper-textures", "gentle-animations"]
  },
  modern: {
    name: "The Digital Purist",
    aesthetic: "Minimalistisch, technisch, fokussiert auf Klarheit und Funktionalität",
    colors: { primary: "#6366F1", background: "#FAFAFA", accent: "#6366F1", text: "#1F2937" },
    typography: { headers: "Inter, sans-serif", body: "Inter, sans-serif" },
    patterns: ["asymmetric-grid", "full-screen-sections", "bento-grid"],
    microInteractions: ["subtle-hover", "smooth-scroll", "staggered-reveal"]
  },
  trust: {
    name: "The Corporate Professional",
    aesthetic: "Seriös, vertrauenswürdig, klare Struktur, Vertrauenssignale prominent",
    colors: { primary: "#1E3A5F", background: "#FFFFFF", accent: "#38B2AC", text: "#1A202C" },
    typography: { headers: "Montserrat, sans-serif", body: "Source Sans Pro, sans-serif" },
    patterns: ["structured-grid", "stats-sections", "team-grid"],
    microInteractions: ["professional-hover", "smooth-scroll", "accordion"]
  },
  vibrant: {
    name: "The Energetic Communicator",
    aesthetic: "Dynamisch, energetisch, starke Typografie, Parallax-Effekte, hohe Informationsdichte",
    colors: { primary: "#FF4500", background: "#0D0D0D", accent: "#FFD700", text: "#FFFFFF" },
    typography: { headers: "Oswald, sans-serif", body: "Open Sans, sans-serif" },
    patterns: ["bento-grid", "magazine-layout", "card-masonry"],
    microInteractions: ["hover-scale", "staggered-reveal", "parallax"]
  },
  natural: {
    name: "The Eco-Conscious",
    aesthetic: "Naturverbunden, nachhaltig, erdige Farben, organische Formen, Naturbilder",
    colors: { primary: "#4A7C59", background: "#F5F0E8", accent: "#8B6914", text: "#2C3E2D" },
    typography: { headers: "Lato, sans-serif", body: "Merriweather, serif" },
    patterns: ["organic-grid", "full-bleed-images", "feature-sections"],
    microInteractions: ["gentle-hover", "smooth-scroll", "fade-in"]
  },
  dynamic: {
    name: "The Playful Innovator",
    aesthetic: "Verspielt, innovativ, bunte Palette, animierte Illustrationen, überraschende Interaktionen",
    colors: { primary: "#6366F1", background: "#FAFAFA", accent: "#EC4899", text: "#1F2937" },
    typography: { headers: "Poppins, sans-serif", body: "Nunito, sans-serif" },
    patterns: ["card-carousel", "feature-grid", "hero-illustration"],
    microInteractions: ["bounce-hover", "playful-animations", "micro-interactions"]
  },
  warm: {
    name: "The Warm Connector (Gastro)",
    aesthetic: "Sensorisch, appetitanregend, gemütlich, warme Erdtöne, einladende Atmosphäre",
    colors: { primary: "#C0392B", background: "#FDF6EC", accent: "#E67E22", text: "#2C1810" },
    typography: { headers: "Playfair Display, serif", body: "Lato, sans-serif" },
    patterns: ["editorial-grid", "full-bleed-images", "card-grid"],
    microInteractions: ["elegant-hover", "smooth-transitions", "fade-in"]
  },
  clean: {
    name: "The Corporate Professional (Clean)",
    aesthetic: "Klar, professionell, vertrauenswürdig, viel Weißraum, strukturierte Navigation",
    colors: { primary: "#2563EB", background: "#FFFFFF", accent: "#0EA5E9", text: "#1E293B" },
    typography: { headers: "Montserrat, sans-serif", body: "Inter, sans-serif" },
    patterns: ["structured-grid", "hero-split", "stats-sections"],
    microInteractions: ["professional-hover", "smooth-scroll", "accordion"]
  },
};

// ── Industry-specific prompt enrichment ───────────────
function buildIndustryContext(category: string): string {
  const lower = (category || "").toLowerCase();

  // Hair & Beauty → Pool: elegant, fresh, luxury
  if (/friseur|salon|beauty|hair|barber|coiffeur|nail|spa|massage|kosmetik|wellness|ästhetik|lash|brow|make.?up|tanning|waxing|threading/.test(lower)) {
    return `LAYOUT-POOL: BEAUTY (elegant / fresh / luxury)
Schreibstil: Poetisch, sinnlich, einladend. Kurze, elegante Sätze. Emotionen ansprechen.
Sprache: Warm, persönlich, luxuriös ohne arrogant zu sein.
Betone: Handwerk & Expertise, persönliche Beratung, Wohlfühlatmosphäre, Transformation, Schönheit.
Hero-Headline: Soll ein Gefühl erzeugen, kein Versprechen machen. Z.B. "Wo Schönheit beginnt" statt "Ihr Friseur in München".
Services: Konkrete Behandlungen mit sensorischen Details (Duft, Gefühl, Ergebnis).
VERBOTEN: "Ihr Wohlbefinden liegt uns am Herzen", "Wir freuen uns auf Ihren Besuch", generische Phrasen.`;
  }

  // Restaurant, Café, Food → Pool: warm, fresh, modern
  if (/restaurant|gastro|cafe|café|bistro|pizza|küche|bäckerei|catering|food|sushi|burger|gastronomie|bakery/.test(lower)) {
    return `LAYOUT-POOL: GASTRONOMIE (warm / fresh / modern)
Schreibstil: Sensorisch, appetitanregend, gemütlich. Beschreibe Aromen, Texturen, Atmosphäre.
Sprache: Herzlich, einladend, leidenschaftlich für Essen.
Betone: Frische Zutaten, Rezepttradition, Atmosphäre, konkrete Gerichte, Reservierung.
Hero-Headline: Soll Hunger und Vorfreude wecken. Z.B. "Wo jeder Bissen zählt" oder "Echte Küche. Echter Geschmack."
Services: Konkrete Gerichte/Menüs mit verlockenden Beschreibungen.
VERBOTEN: "Wir bieten eine große Auswahl", "für jeden Geschmack etwas dabei", generische Phrasen.`;
  }

  // Construction, Trades → Pool: bold, craft, modern
  if (/handwerk|elektriker|klempner|maler|bau|sanitär|dachdecker|contractor|roofing|construction|tischler|schreiner|zimmermann|fliesenleger|renovation|installation/.test(lower)) {
    return `LAYOUT-POOL: HANDWERK (bold / craft / modern)
Schreibstil: Direkt, kraftvoll, selbstbewusst. Kurze, prägnante Aussagen. Zahlen und Fakten.
Sprache: Kompetent, vertrauenswürdig. Keine Schnickschnack.
Betone: Zuverlässigkeit, Qualitätsarbeit, Erfahrung (Jahre), schnelle Reaktionszeit, Festpreise, Garantie.
Hero-Headline: Stark, direkt. Z.B. "Gemacht für die Härte des Alltags" oder "Wir reparieren. Punkt."
Services: Konkrete Leistungen mit Zeitangaben und Garantien.
VERBOTEN: "Wir sind Ihr Partner für...", "Qualität steht bei uns an erster Stelle", weiche Phrasen.`;
  }

  // Automotive → Pool: luxury, bold, craft
  if (/auto|kfz|car|garage|mechanic|werkstatt|karosserie|tuning|fahrzeug|vehicle|motorrad|motorcycle|reifenservice/.test(lower)) {
    return `LAYOUT-POOL: AUTOMOTIVE (luxury / bold / craft)
Schreibstil: Technisch-präzise, leidenschaftlich, premium. Zahlen und Spezifikationen.
Sprache: Kennerschaft, Qualitätsbewusstsein, Leidenschaft fürs Fahrzeug.
Betone: Präzision, Erfahrung, Originalteile, Garantie, schnelle Durchlaufzeit.
Hero-Headline: Leidenschaft und Expertise. Z.B. "Ihr Fahrzeug. Unsere Leidenschaft." oder "Perfektion bis ins letzte Detail."
Services: Konkrete Leistungen mit technischen Details und Zeitangaben.`;
  }

  // Fitness & Sport → Pool: vibrant, dynamic, modern
  if (/fitness|gym|sport|yoga|training|crossfit|pilates|kampfsport|tanzen|personal.?trainer|physiotherap|bewegung|martial|boxing/.test(lower)) {
    return `LAYOUT-POOL: FITNESS (vibrant / dynamic / modern)
Schreibstil: Motivierend, energetisch, herausfordernd. Imperativ-Sätze. Transformation betonen.
Sprache: Stark, inspirierend, community-orientiert. Ergebnisse in den Vordergrund.
Betone: Transformation, konkrete Ergebnisse (kg, Zeit, Leistung), Community, Trainer-Expertise, Programme.
Hero-Headline: Energie und Motivation. Z.B. "Dein stärkeres Ich beginnt hier" oder "Keine Ausreden. Nur Ergebnisse."
Services: Konkrete Programme mit Ergebnisversprechen.
VERBOTEN: "Für jeden das Richtige", "Spaß am Sport", generische Fitness-Phrasen.`;
  }

  // Medical & Health → Pool: trust, clean, modern
  if (/arzt|zahnarzt|praxis|medizin|therapie|doctor|dental|clinic|health|apotheke|klinik|hospital|chiropractor|heilpraktiker/.test(lower)) {
    return `LAYOUT-POOL: MEDIZIN (trust / clean / modern)
Schreibstil: Professionell, beruhigend, klar. Präzise Aussagen. Vertrauen aufbauen.
Sprache: Kompetent, empathisch, sachlich. Fachbegriffe erklären.
Betone: Kompetenz, modernste Technik, Patientenorientierung, kurze Wartezeiten, Qualifikationen.
Hero-Headline: Beruhigend und kompetent. Z.B. "Ihre Gesundheit in erfahrenen Händen" oder "Medizin, die zuhört."
Services: Konkrete Behandlungen mit Erklärungen und Vorteilen.
VERBOTEN: "Ihr Vertrauen ist unser Kapital", "Wir nehmen uns Zeit für Sie", generische Phrasen.`;
  }

  // Legal, Finance, Consulting → Pool: trust, clean, modern
  if (/rechtsanwalt|anwalt|kanzlei|steuerberater|beratung|consulting|law|legal|finanz|versicherung|immobilien|makler/.test(lower)) {
    return `LAYOUT-POOL: BERATUNG (trust / clean / modern)
Schreibstil: Sachlich, präzise, kompetent. Vertrauen durch Expertise.
Sprache: Professionell, direkt, vertrauenswürdig. Keine Emotionen, aber Empathie.
Betone: Expertise, Diskretion, Erfolgsquote, persönliche Betreuung, Spezialisierung, Jahre Erfahrung.
Hero-Headline: Kompetenz und Sicherheit. Z.B. "Ihr Recht. Unsere Expertise." oder "Wenn es darauf ankommt."
Services: Konkrete Leistungsbereiche mit Spezialisierungen.`;
  }

  // Organic, Eco, Garden → Pool: natural, fresh, warm
  if (/bio|organic|öko|eco|natur|garden|garten|florist|blumen|flower|pflanze|plant|naturopath|kräuter|herb|nachhaltig|sustainable/.test(lower)) {
    return `LAYOUT-POOL: NATUR (natural / fresh / warm)
Schreibstil: Warm, authentisch, nachhaltig. Sensorische Beschreibungen. Erdverbundenheit.
Sprache: Ehrlich, leidenschaftlich, umweltbewusst. Regionale Herkunft betonen.
Betone: Nachhaltigkeit, regionale Produkte, handgemacht, frisch, Natur, Gesundheit.
Hero-Headline: Natürlich und einladend. Z.B. "Direkt aus der Natur zu dir" oder "Echt. Frisch. Regional."
Services: Konkrete Produkte/Leistungen mit Herkunftsangaben.`;
  }

  // Tech, Agency, Digital → Pool: modern, vibrant, dynamic
  if (/tech|software|digital|agency|agentur|web|app|it|computer|marketing|design|media|kreativ|creative|startup/.test(lower)) {
    return `LAYOUT-POOL: DIGITAL (modern / vibrant / dynamic)
Schreibstil: Präzise, innovativ, zukunftsorientiert. Ergebnisse und ROI betonen.
Sprache: Kompetent, modern, lösungsorientiert. Technische Begriffe erklären.
Betone: Ergebnisse, Expertise, Innovationsfähigkeit, Portfolio, Prozesse, Zeitersparnis.
Hero-Headline: Wirkungsorientiert. Z.B. "Digitale Lösungen, die wachsen." oder "Technologie, die begeistert."
Services: Konkrete Leistungen mit messbaren Ergebnissen.`;
  }

  // Hotel, Tourism, Events → Pool: luxury, elegant, warm
  if (/hotel|pension|hostel|airbnb|tourism|tourismus|event|veranstaltung|hochzeit|wedding|party|reise|travel/.test(lower)) {
    return `LAYOUT-POOL: HOSPITALITY (luxury / elegant / warm)
Schreibstil: Einladend, atmosphärisch, erlebnisreich. Emotionen und Erinnerungen wecken.
Sprache: Gastfreundlich, warm, exklusiv. Erlebnisse beschreiben.
Betone: Atmosphäre, besondere Momente, Service-Qualität, Lage, Ausstattung.
Hero-Headline: Erlebnisversprechen. Z.B. "Wo Momente zu Erinnerungen werden" oder "Ihr perfekter Aufenthalt."
Services: Konkrete Angebote mit Erlebnisbeschreibungen.`;
  }

  return `LAYOUT-POOL: DIENSTLEISTUNG (clean / modern / trust)
Schreibstil: Klar, professionell, überzeugend. Nutzen für den Kunden betonen.
Sprache: Direkt, kompetent, vertrauenswürdig. Regionale Präsenz.
Betone: Professionalität, Kundenzufriedenheit, Erfahrung, regionale Präsenz, konkrete Leistungen.`;
}

function buildPersonalityHint(name: string, rating: string | null, reviewCount: number): string {
  const parts = [];
  if (rating && parseFloat(rating) >= 4.5) {
    parts.push(`Das Unternehmen hat ausgezeichnete Bewertungen (${rating}/5 bei ${reviewCount} Bewertungen) – betone diese Stärke prominent.`);
  } else if (rating && parseFloat(rating) >= 4.0) {
    parts.push(`Das Unternehmen hat gute Bewertungen (${rating}/5) – erwähne Kundenzufriedenheit.`);
  }
  if (reviewCount > 100) {
    parts.push(`Mit ${reviewCount}+ Bewertungen ist das Unternehmen etabliert und bekannt in der Region.`);
  }
  // Name-based hints
  const lowerName = name.toLowerCase();
  if (lowerName.match(/\b(meister|master|expert|profi)\b/)) {
    parts.push(`Der Name deutet auf besondere Expertise hin – betone Meisterqualität.`);
  }
  if (lowerName.match(/\b(familie|family|familien)\b/)) {
    parts.push(`Familienunternehmen – betone persönliche, familiäre Atmosphäre und Tradition.`);
  }
  return parts.join(" ");
}

/** Builds the full enhanced generation prompt with StoryBrand, archetype personality, animation strategy */
function buildEnhancedPrompt(opts: {
  business: { name: string; address?: string | null; phone?: string | null; rating?: string | null; reviewCount?: number | null; openingHours?: string[] | null };
  category: string;
  industryContext: string;
  personalityHint: string;
  layoutStyle: string;
  colorScheme: { primary: string; secondary: string; accent: string };
  templateStyleDesc: string;
  hoursText: string;
  isRegenerate?: boolean;
}): string {
  const { business, category, industryContext, personalityHint, layoutStyle, colorScheme, templateStyleDesc, hoursText, isRegenerate } = opts;
  const archetype = DESIGN_ARCHETYPES[layoutStyle] || DESIGN_ARCHETYPES["modern"];
  const year = new Date().getFullYear();

  return `Du bist ein PREISGEKRÖNTER Awwwards-Level Webtexter und UX-Copywriter für lokale Unternehmen in Deutschland.
Dein Designprozess:
1. ANALYSE VOR GENERIERUNG: Verstehe Zielgruppe, Pain Points und Unique Value Proposition
2. STORYBRAND: Der KUNDE ist der HELD – das Unternehmen ist der GUIDE (wie Yoda für Luke)
3. QUALITÄT: Einzigartige, spezifische Texte – NIEMALS generische Phrasen
4. ARCHETYP: Halte die Persönlichkeit des Design-Archetyps konsequent durch

═══════════════════════════════════════
UNTERNEHMENSDATEN
═══════════════════════════════════════
Name: ${business.name}
Branche/Kategorie: ${category}
Adresse: ${business.address || "Nicht angegeben"}
Telefon: ${business.phone || "Nicht angegeben"}
Bewertung: ${business.rating ? business.rating + "/5 Sterne" : "Nicht verfügbar"}
Anzahl Bewertungen: ${business.reviewCount || 0}
Öffnungszeiten: ${hoursText}

═══════════════════════════════════════
DESIGN-ARCHETYP: ${archetype.name.toUpperCase()}
═══════════════════════════════════════
Aesthetik: ${archetype.aesthetic}
Typografie-Persönlichkeit: Headlines in ${archetype.typography.headers} / Body in ${archetype.typography.body}
Layout-Patterns: ${archetype.patterns.join(", ")}
Micro-Interactions: ${archetype.microInteractions.join(", ")}

FARB-HIERARCHIE (60-30-10 REGEL – STRIKT EINHALTEN):
- 60% = Hintergrundfarbe: ${archetype.colors.background} (dominanter Hintergrund)
- 30% = Primärfarbe: ${colorScheme.primary || archetype.colors.primary} (Hauptelemente, Texte, Strukturen)
- 10% = Akzentfarbe: ${colorScheme.accent || archetype.colors.accent} (NUR für CTAs, Links, Highlights)
❌ NIEMALS mehr als 3 Hauptfarben
❌ NIEMALS bunte Section-Hintergründe
✅ IMMER gleiche Akzentfarbe für alle CTAs

═══════════════════════════════════════
BRANCHENKONTEXT & PERSÖNLICHKEIT
═══════════════════════════════════════
${industryContext}
${personalityHint}
${templateStyleDesc}

═══════════════════════════════════════
STORYBRAND-FRAMEWORK (PFLICHT)
═══════════════════════════════════════
Der KUNDE ist der HELD dieser Geschichte – ${business.name} ist der erfahrene GUIDE.
- HELD: Dein Traumkunde hat ein konkretes Problem (Stress, Unsicherheit, Zeitdruck)
- GUIDE: ${business.name} hat die Expertise und Empathie, um zu helfen
- PLAN: Einfacher 3-Schritte-Prozess (z.B. Termin → Beratung → Ergebnis)
- CTA: Klarer, einladender Aufruf zur Aktion
- ERFOLG: Das Leben des Kunden verbessert sich konkret
- MISSERFOLG (vermeiden): Was passiert, wenn der Kunde NICHT handelt?

Hero-Headline-Formel: [Emotionaler Trigger] + [Konkretes Ergebnis] für [Zielgruppe]
Beispiele für gute Headlines:
- ✅ "Wo Schönheit beginnt" (Beauty, emotional)
- ✅ "Gemacht für die Härte des Alltags" (Handwerk, direkt)
- ✅ "Dein stärkeres Ich beginnt hier" (Fitness, motivierend)
- ❌ "Willkommen bei ${business.name}" (generisch, verboten)
- ❌ "Ihr Partner für..." (Klischee, verboten)

═══════════════════════════════════════
KREATIVE ANFORDERUNGEN${isRegenerate ? " (NEUE VERSION – ANDERE PERSPEKTIVE)" : ""}
═══════════════════════════════════════
1. EINZIGARTIGKEIT: Schreibe so, als würdest du dieses spezifische Unternehmen kennen.
2. KEINE GENERIK: Verboten: "Wir sind Ihr Partner für...", "Qualität steht bei uns an erster Stelle", "Ihr Vertrauen ist unser Kapital", "Wir freuen uns auf Ihren Besuch".
3. ARCHETYP-KONSISTENZ: Jeder Text muss die Persönlichkeit von "${archetype.name}" widerspiegeln.
4. SPEZIFISCHE LEISTUNGEN: Realistische, branchenspezifische Leistungen – keine generischen "Service 1, Service 2".
5. AUTHENTISCHE TESTIMONIALS: Glaubwürdige Kundenstimmen mit konkreten Details (was wurde gemacht, welches Ergebnis, warum zufrieden).
6. LOKALER BEZUG: Nutze die Stadt/Region aus der Adresse konkret.
7. CTA-TEXTE: Kreative, handlungsauslösende Buttons passend zum Archetyp.${isRegenerate ? "\n8. ANDERE PERSPEKTIVE: Wähle einen anderen Storytelling-Ansatz als zuvor – andere Texte, anderer Fokus, andere Struktur." : ""}

═══════════════════════════════════════
PFLICHT-AUSGABE (exaktes JSON-Format)
═══════════════════════════════════════
{
  "businessName": "${business.name}",
  "tagline": "Einzigartiger, einprägsamer Slogan im Stil von ${archetype.name} (max. 8 Wörter, keine Klischees)",
  "description": "Kurze, packende Beschreibung (2 Sätze, konkret und spezifisch)",
  "archetypePersonality": "${archetype.name}: ${archetype.aesthetic.substring(0, 80)}",
  "sections": [
    {
      "type": "hero",
      "headline": "Kraftvolle Hauptüberschrift im ${archetype.name}-Stil (max. 7 Wörter, mit emotionalem Trigger)",
      "subheadline": "Konkrete Unterüberschrift mit USP (1-2 Sätze, StoryBrand: Held + Problem + Lösung)",
      "content": "Kurzer Einleitungstext (max. 30 Wörter, spezifisch für diese Branche)",
      "ctaText": "Kreativer CTA-Button-Text passend zum Archetyp",
      "ctaLink": "#kontakt"
    },
    {
      "type": "about",
      "headline": "Kreative Überschrift für 'Über uns' (nicht 'Über uns'!)",
      "content": "Authentischer Text über das Unternehmen als Guide (4-5 Sätze: Gründungsgeschichte, Expertise, lokale Verwurzelung, Leidenschaft)"
    },
    {
      "type": "services",
      "headline": "Kreative Überschrift für Leistungen",
      "items": [
        { "title": "Konkrete Leistung 1", "description": "Spezifische Beschreibung mit Nutzen für den Kunden (2 Sätze)", "icon": "LucideIconName" },
        { "title": "Konkrete Leistung 2", "description": "Spezifische Beschreibung mit Nutzen für den Kunden (2 Sätze)", "icon": "LucideIconName" },
        { "title": "Konkrete Leistung 3", "description": "Spezifische Beschreibung mit Nutzen für den Kunden (2 Sätze)", "icon": "LucideIconName" },
        { "title": "Konkrete Leistung 4", "description": "Spezifische Beschreibung mit Nutzen für den Kunden (2 Sätze)", "icon": "LucideIconName" },
        { "title": "Konkrete Leistung 5", "description": "Spezifische Beschreibung mit Nutzen für den Kunden (2 Sätze)", "icon": "LucideIconName" },
        { "title": "Konkrete Leistung 6", "description": "Spezifische Beschreibung mit Nutzen für den Kunden (2 Sätze)", "icon": "LucideIconName" }
      ]
    },
    {
      "type": "testimonials",
      "headline": "Kreative Überschrift für Kundenstimmen",
      "items": [
        { "title": "Kurze Zusammenfassung des Ergebnisses", "description": "Detaillierte, glaubwürdige Bewertung: Was war das Problem? Was hat ${business.name} gemacht? Welches konkrete Ergebnis? (3-4 Sätze)", "author": "Realistischer Vorname + Nachname", "rating": 5 },
        { "title": "Kurze Zusammenfassung des Ergebnisses", "description": "Detaillierte, glaubwürdige Bewertung: anderes Szenario, anderer Kunde (3-4 Sätze)", "author": "Realistischer Vorname + Nachname", "rating": 5 },
        { "title": "Kurze Zusammenfassung des Ergebnisses", "description": "Detaillierte, glaubwürdige Bewertung: drittes Szenario (3-4 Sätze)", "author": "Realistischer Vorname + Nachname", "rating": 4 }
      ]
    },
    {
      "type": "faq",
      "headline": "Häufige Fragen",
      "items": [
        { "question": "Branchenspezifische Frage 1 (echte Kundenfrage)?", "answer": "Detaillierte, hilfreiche Antwort als Guide (2-3 Sätze)" },
        { "question": "Branchenspezifische Frage 2?", "answer": "Detaillierte, hilfreiche Antwort (2-3 Sätze)" },
        { "question": "Branchenspezifische Frage 3?", "answer": "Detaillierte, hilfreiche Antwort (2-3 Sätze)" },
        { "question": "Branchenspezifische Frage 4?", "answer": "Detaillierte, hilfreiche Antwort (2-3 Sätze)" }
      ]
    },
    {
      "type": "cta",
      "headline": "Starke CTA-Überschrift im ${archetype.name}-Stil (Dringlichkeit oder konkreten Nutzen betonen)",
      "content": "Kurzer überzeugender Text (max. 20 Wörter, StoryBrand: Erfolg visualisieren)",
      "ctaText": "Handlungsaufruf-Button",
      "ctaLink": "#kontakt"
    },
    {
      "type": "contact",
      "headline": "Kontaktüberschrift",
      "content": "Einladender Kontakttext (1-2 Sätze)",
      "ctaText": "Nachricht senden"
    }
  ],
  "seoTitle": "${business.name} – [Branchenspezifisches Keyword] in [Stadt]",
  "seoDescription": "Prägnante SEO-Beschreibung mit Keyword und lokalem Bezug (max. 155 Zeichen)",
  "footer": {
    "text": "© ${year} ${business.name}. Alle Rechte vorbehalten."
  }
}

Verfügbare Lucide-Icons für Services: Scissors, Wrench, Heart, Star, Shield, Zap, Clock, MapPin, Phone, Mail, Users, Award, ThumbsUp, Briefcase, Home, Car, Utensils, Camera, Sparkles, Flame, Leaf, Sun, Moon, Coffee, Music, Book, Palette, Hammer, Truck, Package, CheckCircle, ArrowRight, ChevronRight, Globe, Wifi, Lock, Key, Smile, Baby, Dog, Flower, Trees, Dumbbell, Bike, Stethoscope, Pill, Microscope, Scale, Gavel, Calculator, PiggyBank, Building, Factory, Warehouse`;
}

/** Maps a GMB category string to the industry key used in template_uploads table */
function mapCategoryToIndustryKey(category: string): string {
  const lower = (category || "").toLowerCase();
  if (/friseur|salon|beauty|hair|barber|coiffeur|nail|spa|massage|kosmetik|wellness|lash|brow|make.?up/.test(lower)) return "beauty";
  if (/restaurant|gastro|cafe|café|bistro|pizza|küche|bäckerei|catering|food|sushi|burger|bakery/.test(lower)) return "restaurant";
  if (/fitness|gym|sport|yoga|training|crossfit|pilates|kampfsport|personal.?trainer|physiotherap|boxing/.test(lower)) return "fitness";
  if (/auto|kfz|car|garage|mechanic|werkstatt|karosserie|tuning|motorrad|reifenservice/.test(lower)) return "automotive";
  if (/arzt|zahnarzt|praxis|medizin|therapie|doctor|dental|clinic|health|apotheke|klinik|chiropractor/.test(lower)) return "medical";
  if (/rechtsanwalt|anwalt|kanzlei|steuerberater|beratung|consulting|law|legal|finanz|versicherung|immobilien/.test(lower)) return "legal";
  if (/handwerk|elektriker|klempner|maler|bau|sanitär|dachdecker|roofing|construction|tischler|schreiner/.test(lower)) return "trades";
  if (/tech|software|digital|agency|agentur|web|app|it|computer|marketing|design|media|startup/.test(lower)) return "tech";
  if (/bio|organic|öko|eco|natur|garden|garten|florist|blumen|flower|pflanze|naturopath/.test(lower)) return "other";
  if (/hotel|pension|hostel|tourism|tourismus|event|veranstaltung|hochzeit|wedding|reise/.test(lower)) return "hospitality";
  return "other";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Admin: Dashboard Stats ─────────────────────────
  stats: router({
    dashboard: adminProcedure.query(async () => {
      return getDashboardStats();
    }),
  }),

  // ── Admin: GMB Search ──────────────────────────────
  search: router({
    gmb: adminProcedure
      .input(z.object({
        query: z.string().min(1),
        region: z.string().min(1),
        includeOutdated: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const searchQuery = `${input.query} in ${input.region}`;
        const placesResult = await makeRequest<PlacesSearchResult>(
          "/maps/api/place/textsearch/json",
          { query: searchQuery }
        );
        if (placesResult.status !== "OK" || !placesResult.results?.length) {
          return { results: [], total: 0 };
        }
        const detailedResults = [];
        const limitedResults = placesResult.results.slice(0, 20);
        for (const place of limitedResults) {
          try {
            const details = await makeRequest<PlaceDetailsResult>(
              "/maps/api/place/details/json",
              { place_id: place.place_id, fields: "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,types" }
            );
            const hasWebsite = !!(details.result?.website);
            const category = place.types?.[0]?.replace(/_/g, " ") || input.query;
            const websiteUrl = details.result?.website || null;

            // Determine initial lead type
            let leadType: "no_website" | "outdated_website" | "poor_website" | "unknown" = hasWebsite ? "unknown" : "no_website";

            detailedResults.push({
              placeId: place.place_id,
              name: details.result?.name || place.name,
              address: details.result?.formatted_address || place.formatted_address,
              phone: details.result?.formatted_phone_number || null,
              website: websiteUrl,
              rating: details.result?.rating || place.rating || null,
              reviewCount: details.result?.user_ratings_total || place.user_ratings_total || 0,
              category,
              lat: place.geometry?.location?.lat,
              lng: place.geometry?.location?.lng,
              openingHours: details.result?.opening_hours?.weekday_text || [],
              hasWebsite,
              leadType,
            });
          } catch {
            detailedResults.push({
              placeId: place.place_id,
              name: place.name,
              address: place.formatted_address,
              phone: null, website: null,
              rating: place.rating || null,
              reviewCount: place.user_ratings_total || 0,
              category: place.types?.[0]?.replace(/_/g, " ") || input.query,
              lat: place.geometry?.location?.lat,
              lng: place.geometry?.location?.lng,
              openingHours: [],
              hasWebsite: false,
              leadType: "no_website" as const,
            });
          }
        }

        // Filter: if includeOutdated is false, only return businesses without website
        const filtered = input.includeOutdated
          ? detailedResults
          : detailedResults.filter(r => !r.hasWebsite);

        return { results: filtered, total: filtered.length };
      }),

    // New: Analyze a specific website for age and quality
    analyzeWebsite: adminProcedure
      .input(z.object({ businessId: z.number() }))
      .mutation(async ({ input }) => {
        const business = await getBusinessById(input.businessId);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });

        const analysis = await analyzeWebsite(business.website);

        // Update business with analysis results
        await updateBusiness(input.businessId, {
          leadType: analysis.leadType,
          websiteAge: analysis.websiteAge,
          websiteScore: analysis.websiteScore,
          websiteAnalysis: analysis.details,
        });

        return analysis;
      }),

    saveResults: adminProcedure
      .input(z.object({
        results: z.array(z.object({
          placeId: z.string(),
          name: z.string(),
          address: z.string().optional(),
          phone: z.string().nullable().optional(),
          website: z.string().nullable().optional(),
          rating: z.number().nullable().optional(),
          reviewCount: z.number().optional(),
          category: z.string().optional(),
          lat: z.number().optional(),
          lng: z.number().optional(),
          openingHours: z.array(z.string()).optional(),
          hasWebsite: z.boolean(),
          leadType: z.enum(["no_website", "outdated_website", "poor_website", "unknown"]).optional(),
        })),
        searchQuery: z.string(),
        searchRegion: z.string(),
      }))
      .mutation(async ({ input }) => {
        let saved = 0;
        for (const r of input.results) {
          const slug = slugify(r.name) + "-" + nanoid(6);
          await upsertBusiness({
            placeId: r.placeId,
            name: r.name,
            slug,
            address: r.address || null,
            phone: r.phone || null,
            website: r.website || null,
            rating: r.rating?.toString() || null,
            reviewCount: r.reviewCount || 0,
            category: r.category || null,
            lat: r.lat?.toString() || null,
            lng: r.lng?.toString() || null,
            openingHours: r.openingHours || [],
            hasWebsite: r.hasWebsite ? 1 : 0,
            leadType: r.leadType || (r.hasWebsite ? "unknown" : "no_website"),
            searchQuery: input.searchQuery,
            searchRegion: input.searchRegion,
          });
          saved++;
        }
        return { saved };
      }),
  }),

  // ── Admin: Businesses ──────────────────────────────
  business: router({
    list: adminProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        leadType: z.enum(["no_website", "outdated_website", "poor_website", "unknown", "all"]).default("all"),
      }).optional())
      .query(async ({ input }) => {
        const businesses = await listBusinesses(input?.limit || 50, input?.offset || 0);
        const total = await countBusinesses();
        // Filter by leadType if specified
        const filtered = (input?.leadType && input.leadType !== "all")
          ? businesses.filter(b => b.leadType === input.leadType)
          : businesses;
        return { businesses: filtered, total };
      }),
    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const business = await getBusinessById(input.id);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        const website = await getWebsiteByBusinessId(input.id);
        return { business, website };
      }),
  }),

  // ── Admin: Website Generation ──────────────────────
  website: router({
    generate: adminProcedure
      .input(z.object({
        businessId: z.number(),
        generateAiImage: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const business = await getBusinessById(input.businessId);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });

        const existing = await getWebsiteByBusinessId(input.businessId);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Website already generated for this business" });

        const category = business.category || "Dienstleistung";
        const industryContext = buildIndustryContext(category);
        const personalityHint = buildPersonalityHint(business.name, business.rating, business.reviewCount || 0);
        const colorScheme = getIndustryColorScheme(category, business.name);
        const layoutStyle = getLayoutStyle(category, business.name);
        const heroImageUrl = getHeroImageUrl(category, business.name);
        const galleryImages = getGalleryImages(category);

        // Select matching templates from the library for visual reference
        const matchingTemplates = selectTemplatesForIndustry(category, business.name, 3);
        const templateStyleDesc = getTemplateStyleDescription(matchingTemplates);
        const baseTemplateImageUrls = getTemplateImageUrls(matchingTemplates);

        // Merge with admin-uploaded templates for this industry+pool
        const uploadedTemplates = await listTemplateUploadsByPool(
          mapCategoryToIndustryKey(category),
          layoutStyle
        );
        const uploadedImageUrls = uploadedTemplates.slice(0, 3).map(t => t.imageUrl);
        // Uploaded templates take priority (shown first), then library templates
        const templateImageUrls = [...uploadedImageUrls, ...baseTemplateImageUrls].slice(0, 5);

        // Opening hours formatting
        let hoursText = "Nicht angegeben";
        if (business.openingHours && Array.isArray(business.openingHours) && (business.openingHours as string[]).length > 0) {
          hoursText = (business.openingHours as string[]).join(", ");
        }

        const prompt = buildEnhancedPrompt({ business: { ...business, openingHours: business.openingHours as string[] | null }, category, industryContext, personalityHint, layoutStyle, colorScheme, templateStyleDesc, hoursText });

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Du bist ein PREISGEKRÖNTER Awwwards-Level Webtexter und Design-Direktor für lokale Unternehmen in Deutschland. Du analysierst professionelle Website-Templates als visuelle Referenz und erstellst daraus einzigartige, maßgeschneiderte Website-Inhalte im Stil des jeweiligen Design-Archetyps. Antworte AUSSCHLIESSLICH mit validem JSON ohne Markdown-Codeblöcke. Schreibe einzigartige, spezifische Texte – niemals generische Phrasen. Das StoryBrand-Framework ist PFLICHT: Der Kunde ist der Held, das Unternehmen ist der Guide."
            },
            ...(templateImageUrls.length > 0 ? [{
              role: "user" as const,
              content: [
                {
                  type: "text" as const,
                  text: `DESIGN-REFERENZEN: Hier sind ${templateImageUrls.length} professionelle Website-Templates. Analysiere den Design-Stil, die Farbpaletten, die Typografie und das Layout.\n\n⚠️ WICHTIG – INDIVIDUALISIERUNG ERFORDERLICH:\n- Das Ergebnis DARF NICHT wie einer der Screenshots aussehen!\n- Nutze die Screenshots nur um das QUALITÄTSNIVEAU und spezifische DESIGN-PATTERNS zu verstehen\n- Erstelle ein KOMPLETT EIGENSTÄNDIGES Design für dieses Unternehmen\n- Die Archetyp-Farben und der Schreibstil haben ABSOLUTE PRIORITÄT`
                },
                ...templateImageUrls.map(url => ({
                  type: "image_url" as const,
                  image_url: { url, detail: "low" as const }
                }))
              ]
            }] : []),
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== "string") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KI-Generierung fehlgeschlagen" });
        }

        let websiteData: any;
        try {
          const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
          websiteData = JSON.parse(cleaned);
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KI hat kein valides JSON zurückgegeben" });
        }

        // Optionally generate AI hero image
        let finalHeroImageUrl = heroImageUrl;
        if (input.generateAiImage) {
          try {
            const imagePrompt = `Professional hero image for ${business.name}, a ${category} business. ${websiteData.tagline || ""}. High quality, photorealistic, modern, clean composition. No text or logos.`;
            const { url } = await generateImage({ prompt: imagePrompt });
            if (url) finalHeroImageUrl = url;
          } catch {
            // Fallback to Unsplash if AI image generation fails
            finalHeroImageUrl = heroImageUrl;
          }
        }

        // Inject gallery images into sections
        if (galleryImages.length > 0 && websiteData.sections) {
          const gallerySection = websiteData.sections.find((s: any) => s.type === "gallery");
          if (gallerySection) {
            gallerySection.images = galleryImages;
          }
        }

        // Inject real Google rating data
        if (business.rating) websiteData.googleRating = parseFloat(business.rating);
        if (business.reviewCount) websiteData.googleReviewCount = business.reviewCount;

        const slug = slugify(business.name) + "-" + nanoid(4);
        const previewToken = nanoid(32);

        const websiteId = await createGeneratedWebsite({
          businessId: input.businessId,
          slug,
          status: "preview",
          websiteData,
          colorScheme,
          industry: category,
          previewToken,
          addons: [],
          heroImageUrl: finalHeroImageUrl,
          layoutStyle,
        });

        return { websiteId, slug, previewToken, heroImageUrl: finalHeroImageUrl, layoutStyle };
      }),

    regenerate: adminProcedure
      .input(z.object({ websiteId: z.number(), generateAiImage: z.boolean().default(false) }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
        const business = await getBusinessById(website.businessId);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });

        // Full re-generation: same pipeline as generate, but updates existing record
        const category = business.category || "Dienstleistung";
        // Use a different seed so layout/colors vary from the previous version
        const seed = business.name + Date.now().toString();
        const industryContext = buildIndustryContext(category);
        const personalityHint = buildPersonalityHint(business.name, business.rating, business.reviewCount || 0);
        const colorScheme = getIndustryColorScheme(category, seed);
        const layoutStyle = getLayoutStyle(category, seed);
        const heroImageUrl = getHeroImageUrl(category, seed);
        const galleryImages = getGalleryImages(category);

        // Pick different templates than last time by shuffling
        const matchingTemplates = selectTemplatesForIndustry(category, seed, 3);
        const templateStyleDesc = getTemplateStyleDescription(matchingTemplates);
        const baseTemplateImageUrlsRegen = getTemplateImageUrls(matchingTemplates);

        // Merge with admin-uploaded templates for this industry+pool
        const uploadedTemplatesRegen = await listTemplateUploadsByPool(
          mapCategoryToIndustryKey(category),
          layoutStyle
        );
        const uploadedImageUrlsRegen = uploadedTemplatesRegen.slice(0, 3).map(t => t.imageUrl);
        const templateImageUrls = [...uploadedImageUrlsRegen, ...baseTemplateImageUrlsRegen].slice(0, 5);

        let hoursText = "Nicht angegeben";
        if (business.openingHours && Array.isArray(business.openingHours) && (business.openingHours as string[]).length > 0) {
          hoursText = (business.openingHours as string[]).join(", ");
        }

        const prompt = buildEnhancedPrompt({ business: { ...business, openingHours: business.openingHours as string[] | null }, category, industryContext, personalityHint, layoutStyle, colorScheme, templateStyleDesc, hoursText, isRegenerate: true });

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Du bist ein PREISGEKRÖNTER Awwwards-Level Webtexter und Design-Direktor für lokale Unternehmen in Deutschland. Du erstellst eine NEUE VERSION einer Website mit komplett anderem Storytelling-Ansatz und frischen Texten. Antworte AUSSCHLIESSLICH mit validem JSON ohne Markdown-Codeblöcke. Das StoryBrand-Framework ist PFLICHT: Der Kunde ist der Held, das Unternehmen ist der Guide. Niemals generische Phrasen."
            },
            ...(templateImageUrls.length > 0 ? [{
              role: "user" as const,
              content: [
                { type: "text" as const, text: `DESIGN-REFERENZEN: Hier sind ${templateImageUrls.length} professionelle Website-Templates.\n\n⚠️ WICHTIG – INDIVIDUALISIERUNG ERFORDERLICH:\n- Das Ergebnis DARF NICHT wie einer der Screenshots aussehen!\n- Nutze die Screenshots nur um das QUALITÄTSNIVEAU und spezifische DESIGN-PATTERNS zu verstehen\n- Erstelle ein KOMPLETT EIGENSTÄNDIGES Design für dieses Unternehmen\n- Die Archetyp-Farben und der Schreibstil haben ABSOLUTE PRIORITÄT` },
                ...templateImageUrls.map(url => ({ type: "image_url" as const, image_url: { url, detail: "low" as const } }))
              ]
            }] : []),
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        });

        const llmContent = response.choices[0]?.message?.content;
        if (!llmContent || typeof llmContent !== "string") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KI-Regenerierung fehlgeschlagen" });
        }

        let websiteData: any;
        try {
          const cleaned = llmContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
          websiteData = JSON.parse(cleaned);
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KI hat kein valides JSON zurückgegeben" });
        }

        // Optionally generate AI hero image
        let finalHeroImageUrl = heroImageUrl;
        if (input.generateAiImage) {
          try {
            const imagePrompt = `Professional hero image for ${business.name}, a ${category} business. ${websiteData.tagline || ""}. High quality, photorealistic, modern, clean composition. No text or logos.`;
            const { url } = await generateImage({ prompt: imagePrompt });
            if (url) finalHeroImageUrl = url;
          } catch {
            finalHeroImageUrl = heroImageUrl;
          }
        }

        // Inject gallery images
        if (galleryImages.length > 0 && websiteData.sections) {
          const gallerySection = websiteData.sections.find((s: any) => s.type === "gallery");
          if (gallerySection) gallerySection.images = galleryImages;
        }

        // Inject real Google rating data
        if (business.rating) websiteData.googleRating = parseFloat(business.rating);
        if (business.reviewCount) websiteData.googleReviewCount = business.reviewCount;

        // Generate a new slug and token for the regenerated version
        const newSlug = slugify(business.name) + "-" + nanoid(4);
        const newPreviewToken = nanoid(32);

        // Update the existing website record with new content
        await updateWebsite(input.websiteId, {
          slug: newSlug,
          status: "preview",
          websiteData,
          colorScheme,
          industry: category,
          previewToken: newPreviewToken,
          heroImageUrl: finalHeroImageUrl,
          layoutStyle,
        });

        return {
          websiteId: input.websiteId,
          slug: newSlug,
          previewToken: newPreviewToken,
          heroImageUrl: finalHeroImageUrl,
          layoutStyle,
          regenerated: true,
        };
      }),

    list: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const websites = await listWebsites(input?.limit || 50, input?.offset || 0);
        const total = await countWebsites();
        const enriched = [];
        for (const w of websites) {
          const biz = await getBusinessById(w.businessId);
          enriched.push({ ...w, business: biz });
        }
        return { websites: enriched, total };
      }),

    get: publicProcedure
      .input(z.object({ id: z.number().optional(), slug: z.string().optional(), token: z.string().optional() }))
      .query(async ({ input }) => {
        let website;
        if (input.id) website = await getWebsiteById(input.id);
        else if (input.slug) website = await getWebsiteBySlug(input.slug);
        else if (input.token) website = await getWebsiteByToken(input.token);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
        const business = await getBusinessById(website.businessId);
        return { website, business };
      }),

    updateStatus: adminProcedure
      .input(z.object({ id: z.number(), status: z.enum(["preview", "sold", "active", "inactive"]) }))
      .mutation(async ({ input }) => {
        await updateWebsite(input.id, { status: input.status });
        return { success: true };
      }),
  }),

  // ── Admin: Outreach ────────────────────────────────
  outreach: router({
    send: adminProcedure
      .input(z.object({
        businessId: z.number(),
        websiteId: z.number(),
        recipientEmail: z.string().email(),
        subject: z.string(),
        body: z.string(),
      }))
      .mutation(async ({ input }) => {
        const emailId = await createOutreachEmail({
          businessId: input.businessId,
          websiteId: input.websiteId,
          recipientEmail: input.recipientEmail,
          subject: input.subject,
          body: input.body,
          status: "sent",
          sentAt: new Date(),
        });
        await notifyOwner({
          title: `Outreach E-Mail gesendet`,
          content: `E-Mail an ${input.recipientEmail} gesendet.\nBetreff: ${input.subject}`,
        });
        return { emailId, success: true };
      }),

    list: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const emails = await listOutreachEmails(input?.limit || 50, input?.offset || 0);
        const total = await countOutreachEmails();
        return { emails, total };
      }),
  }),

  // ── Admin: Template Uploads ───────────────────────
  templates: router({
    // Batch upload: upload one image, get back id + imageUrl, then classify separately
    upload: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        imageData: z.string(),
        mimeType: z.string().default("image/jpeg"),
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const { nanoid: nid } = await import("nanoid");
        const base64Data = input.imageData.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const ext = input.mimeType.split("/")[1] || "jpg";
        const fileKey = `templates/pending/${nid(12)}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        // Create with status=pending, no industry yet
        const id = await createTemplateUpload({
          name: input.name,
          industry: "other",
          industries: "[]",
          layoutPool: "clean",
          status: "pending",
          imageUrl: url,
          fileKey,
        });
        return { id, imageUrl: url };
      }),

    // AI classification: analyze uploaded image and suggest industries + layout pool
    classify: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const template = await getTemplateUploadById(input.id);
        if (!template) throw new TRPCError({ code: "NOT_FOUND" });

        const classifyPrompt = `Du bist ein Experte für Website-Design und Branchenklassifizierung.
Analysiere diesen Website-Screenshot und bestimme:
1. Für welche Branchen ist dieses Design-Template geeignet? (mehrere möglich)
2. Welcher Layout-Pool passt am besten?

Veefügbare Branchen (wähle alle passenden):
- beauty (Friseur, Salon, Spa, Kosmetik, Wellness, Nail Studio)
- restaurant (Restaurant, Café, Bistro, Bäckerei, Food)
- fitness (Gym, Yoga, Sport, Personal Training, Crossfit)
- automotive (KFZ, Autohaus, Werkstatt, Tuning)
- medical (Arzt, Zahnarzt, Praxis, Therapie, Apotheke)
- legal (Anwalt, Steuerberater, Beratung, Kanzlei)
- trades (Handwerk, Elektriker, Klempner, Bau, Maler)
- retail (Einzelhandel, Mode, Shop, Boutique)
- tech (IT, Software, Agentur, Digital, Startup)
- education (Schule, Kurs, Coaching, Nachhilfe)
- hospitality (Hotel, Pension, Tourismus, Events)
- other (Sonstige)

Veefügbare Layout-Pools:
- elegant (Luxuriös, Serif-Typografie, Gold-Akzente, Beauty/Spa-Stil)
- bold (Kraftvoll, Große Headlines, Dunkler Hintergrund, Handwerk-Stil)
- warm (Warm, Einladend, Foodfoto-Atmosphäre, Restaurant-Stil)
- clean (Sauber, Viel Weißraum, Trust-Badges, Medizin/Beratungs-Stil)
- dynamic (Energetisch, Diagonal-Elemente, Fitness-Stil)
- luxury (Premium, Schwarz/Gold, Automotive/High-End-Stil)
- craft (Industrial, Handgemacht, Werkzeug-Ästhetik)
- fresh (Hell, Luftig, Illustrationen, Café/Wellness-Stil)
- trust (Professionell, Blau-Akzente, Medizin/Legal-Stil)
- modern (Asymmetrisch, Tech-Startup-Stil, Minimal)
- vibrant (Neon-Akzente, Energie, Fitness/Sport-Stil)
- natural (Öko, Erdfarben, Natur-Stil)

Antworte NUR mit validem JSON:
{
  "industries": ["beauty", "fitness"],
  "layoutPool": "elegant",
  "confidence": "high",
  "reason": "Kurze Begründung auf Deutsch (max. 2 Sätze)"
}`;

        const response = await invokeLLM({
          messages: [
            { role: "user", content: [
              { type: "text", text: classifyPrompt },
              { type: "image_url", image_url: { url: template.imageUrl, detail: "low" } },
            ]},
          ],
          response_format: { type: "json_schema", json_schema: {
            name: "template_classification",
            strict: true,
            schema: {
              type: "object",
              properties: {
                industries: { type: "array", items: { type: "string" } },
                layoutPool: { type: "string" },
                confidence: { type: "string" },
                reason: { type: "string" },
              },
              required: ["industries", "layoutPool", "confidence", "reason"],
              additionalProperties: false,
            },
          }},
        });

        const raw = response.choices[0].message.content as string;
        let parsed: { industries: string[]; layoutPool: string; confidence: string; reason: string };
        try { parsed = JSON.parse(raw); } catch {
          parsed = { industries: ["other"], layoutPool: "clean", confidence: "low", reason: "KI-Analyse fehlgeschlagen" };
        }

        // Save AI suggestions to DB
        await updateTemplateUpload(input.id, {
          aiIndustries: JSON.stringify(parsed.industries),
          aiLayoutPool: parsed.layoutPool,
          aiConfidence: parsed.confidence,
          aiReason: parsed.reason,
          // Pre-fill the actual fields with AI suggestions (admin can correct)
          industries: JSON.stringify(parsed.industries),
          industry: parsed.industries[0] || "other",
          layoutPool: parsed.layoutPool,
        });

        return {
          id: input.id,
          industries: parsed.industries,
          layoutPool: parsed.layoutPool,
          confidence: parsed.confidence,
          reason: parsed.reason,
        };
      }),

    // Update template metadata (admin correction after AI classification)
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        industries: z.array(z.string()).optional(),
        layoutPool: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, industries, ...rest } = input;
        const updateData: Record<string, unknown> = { ...rest };
        if (industries !== undefined) {
          updateData.industries = JSON.stringify(industries);
          updateData.industry = industries[0] || "other";
        }
        await updateTemplateUpload(id, updateData as any);
        return { success: true };
      }),

    // Approve a single template
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateTemplateUpload(input.id, { status: "approved" });
        return { success: true };
      }),

    // Bulk approve multiple templates
    bulkApprove: adminProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        await Promise.all(input.ids.map(id => updateTemplateUpload(id, { status: "approved" })));
        return { success: true, count: input.ids.length };
      }),

    list: adminProcedure
      .input(z.object({ status: z.enum(["pending", "approved", "rejected", "all"]).optional(), industry: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const status = input?.status === "all" ? undefined : (input?.status || undefined);
        if (input?.industry && input.industry !== "all") {
          return listTemplateUploadsByIndustry(input.industry);
        }
        return listTemplateUploads(status);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTemplateUpload(input.id);
        return { success: true };
      }),

    getForPool: adminProcedure
      .input(z.object({ industry: z.string(), layoutPool: z.string() }))
      .query(async ({ input }) => {
        return listTemplateUploadsByPool(input.industry, input.layoutPool);
      }),
  }),

  // ── Public: Preview checkout ───────────────────────
  checkout: router({
    createSession: publicProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND" });
        await updateWebsite(input.websiteId, { status: "sold", paidAt: new Date() });
        return { success: true, message: "Zahlung simuliert (Stripe-Integration im MVP)" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
