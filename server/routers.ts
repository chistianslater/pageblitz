import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure, protectedProcedure } from "./_core/trpc";
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
  createSubscription, getSubscriptionByWebsiteId, updateSubscriptionByWebsiteId,
  createOnboarding, getOnboardingByWebsiteId, updateOnboarding,
  deleteWebsite, deleteBusiness, getWebsitesByUserId,
} from "./db";
import { makeRequest, type PlacesSearchResult, type PlaceDetailsResult } from "./_core/map";
import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";
import { getHeroImageUrl, getGalleryImages, getIndustryColorScheme, getLayoutStyle, getLayoutPool } from "./industryImages";
import { getNextLayoutForIndustry } from "./db";
import { selectTemplatesForIndustry, getTemplateStyleDescription, getTemplateImageUrls } from "./templateSelector";
import { analyzeWebsite } from "./websiteAnalysis";
import { generateImpressum, generateDatenschutz, patchWebsiteData } from "./legalGenerator";
import { getIndustryServicesSeed, getIndustryProfile } from "@shared/industryServices";
import { uploadLogo, uploadPhoto } from "./onboardingUpload";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const PRICING = {
  base: { amount: 7900, currency: "eur", interval: "month" as const },
  subpage: { amount: 990, currency: "eur", interval: "month" as const },
  gallery: { amount: 490, currency: "eur", interval: "month" as const },
} as const;

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[äöüß]/g, m => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[m] || m))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

/**
 * Fetch photos from Google My Business (Places API) for a given placeId.
 * Returns an array of photo URLs (up to maxPhotos), or empty array on failure.
 */
async function getGmbPhotos(placeId: string, maxPhotos = 6): Promise<string[]> {
  try {
    const details = await makeRequest<any>(
      "/maps/api/place/details/json",
      { place_id: placeId, fields: "photos", language: "de" }
    );
    const photos: Array<{ photo_reference: string; width: number; height: number }> =
      details?.result?.photos || [];
    if (!photos.length) return [];
    // Build photo URLs via the Manus Maps proxy (same pattern as map.ts)
    const baseUrl = (ENV.forgeApiUrl || "").replace(/\/+$/, "");
    const apiKey = ENV.forgeApiKey || "";
    if (!baseUrl || !apiKey) return [];
    return photos.slice(0, maxPhotos).map((p) => {
      const url = new URL(`${baseUrl}/v1/maps/proxy/maps/api/place/photo`);
      url.searchParams.set("maxwidth", "1600");
      url.searchParams.set("photo_reference", p.photo_reference);
      url.searchParams.set("key", apiKey);
      return url.toString();
    });
  } catch {
    return [];
  }
}

// ── Design Archetype Definitions ─────────────────────
// Each archetype has concrete CSS rules (promptInstruction) that force the AI to produce
// visually distinct, award-winning designs – not generic templates.
const DESIGN_ARCHETYPES: Record<string, {
  name: string;
  designTwin: string;
  aesthetic: string;
  colors: { primary: string; background: string; accent: string; text: string };
  typography: { headers: string; body: string };
  patterns: string[];
  microInteractions: string[];
  promptInstruction: string;
}> = {
  elegant: {
    name: "The Luxury Minimalist",
    designTwin: "Aesop meets Acne Studios",
    aesthetic: "Elegant, reduziert, luxuriös. Großzügiger Weißraum, klassische Serifen, hochwertige Bilder.",
    colors: { primary: "#1A1A1A", background: "#FDFBF7", accent: "#D4AF37", text: "#1A1A1A" },
    typography: { headers: "Playfair Display, serif", body: "Lato, sans-serif" },
    patterns: ["editorial-grid", "full-bleed-images", "generous-whitespace"],
    microInteractions: ["subtle scale on hover (1.02)", "smooth opacity transitions", "parallax at 0.3x"],
    promptInstruction: `Design Style: Luxury Minimalist (Aesop / Acne Studios Vibe).
STRIKTE CSS-REGELN:
1) Serif-Überschriften: Playfair Display, font-size: min(8vw, 72px), font-weight: 700, letter-spacing: -0.03em
2) Extremer Weißraum: padding-top/bottom mindestens 120px für alle Sections
3) Farbpalette NUR: Hintergrund #FDFBF7, Text #1A1A1A, Akzent #D4AF37 – KEINE anderen Farben
4) Keine Schatten, keine Borders – nur 1px solid rgba(0,0,0,0.08) als Trennlinie
5) Bilder: Full-bleed, object-fit: cover, kein Overlay-Text direkt auf Bildern
6) Buttons: outline-only, 1px solid currentColor, kein background, großes padding (16px 40px)
7) Layout: Zentriert, max-width: 900px, asymmetrische Abstände (z.B. padding-left: 10%, padding-right: 5%)
Vibe: Teuer, zeitlos, sophisticated. Weniger ist mehr.`
  },
  fresh: {
    name: "The Warm Connector",
    designTwin: "Calm meets Headspace",
    aesthetic: "Einladend, freundlich, zugänglich. Warme Pastelle, abgerundete Formen, authentische Fotografie.",
    colors: { primary: "#E07B53", background: "#FDF8F4", accent: "#F4A261", text: "#2D3436" },
    typography: { headers: "Nunito, sans-serif", body: "Open Sans, sans-serif" },
    patterns: ["card-grid", "testimonial-slider", "feature-sections"],
    microInteractions: ["gentle scale on hover", "soft shadow transitions", "smooth color shifts"],
    promptInstruction: `Design Style: Warm Connector (Calm / Headspace Vibe).
STRIKTE CSS-REGELN:
1) Abgerundete Ecken ÜBERALL: border-radius: 24px für Cards, 999px für Buttons und Badges
2) Pastellfarben: Hintergrund #FDF8F4, Akzent #E07B53, Sekundär #F4A261 – warme Erdtöne
3) Schrift: Nunito 700 für Headlines (freundlich, rund), Open Sans für Body
4) Soft Shadows: box-shadow: 0 8px 32px rgba(224,123,83,0.12) auf Cards
5) Hero: Großes Foto links (60%), Text rechts (40%) – KEIN Vollbild-Hero
6) Testimonials: Karten mit Foto, Name, Sterne – prominent, 3-spaltig
7) CTA-Buttons: pill-shaped, background: #E07B53, color: white, padding: 16px 40px
Vibe: Menschlich, fürsorglich, zugänglich. Wie ein freundlicher Nachbar.`
  },
  luxury: {
    name: "The Immersive Storyteller",
    designTwin: "Dogstudio.co meets Exoape.com",
    aesthetic: "Filmisch, emotional, atmosphärisch. Video-first, sanfte Animationen, dunkle Atmosphäre.",
    colors: { primary: "#0F141A", background: "#0F141A", accent: "#C9A84C", text: "#E8E2DA" },
    typography: { headers: "Playfair Display, serif", body: "Inter, sans-serif" },
    patterns: ["video-hero", "parallax-sections", "cinematic-scroll"],
    microInteractions: ["smooth fade-in on scroll", "letter-by-letter animation", "parallax depth layers"],
    promptInstruction: `Design Style: Immersive Storyteller (Dogstudio / Exoape Vibe).
STRIKTE CSS-REGELN:
1) Dark Mode PFLICHT: background: #0F141A, text: #E8E2DA – KEIN heller Hintergrund
2) RIESIGE Typografie: H1 font-size: min(12vw, 96px), font-weight: 700, line-height: 0.95
3) Vollbild-Hero: 100vh, background-image mit overlay: linear-gradient(to bottom, rgba(15,20,26,0.3), rgba(15,20,26,0.9))
4) Goldener Akzent #C9A84C NUR für CTAs, Trennlinien und Highlights – sparsam einsetzen
5) Scroll-Animationen: Elemente erscheinen mit opacity: 0 → 1 und translateY(40px) → 0
6) Sections: Abwechselnd dunkel (#0F141A) und sehr dunkel (#070A0D) – kein helles Element
7) Buttons: Transparent mit 1px gold border, hover: gold background
Vibe: Filmisch, mysteriös, emotional. Wie ein Kinotrailer.`
  },
  bold: {
    name: "The Bold Experimentalist",
    designTwin: "Baseborn.studio meets Tore Bentsen",
    aesthetic: "Kraftvoll, direkt, starke Kontraste. Große Typografie, asymmetrische Layouts, schwarzer Hintergrund.",
    colors: { primary: "#FF4500", background: "#0A0A0A", accent: "#FF4500", text: "#FFFFFF" },
    typography: { headers: "Space Grotesk, sans-serif", body: "Inter, sans-serif" },
    patterns: ["asymmetric-split", "full-screen-sections", "broken-grid"],
    microInteractions: ["text distortion on hover", "rotate/skew on scroll", "marquee ticker"],
    promptInstruction: `Design Style: Bold Experimentalist (Baseborn / Brutalist Vibe).
STRIKTE CSS-REGELN:
1) Schwarzer Hintergrund PFLICHT: background: #0A0A0A, text: #FFFFFF – maximaler Kontrast
2) EXTREME Typografie: H1 font-size: min(15vw, 120px), font-weight: 900, letter-spacing: -0.05em, text-transform: uppercase
3) Asymmetrisches Hero-Layout: Text links (55%), Bild rechts mit clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%)
4) Akzentfarbe #FF4500 NUR für CTAs und Hover-States – wie Feuer im Dunkel
5) Marquee-Ticker: Horizontaler Text-Scroll zwischen Sections (font-size: 14px, text: Leistungen/Keywords)
6) Buttons: Filled, background: #FF4500, color: white, border-radius: 0 (eckig!), text-transform: uppercase
7) Kein Padding-Weichspüler: Sections direkt aneinander, harte Übergänge
Vibe: Roh, selbstbewusst, rebellisch. Wie ein Schlag ins Gesicht (positiv).`
  },
  craft: {
    name: "The Retro Revivalist",
    designTwin: "Mailchimp meets Innocent Drinks",
    aesthetic: "Authentisch, handwerklich, nostalgisch. Texturierte Hintergründe, Vintage-Typografie, Wärme.",
    colors: { primary: "#8B4513", background: "#FFF8DC", accent: "#CD5C5C", text: "#3E2723" },
    typography: { headers: "Abril Fatface, serif", body: "Lato, sans-serif" },
    patterns: ["classic-layout", "vintage-cards", "decorative-borders"],
    microInteractions: ["subtle hover", "paper texture overlay", "gentle fade-in"],
    promptInstruction: `Design Style: Retro Revivalist (Mailchimp / Handmade Vibe).
STRIKTE CSS-REGELN:
1) Cremefarbener Hintergrund: background: #FFF8DC – warm, papierartig, KEIN reines Weiß
2) Retro-Schrift: Abril Fatface für Headlines (groß, dekorativ), Lato für Body
3) Textur: background-image: url(noise.png) mit opacity: 0.03 über alle Sections
4) Warme Farben: Braun #8B4513, Terrakotta #CD5C5C, Senf #DAA520 – erdige Palette
5) Dekorative Elemente: Dünne Rahmen (2px solid #8B4513), Trennlinien mit Ornament-Charakter
6) Cards: border: 2px solid rgba(139,69,19,0.2), border-radius: 8px, box-shadow: 4px 4px 0 rgba(139,69,19,0.1)
7) Buttons: Filled braun, border-radius: 4px, leicht texturiert
Vibe: Nostalgisch, handwerklich, authentisch. Wie ein Familienbetrieb seit 1952.`
  },
  modern: {
    name: "The Digital Purist",
    designTwin: "Linear.app meets Vercel",
    aesthetic: "Minimalistisch, technisch, fokussiert. Dunkle Hintergründe, klare Hierarchie, Bento-Grid.",
    colors: { primary: "#6366F1", background: "#0A0A0A", accent: "#6366F1", text: "#E8E8E8" },
    typography: { headers: "Inter, sans-serif", body: "Inter, sans-serif" },
    patterns: ["bento-grid", "asymmetric-grid", "full-screen-sections"],
    microInteractions: ["glow on hover", "underline animation", "subtle border glow"],
    promptInstruction: `Design Style: Digital Purist (Linear / Vercel Vibe).
STRIKTE CSS-REGELN:
1) Dunkler Hintergrund: background: #0A0A0A, text: #E8E8E8 – Engineering-Ästhetik
2) Exzessiver Weißraum: padding-top/bottom: 140px für alle Sections
3) Glassmorphism-Borders: border: 1px solid rgba(255,255,255,0.08) auf Cards
4) Bento-Grid für Features: CSS Grid mit ungleichen Zellen (2x1, 1x2, 1x1)
5) Typografie: Inter 700-900, kleine Labels in uppercase mit letter-spacing: 0.12em
6) Akzent #6366F1 NUR für Glows: box-shadow: 0 0 40px rgba(99,102,241,0.3)
7) Buttons: Glassmorphism-Style, backdrop-filter: blur(10px), border: 1px solid rgba(99,102,241,0.4)
Vibe: Präzision, Ingenieurskunst, High-Tech. Wie ein Produkt von einem Top-Startup.`
  },
  trust: {
    name: "The Corporate Professional",
    designTwin: "McKinsey meets Goldman Sachs",
    aesthetic: "Seriös, strukturiert, vertrauenswürdig. Navy-Farben, klare Grids, Business-Fotografie.",
    colors: { primary: "#1E3A5F", background: "#FFFFFF", accent: "#38B2AC", text: "#1A202C" },
    typography: { headers: "Montserrat, sans-serif", body: "Source Sans Pro, sans-serif" },
    patterns: ["structured-grid", "stats-sections", "team-grid"],
    microInteractions: ["subtle hover states", "smooth transitions", "professional feedback"],
    promptInstruction: `Design Style: Corporate Professional (McKinsey / Goldman Sachs Vibe).
STRIKTE CSS-REGELN:
1) Heller Hintergrund: background: #FFFFFF, Sekundär: #F8FAFC – sauber, professionell
2) Navy-Blau als Hauptfarbe: #1E3A5F für Header, Überschriften, Buttons
3) Diagonal-Split-Hero: Linke Hälfte dunkel (#1E3A5F) mit Text, rechte Hälfte Foto – clip-path: polygon(0 0, 58% 0, 52% 100%, 0 100%)
4) Trust-Badges: Bewertungssterne, Zertifikate, Kundenzahlen prominent im Hero
5) Stats-Section: Große Zahlen (font-size: 64px, font-weight: 800) mit Beschreibung darunter
6) Typografie: Montserrat 700 für Headlines, Source Sans Pro für Body – professionell, lesbar
7) Buttons: Filled navy, border-radius: 6px, hover: leicht aufgehellt
Vibe: Vertrauenswürdig, etabliert, seriös. Wie ein Marktführer.`
  },
  vibrant: {
    name: "The Energetic Communicator",
    designTwin: "Critical Mass meets Monks.com",
    aesthetic: "Dynamisch, magazinähnlich, informationsdicht. Starke Typografie, Parallax, Bewegung.",
    colors: { primary: "#FF4500", background: "#0D0D0D", accent: "#FFD700", text: "#FFFFFF" },
    typography: { headers: "Oswald, sans-serif", body: "Open Sans, sans-serif" },
    patterns: ["bento-grid", "magazine-layout", "card-masonry"],
    microInteractions: ["counter animation", "parallax on scroll", "bounce effect on hover"],
    promptInstruction: `Design Style: Energetic Communicator (Critical Mass / Monks Vibe).
STRIKTE CSS-REGELN:
1) Dunkler Hintergrund: background: #0D0D0D, text: #FFFFFF – maximale Energie
2) UPPERCASE-Typografie: Oswald 900, font-size: min(10vw, 80px), letter-spacing: 0.02em, text-transform: uppercase
3) Grid-Breaking Layout: CSS Grid mit overlapping elements, negative margins
4) Marquee-Ticker PFLICHT: Horizontaler Scroll-Text mit Leistungen/Keywords zwischen Sections
5) Akzent-Kontrast: Orange #FF4500 + Gold #FFD700 – energetisch, warm
6) Counter-Animationen: Große Zahlen die beim Scrollen hochzählen (z.B. 500+ Kunden, 15 Jahre)
7) Buttons: Pill-shaped, gradient: linear-gradient(135deg, #FF4500, #FFD700)
Vibe: Laut, selbstbewusst, buzz-worthy. Wie eine Werbeagentur.`
  },
  natural: {
    name: "The Eco-Conscious",
    designTwin: "Patagonia meets Oatly",
    aesthetic: "Naturverbunden, nachhaltig, erdige Farben, organische Formen, Naturbilder.",
    colors: { primary: "#4A7C59", background: "#F5F0E8", accent: "#8B6914", text: "#2C3E2D" },
    typography: { headers: "Lato, sans-serif", body: "Lato, sans-serif" },
    patterns: ["organic-grid", "full-bleed-images", "feature-sections"],
    microInteractions: ["gentle hover", "smooth scroll", "organic fade-in"],
    promptInstruction: `Design Style: Eco-Conscious (Patagonia / Oatly Vibe).
STRIKTE CSS-REGELN:
1) Natürlicher Hintergrund: background: #F5F0E8 (Leinen/Papier), KEIN reines Weiß
2) Organische Formen: Wellenförmige SVG-Trennlinien zwischen Sections (keine geraden Kanten)
3) Waldgrün als Hauptfarbe: #4A7C59 für Buttons, Akzente, Überschriften
4) Typografie: Lato 700 für Headlines – klar, natürlich, nicht zu dekorativ
5) Bilder: Vollbild-Naturfotos, kein Overlay, authentisch und unbearbeitet wirkend
6) Cards: border-radius: 16px, background: rgba(255,255,255,0.7), backdrop-filter: blur(8px)
7) Buttons: Filled waldgrün, border-radius: 999px (pill), padding: 14px 36px
Vibe: Nachhaltig, clean, natürlich. Wie ein Bio-Unternehmen mit Stil.`
  },
  dynamic: {
    name: "The Playful Innovator",
    designTwin: "Duolingo meets Figma",
    aesthetic: "Verspielt, bunt, gamifiziert. Lebhafte Farben, abgerundete Elemente, spielerische Animationen.",
    colors: { primary: "#6366F1", background: "#FAFAFA", accent: "#EC4899", text: "#1F2937" },
    typography: { headers: "Poppins, sans-serif", body: "Nunito, sans-serif" },
    patterns: ["card-carousel", "feature-grid", "hero-illustration"],
    microInteractions: ["bounce animations", "playful hover effects", "progress indicators"],
    promptInstruction: `Design Style: Playful Innovator (Duolingo / Figma Vibe).
STRIKTE CSS-REGELN:
1) Heller Hintergrund: background: #FAFAFA, lebhafte Farb-Akzente
2) Abgerundete Elemente ÜBERALL: border-radius: 24px für Cards, 999px für Buttons und Tags
3) Gradient-Hintergründe: linear-gradient(135deg, #6366F1, #EC4899) für Hero-Elemente
4) Poppins 800 für Headlines – freundlich, modern, lebendig
5) Bounce-Animationen: transform: translateY(-4px) auf hover, transition: 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)
6) Farbige Feature-Cards: Jede Card hat eigene Akzentfarbe (lila, pink, grün, orange)
7) Buttons: Gradient-filled, border-radius: 999px, box-shadow: 0 8px 24px rgba(99,102,241,0.4)
Vibe: Spaßig, engagierend, erfrischend. Wie eine App die man gerne benutzt.`
  },
  warm: {
    name: "The Warm Connector (Gastro)",
    designTwin: "Noma meets The French Laundry",
    aesthetic: "Sensorisch, appetitanregend, gemütlich. Warme Erdtöne, Foodfoto-Atmosphäre.",
    colors: { primary: "#C0392B", background: "#FDF6EC", accent: "#E67E22", text: "#2C1810" },
    typography: { headers: "Playfair Display, serif", body: "Lato, sans-serif" },
    patterns: ["editorial-grid", "full-bleed-images", "card-grid"],
    microInteractions: ["elegant hover", "smooth transitions", "fade-in"],
    promptInstruction: `Design Style: Warm Gastro Connector (Noma / Fine Dining Vibe).
STRIKTE CSS-REGELN:
1) Cremiger Hintergrund: background: #FDF6EC – warm, appetitlich, einladend
2) Vollbild-Foodfoto im Hero: 100vh, object-fit: cover, overlay: linear-gradient(to right, rgba(44,24,16,0.85) 40%, transparent)
3) Playfair Display 700 für Headlines – elegant, gastronomisch
4) Warme Farbpalette: Dunkelrot #C0392B, Orange #E67E22, Creme – keine kalten Farben
5) Menü-Karten: Große Fotos, border-radius: 12px, box-shadow: 0 20px 60px rgba(0,0,0,0.15)
6) Reservierungs-CTA prominent: Großer Button, kontraststark, immer sichtbar
7) Typografie-Kontrast: Große Serif-Headlines + kleine Sans-Serif-Labels
Vibe: Appetitanregend, gemütlich, premium. Wie ein Restaurant das man sofort besuchen will.`
  },
  clean: {
    name: "The Corporate Professional (Clean)",
    designTwin: "Stripe meets Notion",
    aesthetic: "Klar, professionell, vertrauenswürdig. Viel Weißraum, strukturierte Navigation, Blau-Akzente.",
    colors: { primary: "#2563EB", background: "#FFFFFF", accent: "#0EA5E9", text: "#1E293B" },
    typography: { headers: "Montserrat, sans-serif", body: "Inter, sans-serif" },
    patterns: ["structured-grid", "hero-split", "stats-sections"],
    microInteractions: ["professional hover", "smooth scroll", "accordion"],
    promptInstruction: `Design Style: Clean Corporate (Stripe / Notion Vibe).
STRIKTE CSS-REGELN:
1) Weißer Hintergrund: background: #FFFFFF, Sekundär: #F8FAFC – maximale Klarheit
2) Blau als einzige Akzentfarbe: #2563EB für Buttons, Links, Highlights – KEINE anderen Farben
3) Viel Weißraum: padding-top/bottom: 100px, max-width: 1200px, zentriert
4) Split-Hero: Text links (50%), Illustration/Foto rechts (50%) – symmetrisch, professionell
5) Feature-Grid: 3-spaltig, Icons in Blau, Titel fett, Beschreibung grau
6) Trust-Elemente: Kundenzahlen, Bewertungen, Zertifikate prominent
7) Buttons: Filled blau, border-radius: 8px, hover: #1D4ED8
Vibe: Vertrauenswürdig, modern, professionell. Wie ein SaaS-Produkt.`
  },
};

// ── Industry-specific prompt enrichment ───────────────
function buildIndustryContext(category: string, businessName: string = ""): string {
  const combined = `${category} ${businessName}`.toLowerCase();

  // Hair & Beauty → Pool: elegant, fresh, luxury
  if (/friseur|salon|beauty|hair|barber|coiffeur|nail|spa|massage|kosmetik|wellness|ästhetik|lash|brow|make.?up|tanning|waxing|threading/.test(combined)) {
    return `LAYOUT-POOL: BEAUTY (elegant / fresh / luxury)
Schreibstil: Poetisch, sinnlich, einladend. Kurze, elegante Sätze. Emotionen ansprechen.
Sprache: Warm, persönlich, luxuriös ohne arrogant zu sein.
Betone: Handwerk & Expertise, persönliche Beratung, Wohlfühlatmosphäre, Transformation, Schönheit.
Hero-Headline: Soll ein Gefühl erzeugen, kein Versprechen machen. Z.B. "Wo Schönheit beginnt" statt "Ihr Friseur in München".
Services: Konkrete Behandlungen mit sensorischen Details (Duft, Gefühl, Ergebnis).
VERBOTEN: "Ihr Wohlbefinden liegt uns am Herzen", "Wir freuen uns auf Ihren Besuch", generische Phrasen.`;
  }

  // Bar, Tapas, Cocktail, Pub → Pool: dark, vibrant, nightlife
  if (/\bbar\b|tapas|cocktail|lounge|pub|kneipe|weinbar|brauerei|brewery|nightlife|nachtleben|aperitivo/.test(combined)) {
    return `LAYOUT-POOL: BAR (dark / vibrant / nightlife)
Schreibstil: Stimmungsvoll, verführerisch, atmosphärisch. Kurze, knackige Sätze. Nacht-Feeling.
Sprache: Lässig, einladend, cool. Erlebnisse und Atmosphäre betonen.
Betone: Atmosphäre, Signature-Drinks, Musik, Abend-/Nacht-Erlebnis, Gastfreundschaft.
Hero-Headline: Einladend und stimmungsvoll. Z.B. "Wo der Abend beginnt" oder "Dein Lieblingsplatz wartet."
Services: Konkrete Drinks/Speisen mit verlockenden Beschreibungen.
VERBOTEN: "Wir bieten eine große Auswahl", generische Gastro-Phrasen.`;
  }

  // Restaurant, Café, Food → Pool: warm, fresh, modern
  if (/restaurant|gastro|cafe|café|bistro|pizza|küche|bäckerei|catering|food|sushi|burger|gastronomie|bakery/.test(combined)) {
    return `LAYOUT-POOL: GASTRONOMIE (warm / fresh / modern)
Schreibstil: Sensorisch, appetitanregend, gemütlich. Beschreibe Aromen, Texturen, Atmosphäre.
Sprache: Herzlich, einladend, leidenschaftlich für Essen.
Betone: Frische Zutaten, Rezepttradition, Atmosphäre, konkrete Gerichte, Reservierung.
Hero-Headline: Soll Hunger und Vorfreude wecken. Z.B. "Wo jeder Bissen zählt" oder "Echte Küche. Echter Geschmack."
Services: Konkrete Gerichte/Menüs mit verlockenden Beschreibungen.
VERBOTEN: "Wir bieten eine große Auswahl", "für jeden Geschmack etwas dabei", generische Phrasen.`;
  }

  // Bauunternehmen → Pool: bold, industrial, modern
  if (/bauunternehmen|baufirma|hochbau|tiefbau|rohbau|bauträger|generalunternehmer|schlüsselfertig|neubau|umbau|anbau/.test(combined)) {
    return `LAYOUT-POOL: BAUUNTERNEHMEN (bold / industrial / modern)
Schreibstil: Kraftvoll, kompetent, zuverlässig. Zahlen, Projekte, Referenzen betonen.
Sprache: Professionell, direkt, vertrauensweckend. Großprojekte und Expertise hervorheben.
Betone: Referenzprojekte, Erfahrung in Jahren, Fachkompetenz, Terminzuverlässigkeit, Schlüsselfertig-Lösungen.
Hero-Headline: Stark und kompetent. Z.B. "Wir bauen Ihre Zukunft" oder "Von der Planung bis zum Schlüssel."
Services: Konkrete Bauleistungen mit Projektbeispielen und Größenangaben.
VERBOTEN: "Qualität steht bei uns an erster Stelle", "Ihr Partner für...", weiche Phrasen.`;
  }

  // Construction, Trades → Pool: bold, craft, modern
  if (/handwerk|elektriker|klempner|maler|bau|sanitär|dachdecker|contractor|roofing|construction|tischler|schreiner|zimmermann|fliesenleger|renovation|installation/.test(combined)) {
    return `LAYOUT-POOL: HANDWERK (bold / craft / modern)
Schreibstil: Direkt, kraftvoll, selbstbewusst. Kurze, prägnante Aussagen. Zahlen und Fakten.
Sprache: Kompetent, vertrauenswürdig. Keine Schnickschnack.
Betone: Zuverlässigkeit, Qualitätsarbeit, Erfahrung (Jahre), schnelle Reaktionszeit, Festpreise, Garantie.
Hero-Headline: Stark, direkt. Z.B. "Gemacht für die Härte des Alltags" oder "Wir reparieren. Punkt."
Services: Konkrete Leistungen mit Zeitangaben und Garantien.
VERBOTEN: "Wir sind Ihr Partner für...", "Qualität steht bei uns an erster Stelle", weiche Phrasen.`;
  }

  // Automotive → Pool: luxury, bold, craft
  if (/auto|kfz|car|garage|mechanic|werkstatt|karosserie|tuning|fahrzeug|vehicle|motorrad|motorcycle|reifenservice/.test(combined)) {
    return `LAYOUT-POOL: AUTOMOTIVE (luxury / bold / craft)
Schreibstil: Technisch-präzise, leidenschaftlich, premium. Zahlen und Spezifikationen.
Sprache: Kennerschaft, Qualitätsbewusstsein, Leidenschaft fürs Fahrzeug.
Betone: Präzision, Erfahrung, Originalteile, Garantie, schnelle Durchlaufzeit.
Hero-Headline: Leidenschaft und Expertise. Z.B. "Ihr Fahrzeug. Unsere Leidenschaft." oder "Perfektion bis ins letzte Detail."
Services: Konkrete Leistungen mit technischen Details und Zeitangaben.`;
  }

  // Fitness & Sport → Pool: vibrant, dynamic, modern
  if (/fitness|gym|sport|yoga|training|crossfit|pilates|kampfsport|tanzen|personal.?trainer|physiotherap|bewegung|martial|boxing/.test(combined)) {
    return `LAYOUT-POOL: FITNESS (vibrant / dynamic / modern)
Schreibstil: Motivierend, energetisch, herausfordernd. Imperativ-Sätze. Transformation betonen.
Sprache: Stark, inspirierend, community-orientiert. Ergebnisse in den Vordergrund.
Betone: Transformation, konkrete Ergebnisse (kg, Zeit, Leistung), Community, Trainer-Expertise, Programme.
Hero-Headline: Energie und Motivation. Z.B. "Dein stärkeres Ich beginnt hier" oder "Keine Ausreden. Nur Ergebnisse."
Services: Konkrete Programme mit Ergebnisversprechen.
VERBOTEN: "Für jeden das Richtige", "Spaß am Sport", generische Fitness-Phrasen.`;
  }

  // Medical & Health → Pool: trust, clean, modern
  if (/arzt|zahnarzt|praxis|medizin|therapie|doctor|dental|clinic|health|apotheke|klinik|hospital|chiropractor|heilpraktiker/.test(combined)) {
    return `LAYOUT-POOL: MEDIZIN (trust / clean / modern)
Schreibstil: Professionell, beruhigend, klar. Präzise Aussagen. Vertrauen aufbauen.
Sprache: Kompetent, empathisch, sachlich. Fachbegriffe erklären.
Betone: Kompetenz, modernste Technik, Patientenorientierung, kurze Wartezeiten, Qualifikationen.
Hero-Headline: Beruhigend und kompetent. Z.B. "Ihre Gesundheit in erfahrenen Händen" oder "Medizin, die zuhört."
Services: Konkrete Behandlungen mit Erklärungen und Vorteilen.
VERBOTEN: "Ihr Vertrauen ist unser Kapital", "Wir nehmen uns Zeit für Sie", generische Phrasen.`;
  }

  // Legal, Finance, Consulting → Pool: trust, clean, modern
  if (/rechtsanwalt|anwalt|kanzlei|steuerberater|beratung|consulting|law|legal|finanz|versicherung|immobilien|makler/.test(combined)) {
    return `LAYOUT-POOL: BERATUNG (trust / clean / modern)
Schreibstil: Sachlich, präzise, kompetent. Vertrauen durch Expertise.
Sprache: Professionell, direkt, vertrauenswürdig. Keine Emotionen, aber Empathie.
Betone: Expertise, Diskretion, Erfolgsquote, persönliche Betreuung, Spezialisierung, Jahre Erfahrung.
Hero-Headline: Kompetenz und Sicherheit. Z.B. "Ihr Recht. Unsere Expertise." oder "Wenn es darauf ankommt."
Services: Konkrete Leistungsbereiche mit Spezialisierungen.`;
  }

  // Organic, Eco, Garden → Pool: natural, fresh, warm
  if (/bio|organic|öko|eco|natur|garden|garten|florist|blumen|flower|pflanze|plant|naturopath|kräuter|herb|nachhaltig|sustainable/.test(combined)) {
    return `LAYOUT-POOL: NATUR (natural / fresh / warm)
Schreibstil: Warm, authentisch, nachhaltig. Sensorische Beschreibungen. Erdverbundenheit.
Sprache: Ehrlich, leidenschaftlich, umweltbewusst. Regionale Herkunft betonen.
Betone: Nachhaltigkeit, regionale Produkte, handgemacht, frisch, Natur, Gesundheit.
Hero-Headline: Natürlich und einladend. Z.B. "Direkt aus der Natur zu dir" oder "Echt. Frisch. Regional."
Services: Konkrete Produkte/Leistungen mit Herkunftsangaben.`;
  }

  // Tech, Agency, Digital → Pool: modern, vibrant, dynamic
  if (/tech|software|digital|agency|agentur|web|app|it|computer|marketing|design|media|kreativ|creative|startup/.test(combined)) {
    return `LAYOUT-POOL: DIGITAL (modern / vibrant / dynamic)
Schreibstil: Präzise, innovativ, zukunftsorientiert. Ergebnisse und ROI betonen.
Sprache: Kompetent, modern, lösungsorientiert. Technische Begriffe erklären.
Betone: Ergebnisse, Expertise, Innovationsfähigkeit, Portfolio, Prozesse, Zeitersparnis.
Hero-Headline: Wirkungsorientiert. Z.B. "Digitale Lösungen, die wachsen." oder "Technologie, die begeistert."
Services: Konkrete Leistungen mit messbaren Ergebnissen.`;
  }

  // Hotel, Tourism, Events → Pool: luxury, elegant, warm
  if (/hotel|pension|hostel|airbnb|tourism|tourismus|event|veranstaltung|hochzeit|wedding|party|reise|travel/.test(combined)) {
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

  return `Du bist ein PREISGEKRÖNTER Awwwards-Level Webdesigner, UX-Copywriter und Frontend-Entwickler.
Deine Websites gewinnen regelmäßig "Site of the Day" auf Awwwards, FWA und CSS Design Awards.

⚠️ SPRACHE: ALLE TEXTE MÜSSEN AUF DEUTSCH SEIN – Überschriften, Fließtexte, Testimonials, Buttons, FAQ, ALLES. Kein einziges englisches Wort außer Eigennamen und Markennamen. Testimonials von deutschen Kunden mit deutschen Namen.

Dein Designprozess:
1. ANALYSE VOR GENERIERUNG: Verstehe Zielgruppe, Pain Points und Unique Value Proposition
2. DESIGN-TWIN IMITIEREN: Imitiere die visuelle DNA des Design-Twins – aber mit den Kundendaten
3. STORYBRAND: Der KUNDE ist der HELD – das Unternehmen ist der GUIDE (wie Yoda für Luke)
4. QUALITÄT: Einzigartige, spezifische Texte – NIEMALS generische Phrasen
5. ANIMATION: Subtile, purposeful Animationen – jede Animation hat einen Grund

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
Design-Twin: ${archetype.designTwin}
═══════════════════════════════════════
Aesthetik: ${archetype.aesthetic}
Typografie: Headlines in ${archetype.typography.headers} / Body in ${archetype.typography.body}
Layout-Patterns: ${archetype.patterns.join(", ")}
Micro-Interactions: ${archetype.microInteractions.join(", ")}

${archetype.promptInstruction}

FARB-HIERARCHIE (60-30-10 REGEL – STRIKT EINHALTEN):
- 60% = Hintergrundfarbe: ${archetype.colors.background} (dominanter Hintergrund)
- 30% = Primärfarbe: ${colorScheme.primary || archetype.colors.primary} (Hauptelemente, Texte, Strukturen)
- 10% = Akzentfarbe: ${colorScheme.accent || archetype.colors.accent} (NUR für CTAs, Links, Highlights)
❌ NIEMALS mehr als 3 Hauptfarben
❌ NIEMALS bunte Section-Hintergründe
✅ IMMER gleiche Akzentfarbe für alle CTAs

═══════════════════════════════════════
ANIMATIONS-STRATEGIE
═══════════════════════════════════════
Page-Load Sequenz:
- Navbar: fade-in 0.3s ease-out
- Hero-Headline: slide-up 0.6s ease-out, 0.1s delay
- Hero-Subtext: fade-in 0.6s ease-out, 0.2s delay
- CTA-Button: fade-in + scale 0.6s ease-out, 0.4s delay

Scroll-Verhalten:
- Intersection Observer: Elemente fade-in + translateY(30px → 0) beim Erscheinen
- Card-Stagger: 80ms delay pro Card für orchestrierte Animationen
- Navbar: backdrop-blur + shadow bei scroll (class 'scrolled' via JS)

Interaktive Elemente:
- Buttons: translateY(-2px) + box-shadow glow on hover, 0.2s ease-out
- Cards: scale(1.02) + shadow enhanced on hover, 0.3s ease-out
- Links: animated underline width 0→100%, 0.2s ease-out

═══════════════════════════════════════
BRANCHENKONTEXT & PERSÖNLICHKEIT
═══════════════════════════════════════
${industryContext}
${getIndustryServicesSeed(category)}
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
5. AUTHENTISCHE TESTIMONIALS AUF DEUTSCH: Glaubwürdige Kundenstimmen auf Deutsch mit konkreten Details (was wurde gemacht, welches Ergebnis, warum zufrieden). Autoren-Namen müssen deutsch klingen (z.B. "Maria Schneider", "Thomas Müller"). KEINE englischen Testimonials.
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
      "type": "about",
      "headline": "Kreative Überschrift für 'Über uns' (NICHT 'Über uns'! Beispiel: 'Unsere Geschichte', 'Wer wir sind', 'Seit [Jahr] für Sie da')",
      "content": "Authentischer Text über das Unternehmen (4-5 Sätze: Gründungsgeschichte oder Leidenschaft, Expertise, lokale Verwurzelung, Was uns besonders macht, Versprechen an den Kunden)",
      "items": [
        { "title": "Starke Zahl oder Aussage", "description": "Erklärung (z.B. '15+ Jahre Erfahrung', '500+ zufriedene Kunden', 'Familienunternehmen')" },
        { "title": "Starke Zahl oder Aussage", "description": "Erklärung" },
        { "title": "Starke Zahl oder Aussage", "description": "Erklärung" }
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
  },
  "designTokens": {
    "headlineFont": "[PFLICHT: Exakter Google Font Name für Überschriften. Regeln: luxury/elegant=Playfair Display oder Cormorant Garamond; bold/craft=Oswald oder Barlow Condensed; fresh/natural=Poppins oder Nunito; trust/clean=Montserrat oder Inter; modern=Space Grotesk oder DM Sans; vibrant/dynamic=Barlow Condensed oder Rajdhani; warm=Lora oder Fraunces]",
    "bodyFont": "[PFLICHT: Exakter Google Font Name für Fließtext. WICHTIG: bodyFont MUSS IMMER eine serifenlose Schrift sein! Erlaubt: Inter, Nunito, Source Sans 3, Lato, DM Sans, Outfit, Open Sans, Barlow, Raleway, Poppins. VERBOTEN als bodyFont: Lora, Playfair Display, Merriweather, Georgia, Cormorant, Fraunces, DM Serif, Crimson Text (diese nur für headlineFont!). Handwerk/Bau/Auto/Fitness: immer Barlow oder Inter. Beauty/Wellness: Nunito oder Lato. Restaurant: Nunito oder Open Sans.]",
    "headlineFontWeight": "[700 oder 800 oder 900 je nach Archetyp-Energie]",
    "headlineLetterSpacing": "[z.B. -0.04em für elegant/luxury, 0.08em für craft/bold, -0.02em für modern]",
    "bodyLineHeight": "[z.B. 1.6 für kompakt, 1.8 für luftig, 1.75 für standard]",
    "borderRadius": "[none | sm | md | lg | full – passend zum Archetyp: luxury=none, craft=sm, fresh=lg, vibrant=full]",
    "shadowStyle": "[none | flat | soft | dramatic | glow – luxury=none, trust=soft, craft=flat, vibrant=glow]",
    "sectionSpacing": "[tight | normal | spacious | ultra – luxury=ultra, craft=normal, fresh=spacious]",
    "sectionBackgrounds": ["[Hintergrund Sektion 1, z.B. #FFFFFF]", "[Hintergrund Sektion 2, z.B. #F8F4F0]", "[Hintergrund Sektion 3, z.B. #1A1A1A]"],
    "accentColor": "[Akzentfarbe aus der 60-30-10 Regel, z.B. ${colorScheme.accent || archetype.colors.accent}]",
    "textColor": "[Primäre Textfarbe, z.B. #1A1A1A oder #F0F0F0 bei dark mode]",
    "backgroundColor": "[Haupt-Hintergrundfarbe, z.B. ${archetype.colors.background}]",
    "cardBackground": "[Karten-Hintergrundfarbe, z.B. #FFFFFF oder rgba(255,255,255,0.05)]",
    "buttonStyle": "[filled | outline | ghost | pill – luxury=outline, craft=filled, fresh=pill, vibrant=filled]",
    "archetype": "${archetype.name}"
  }
}

Verfügbare Lucide-Icons für Services: Scissors, Wrench, Heart, Star, Shield, Zap, Clock, MapPin, Phone, Mail, Users, Award, ThumbsUp, Briefcase, Home, Car, Utensils, Camera, Sparkles, Flame, Leaf, Sun, Moon, Coffee, Music, Book, Palette, Hammer, Truck, Package, CheckCircle, ArrowRight, ChevronRight, Globe, Wifi, Lock, Key, Smile, Baby, Dog, Flower, Trees, Dumbbell, Bike, Stethoscope, Pill, Microscope, Scale, Gavel, Calculator, PiggyBank, Building, Factory, Warehouse`;
}

/** Maps a GMB category string to the industry key used in template_uploads table */
function mapCategoryToIndustryKey(category: string): string {
  const lower = (category || "").toLowerCase();
  if (/friseur|salon|beauty|hair|barber|coiffeur|nail|spa|massage|kosmetik|wellness|lash|brow|make.?up/.test(lower)) return "beauty";
  if (/\bbar\b|tapas|cocktail|lounge|pub|kneipe|weinbar|brauerei|brewery|nightlife|aperitivo/.test(lower)) return "restaurant";
  if (/café|cafe|bistro|kaffee|coffee|coffeeshop|bäckerei|bakery|konditorei|patisserie|brunch/.test(lower)) return "restaurant";
  if (/restaurant|gastro|gastronomie|pizza|küche|bäckerei|catering|food|sushi|burger|bakery/.test(lower)) return "restaurant";
  if (/fitness|gym|sport|yoga|training|crossfit|pilates|kampfsport|personal.?trainer|physiotherap|boxing/.test(lower)) return "fitness";
  if (/auto|kfz|car|garage|mechanic|werkstatt|karosserie|tuning|motorrad|reifenservice/.test(lower)) return "automotive";
  if (/arzt|zahnarzt|praxis|medizin|therapie|doctor|dental|clinic|health|apotheke|klinik|chiropractor/.test(lower)) return "medical";
  if (/rechtsanwalt|anwalt|kanzlei|steuerberater|beratung|consulting|law|legal|finanz|versicherung|immobilien/.test(lower)) return "legal";
  if (/bauunternehmen|baufirma|hochbau|tiefbau|rohbau|bauträger|generalunternehmer|schlüsselfertig|neubau/.test(lower)) return "trades";
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
          { query: searchQuery, language: "de" }
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
              { place_id: place.place_id, fields: "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,types,reviews", language: "de" }
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
              reviews: details.result?.reviews || [],
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
      reviews: z.array(z.object({
        author_name: z.string(),
        rating: z.number(),
        text: z.string(),
        time: z.number(),
      })).optional(),
        })),
        searchQuery: z.string(),
        searchRegion: z.string(),
      }))
      .mutation(async ({ input }) => {
        let saved = 0;
        const toAnalyze: { businessId: number; websiteUrl: string }[] = [];

        for (const r of input.results) {
          const slug = slugify(r.name) + "-" + nanoid(6);
          const businessId = await upsertBusiness({
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
            googleReviews: r.reviews && r.reviews.length > 0 ? r.reviews : null,
          });
          saved++;

          // Queue for background analysis if has website and leadType is unknown
          if (r.hasWebsite && r.website && (!r.leadType || r.leadType === "unknown")) {
            toAnalyze.push({ businessId, websiteUrl: r.website });
          }
        }

        // Run website analysis in background (non-blocking)
        if (toAnalyze.length > 0) {
          Promise.allSettled(
            toAnalyze.map(async ({ businessId, websiteUrl }) => {
              try {
                const analysis = await analyzeWebsite(websiteUrl);
                await updateBusiness(businessId, {
                  leadType: analysis.leadType,
                  websiteAge: analysis.websiteAge,
                  websiteScore: analysis.websiteScore,
                  websiteAnalysis: analysis.details,
                });
              } catch {
                // Silently ignore analysis failures
              }
            })
          ).catch(() => {});
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

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const business = await getBusinessById(input.id);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });
        // Delete associated website (and its dependencies) first
        const website = await getWebsiteByBusinessId(input.id);
        if (website) await deleteWebsite(website.id);
        // Delete the business itself
        await deleteBusiness(input.id);
        return { success: true };
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
        const industryContext = buildIndustryContext(category, business.name);
        const personalityHint = buildPersonalityHint(business.name, business.rating, business.reviewCount || 0);
        const colorScheme = getIndustryColorScheme(category, business.name);
        // Round-robin layout assignment: guarantees consecutive same-industry
        // websites always get a different layout from the pool.
        const { pool: layoutPool, industryKey } = getLayoutPool(category, business.name);
        const layoutStyle = await getNextLayoutForIndustry(industryKey, layoutPool);
        const heroImageUrl = getHeroImageUrl(category, business.name);
        const galleryImages = getGalleryImages(category, business.name);
        // Fetch GMB photos from Google Places API (prefer real business photos over Unsplash)
        const gmbPhotos = business.placeId ? await getGmbPhotos(business.placeId, 7) : [];
        // Select matching templatess from the library for visual reference
        const matchingTemplates = selectTemplatesForIndustry(category, business.name, 3);
        const templateStyleDesc = getTemplateStyleDescription(matchingTemplates);
        const baseTemplateImageUrls = getTemplateImageUrls(matchingTemplates);

        // Merge with admin-uploaded templates for this industry+pool
        const uploadedTemplates = await listTemplateUploadsByPool(
          industryKey,
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
        // Priority: AI image > GMB photo > Unsplash fallback
        let finalHeroImageUrl = gmbPhotos.length > 0 ? gmbPhotos[0] : heroImageUrl;
        if (input.generateAiImage) {
          try {
            const imagePrompt = `Professional hero image for ${business.name}, a ${category} business. ${websiteData.tagline || ""}. High quality, photorealistic, modern, clean composition. No text or logos.`;
            const { url } = await generateImage({ prompt: imagePrompt });
            if (url) finalHeroImageUrl = url;
          } catch {
            // Fallback to GMB photo or Unsplash if AI image generation fails
            finalHeroImageUrl = gmbPhotos.length > 0 ? gmbPhotos[0] : heroImageUrl;
          }
        }
        // Inject gallery images: prefer GMB photos, fall back to Unsplash
        const effectiveGalleryImages = gmbPhotos.length >= 3 ? gmbPhotos.slice(1) : galleryImages;
        if (effectiveGalleryImages.length > 0 && websiteData.sections) {
          const gallerySection = websiteData.sections.find((s: any) => s.type === "gallery");
          if (gallerySection) {
            gallerySection.images = effectiveGalleryImages;
          }
        }

        // Inject real Google rating data
        if (business.rating) websiteData.googleRating = parseFloat(business.rating);
        if (business.reviewCount) websiteData.googleReviewCount = business.reviewCount;

        // Inject real Google reviews into testimonials section if available
        const realReviews = (business as any).googleReviews as Array<{ author_name: string; rating: number; text: string; time: number }> | null;
        if (realReviews && realReviews.length >= 3 && websiteData.sections) {
          const testimonialsSection = websiteData.sections.find((s: any) => s.type === "testimonials");
          if (testimonialsSection) {
            const topReviews = realReviews
              .filter((r) => r.text && r.text.length >= 50)
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5)
              .map((r) => ({
                title: r.text.slice(0, 60) + (r.text.length > 60 ? "…" : ""),
                description: r.text,
                author: r.author_name,
                rating: r.rating,
                isRealReview: true,
              }));
            if (topReviews.length >= 2) {
              testimonialsSection.items = topReviews;
              testimonialsSection.isRealReviews = true;
            }
          }
        }

        // Sanitize designTokens: ensure enum values are valid
        if (websiteData.designTokens) {
          const dt = websiteData.designTokens;
          const validRadius = ["none", "sm", "md", "lg", "full"];
          const validShadow = ["none", "flat", "soft", "dramatic", "glow"];
          const validSpacing = ["tight", "normal", "spacious", "ultra"];
          const validButton = ["filled", "outline", "ghost", "pill"];
          if (!validRadius.includes(dt.borderRadius)) dt.borderRadius = "md";
          if (!validShadow.includes(dt.shadowStyle)) dt.shadowStyle = "soft";
          if (!validSpacing.includes(dt.sectionSpacing)) dt.sectionSpacing = "normal";
          if (!validButton.includes(dt.buttonStyle)) dt.buttonStyle = "filled";
          if (!Array.isArray(dt.sectionBackgrounds) || dt.sectionBackgrounds.length < 2) {
            dt.sectionBackgrounds = [colorScheme.background, colorScheme.surface, colorScheme.background];
          }
          // Ensure font names are plain strings (no brackets)
          if (dt.headlineFont && dt.headlineFont.includes("[")) dt.headlineFont = "Playfair Display";
          if (dt.bodyFont && dt.bodyFont.includes("[")) dt.bodyFont = "Inter";
          // CRITICAL: bodyFont must NEVER be a serif font - serifs are for headlines only
          const FORBIDDEN_BODY_FONTS = ["lora", "playfair", "merriweather", "georgia", "cormorant", "fraunces", "dm serif", "crimson", "garamond", "times", "palatino", "baskerville", "didot"];
          if (dt.bodyFont && FORBIDDEN_BODY_FONTS.some(f => dt.bodyFont!.toLowerCase().includes(f))) {
            dt.bodyFont = "Inter"; // Safe sans-serif fallback
          }
          // Ensure accent color is a valid hex/rgb
          if (!dt.accentColor || dt.accentColor.includes("[")) dt.accentColor = colorScheme.accent;
          if (!dt.textColor || dt.textColor.includes("[")) dt.textColor = colorScheme.text;
          if (!dt.backgroundColor || dt.backgroundColor.includes("[")) dt.backgroundColor = colorScheme.background;
          if (!dt.cardBackground || dt.cardBackground.includes("[")) dt.cardBackground = colorScheme.surface;
        }

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
        // Round-robin: guarantees a different layout than the previous generation
        const { pool: layoutPoolRegen, industryKey: industryKeyRegen } = getLayoutPool(category, business.name);
        const layoutStyle = await getNextLayoutForIndustry(industryKeyRegen, layoutPoolRegen);
        const heroImageUrl = getHeroImageUrl(category, seed);
        const galleryImages = getGalleryImages(category, business.name);

        // Pick different templates than last time by shuffling
        const matchingTemplates = selectTemplatesForIndustry(category, seed, 3);
        const templateStyleDesc = getTemplateStyleDescription(matchingTemplates);
        const baseTemplateImageUrlsRegen = getTemplateImageUrls(matchingTemplates);

        // Merge with admin-uploaded templates for this industry+pool
        const uploadedTemplatesRegen = await listTemplateUploadsByPool(
          industryKeyRegen,
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

        // Inject real Google reviews into testimonials section if available
        const realReviews = (business as any).googleReviews as Array<{ author_name: string; rating: number; text: string; time: number }> | null;
        if (realReviews && realReviews.length >= 3 && websiteData.sections) {
          const testimonialsSection = websiteData.sections.find((s: any) => s.type === "testimonials");
          if (testimonialsSection) {
            const topReviews = realReviews
              .filter((r) => r.text && r.text.length >= 50)
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5)
              .map((r) => ({
                title: r.text.slice(0, 60) + (r.text.length > 60 ? "…" : ""),
                description: r.text,
                author: r.author_name,
                rating: r.rating,
                isRealReview: true,
              }));
            if (topReviews.length >= 2) {
              testimonialsSection.items = topReviews;
              testimonialsSection.isRealReviews = true;
            }
          }
        }

        // Sanitize designTokens: ensure enum values are valid
        if (websiteData.designTokens) {
          const dt = websiteData.designTokens;
          const validRadius = ["none", "sm", "md", "lg", "full"];
          const validShadow = ["none", "flat", "soft", "dramatic", "glow"];
          const validSpacing = ["tight", "normal", "spacious", "ultra"];
          const validButton = ["filled", "outline", "ghost", "pill"];
          if (!validRadius.includes(dt.borderRadius)) dt.borderRadius = "md";
          if (!validShadow.includes(dt.shadowStyle)) dt.shadowStyle = "soft";
          if (!validSpacing.includes(dt.sectionSpacing)) dt.sectionSpacing = "normal";
          if (!validButton.includes(dt.buttonStyle)) dt.buttonStyle = "filled";
          if (!Array.isArray(dt.sectionBackgrounds) || dt.sectionBackgrounds.length < 2) {
            dt.sectionBackgrounds = [colorScheme.background, colorScheme.surface, colorScheme.background];
          }
          if (dt.headlineFont && dt.headlineFont.includes("[")) dt.headlineFont = "Playfair Display";
          if (dt.bodyFont && dt.bodyFont.includes("[")) dt.bodyFont = "Inter";
          // CRITICAL: bodyFont must NEVER be a serif font
          const FORBIDDEN_BODY_FONTS_REGEN = ["lora", "playfair", "merriweather", "georgia", "cormorant", "fraunces", "dm serif", "crimson", "garamond", "times", "palatino", "baskerville", "didot"];
          if (dt.bodyFont && FORBIDDEN_BODY_FONTS_REGEN.some(f => dt.bodyFont!.toLowerCase().includes(f))) {
            dt.bodyFont = "Inter";
          }
          if (!dt.accentColor || dt.accentColor.includes("[")) dt.accentColor = colorScheme.accent;
          if (!dt.textColor || dt.textColor.includes("[")) dt.textColor = colorScheme.text;
          if (!dt.backgroundColor || dt.backgroundColor.includes("[")) dt.backgroundColor = colorScheme.background;
          if (!dt.cardBackground || dt.cardBackground.includes("[")) dt.cardBackground = colorScheme.surface;
        }

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

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.id);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
        await deleteWebsite(input.id);
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

  // ── Checkout & Subscriptions ─────────────────────────
  checkout: router({
    createSession: publicProcedure
      .input(z.object({
        websiteId: z.number(),
        addOns: z.object({
          subpages: z.number().default(0),
          gallery: z.boolean().default(false),
          contactForm: z.boolean().default(false),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND" });
        
        let totalAmount = PRICING.base.amount;
        const addOnsList = [];
        if (input.addOns?.subpages) {
          totalAmount += input.addOns.subpages * PRICING.subpage.amount;
          addOnsList.push(`${input.addOns.subpages} Unterseite(n)`);
        }
        if (input.addOns?.gallery) {
          totalAmount += PRICING.gallery.amount;
          addOnsList.push("Bildergalerie");
        }
        if (input.addOns?.contactForm) {
          addOnsList.push("Kontaktformular");
        }
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "subscription",
          customer_email: ctx.user?.email || undefined,
          line_items: [
            {
              price_data: {
                currency: "eur",
                product_data: {
                  name: `Pageblitz Website - ${website.slug}`,
                  description: `79EUR/Monat Basis${addOnsList.length > 0 ? " + " + addOnsList.join(", ") : ""}`,
                },
                unit_amount: totalAmount,
                recurring: { interval: "month", interval_count: 1 },
              },
              quantity: 1,
            },
          ],
          success_url: `${ctx.req.headers.origin}/websites/${website.id}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${ctx.req.headers.origin}/websites/${website.id}`,
          metadata: {
            websiteId: website.id.toString(),
            userId: ctx.user?.id.toString() || "anonymous",
            addOns: JSON.stringify(input.addOns),
          },
        });
        
        if (!session.url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe session URL not generated" });
        return { url: session.url, sessionId: session.id };
      }),
  }),
  
  // ── Onboarding ────────────────────────────────────────
  onboarding: router({
    get: publicProcedure
      .input(z.object({ websiteId: z.number() }))
      .query(async ({ input }) => {
        const onboarding = await getOnboardingByWebsiteId(input.websiteId);
        if (!onboarding) throw new TRPCError({ code: "NOT_FOUND" });
        return onboarding;
      }),

    generateText: publicProcedure
      .input(z.object({
        websiteId: z.number(),
        field: z.enum(["tagline", "description", "usp", "targetAudience"]),
        context: z.string(),
      }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND" });
        
        const prompts: Record<string, string> = {
          tagline: `Erstelle einen kurzen, einprägsamen deutschen Slogan (max. 8 Wörter) für dieses Unternehmen. Nur den Slogan, keine Anführungszeichen, keine Erklärung.

Kontext: ${input.context}`,
          description: `Schreibe eine professionelle deutsche Unternehmensbeschreibung (2-3 Sätze, ca. 80-120 Wörter) für dieses Unternehmen. Direkt, überzeugend, ohne Floskeln.

Kontext: ${input.context}`,
          usp: `Was ist das Alleinstellungsmerkmal (USP) dieses Unternehmens? Formuliere es in einem prägnanten deutschen Satz (max. 15 Wörter). Nur den USP, keine Erklärung.

Kontext: ${input.context}`,
          targetAudience: `Beschreibe die ideale Zielgruppe für dieses Unternehmen in 1-2 deutschen Sätzen. Konkret und spezifisch.

Kontext: ${input.context}`,
        };
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Du bist ein professioneller Texter für lokale Unternehmen in Deutschland. Schreibe immer auf Deutsch. Sei prägnant, authentisch und vermeide Marketingfloskeln." },
            { role: "user", content: prompts[input.field] },
          ],
        });
        
        const rawContent = response.choices?.[0]?.message?.content;
        const text = typeof rawContent === "string" ? rawContent : "";
        return { text: text.trim() };
      }),
    
    suggestServices: publicProcedure
      .input(z.object({
        websiteId: z.number(),
        context: z.string(),
      }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND" });

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Du bist ein Experte für lokale Unternehmenswebsites in Deutschland. Antworte immer mit validem JSON." },
            { role: "user", content: `Schlage 6 verschiedene, typische Leistungen für dieses Unternehmen vor. Achte auf eine gute Mischung aus Standard-Dienstleistungen und spezielleren Angeboten. Gib nur ein JSON-Array zurück, kein Markdown, keine Erklärung.\n\nFormat: [{\"title\": \"Leistungsname\", \"description\": \"Kurze Beschreibung (max 12 Wörter)\"}]\n\nKontext: ${input.context}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "services_suggestions",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  services: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                      },
                      required: ["title", "description"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["services"],
                additionalProperties: false,
              },
            },
          },
        });

        const rawContent = response.choices?.[0]?.message?.content;
        const text = typeof rawContent === "string" ? rawContent : "{}";
        try {
          const parsed = JSON.parse(text);
          const services = (parsed.services || []).slice(0, 4).map((s: { title: string; description: string }) => ({
            title: String(s.title || "").trim(),
            description: String(s.description || "").trim(),
          }));
          return { services };
        } catch {
          return { services: [] };
        }
      }),

    findEmail: publicProcedure
      .input(z.object({
        websiteId: z.number(),
        domain: z.string().optional(),
        websiteUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND" });

        const domain = input.domain || (input.websiteUrl ? (() => {
          try { return new URL(input.websiteUrl!).hostname.replace(/^www\./, ""); } catch { return null; }
        })() : null);

        if (!domain) return { email: null, source: null };

        // 1. Try Hunter.io if API key is configured
        const hunterKey = process.env.HUNTER_API_KEY;
        if (hunterKey) {
          try {
            const hunterRes = await fetch(
              `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&limit=5&api_key=${hunterKey}`
            );
            const hunterData = await hunterRes.json() as { data?: { emails?: Array<{ value: string; type: string; confidence: number }> } };
            const emails = hunterData?.data?.emails || [];
            // Prefer generic emails (info@, kontakt@, etc.) over personal ones
            const generic = emails.find(e => /^(info|kontakt|contact|hallo|hello|mail|post|office|service|anfrage)@/i.test(e.value));
            const best = generic || emails.sort((a, b) => b.confidence - a.confidence)[0];
            if (best?.value) return { email: best.value, source: "hunter" };
          } catch {
            // fall through to scraping
          }
        }

        // 2. Fallback: scrape the website for mailto: links
        try {
          const url = input.websiteUrl || `https://${domain}`;
          const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Pageblitz/1.0)" },
            signal: AbortSignal.timeout(6000),
          });
          const html = await res.text();
          const matches = html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g) || [];
          const emails = Array.from(new Set(matches.map(m => m.replace("mailto:", "").toLowerCase())))
            .filter(e => !e.includes("example.com") && !e.includes("domain.com"));
          // Prefer generic emails
          const generic = emails.find(e => /^(info|kontakt|contact|hallo|hello|mail|post|office|service|anfrage)@/.test(e));
          const best = generic || emails[0];
          if (best) return { email: best, source: "scrape" };
        } catch {
          // ignore
        }

        return { email: null, source: null };
      }),

    saveStep: publicProcedure
      .input(z.object({
        websiteId: z.number(),
        step: z.number(),
        data: z.record(z.string(), z.any()),
      }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND" });
        
        // Strip any protected fields from input.data to prevent accidental overrides
        const { websiteId: _wid, id: _id, stepCurrent: _sc, status: _st, createdAt: _ca, ...safeData } = input.data as any;
        let onboarding = await getOnboardingByWebsiteId(input.websiteId);
        if (!onboarding) {
          await createOnboarding({
            websiteId: input.websiteId,
            status: "in_progress",
            stepCurrent: input.step,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...safeData,
          });
        } else {
          await updateOnboarding(input.websiteId, {
            stepCurrent: input.step,
            ...safeData,
            updatedAt: Date.now(),
          });
        }
        
        // If businessCategory changed, potentially update industry, heroImageUrl and colorScheme
        if (safeData.businessCategory) {
          const newCategory = safeData.businessCategory;
          const biz = website.businessId ? await getBusinessById(website.businessId) : undefined;
          const bizName = biz?.name || "";
          const industryContext = buildIndustryContext(newCategory, bizName);
          const heroImageUrl = getHeroImageUrl(newCategory, bizName);
          const colorScheme = getIndustryColorScheme(newCategory, bizName);
          
          await updateWebsite(input.websiteId, { 
            industry: newCategory, 
            heroImageUrl, 
            colorScheme 
          });
        }

        // If colorScheme changed, immediately update colorScheme in generated_websites
        // so the Preview page shows the same colors as the Onboarding Chat live preview.
        if (safeData.colorScheme) {
          const existingCs = (website.colorScheme as any) || {};
          const updatedCs = {
            ...existingCs,
            ...safeData.colorScheme,
          };
          await updateWebsite(input.websiteId, { colorScheme: updatedCs });
        }
        
        return { success: true, step: input.step };
      }),
    
    complete: publicProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND" });
        
        const onboarding = await getOnboardingByWebsiteId(input.websiteId);
        if (!onboarding) throw new TRPCError({ code: "NOT_FOUND", message: "Onboarding not found" });
        
        // Determine the effective category: prefer user-chosen onboarding category over original GMB category
        const effectiveCategory = (onboarding as any).businessCategory || (website as any).business?.category || "Dienstleistung";
        
        // If user didn't provide custom services, fall back to industry defaults from the profile
        let topServices = onboarding.topServices;
        if (!topServices || (Array.isArray(topServices) && topServices.length === 0)) {
          const profile = getIndustryProfile(effectiveCategory);
          if (profile) {
            topServices = profile.services.slice(0, 5).map(s => ({ title: s.title, description: s.description, icon: s.icon }));
          }
        }
        
        // Patch website data with real onboarding content (no redesign)
        const patchedData = patchWebsiteData(website.websiteData, {
          businessName: onboarding.businessName,
          tagline: onboarding.tagline,
          description: onboarding.description,
          usp: onboarding.usp,
          targetAudience: onboarding.targetAudience,
          topServices,
          addOnMenuData: (onboarding as any).addOnMenuData,
          addOnPricelistData: (onboarding as any).addOnPricelistData,
          addOnContactForm: onboarding.addOnContactForm ?? undefined,
          logoUrl: onboarding.logoUrl,
          photoUrls: onboarding.photoUrls,
        });
        
        // Also update the business category in the business table if it changed
        if ((onboarding as any).businessCategory && website.businessId) {
          try {
            await updateBusiness(website.businessId, { category: (onboarding as any).businessCategory });
          } catch { /* non-critical */ }
        }
        
        // Generate legal pages if legal data is present
        let impressumHtml: string | null = null;
        let datenschutzHtml: string | null = null;
        
        if (onboarding.legalOwner && onboarding.legalEmail) {
          const legalData = {
            businessName: onboarding.businessName || (website.websiteData as any)?.businessName || "Unternehmen",
            legalOwner: onboarding.legalOwner,
            legalStreet: onboarding.legalStreet || "",
            legalZip: onboarding.legalZip || "",
            legalCity: onboarding.legalCity || "",
            legalCountry: onboarding.legalCountry || "Deutschland",
            legalEmail: onboarding.legalEmail,
            legalPhone: onboarding.legalPhone || undefined,
            legalVatId: onboarding.legalVatId || undefined,
            legalRegister: onboarding.legalRegister || undefined,
            legalRegisterCourt: onboarding.legalRegisterCourt || undefined,
            legalResponsible: onboarding.legalResponsible || undefined,
          };
          impressumHtml = generateImpressum(legalData);
          datenschutzHtml = generateDatenschutz(legalData);
        }
        
        // Patch color scheme with user's chosen brand colors
        const existingColorScheme = (website.colorScheme as any) || {};
        const patchedColorScheme = {
          ...existingColorScheme,
          ...(onboarding.colorScheme || {}),
        };

        // Save patched data and legal pages
        const websiteUpdateData: any = {
          websiteData: {
            ...(patchedData || {}),
            impressumHtml,
            datenschutzHtml,
            hasLegalPages: !!(impressumHtml && datenschutzHtml),
          },
          colorScheme: patchedColorScheme,
          onboardingStatus: "completed",
          hasLegalPages: !!(impressumHtml && datenschutzHtml),
          status: "active",
        };
        // Persist hero and about photo URLs chosen during onboarding
        if (onboarding.heroPhotoUrl) websiteUpdateData.heroImageUrl = onboarding.heroPhotoUrl;
        if (onboarding.aboutPhotoUrl) websiteUpdateData.aboutImageUrl = onboarding.aboutPhotoUrl;
        await updateWebsite(input.websiteId, websiteUpdateData);
        
        // Mark onboarding as completed
        await updateOnboarding(input.websiteId, {
          status: "completed",
          completedAt: Date.now(),
          updatedAt: Date.now(),
        });
        
        // Notify owner
        await notifyOwner({
          title: "Onboarding abgeschlossen",
          content: `Website ${website.slug} wurde durch Onboarding aktiviert.`,
        });
        
        return { success: true };
      }),
    
    // Upload logo during onboarding
    uploadLogo: publicProcedure
      .input(z.object({
        websiteId: z.number(),
        imageData: z.string(),
        mimeType: z.string().default("image/png"),
      }))
      .mutation(async ({ input }) => {
        const result = await uploadLogo(input.imageData, input.mimeType, input.websiteId);
        await updateOnboarding(input.websiteId, {
          logoUrl: result.url,
          updatedAt: Date.now(),
        });
        return { url: result.url, key: result.key };
      }),
    
    // Upload photos during onboarding
    uploadPhoto: publicProcedure
      .input(z.object({
        websiteId: z.number(),
        imageData: z.string(),
        mimeType: z.string().default("image/jpeg"),
        index: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const result = await uploadPhoto(input.imageData, input.mimeType, input.websiteId, input.index);
        
        // Append to existing photo URLs
        const onboarding = await getOnboardingByWebsiteId(input.websiteId);
        const existingPhotos = Array.isArray(onboarding?.photoUrls) ? onboarding.photoUrls as string[] : [];
        const updatedPhotos = [...existingPhotos, result.url];
        
        await updateOnboarding(input.websiteId, {
          photoUrls: updatedPhotos as any,
          updatedAt: Date.now(),
        });
        return { url: result.url, key: result.key, totalPhotos: updatedPhotos.length };
      }),

    // Get industry-specific photo suggestions for the hero image step
    getPhotoSuggestions: publicProcedure
      .input(z.object({ category: z.string(), businessName: z.string().optional() }))
      .query(async ({ input }) => {
        const { getIndustryImages } = await import('./industryImages');
        const imageSet = getIndustryImages(input.category);
        const rawSuggestions = [
          ...imageSet.hero.slice(0, 4),
          ...(imageSet.gallery || []).slice(0, 2),
        ].slice(0, 6);

        const suggestions = rawSuggestions.map((url) => {
          // Unsplash URL transformation for thumbnails: w=400, q=70
          const thumb = url.replace(/w=\d+/, "w=400").replace(/q=\d+/, "q=70");
          return {
            url,
            thumb,
            alt: input.category,
          };
        });

        return { suggestions };
      }),
  }),

  // ── Self-Service: Start without GMB ────────────────────────────────
  // ── Customer Dashboard ──────────────────────────────
  customer: router({
    getMyWebsites: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const rows = await getWebsitesByUserId(userId);
      // Enrich with business data
      const results = await Promise.all(
        rows.map(async (row) => {
          const business = await getBusinessById(row.website.businessId);
          return { website: row.website, subscription: row.subscription, business };
        })
      );
      return results;
    }),
    updateWebsiteContent: protectedProcedure
      .input(z.object({
        websiteId: z.number(),
        patch: z.object({
          tagline: z.string().optional(),
          description: z.string().optional(),
          businessName: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          address: z.string().optional(),
          heroPhotoUrl: z.string().optional(),
          aboutPhotoUrl: z.string().optional(),
          brandColor: z.string().optional(),
          brandSecondaryColor: z.string().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership via subscription
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find((r) => r.website.id === input.websiteId);
        if (!owned) throw new TRPCError({ code: "FORBIDDEN", message: "Website gehört nicht zu deinem Account" });
        const website = owned.website;
        // Patch websiteData
        const websiteData = (website.websiteData as any) || {};
        const { tagline, description, businessName, phone, email, address, heroPhotoUrl, aboutPhotoUrl } = input.patch;
        if (tagline !== undefined) websiteData.tagline = tagline;
        if (description !== undefined) websiteData.description = description;
        if (businessName !== undefined) websiteData.businessName = businessName;
        // Patch sections
        if ((tagline || description) && Array.isArray(websiteData.sections)) {
          websiteData.sections = websiteData.sections.map((s: any) => {
            if (s.type === "hero") {
              return { ...s, headline: tagline ?? s.headline, subheadline: description ?? s.subheadline };
            }
            return s;
          });
        }
        // Patch color scheme
        const colorScheme = (website.colorScheme as any) || {};
        if (input.patch.brandColor) colorScheme.primary = input.patch.brandColor;
        if (input.patch.brandSecondaryColor) colorScheme.secondary = input.patch.brandSecondaryColor;
        const updateData: any = { websiteData, colorScheme };
        if (heroPhotoUrl !== undefined) updateData.heroImageUrl = heroPhotoUrl;
        if (aboutPhotoUrl !== undefined) updateData.aboutImageUrl = aboutPhotoUrl;
        // Patch business contact info
        if (phone !== undefined || email !== undefined || address !== undefined) {
          const biz = await getBusinessById(website.businessId);
          if (biz) {
            await updateBusiness(biz.id, {
              ...(phone !== undefined ? { phone } : {}),
              ...(email !== undefined ? { email } : {}),
              ...(address !== undefined ? { address } : {}),
            });
          }
        }
        await updateWebsite(input.websiteId, updateData);
        return { success: true };
      }),
    setWebsiteActive: adminProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        await updateWebsite(input.websiteId, { status: "active" });
        return { success: true };
      }),
    createTestSubscription: adminProcedure
      .input(z.object({ websiteId: z.number(), userId: z.number() }))
      .mutation(async ({ input }) => {
        // Check if subscription already exists
        const existing = await getSubscriptionByWebsiteId(input.websiteId);
        if (existing) {
          // Update userId
          await updateSubscriptionByWebsiteId(input.websiteId, { userId: input.userId });
        } else {
          await createSubscription({
            websiteId: input.websiteId,
            userId: input.userId,
            status: "active",
            plan: "base",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
        await updateWebsite(input.websiteId, { status: "active" });
        return { success: true };
      }),
  }),

  selfService: router({
    /**
     * Resolve a Google share link (share.google/xxx, maps.app.goo.gl/xxx,
     * or a full google.com/maps/place/... URL) to a business name and
     * optionally a Place ID for data pre-fill.
     */
    resolveLink: publicProcedure
      .input(z.object({ url: z.string() }))
      .mutation(async ({ input }) => {
        const url = input.url.trim();

        // ── Pattern 1: share.google/CODE ─────────────────────────────────
        if (/share\.google\//.test(url)) {
          try {
            // Step 1: follow the first redirect to google.com/share.google?q=...
            const r1 = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(8000) });
            const loc = r1.headers.get("location") || "";
            if (!loc) return { resolved: false, businessName: null, placeId: null };

            // Step 2: fetch the google.com/share.google page and extract search query
            const r2 = await fetch(loc, { redirect: "follow", signal: AbortSignal.timeout(8000) });
            const html = await r2.text();

            // The page contains a fallback link like /search?q=SCHAU+%26+HORCH
            const match = html.match(/\/search\?q=([^"&<>]+)/);
            if (!match) return { resolved: false, businessName: null, placeId: null };
            const businessName = decodeURIComponent(match[1].replace(/\+/g, " "));

            // Step 3: search Places API with the extracted name
            const placesResult = await makeRequest<PlacesSearchResult>(
              "/maps/api/place/textsearch/json",
              { query: businessName, language: "de" }
            );
            const place = placesResult.results?.[0];
            if (!place) return { resolved: true, businessName, placeId: null, address: null, phone: null, category: null };

            // Step 4: fetch place details
            const details = await makeRequest<PlaceDetailsResult>(
              "/maps/api/place/details/json",
              { place_id: place.place_id, fields: "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,types,reviews", language: "de" }
            );
            const r = details.result;
            return {
              resolved: true,
              businessName: r?.name || businessName,
              placeId: place.place_id,
              address: r?.formatted_address || place.formatted_address || null,
              phone: r?.formatted_phone_number || null,
              website: r?.website || null,
              rating: r?.rating || null,
              reviewCount: r?.user_ratings_total || 0,
              category: place.types?.[0]?.replace(/_/g, " ") || null,
              openingHours: r?.opening_hours?.weekday_text || [],
              reviews: r?.reviews || [],
            };
          } catch {
            return { resolved: false, businessName: null, placeId: null };
          }
        }

        // ── Pattern 2: maps.app.goo.gl/CODE (short link) ─────────────────
        if (/maps\.app\.goo\.gl\//.test(url)) {
          try {
            const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(8000) });
            const finalUrl = r.url;
            // Extract place name from URL: /maps/place/NAME/@...
            const nameMatch = finalUrl.match(/\/maps\/place\/([^/@?]+)/);
            const placeIdMatch = finalUrl.match(/0x[0-9a-f]+:0x[0-9a-f]+/i);
            if (nameMatch) {
              const businessName = decodeURIComponent(nameMatch[1].replace(/\+/g, " "));
              return { resolved: true, businessName, placeId: placeIdMatch?.[0] || null };
            }
            return { resolved: false, businessName: null, placeId: null };
          } catch {
            return { resolved: false, businessName: null, placeId: null };
          }
        }

        // ── Pattern 3: Full google.com/maps/place/NAME/... URL ────────────
        const fullUrlMatch = url.match(/google\.com\/maps\/place\/([^/@?]+)/);
        if (fullUrlMatch) {
          const businessName = decodeURIComponent(fullUrlMatch[1].replace(/\+/g, " "));
          return { resolved: true, businessName, placeId: null };
        }

        return { resolved: false, businessName: null, placeId: null };
      }),

    generateWebsite: publicProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
        // Already has content – skip re-generation
        if (website.websiteData) return { success: true, alreadyGenerated: true };

        const business = await getBusinessById(website.businessId);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });

        const category = business.category || "Dienstleistung";
        const industryContext = buildIndustryContext(category, business.name);
        const personalityHint = buildPersonalityHint(business.name, business.rating, business.reviewCount || 0);
        const colorScheme = getIndustryColorScheme(category, business.name);
        const { pool: layoutPool, industryKey } = getLayoutPool(category, business.name);
        const layoutStyle = await getNextLayoutForIndustry(industryKey, layoutPool);
        const heroImageUrl = getHeroImageUrl(category, business.name);
        const galleryImages = getGalleryImages(category, business.name);
        const gmbPhotos = business.placeId && !business.placeId.startsWith("self-") ? await getGmbPhotos(business.placeId, 7) : [];
        const matchingTemplates = selectTemplatesForIndustry(category, business.name, 3);
        const templateStyleDesc = getTemplateStyleDescription(matchingTemplates);
        const baseTemplateImageUrls = getTemplateImageUrls(matchingTemplates);
        const uploadedTemplates = await listTemplateUploadsByPool(industryKey, layoutStyle);
        const uploadedImageUrls = uploadedTemplates.slice(0, 3).map((t: any) => t.imageUrl);
        const templateImageUrls = [...uploadedImageUrls, ...baseTemplateImageUrls].slice(0, 5);

        let hoursText = "Nicht angegeben";
        if (business.openingHours && Array.isArray(business.openingHours) && (business.openingHours as string[]).length > 0) {
          hoursText = (business.openingHours as string[]).join(", ");
        }

        const prompt = buildEnhancedPrompt({ business: { ...business, openingHours: business.openingHours as string[] | null }, category, industryContext, personalityHint, layoutStyle, colorScheme, templateStyleDesc, hoursText });

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Du bist ein PREISGEKRÖNTER Awwwards-Level Webtexter und Design-Direktor für lokale Unternehmen in Deutschland. Antworte AUSSCHLIESSLICH mit validem JSON ohne Markdown-Codeblöcke." },
            ...(templateImageUrls.length > 0 ? [{
              role: "user" as const,
              content: [
                { type: "text" as const, text: `DESIGN-REFERENZEN: ${templateImageUrls.length} professionelle Website-Templates als Qualitätsreferenz.` },
                ...templateImageUrls.map(url => ({ type: "image_url" as const, image_url: { url, detail: "low" as const } }))
              ]
            }] : []),
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== "string") throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KI-Generierung fehlgeschlagen" });

        let websiteData: any;
        try {
          const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
          websiteData = JSON.parse(cleaned);
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KI hat kein valides JSON zurückgegeben" });
        }

        const finalHeroImageUrl = gmbPhotos.length > 0 ? gmbPhotos[0] : heroImageUrl;
        const effectiveGalleryImages = gmbPhotos.length >= 3 ? gmbPhotos.slice(1) : galleryImages;
        if (effectiveGalleryImages.length > 0 && websiteData.sections) {
          const gallerySection = websiteData.sections.find((s: any) => s.type === "gallery");
          if (gallerySection) gallerySection.images = effectiveGalleryImages;
        }
        if (business.rating) websiteData.googleRating = parseFloat(business.rating);
        if (business.reviewCount) websiteData.googleReviewCount = business.reviewCount;

        const realReviews = (business as any).googleReviews as Array<{ author_name: string; rating: number; text: string; time: number }> | null;
        if (realReviews && realReviews.length >= 3 && websiteData.sections) {
          const testimonialsSection = websiteData.sections.find((s: any) => s.type === "testimonials");
          if (testimonialsSection) {
            const topReviews = realReviews.filter((r) => r.text && r.text.length >= 50).sort((a, b) => b.rating - a.rating).slice(0, 5).map((r) => ({ title: r.text.slice(0, 60) + (r.text.length > 60 ? "\u2026" : ""), description: r.text, author: r.author_name, rating: r.rating, isRealReview: true }));
            if (topReviews.length >= 2) { testimonialsSection.items = topReviews; testimonialsSection.isRealReviews = true; }
          }
        }

        if (websiteData.designTokens) {
          const dt = websiteData.designTokens;
          if (!["none","sm","md","lg","full"].includes(dt.borderRadius)) dt.borderRadius = "md";
          if (!["none","flat","soft","dramatic","glow"].includes(dt.shadowStyle)) dt.shadowStyle = "soft";
          if (!["tight","normal","spacious","ultra"].includes(dt.sectionSpacing)) dt.sectionSpacing = "normal";
          if (!["filled","outline","ghost","pill"].includes(dt.buttonStyle)) dt.buttonStyle = "filled";
          if (!Array.isArray(dt.sectionBackgrounds) || dt.sectionBackgrounds.length < 2) dt.sectionBackgrounds = [colorScheme.background, colorScheme.surface, colorScheme.background];
          if (dt.headlineFont && dt.headlineFont.includes("[")) dt.headlineFont = "Playfair Display";
          if (dt.bodyFont && dt.bodyFont.includes("[")) dt.bodyFont = "Inter";
          const FORBIDDEN_BODY_FONTS = ["lora","playfair","merriweather","georgia","cormorant","fraunces","dm serif","crimson","garamond","times","palatino","baskerville","didot"];
          if (dt.bodyFont && FORBIDDEN_BODY_FONTS.some(f => dt.bodyFont!.toLowerCase().includes(f))) dt.bodyFont = "Inter";
          if (!dt.accentColor || dt.accentColor.includes("[")) dt.accentColor = colorScheme.accent;
          if (!dt.textColor || dt.textColor.includes("[")) dt.textColor = colorScheme.text;
          if (!dt.backgroundColor || dt.backgroundColor.includes("[")) dt.backgroundColor = colorScheme.background;
          if (!dt.cardBackground || dt.cardBackground.includes("[")) dt.cardBackground = colorScheme.surface;
        }

        await updateWebsite(input.websiteId, { websiteData, colorScheme, industry: category, heroImageUrl: finalHeroImageUrl, layoutStyle });
        return { success: true, alreadyGenerated: false };
      }),

    start: publicProcedure
      .input(z.object({
        gmbUrl: z.string().optional(), // optional GMB URL
        businessName: z.string().optional(), // optional pre-filled name
        placeId: z.string().optional(), // optional Place ID from resolveLink
        address: z.string().optional(),
        phone: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Create a placeholder business
        const placeholderName = input.businessName || "Neues Unternehmen";
        const baseSlug = slugify(placeholderName);
        const uniqueSlug = `${baseSlug}-${nanoid(6)}`;
        const businessId = await upsertBusiness({
          name: placeholderName,
          slug: uniqueSlug,
          placeId: input.placeId || `self-${nanoid(8)}`,
          category: input.category || "",
          address: input.address || "",
          phone: input.phone || "",
        });
        // Create a preview website
        const previewToken = nanoid(32);
        const websiteSlug = `preview-${uniqueSlug}`;
        const websiteId = await createGeneratedWebsite({
          businessId,
          slug: websiteSlug,
          status: "preview",
          previewToken,
          onboardingStatus: "in_progress",
        });
        // Create onboarding record
        await createOnboarding({
          websiteId,
          status: "in_progress",
          stepCurrent: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        return { previewToken, websiteId };
      }),
  }),
});

export type AppRouter = typeof appRouter;
