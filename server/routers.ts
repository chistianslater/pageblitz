import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  upsertBusiness, getBusinessById, listBusinesses, countBusinesses, updateBusiness,
  createGeneratedWebsite, getWebsiteById, getWebsiteBySlug, getWebsiteByFormerSlug, getWebsiteByToken, getWebsiteByBusinessId,
  listWebsites, countWebsites, updateWebsite,
  createOutreachEmail, listOutreachEmails, countOutreachEmails,
  getDashboardStats,
  createTemplateUpload, listTemplateUploads, listTemplateUploadsByIndustry, listTemplateUploadsByPool, deleteTemplateUpload,
  updateTemplateUpload, getTemplateUploadById, parseIndustries,
  createSubscription, getSubscriptionByWebsiteId, updateSubscriptionByWebsiteId, updateSubscription,
  createOnboarding, getOnboardingByWebsiteId, updateOnboarding,
  deleteWebsite, deleteBusiness, getWebsitesByUserId,
  getLeadFunnelStats, listExternalLeads, countExternalLeads,
  createGenerationJob, getGenerationJobById, getGenerationJobByWebsiteId, updateGenerationJob,
  updateUser, getUserByOpenId,
  createContactSubmission, getContactSubmissionsByWebsiteId, countUnreadSubmissions,
  markSubmissionRead, countRecentSubmissionsByIp, archiveSubmission, deleteContactSubmission,
} from "./db";
import type { InsertUser } from "../drizzle/schema";
import { makeRequest, type PlacesSearchResult, type PlaceDetailsResult } from "./_core/map";
import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";
import { getHeroImageUrl, getGalleryImages, getIndustryColorScheme, getLayoutStyle, getLayoutPool, getIndustryImages, getContrastColor } from "./industryImages";
import { uploadPhoto } from "./onboardingUpload";
import { getNextLayoutForIndustry } from "./db";
import { selectTemplatesForIndustry, getTemplateStyleDescription, getTemplateImageUrls } from "./templateSelector";
import { analyzeWebsite } from "./websiteAnalysis";
import { generateImpressum, generateDatenschutz, patchWebsiteData } from "./legalGenerator";
import { registerUmamiWebsite, getUmamiStats } from "./umami";
import { getIndustryServicesSeed, getIndustryProfile } from "@shared/industryServices";
import { getLayoutFonts, getLLMFontPrompt, FORBIDDEN_BODY_FONTS, DESIGN_TOKEN_CONFIG } from "@shared/layoutConfig";
import { uploadLogo, uploadPhoto } from "./onboardingUpload";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
// Compat client with older API — current_period_end not in 2026-02-25.clover
const stripeCompat = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-04-10" as any });

const PRICING = {
  base: {
    monthly: 2490,  // 24,90 €/Monat (monatliche Abrechnung)
    yearly:  1990,  // 19,90 €/Monat (jährliche Abrechnung, monatlich abgebucht)
  },
  addon: 390,       // 3,90 € pro Add-on (unabhängig vom Billing-Interval)
} as const;

// Add-on-Typen für Stripe Checkout (Extra-Seite folgt später zu 6,90 €)
type AddOnKey = "contactForm" | "gallery" | "menu" | "pricelist";
const ADDON_NAMES: Record<AddOnKey, string> = {
  contactForm: "Kontaktformular",
  gallery:     "Bildergalerie",
  menu:        "Speisekarte",
  pricelist:   "Preisliste",
};

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[äöüß]/g, m => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[m] || m))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

/**
 * Converts an array of DayHours objects into a human-readable opening hours string.
 * Consecutive days with identical times are grouped (e.g. "Montag – Freitag: 09:00 – 18:00 Uhr").
 */
function formatOpeningHoursText(hours: Array<{ day: string; open: boolean; from: string; to: string }>): string {
  const open = hours.filter(h => h.open);
  if (open.length === 0) return '';
  const lines: string[] = [];
  let i = 0;
  while (i < open.length) {
    let j = i;
    while (j + 1 < open.length && open[j + 1].from === open[i].from && open[j + 1].to === open[i].to) j++;
    const range = i === j ? open[i].day : `${open[i].day} – ${open[j].day}`;
    lines.push(`${range}: ${open[i].from} – ${open[i].to} Uhr`);
    i = j + 1;
  }
  return lines.join('\n');
}

// Generic Google Places types that apply to virtually every business – not useful as category
const GENERIC_GMB_TYPES = new Set([
  "establishment", "point_of_interest", "local_business", "store", "food",
  "premise", "political", "geocode", "route",
]);

/**
 * Pick the most specific category from a Google Places `types` array.
 * Filters out generic catch-all types and returns a human-readable string.
 */
function extractGmbCategory(types?: string[]): string | null {
  if (!types?.length) return null;
  const specific = types.find(t => !GENERIC_GMB_TYPES.has(t));
  return specific ? specific.replace(/_/g, " ") : null;
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
    // Build photo URLs – direct Google API or Forge proxy
    const isDirectGoogle = !!ENV.googlePlacesApiKey;
    const baseUrl = isDirectGoogle
      ? "https://maps.googleapis.com"
      : (ENV.forgeApiUrl || "").replace(/\/+$/, "");
    const apiKey = isDirectGoogle ? ENV.googlePlacesApiKey : ENV.forgeApiKey || "";
    if (!baseUrl || !apiKey) return [];
    const photoPath = isDirectGoogle
      ? "/maps/api/place/photo"
      : "/v1/maps/proxy/maps/api/place/photo";
    return photos.slice(0, maxPhotos).map((p) => {
      const url = new URL(`${baseUrl}${photoPath}`);
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
    typography: { headers: "Fraunces, serif", body: "Outfit, sans-serif" },
    patterns: ["asymmetric-grid", "full-bleed-images", "editorial-layout"],
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
    typography: { headers: "Plus Jakarta Sans, sans-serif", body: "Instrument Sans, sans-serif" },
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
    typography: { headers: "Fraunces, serif", body: "Outfit, sans-serif" },
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
    typography: { headers: "Space Grotesque, sans-serif", body: "Plus Jakarta Sans, sans-serif" },
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
    typography: { headers: "Bricolage Grotesque, sans-serif", body: "Instrument Sans, sans-serif" },
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
    typography: { headers: "Plus Jakarta Sans, sans-serif", body: "Inter, sans-serif" },
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
    typography: { headers: "Instrument Sans, sans-serif", body: "Inter, sans-serif" },
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
    typography: { headers: "Bricolage Grotesque, sans-serif", body: "Plus Jakarta Sans, sans-serif" },
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
    typography: { headers: "Fraunces, serif", body: "Instrument Sans, sans-serif" },
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
    typography: { headers: "Syne, sans-serif", body: "Plus Jakarta Sans, sans-serif" },
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
    typography: { headers: "Fraunces, serif", body: "Instrument Sans, sans-serif" },
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
    typography: { headers: "Instrument Sans, sans-serif", body: "Inter, sans-serif" },
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

/** Builds a simplified generation prompt for faster AI processing */
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
  addressingMode?: string; // "du" | "Sie"
}): string {
  const { business, category, industryContext, layoutStyle, colorScheme, hoursText, isRegenerate, addressingMode } = opts;
  const archetype = DESIGN_ARCHETYPES[layoutStyle] || DESIGN_ARCHETYPES["modern"];
  const year = new Date().getFullYear();

  // Vereinfachter Prompt für schnellere Generation (~500 Tokens statt ~2000)
  return `Erstelle Website-Inhalte für ${business.name} (${category}).

UNTERNEHMEN:
- Name: ${business.name}
- Branche: ${category}
- Adresse: ${business.address || "Nicht angegeben"}
- Bewertung: ${business.rating ? business.rating + "/5" : "Nicht verfügbar"}
- Öffnungszeiten: ${hoursText}

STIL: ${archetype.name} - ${archetype.aesthetic.substring(0, 60)}
FARBEN: 60% ${archetype.colors.background}, 30% ${colorScheme.primary}, 10% ${colorScheme.accent}

REGELN:
1. ALLE TEXTE AUF DEUTSCH
2. KEINE generischen Phrasen wie "Ihr Partner für..."
3. Der KUNDE ist der Held, ${business.name} ist der Guide
4. Authentische deutsche Kundennamen in Testimonials
5. ANREDE: ${addressingMode === 'Sie' ? 'Besucher IMMER siezen – "Wir helfen Ihnen", "Ihre Website", "Sie profitieren" – KEIN "du/dein/dir"' : 'Besucher IMMER duzen – "Wir helfen dir", "deine Website", "du profitierst" – KEIN "Sie/Ihnen/Ihr"'}
${isRegenerate ? "6. ANDERE Perspektive als zuvor wählen" : ""}

JSON-AUSGABE:
{
  "businessName": "${business.name}",
  "tagline": "Kurzer Slogan max 8 Wörter",
  "description": "2 Sätze über das Unternehmen",
  "sections": [
    {
      "type": "hero",
      "headline": "Hauptüberschrift max 7 Wörter",
      "subheadline": "1-2 Sätze: erst das Kundenproblem oder den Schmerz nennen, dann die Lösung – aus Kundenperspektive",
      "ctaText": "Button-Text"
    },
    {
      "type": "services",
      "headline": "Unsere Leistungen",
      "items": [
        {"title": "Leistung 1", "description": "2 Sätze", "icon": "Wrench"},
        {"title": "Leistung 2", "description": "2 Sätze", "icon": "Star"},
        {"title": "Leistung 3", "description": "2 Sätze", "icon": "Heart"}
      ]
    },
    {
      "type": "about",
      "headline": "Kurze Über-uns-Überschrift max 5 Wörter",
      "content": "2-3 authentische Sätze über das Unternehmen, seine Stärken, Werte und was es von der Konkurrenz unterscheidet. Konkret und spezifisch für diese Branche."
    },
    {
      "type": "process",
      "headline": "So einfach geht's",
      "items": [
        {"step": "1", "title": "Schritt 1 Titel", "description": "1 Satz – branchenspezifisch, wie der Kunde Kontakt aufnimmt"},
        {"step": "2", "title": "Schritt 2 Titel", "description": "1 Satz – was beim Beratungs- oder Planungsgespräch passiert"},
        {"step": "3", "title": "Schritt 3 Titel", "description": "1 Satz – das konkrete Ergebnis, das der Kunde erhält"}
      ]
    },
    {
      "type": "cta",
      "headline": "CTA-Überschrift",
      "content": "Kurzer Text",
      "ctaText": "Jetzt anfragen"
    }
  ],
  "seoTitle": "${business.name} - ${category}",
  "footer": {"text": "© ${year} ${business.name}. Alle Rechte vorbehalten."},
  "designTokens": {
    "accentColor": "${colorScheme.accent}",
    "backgroundColor": "${archetype.colors.background}",
    "archetype": "${archetype.name}"
  }
}`;
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

/**
 * Classifies a business into one of our predefined industry keys using AI.
 * This ensures better image/color matching than simple keyword string matching.
 */
async function classifyIndustry(category: string, businessName: string): Promise<string> {
  const prompt = `Classify this business into exactly ONE of the following industry keys.
Keys: friseur, restaurant, pizza, bar, cafe, hotel, bauunternehmen, handwerk, fitness, beauty, medizin, immobilien, baeckerei, beratung, reinigung, auto, fotografie, garten, tech.
If you are uncertain or the business doesn't fit any specifically, return "default".

Business Category: ${category}
Business Name: ${businessName}

Return ONLY the key (one word, lowercase).`;

  try {
    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
    });

    const rawContent = response.choices[0]?.message?.content;
    const contentStr = typeof rawContent === "string" ? rawContent : "";
    const key = contentStr.trim().toLowerCase().replace(/[^a-z]/g, "") || "default";
    const validKeys = ["friseur", "restaurant", "pizza", "bar", "cafe", "hotel", "bauunternehmen", "handwerk", "fitness", "beauty", "medizin", "immobilien", "baeckerei", "beratung", "reinigung", "auto", "fotografie", "garten", "tech", "default"];
    return validKeys.includes(key) ? key : "default";
  } catch (error) {
    console.error("Industry classification failed:", error);
    return "default";
  }
}

// ── Background Website Generation Worker ────────────────────────────────────

/**
 * Returns industry-specific 3-step process section.
 * Always overrides LLM output for reliable, on-brand content.
 */
function buildProcessSection(category: string): { headline: string; items: Array<{ step: string; title: string; description: string }> } {
  const cat = (category || '').toLowerCase();

  if (cat.includes('restaurant') || cat.includes('gastro')) return {
    headline: "So einfach geht's",
    items: [
      { step: "1", title: "Reservieren", description: "Tisch online, per Telefon oder App reservieren – auch kurzfristig möglich." },
      { step: "2", title: "Ankommen", description: "Herzliche Begrüßung und persönlicher Service von Anfang an." },
      { step: "3", title: "Genießen", description: "Frische Küche und aufmerksamer Service für einen unvergesslichen Abend." },
    ],
  };
  if (cat.includes('café') || cat.includes('cafe') || cat.includes('bistro') || cat.includes('bäckerei') || cat.includes('bakery')) return {
    headline: "Ihr Moment zum Durchatmen",
    items: [
      { step: "1", title: "Reinkommen", description: "Einfach vorbeikommen – Reservierung ist auf Wunsch auch möglich." },
      { step: "2", title: "Auswählen", description: "Frische Backwaren, Spezialitäten und hochwertige Kaffeespezialitäten genießen." },
      { step: "3", title: "Entspannen", description: "Genuss und Pause in gemütlicher Atmosphäre." },
    ],
  };
  if (cat.includes('bar') || cat.includes('tapas') || cat.includes('lounge')) return {
    headline: "Ihr Abend beginnt hier",
    items: [
      { step: "1", title: "Tisch reservieren", description: "Online oder telefonisch Ihren Platz für den Abend sichern." },
      { step: "2", title: "Ankommen & bestellen", description: "Entspannte Atmosphäre, handgemachte Drinks und ein aufmerksames Team." },
      { step: "3", title: "Unvergesslicher Abend", description: "Gute Gesellschaft, tolle Musik und ein Abend, der in Erinnerung bleibt." },
    ],
  };
  if (cat.includes('friseur') || cat.includes('hair')) return {
    headline: "Ihr Weg zum neuen Look",
    items: [
      { step: "1", title: "Termin buchen", description: "Einfach online oder telefonisch Ihren Wunschtermin auswählen." },
      { step: "2", title: "Beratung & Styling", description: "Persönliche Stilberatung und professionelle Umsetzung Ihres Wunsch-Looks." },
      { step: "3", title: "Strahlendes Ergebnis", description: "Sie verlassen den Salon mit einem frischen, gepflegten Erscheinungsbild." },
    ],
  };
  if (cat.includes('beauty') || cat.includes('kosmetik') || cat.includes('nails') || cat.includes('massage') || cat.includes('spa') || cat.includes('wellness')) return {
    headline: "Ihr Weg zur Auszeit",
    items: [
      { step: "1", title: "Termin buchen", description: "Online oder telefonisch schnell und unkompliziert reservieren." },
      { step: "2", title: "Ankommen & Entspannen", description: "Wir empfangen Sie herzlich und kümmern uns um jedes Detail." },
      { step: "3", title: "Verwöhnendes Ergebnis", description: "Sie gehen entspannt und gepflegt – genau so, wie Sie es verdienen." },
    ],
  };
  if (cat.includes('bau') || cat.includes('handwerk') || cat.includes('renovier') || cat.includes('maler') || cat.includes('elektro') || cat.includes('sanitär') || cat.includes('heizung') || cat.includes('zimmerer') || cat.includes('schreiner') || cat.includes('tischler')) return {
    headline: "Von der Anfrage zum fertigen Projekt",
    items: [
      { step: "1", title: "Kostenlose Anfrage", description: "Beschreiben Sie Ihr Projekt – wir melden uns innerhalb von 24 Stunden." },
      { step: "2", title: "Kostenvoranschlag", description: "Transparenter Festpreis nach Besichtigung – keine versteckten Kosten." },
      { step: "3", title: "Saubere Ausführung", description: "Pünktliche, professionelle Arbeit mit Qualitätsgarantie." },
    ],
  };
  if (cat.includes('fitness') || cat.includes('sport') || cat.includes('gym') || cat.includes('personal') || cat.includes('yoga') || cat.includes('pilates')) return {
    headline: "Ihr Weg zu Ihrem Ziel",
    items: [
      { step: "1", title: "Kostenloses Probetraining", description: "Lerne uns kennen – unverbindlich und ohne Mitgliedschaft." },
      { step: "2", title: "Persönlicher Trainingsplan", description: "Individuell auf deine Ziele, deinen Körper und deine Zeit abgestimmt." },
      { step: "3", title: "Sichtbare Ergebnisse", description: "Mit konsequentem Training und Unterstützung erreichst du deine Ziele." },
    ],
  };
  if (cat.includes('arzt') || cat.includes('zahnarzt') || cat.includes('dental') || cat.includes('praxis') || cat.includes('therapeut') || cat.includes('physio') || cat.includes('med')) return {
    headline: "Ihre Gesundheit in guten Händen",
    items: [
      { step: "1", title: "Termin vereinbaren", description: "Online oder telefonisch schnell und einfach einen Termin buchen." },
      { step: "2", title: "Untersuchung & Beratung", description: "Sorgfältige Untersuchung und ausführliche Beratung in angenehmer Atmosphäre." },
      { step: "3", title: "Behandlung & Nachsorge", description: "Professionelle Behandlung und persönliche Begleitung auf dem Weg zur Genesung." },
    ],
  };
  if (cat.includes('anwalt') || cat.includes('rechts') || cat.includes('kanzlei') || cat.includes('notar')) return {
    headline: "Ihr Recht in sicheren Händen",
    items: [
      { step: "1", title: "Erstgespräch anfragen", description: "Schildern Sie Ihr Anliegen – das erste Beratungsgespräch ist kostenfrei." },
      { step: "2", title: "Fallanalyse", description: "Wir prüfen Ihre Situation und entwickeln die optimale Strategie." },
      { step: "3", title: "Durchsetzung Ihrer Rechte", description: "Professionelle Vertretung und Begleitung bis zur erfolgreichen Lösung." },
    ],
  };
  if (cat.includes('immobil') || cat.includes('makler')) return {
    headline: "Ihr Weg zur Traumimmobilie",
    items: [
      { step: "1", title: "Kostenlose Beratung", description: "Wir besprechen Ihre Wünsche und Ihr Budget in einem persönlichen Gespräch." },
      { step: "2", title: "Gezielte Suche", description: "Wir präsentieren passende Objekte aus unserem Netzwerk." },
      { step: "3", title: "Erfolgreicher Abschluss", description: "Von der Besichtigung bis zur Schlüsselübergabe – wir begleiten jeden Schritt." },
    ],
  };
  if (cat.includes('fotograf') || cat.includes('photo') || cat.includes('video') || cat.includes('film')) return {
    headline: "Ihre Momente in besten Händen",
    items: [
      { step: "1", title: "Anfrage & Beratung", description: "Erzählen Sie uns von Ihrem Wunschprojekt – kostenlose Erstberatung." },
      { step: "2", title: "Planung & Vorbereitung", description: "Gemeinsam planen wir Konzept, Locations und Ablauf für perfekte Ergebnisse." },
      { step: "3", title: "Fotos & Erinnerungen", description: "Professionell bearbeitete Bilder – pünktlich geliefert in höchster Qualität." },
    ],
  };
  if (cat.includes('auto') || cat.includes('kfz') || cat.includes('werkstatt') || cat.includes('fahrzeug')) return {
    headline: "Ihr Fahrzeug in besten Händen",
    items: [
      { step: "1", title: "Termin buchen", description: "Online oder telefonisch schnell einen Termin vereinbaren." },
      { step: "2", title: "Diagnose & Angebot", description: "Wir prüfen Ihr Fahrzeug und erstellen einen transparenten Kostenvoranschlag." },
      { step: "3", title: "Abfahrbereit", description: "Professionelle Reparatur und Wartung – Ihr Fahrzeug wartet auf Sie." },
    ],
  };
  if (cat.includes('hotel') || cat.includes('pension') || cat.includes('unterkunft') || cat.includes('ferienwohnung')) return {
    headline: "Ihr perfekter Aufenthalt",
    items: [
      { step: "1", title: "Zimmer buchen", description: "Einfach online oder telefonisch Ihren Aufenthalt reservieren." },
      { step: "2", title: "Ankommen & Wohlfühlen", description: "Herzlicher Empfang und komfortable Zimmer in entspannter Atmosphäre." },
      { step: "3", title: "Unvergesslicher Aufenthalt", description: "Persönlicher Service und alle Annehmlichkeiten für Ihre Erholung." },
    ],
  };
  if (cat.includes('it') || cat.includes('software') || cat.includes('digital') || cat.includes('web') || cat.includes('agentur')) return {
    headline: "Von der Idee zur Lösung",
    items: [
      { step: "1", title: "Anfrage stellen", description: "Beschreiben Sie Ihr Projekt oder Problem – wir melden uns schnell." },
      { step: "2", title: "Konzept & Angebot", description: "Wir analysieren Ihre Anforderungen und erstellen ein maßgeschneidertes Konzept." },
      { step: "3", title: "Umsetzung & Support", description: "Professionelle Umsetzung und langfristiger Support für Ihren Erfolg." },
    ],
  };
  // Universal fallback
  return {
    headline: "So einfach geht's",
    items: [
      { step: "1", title: "Kontakt aufnehmen", description: "Schreiben Sie uns oder rufen Sie an – wir antworten schnell und unkompliziert." },
      { step: "2", title: "Persönliche Beratung", description: "Wir analysieren Ihre Situation und zeigen Ihnen die beste Lösung." },
      { step: "3", title: "Professionelles Ergebnis", description: "Wir setzen Ihr Projekt um – zuverlässig, pünktlich und mit Qualitätsgarantie." },
    ],
  };
}

/**
 * Builds verified stats from real business data only.
 * Replaces any LLM-generated stats – every value is either from the DB or a safe universal claim.
 */
function buildVerifiedStats(business: any, category: string): Array<{title: string; description: string}> {
  const stats: Array<{title: string; description: string}> = [];
  const cat = (category || '').toLowerCase();

  // 1. Google rating (verified)
  if (business.rating && parseFloat(business.rating) >= 3) {
    stats.push({ title: `${parseFloat(business.rating).toFixed(1)}★`, description: 'Google Bewertung' });
  }

  // 2. Review count (verified) – rounded to nearest 10 if ≥ 50
  if (business.reviewCount && business.reviewCount >= 5) {
    const rc = business.reviewCount;
    const display = rc >= 50 ? `${Math.floor(rc / 10) * 10}+` : `${rc}+`;
    stats.push({ title: display, description: 'Kundenbewertungen' });
  }

  // 3. Open days per week (derived from real opening hours)
  if (business.openingHours && Array.isArray(business.openingHours)) {
    const openDays = (business.openingHours as string[]).filter((h: string) =>
      h && !h.toLowerCase().includes('geschlossen') && !h.toLowerCase().includes('closed')
    ).length;
    if (openDays >= 5 && openDays <= 7) {
      stats.push({ title: `${openDays}×`, description: 'Wochentage geöffnet' });
    }
  }

  // 4. Universal: no hidden costs (safe for any legitimate business)
  stats.push({ title: '0€', description: 'Versteckte Kosten' });

  // 5. Fill to 4 with a safe universal qualitative signal
  if (stats.length < 4) {
    const extra = cat.includes('fitness') || cat.includes('sport')
      ? { title: 'Kostenlos', description: 'Erstgespräch' }
      : cat.includes('restaurant') || cat.includes('café')
      ? { title: 'Täglich', description: 'Frisch zubereitet' }
      : { title: 'Persönlich', description: 'Betreut' };
    stats.push(extra);
  }

  return stats.slice(0, 4);
}

/** Fallback-Template-Daten wenn KI fehlschlägt */
function getFallbackWebsiteData(business: any, category: string, colorScheme: any, layoutStyle: string) {
  const year = new Date().getFullYear();
  return {
    businessName: business.name,
    tagline: "Professionelle Dienstleistungen in Ihrer Region",
    description: `${business.name} bietet erstklassige ${category}-Dienstleistungen. Kontaktieren Sie uns für eine persönliche Beratung.`,
    sections: [
      {
        type: "hero",
        headline: `Willkommen bei ${business.name}`,
        subheadline: `Ihr zuverlässiger Partner für ${category}`,
        ctaText: "Jetzt kontaktieren"
      },
      {
        type: "services",
        headline: "Unsere Leistungen",
        items: [
          { title: "Beratung", description: "Individuelle Beratung für Ihre Bedürfnisse", icon: "Users" },
          { title: "Service", description: "Professioneller Service mit Qualitätsgarantie", icon: "Star" },
          { title: "Support", description: "Langfristige Betreuung und Support", icon: "Heart" }
        ]
      },
      {
        type: "cta",
        headline: "Bereit für den nächsten Schritt?",
        content: "Kontaktieren Sie uns für ein unverbindliches Gespräch.",
        ctaText: "Termin vereinbaren"
      }
    ],
    seoTitle: `${business.name} - ${category}`,
    footer: { text: `© ${year} ${business.name}. Alle Rechte vorbehalten.` },
    designTokens: {
      accentColor: colorScheme.accent,
      backgroundColor: colorScheme.background,
      archetype: layoutStyle
    }
  };
}

/**
 * Runs website generation in the background.
 * Updates job progress and status in the database.
 */
async function runWebsiteGeneration(jobId: number, websiteId: number): Promise<void> {
  try {
    // Update job status to processing
    await updateGenerationJob(jobId, { status: "processing", progress: 10 });

    const website = await getWebsiteById(websiteId);
    if (!website) throw new Error("Website not found");

    const business = await getBusinessById(website.businessId);
    if (!business) throw new Error("Business not found");

    // Progress: 15% - Starting generation
    await updateGenerationJob(jobId, { progress: 15 });

    const category = business.category || "Dienstleistung";
    
    // PARALLEL: Industry classification + context building
    const [industryKey, industryContext, personalityHint] = await Promise.all([
      classifyIndustry(category, business.name),
      Promise.resolve(buildIndustryContext(category, business.name)),
      Promise.resolve(buildPersonalityHint(business.name, business.rating, business.reviewCount || 0))
    ]);
    
    // Progress: 25% - Industry classified
    await updateGenerationJob(jobId, { progress: 25 });

    const colorScheme = getIndustryColorScheme(category, business.name, industryKey);
    const { pool: layoutPool } = getLayoutPool(category, business.name, industryKey);
    const layoutStyle = await getNextLayoutForIndustry(industryKey, layoutPool);
    
    // Progress: 30% - Layout selected
    await updateGenerationJob(jobId, { progress: 30 });

    // PARALLEL: Alle Bilder und Templates gleichzeitig laden
    const [
      heroImageUrl,
      galleryImages,
      gmbPhotos,
      matchingTemplates
    ] = await Promise.all([
      Promise.resolve(getHeroImageUrl(category, business.name, industryKey)),
      Promise.resolve(getGalleryImages(category, business.name, industryKey)),
      business.placeId && !business.placeId.startsWith("self-") 
        ? getGmbPhotos(business.placeId, 7) 
        : Promise.resolve([]),
      Promise.resolve(selectTemplatesForIndustry(category, business.name, 3))
    ]);
    
    const templateStyleDesc = getTemplateStyleDescription(matchingTemplates);
    const baseTemplateImageUrls = getTemplateImageUrls(matchingTemplates);
    
    // Templates aus DB parallel laden
    const uploadedTemplates = await listTemplateUploadsByPool(industryKey, layoutStyle);
    const uploadedImageUrls = uploadedTemplates.slice(0, 3).map((t: any) => t.imageUrl);
    const templateImageUrls = [...uploadedImageUrls, ...baseTemplateImageUrls].slice(0, 3); // Reduziert auf 3 statt 5

    // Progress: 45% - Images and templates loaded
    await updateGenerationJob(jobId, { progress: 45 });

    let hoursText = "Nicht angegeben";
    if (business.openingHours && Array.isArray(business.openingHours) && (business.openingHours as string[]).length > 0) {
      hoursText = (business.openingHours as string[]).join("\n");
    }

    const onboarding = await getOnboardingByWebsiteId(websiteId);
    const addressingMode = (onboarding as any)?.addressingMode || 'du';

    const prompt = buildEnhancedPrompt({
      business: { ...business, openingHours: business.openingHours as string[] | null },
      category,
      industryContext,
      personalityHint,
      layoutStyle,
      colorScheme,
      templateStyleDesc,
      hoursText,
      addressingMode,
    });

    // Progress: 50% - Starting AI generation
    await updateGenerationJob(jobId, { progress: 50 });

    // Start progress simulation during AI generation (updates every 2 seconds - faster)
    let simulatedProgress = 50;
    const progressInterval = setInterval(async () => {
      if (simulatedProgress < 75) {
        simulatedProgress += 2;
        await updateGenerationJob(jobId, { progress: simulatedProgress });
      }
    }, 2000); // Every 2 seconds +2%

    // AI-Generation mit Timeout und Fallback
    let websiteData: any;
    let useFallback = false;
    
    try {
      const response = await Promise.race([
        invokeLLM({
          messages: [
            { role: "system", content: "Du bist ein Webdesigner. Antworte AUSSCHLIESSLICH mit validem JSON." },
            ...(templateImageUrls.length > 0 ? [{
              role: "user" as const,
              content: [
                { type: "text" as const, text: `Design-Referenzen: ${templateImageUrls.length} Templates` },
                ...templateImageUrls.map(url => ({ type: "image_url" as const, image_url: { url, detail: "low" as const } }))
              ]
            }] : []),
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("KI-Timeout nach 60s")), 60000)
        )
      ]);

      const content = (response as any).choices[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("KI-Generierung fehlgeschlagen");
      }

      try {
        const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
        websiteData = JSON.parse(cleaned);
      } catch {
        throw new Error("KI hat kein valides JSON zurückgegeben");
      }
    } catch (aiError) {
      console.warn(`[Generation Job ${jobId}] KI-Fehler, verwende Fallback:`, aiError);
      websiteData = getFallbackWebsiteData(business, category, colorScheme, layoutStyle);
      useFallback = true;
    }

    // Stop progress simulation
    clearInterval(progressInterval);

    // Progress: 80% - AI response received / Fallback applied
    await updateGenerationJob(jobId, { progress: 80 });

    // ── Strip LLM stats + inject industry-specific process section ──────────
    if (websiteData.sections) {
      websiteData.sections = websiteData.sections.filter((s: any) => s.type !== 'stats' && s.type !== 'process');
      const proc = buildProcessSection(category);
      const servIdx = websiteData.sections.findIndex((s: any) => s.type === 'services');
      websiteData.sections.splice(servIdx >= 0 ? servIdx + 1 : websiteData.sections.length, 0, { type: 'process', ...proc });
    }

    const finalHeroImageUrl = gmbPhotos.length > 0 ? gmbPhotos[0] : heroImageUrl;
    const effectiveGalleryImages = gmbPhotos.length >= 3 ? gmbPhotos.slice(1) : galleryImages;
    if (effectiveGalleryImages.length > 0 && websiteData.sections) {
      const gallerySection = websiteData.sections.find((s: any) => s.type === "gallery");
      if (gallerySection) {
        gallerySection.items = effectiveGalleryImages.map(url => ({ imageUrl: url }));
        gallerySection.images = effectiveGalleryImages;
      }
    }
    if (business.rating) websiteData.googleRating = parseFloat(business.rating);
    if (business.reviewCount) websiteData.googleReviewCount = business.reviewCount;

    const realReviews = (business as any).googleReviews as Array<{ author_name: string; rating: number; text: string; time: number }> | null;
    let injectedRealReviewsSS = false;
    if (realReviews && realReviews.length > 0 && websiteData.sections) {
      const testimonialsSection = websiteData.sections.find((s: any) => s.type === "testimonials");
      if (testimonialsSection) {
        const rawTopReviews = realReviews
          .filter((r) => r.text && r.text.length >= 20)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5)
          .map((r) => ({
            title: r.text.slice(0, 60) + (r.text.length > 60 ? "…" : ""),
            description: r.text,
            author: r.author_name,
            rating: r.rating,
            isRealReview: true,
          }));
        
        if (rawTopReviews.length >= 1) {
          testimonialsSection.items = rawTopReviews;
          testimonialsSection.isRealReviews = true;
          injectedRealReviewsSS = true;
        }
      }
    }

    // Remove testimonials if they are not real reviews (AI hallucinations)
    if (!injectedRealReviewsSS && websiteData.sections) {
      websiteData.sections = websiteData.sections.filter((s: any) => s.type !== "testimonials");
    }

    // Inject real contact data from business record (overrides any AI-generated contact section)
    if (websiteData.sections) {
      websiteData.sections = websiteData.sections.filter((s: any) => s.type !== "contact");
      const contactItems: Array<{ title: string; description: string; icon: string }> = [];
      if (business.phone) contactItems.push({ title: "Telefon", description: business.phone, icon: "Phone" });
      if (business.address) contactItems.push({ title: "Adresse", description: business.address, icon: "MapPin" });
      if (hoursText && hoursText !== "Nicht angegeben") contactItems.push({ title: "Öffnungszeiten", description: hoursText, icon: "Clock" });
      if (contactItems.length > 0) {
        websiteData.sections.push({ type: "contact", headline: "Kontakt", items: contactItems });
      }
    }

    // Progress: 90% - Processing website data
    await updateGenerationJob(jobId, { progress: 90 });

    if (websiteData.designTokens) {
      const dt = websiteData.designTokens;
      if (!DESIGN_TOKEN_CONFIG.radius.includes(dt.borderRadius as any)) dt.borderRadius = "md";
      if (!DESIGN_TOKEN_CONFIG.shadow.includes(dt.shadowStyle as any)) dt.shadowStyle = "soft";
      if (!DESIGN_TOKEN_CONFIG.spacing.includes(dt.sectionSpacing as any)) dt.sectionSpacing = "normal";
      if (!DESIGN_TOKEN_CONFIG.button.includes(dt.buttonStyle as any)) dt.buttonStyle = "filled";
      if (!Array.isArray(dt.sectionBackgrounds) || dt.sectionBackgrounds.length < 2) dt.sectionBackgrounds = [colorScheme.background, colorScheme.surface, colorScheme.background];
      { const lfSS = getLayoutFonts(layoutStyle);
      if (!dt.headlineFont || dt.headlineFont.includes("[")) dt.headlineFont = lfSS.headlineFont;
      if (!dt.bodyFont || dt.bodyFont.includes("[")) dt.bodyFont = lfSS.bodyFont;
      if (dt.bodyFont && FORBIDDEN_BODY_FONTS.some(f => dt.bodyFont!.toLowerCase().includes(f))) dt.bodyFont = lfSS.bodyFont; }
      if (!dt.accentColor || dt.accentColor.includes("[")) dt.accentColor = colorScheme.accent;
      if (!dt.textColor || dt.textColor.includes("[")) dt.textColor = colorScheme.text;
      if (!dt.backgroundColor || dt.backgroundColor.includes("[")) dt.backgroundColor = colorScheme.background;
      if (!dt.cardBackground || dt.cardBackground.includes("[")) dt.cardBackground = colorScheme.surface;
    }

    // Progress: 95% - Saving to database
    await updateGenerationJob(jobId, { progress: 95 });

    await updateWebsite(websiteId, { websiteData, colorScheme, industry: category, heroImageUrl: finalHeroImageUrl, layoutStyle });

    // Progress: 100% - Complete
    await updateGenerationJob(jobId, { 
      status: "completed", 
      progress: 100, 
      result: { success: true, alreadyGenerated: false, usedFallback: useFallback } 
    });

    console.log(`[Generation Job ${jobId}] Completed successfully for website ${websiteId}${useFallback ? " (mit Fallback)" : ""}`);
  } catch (error: any) {
    console.error(`[Generation Job ${jobId}] Failed:`, error);
    await updateGenerationJob(jobId, { 
      status: "failed", 
      error: error.message || "Unknown error during generation" 
    });
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      console.log("[Auth] me endpoint - ctx.user:", opts.ctx.user ? `found (${opts.ctx.user.openId})` : "null");
      return opts.ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      // Clear cookie by setting empty value and expired maxAge
      ctx.res.cookie(COOKIE_NAME, "", {
        ...cookieOptions,
        maxAge: 0,
        expires: new Date(0),
      });
      // Also try clearCookie as fallback
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
      return { success: true } as const;
    }),

    /**
     * Update user profile (name, email)
     */
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

        const updateData: Partial<InsertUser> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.email !== undefined) updateData.email = input.email;

        if (Object.keys(updateData).length === 0) {
          return { success: true, user };
        }

        await updateUser(user.id, updateData);
        const updatedUser = await getUserByOpenId(user.openId);
        return { success: true, user: updatedUser };
      }),

    /**
     * Change password (only for non-Google users)
     */
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

        // Google users cannot change password
        if (user.loginMethod === "google") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Google users cannot change password" });
        }

        // Note: For Magic Link users, we don't store passwords
        // This would need a proper password system if implementing email+password auth
        throw new TRPCError({ code: "NOT_IMPLEMENTED", message: "Password change not available for magic link accounts" });
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
            const category = extractGmbCategory(place.types) || input.query;
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
              category: extractGmbCategory(place.types) || input.query,
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

    // User-facing GMB search (no admin required)
    gmbSearchPublic: publicProcedure
      .input(z.object({
        query: z.string().min(1),
        region: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const searchQuery = input.region
          ? `${input.query} in ${input.region}`
          : input.query;
        const placesResult = await makeRequest<PlacesSearchResult>(
          "/maps/api/place/textsearch/json",
          { query: searchQuery, language: "de" }
        );
        if (placesResult.status !== "OK" || !placesResult.results?.length) {
          return { results: [], total: 0 };
        }
        const detailedResults = [];
        const limitedResults = placesResult.results.slice(0, 5);
        for (const place of limitedResults) {
          try {
            const details = await makeRequest<PlaceDetailsResult>(
              "/maps/api/place/details/json",
              { place_id: place.place_id, fields: "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,types", language: "de" }
            );
            const category = extractGmbCategory(place.types) || input.query;
            detailedResults.push({
              placeId: place.place_id,
              name: details.result?.name || place.name,
              address: details.result?.formatted_address || place.formatted_address,
              phone: details.result?.formatted_phone_number || null,
              website: details.result?.website || null,
              rating: details.result?.rating || place.rating || null,
              reviewCount: details.result?.user_ratings_total || place.user_ratings_total || 0,
              category,
            });
          } catch {
            detailedResults.push({
              placeId: place.place_id,
              name: place.name,
              address: place.formatted_address,
              phone: null, website: null,
              rating: place.rating || null,
              reviewCount: place.user_ratings_total || 0,
              category: extractGmbCategory(place.types) || input.query,
            });
          }
        }
        return { results: detailedResults, total: detailedResults.length };
      }),

    // City autocomplete for StartPage – server-side to keep API key private
    autocompleteCity: publicProcedure
      .input(z.object({ input: z.string().min(2) }))
      .mutation(async ({ input }) => {
        const result = await makeRequest<{ status: string; predictions: Array<{ description: string; place_id: string }> }>(
          "/maps/api/place/autocomplete/json",
          {
            input: input.input,
            types: "(cities)",
            language: "de",
            components: "country:de|country:at|country:ch",
          }
        );
        if (result.status !== "OK" || !result.predictions?.length) return { suggestions: [] };
        return {
          suggestions: result.predictions.slice(0, 6).map((p) => ({
            label: p.description,
            placeId: p.place_id,
          })),
        };
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

    bulkDelete: adminProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        let deleted = 0;
        for (const id of input.ids) {
          try {
            const website = await getWebsiteByBusinessId(id);
            if (website) await deleteWebsite(website.id);
            await deleteBusiness(id);
            deleted++;
          } catch (_) {}
        }
        return { deleted };
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
        const industryKey = await classifyIndustry(category, business.name);
        const industryContext = buildIndustryContext(category, business.name);
        const personalityHint = buildPersonalityHint(business.name, business.rating, business.reviewCount || 0);
        const colorScheme = getIndustryColorScheme(category, business.name, industryKey);
        // Round-robin layout assignment: guarantees consecutive same-industry
        // websites always get a different layout from the pool.
        const { pool: layoutPool } = getLayoutPool(category, business.name, industryKey);
        const layoutStyle = await getNextLayoutForIndustry(industryKey, layoutPool);
        const heroImageUrl = getHeroImageUrl(category, business.name, industryKey);
        const galleryImages = getGalleryImages(category, business.name, industryKey);
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
          hoursText = (business.openingHours as string[]).join("\n");
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
            // Fix: Use 'items' with 'imageUrl' instead of just 'images' to match Layout components
            gallerySection.items = effectiveGalleryImages.map(url => ({ imageUrl: url }));
            gallerySection.images = effectiveGalleryImages; // Keep for backward compatibility if any old layout uses it
          }
        }

        // Inject real Google rating data
        if (business.rating) websiteData.googleRating = parseFloat(business.rating);
        if (business.reviewCount) websiteData.googleReviewCount = business.reviewCount;

        // Inject real Google reviews into testimonials section if available
        const realReviews = (business as any).googleReviews as Array<{ author_name: string; rating: number; text: string; time: number }> | null;
        let injectedRealReviews = false;
        if (realReviews && realReviews.length > 0 && websiteData.sections) {
          const testimonialsSection = websiteData.sections.find((s: any) => s.type === "testimonials");
          if (testimonialsSection) {
            const rawTopReviews = realReviews
              .filter((r) => r.text && r.text.length >= 20)
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5)
              .map((r) => ({
                title: r.text.slice(0, 60) + (r.text.length > 60 ? "…" : ""),
                description: r.text,
                author: r.author_name,
                rating: r.rating,
                isRealReview: true,
              }));
            
            if (rawTopReviews.length >= 1) {
              testimonialsSection.items = rawTopReviews;
              testimonialsSection.isRealReviews = true;
              injectedRealReviews = true;
            }
          }
        }

        // Remove testimonials if they are not real reviews (AI hallucinations)
        if (!injectedRealReviews && websiteData.sections) {
          websiteData.sections = websiteData.sections.filter((s: any) => s.type !== "testimonials");
        }

        // Strip LLM stats + inject industry-specific process section
        if (websiteData.sections) {
          websiteData.sections = websiteData.sections.filter((s: any) => s.type !== 'stats' && s.type !== 'process');
          const proc = buildProcessSection(category);
          const servIdx = websiteData.sections.findIndex((s: any) => s.type === 'services');
          websiteData.sections.splice(servIdx >= 0 ? servIdx + 1 : websiteData.sections.length, 0, { type: 'process', ...proc });
        }

        // Inject real contact data from business record (overrides any AI-generated contact section)
        if (websiteData.sections) {
          websiteData.sections = websiteData.sections.filter((s: any) => s.type !== "contact");
          const contactItems: Array<{ title: string; description: string; icon: string }> = [];
          if (business.phone) contactItems.push({ title: "Telefon", description: business.phone, icon: "Phone" });
          if (business.address) contactItems.push({ title: "Adresse", description: business.address, icon: "MapPin" });
          if (hoursText && hoursText !== "Nicht angegeben") contactItems.push({ title: "Öffnungszeiten", description: hoursText, icon: "Clock" });
          if (contactItems.length > 0) {
            websiteData.sections.push({ type: "contact", headline: "Kontakt", items: contactItems });
          }
        }

        // Sanitize designTokens: ensure enum values are valid
        if (websiteData.designTokens) {
          const dt = websiteData.designTokens;
          if (!DESIGN_TOKEN_CONFIG.radius.includes(dt.borderRadius as any)) dt.borderRadius = "md";
          if (!DESIGN_TOKEN_CONFIG.shadow.includes(dt.shadowStyle as any)) dt.shadowStyle = "soft";
          if (!DESIGN_TOKEN_CONFIG.spacing.includes(dt.sectionSpacing as any)) dt.sectionSpacing = "normal";
          if (!DESIGN_TOKEN_CONFIG.button.includes(dt.buttonStyle as any)) dt.buttonStyle = "filled";
          if (!Array.isArray(dt.sectionBackgrounds) || dt.sectionBackgrounds.length < 2) {
            dt.sectionBackgrounds = [colorScheme.background, colorScheme.surface, colorScheme.background];
          }
          // Ensure font names are plain strings (no brackets)
          { const lf = getLayoutFonts(layoutStyle);
          if (!dt.headlineFont || dt.headlineFont.includes("[")) dt.headlineFont = lf.headlineFont;
          if (!dt.bodyFont || dt.bodyFont.includes("[")) dt.bodyFont = lf.bodyFont;
          if (dt.bodyFont && FORBIDDEN_BODY_FONTS.some(f => dt.bodyFont!.toLowerCase().includes(f))) dt.bodyFont = lf.bodyFont; }
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
        const industryKeyRegen = await classifyIndustry(category, business.name);
        // Use a different seed so layout/colors vary from the previous version
        const seed = business.name + Date.now().toString();
        const industryContext = buildIndustryContext(category, business.name);
        const personalityHint = buildPersonalityHint(business.name, business.rating, business.reviewCount || 0);
        const colorScheme = getIndustryColorScheme(category, seed, industryKeyRegen);
        // Round-robin: guarantees a different layout than the previous generation
        const { pool: layoutPoolRegen } = getLayoutPool(category, business.name, industryKeyRegen);
        const layoutStyle = await getNextLayoutForIndustry(industryKeyRegen, layoutPoolRegen);
        const heroImageUrl = getHeroImageUrl(category, seed, industryKeyRegen);
        const galleryImages = getGalleryImages(category, business.name, industryKeyRegen);

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
          hoursText = (business.openingHours as string[]).join("\n");
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
          if (gallerySection) {
            gallerySection.items = galleryImages.map(url => ({ imageUrl: url }));
            gallerySection.images = galleryImages;
          }
        }

        // Inject real Google rating data
        if (business.rating) websiteData.googleRating = parseFloat(business.rating);
        if (business.reviewCount) websiteData.googleReviewCount = business.reviewCount;

        // Inject real Google reviews into testimonials section if available
        const realReviews = (business as any).googleReviews as Array<{ author_name: string; rating: number; text: string; time: number }> | null;
        let injectedRealReviews = false;
        if (realReviews && realReviews.length > 0 && websiteData.sections) {
          const testimonialsSection = websiteData.sections.find((s: any) => s.type === "testimonials");
          if (testimonialsSection) {
            const rawTopReviews = realReviews
              .filter((r) => r.text && r.text.length >= 20)
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5)
              .map((r) => ({
                title: r.text.slice(0, 60) + (r.text.length > 60 ? "…" : ""),
                description: r.text,
                author: r.author_name,
                rating: r.rating,
                isRealReview: true,
              }));
            
            if (rawTopReviews.length >= 1) {
              testimonialsSection.items = rawTopReviews;
              testimonialsSection.isRealReviews = true;
              injectedRealReviews = true;
            }
          }
        }

        // Remove testimonials if they are not real reviews (AI hallucinations)
        if (!injectedRealReviews && websiteData.sections) {
          websiteData.sections = websiteData.sections.filter((s: any) => s.type !== "testimonials");
        }

        // Strip LLM stats + inject industry-specific process section
        if (websiteData.sections) {
          websiteData.sections = websiteData.sections.filter((s: any) => s.type !== 'stats' && s.type !== 'process');
          const proc = buildProcessSection(category);
          const servIdx = websiteData.sections.findIndex((s: any) => s.type === 'services');
          websiteData.sections.splice(servIdx >= 0 ? servIdx + 1 : websiteData.sections.length, 0, { type: 'process', ...proc });
        }

        // Inject real contact data from business record (overrides any AI-generated contact section)
        if (websiteData.sections) {
          websiteData.sections = websiteData.sections.filter((s: any) => s.type !== "contact");
          const contactItems: Array<{ title: string; description: string; icon: string }> = [];
          if (business.phone) contactItems.push({ title: "Telefon", description: business.phone, icon: "Phone" });
          if (business.address) contactItems.push({ title: "Adresse", description: business.address, icon: "MapPin" });
          if (hoursText && hoursText !== "Nicht angegeben") contactItems.push({ title: "Öffnungszeiten", description: hoursText, icon: "Clock" });
          if (contactItems.length > 0) {
            websiteData.sections.push({ type: "contact", headline: "Kontakt", items: contactItems });
          }
        }

        // Sanitize designTokens: ensure enum values are valid
        if (websiteData.designTokens) {
          const dt = websiteData.designTokens;
          if (!DESIGN_TOKEN_CONFIG.radius.includes(dt.borderRadius as any)) dt.borderRadius = "md";
          if (!DESIGN_TOKEN_CONFIG.shadow.includes(dt.shadowStyle as any)) dt.shadowStyle = "soft";
          if (!DESIGN_TOKEN_CONFIG.spacing.includes(dt.sectionSpacing as any)) dt.sectionSpacing = "normal";
          if (!DESIGN_TOKEN_CONFIG.button.includes(dt.buttonStyle as any)) dt.buttonStyle = "filled";
          if (!Array.isArray(dt.sectionBackgrounds) || dt.sectionBackgrounds.length < 2) {
            dt.sectionBackgrounds = [colorScheme.background, colorScheme.surface, colorScheme.background];
          }
          { const lfR = getLayoutFonts(layoutStyle);
          if (!dt.headlineFont || dt.headlineFont.includes("[")) dt.headlineFont = lfR.headlineFont;
          if (!dt.bodyFont || dt.bodyFont.includes("[")) dt.bodyFont = lfR.bodyFont;
          if (dt.bodyFont && FORBIDDEN_BODY_FONTS.some(f => dt.bodyFont!.toLowerCase().includes(f))) dt.bodyFont = lfR.bodyFont; }
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
          // Inject ID into websiteData for stable randomization seed in frontend
          if (w.websiteData) {
            (w.websiteData as any).id = w.id;
          }
          enriched.push({ ...w, business: biz });
        }
        return { websites: enriched, total };
      }),

    get: publicProcedure
      .input(z.object({ id: z.number().optional(), slug: z.string().optional(), token: z.string().optional() }))
      .query(async ({ input }) => {
        let website;
        let redirectToSlug: string | null = null;
        if (input.id) website = await getWebsiteById(input.id);
        else if (input.slug) {
          website = await getWebsiteBySlug(input.slug);
          // Fallback: look up by former slug so old preview-* URLs redirect to the new slug
          if (!website) {
            const byFormer = await getWebsiteByFormerSlug(input.slug);
            if (byFormer) {
              website = byFormer;
              redirectToSlug = byFormer.slug;
            }
          }
        }
        else if (input.token) website = await getWebsiteByToken(input.token);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
        const business = await getBusinessById(website.businessId);

        // Inject ID into websiteData for stable randomization seed in frontend
        if (website.websiteData) {
          (website.websiteData as any).id = website.id;
        }

        return { website, business, redirectToSlug };
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

    bulkDelete: adminProcedure
      .input(z.object({ ids: z.array(z.number()).min(1).max(100) }))
      .mutation(async ({ input }) => {
        let deleted = 0;
        for (const id of input.ids) {
          const website = await getWebsiteById(id);
          if (website) {
            await deleteWebsite(id);
            deleted++;
          }
        }
        return { success: true, deleted };
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
        websiteId:       z.number(),
        billingInterval: z.enum(["monthly", "yearly"]).default("yearly"),
        addOns: z.object({
          contactForm: z.boolean().default(false),
          gallery:     z.boolean().default(false),
          menu:        z.boolean().default(false),
          pricelist:   z.boolean().default(false),
        }).default({}),
      }))
      .mutation(async ({ input, ctx }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND" });

        const baseAmount  = PRICING.base[input.billingInterval];
        const activeAddOns = (Object.entries(input.addOns) as [AddOnKey, boolean][]).filter(([, v]) => v);
        const totalAmount  = baseAmount + activeAddOns.length * PRICING.addon;

        const basePriceStr  = (baseAmount / 100).toFixed(2).replace(".", ",");
        const intervalLabel = input.billingInterval === "yearly" ? "Jahresabo" : "monatlich";
        const description   = [
          `${basePriceStr} €/Mo Basis (${intervalLabel})`,
          ...activeAddOns.map(([k]) => ADDON_NAMES[k]),
        ].join(" + ");

        const origin = ctx.req.headers.origin || "https://pageblitz.de";
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "subscription",
          customer_email: ctx.user?.email || undefined,
          line_items: [
            {
              price_data: {
                currency: "eur",
                product_data: {
                  name: `Pageblitz – ${website.businessName || (website.websiteData as any)?.businessName || "Deine Website"}`,
                  description,
                },
                unit_amount: totalAmount,
                recurring: { interval: "month" },
              },
              quantity: 1,
            },
          ],
          subscription_data: {
            trial_period_days: 7,
          },
          success_url: `${origin}/my-website?checkout=success`,
          cancel_url:  `${origin}/start`,
          metadata: {
            websiteId:       website.id.toString(),
            userId:          ctx.user?.id?.toString() || "0",
            billingInterval: input.billingInterval,
            addOns:          JSON.stringify(input.addOns),
            totalAmount:     totalAmount.toString(),
          },
        });

        if (!session.url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe session URL not generated" });
        return { url: session.url, sessionId: session.id, totalAmount, addOnsList: activeAddOns.map(([k]) => ADDON_NAMES[k]) };
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
          tagline: `Erstelle einen kurzen, einprägsamen deutschen Slogan (max. 8 Wörter) nach dem StoryBrand-Prinzip. Der Slogan beschreibt, was der KUNDE erreicht oder gewinnt – nicht was das Unternehmen ist. Beispiel: "Damit Sie sich keine Sorgen mehr machen müssen." Nur den Slogan, keine Anführungszeichen, keine Erklärung.

Kontext: ${input.context}`,
          description: `Schreibe eine deutsche Website-Beschreibung (2-3 Sätze, ca. 80-120 Wörter) nach dem StoryBrand-Prinzip: 1) Benenne das Problem des Kunden. 2) Positioniere das Unternehmen als Guide der hilft. 3) Beschreibe das Ergebnis für den Kunden. Nie "Wir sind Experten" – stattdessen "Sie bekommen / erreichen...". Keine Floskeln.

Kontext: ${input.context}`,
          usp: `Was ist das wichtigste Versprechen an den Kunden? Formuliere es als Kundennutzen in einem prägnanten deutschen Satz (max. 15 Wörter) – welches Problem wird gelöst, welches Ergebnis wird erreicht? Nicht "Wir haben 15 Jahre Erfahrung" sondern "Damit Sie [Ergebnis] erreichen". Nur den USP, keine Erklärung.

Kontext: ${input.context}`,
          targetAudience: `Beschreibe die ideale Zielgruppe für dieses Unternehmen in 1-2 deutschen Sätzen. Konkret und spezifisch – welche Menschen mit welchem Problem oder Wunsch.

Kontext: ${input.context}`,
        };

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Du bist ein professioneller Texter für lokale Unternehmen in Deutschland, der das StoryBrand-Framework von Donald Miller beherrscht. Grundprinzip: Der KUNDE ist der Held – nicht das Unternehmen. Das Unternehmen ist der Guide, der dem Kunden hilft, sein Problem zu lösen. Schreibe immer auf Deutsch. Outcome-fokussiert, nie company-centric." },
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
            { role: "system", content: "Du bist ein Experte für lokale Unternehmenswebsites in Deutschland, der das StoryBrand-Framework beherrscht. Leistungen werden als Lösungen für Kundenprobleme formuliert – outcome-focused. Der Titel nennt die Leistung, die Beschreibung nennt den Kundennutzen (was der Kunde erreicht/gewinnt). Antworte immer mit validem JSON." },
            { role: "user", content: `Schlage 6 verschiedene, typische Leistungen für dieses Unternehmen vor. Jede Leistung: Titel = klare Bezeichnung der Leistung, Beschreibung = was der Kunde dadurch gewinnt/erreicht (max 12 Wörter, Kundenperspektive). Gib nur ein JSON-Array zurück, kein Markdown, keine Erklärung.\n\nFormat: [{\"title\": \"Leistungsname\", \"description\": \"Was der Kunde dadurch gewinnt (max 12 Wörter)\"}]\n\nKontext: ${input.context}` },
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
          const industryKey = await classifyIndustry(newCategory, bizName);
          const industryContext = buildIndustryContext(newCategory, bizName);
          const heroImageUrl = getHeroImageUrl(newCategory, bizName, industryKey);
          const colorScheme = getIndustryColorScheme(newCategory, bizName, industryKey);
          const galleryImages = getGalleryImages(newCategory, bizName, industryKey);
          
          // Also patch the websiteData JSON blob if it exists to replace stale images/colors
          let updatedWebsiteData = website.websiteData;
          if (updatedWebsiteData) {
             try {
               // Deep clone
               const data = JSON.parse(JSON.stringify(updatedWebsiteData));
               // Update top-level fields
               data.heroImageUrl = heroImageUrl;
               if (data.hero) data.hero.imageUrl = heroImageUrl;
               
               // Update colors in designTokens if they exist
               if (data.designTokens) {
                 data.designTokens.accentColor = colorScheme.accent;
                 data.designTokens.backgroundColor = colorScheme.background;
                 data.designTokens.cardBackground = colorScheme.surface;
                 data.designTokens.textColor = colorScheme.text;
               }

               // Inject new gallery images
               const gallerySection = data.sections?.find((s: any) => s.type === "gallery");
               if (gallerySection && galleryImages.length > 0) {
                 gallerySection.items = galleryImages.map(url => ({ imageUrl: url }));
                 gallerySection.images = galleryImages; // Keep for backward compatibility
               }

               // Replace any remaining Unsplash URLs in the entire blob with the new hero image as a placeholder
               // (or a random one from the new industry set)
               const industryImages = getIndustryImages(newCategory, bizName, industryKey);
               const allIndustryHeroes = industryImages.hero;
               
               const patchedStr = JSON.stringify(data).replace(
                 /https:\/\/images\.unsplash\.com\/[^"]+/g,
                 (match) => {
                   // If it's a known industry image, keep it? No, replace all to be sure.
                   const idx = Math.floor(Math.random() * allIndustryHeroes.length);
                   return allIndustryHeroes[idx] || match;
                 }
               );
               updatedWebsiteData = JSON.parse(patchedStr);
             } catch (e) {
               console.error("Error patching websiteData in saveStep:", e);
             }
          }

          await updateWebsite(input.websiteId, { 
            industry: newCategory, 
            heroImageUrl, 
            colorScheme,
            websiteData: updatedWebsiteData
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
          
          // CRITICAL: Always re-calculate ALL contrast colors if any base color was provided
          // to ensure text remains readable and prevent TypeScript sync errors
          if (updatedCs.primary) updatedCs.onPrimary = getContrastColor(updatedCs.primary);
          if (updatedCs.secondary) updatedCs.onSecondary = getContrastColor(updatedCs.secondary);
          if (updatedCs.accent) updatedCs.onAccent = getContrastColor(updatedCs.accent);
          if (updatedCs.surface) updatedCs.onSurface = getContrastColor(updatedCs.surface);
          if (updatedCs.background) updatedCs.onBackground = getContrastColor(updatedCs.background);
          
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
        
        // Inject contact items from manual onboarding data (phone, email, address, opening hours)
        const contactItems: Array<{ title: string; description: string; icon: string }> = [];
        if (onboarding.legalPhone)
          contactItems.push({ title: 'Telefon', description: onboarding.legalPhone, icon: 'Phone' });
        if (onboarding.legalEmail)
          contactItems.push({ title: 'E-Mail', description: onboarding.legalEmail, icon: 'Mail' });
        const addrParts = [
          onboarding.legalStreet,
          `${onboarding.legalZip || ''} ${onboarding.legalCity || ''}`.trim(),
        ].filter(Boolean);
        const addrStr = addrParts.join(', ');
        if (addrStr)
          contactItems.push({ title: 'Adresse', description: addrStr, icon: 'MapPin' });
        const ohRaw = (onboarding as any).openingHours;
        if (ohRaw && Array.isArray(ohRaw) && ohRaw.length > 0) {
          const ohText = formatOpeningHoursText(ohRaw);
          if (ohText) contactItems.push({ title: 'Öffnungszeiten', description: ohText, icon: 'Clock' });
        }
        if (contactItems.length > 0 && patchedData) {
          // Ensure sections array exists (some non-GMB websites might not have one yet)
          if (!(patchedData as any).sections) (patchedData as any).sections = [];
          (patchedData as any).sections = (patchedData as any).sections.filter((s: any) => s.type !== 'contact');
          (patchedData as any).sections.push({
            type: 'contact',
            headline: 'Kontakt',
            items: contactItems,
            content: 'Wir freuen uns auf Ihre Nachricht.',
            ctaText: 'Nachricht senden',
          });
        }

        // Apply user's section order and hidden sections from hideSections step
        const savedSectionOrder: string[] | undefined = (onboarding as any).sectionOrder;
        const savedHiddenSections: string[] | undefined = (onboarding as any).hiddenSections;
        if (patchedData && (patchedData as any).sections) {
          let secs = (patchedData as any).sections;
          if (savedHiddenSections && savedHiddenSections.length > 0) {
            secs = secs.filter((s: any) => !savedHiddenSections.includes(s.type));
          }
          if (savedSectionOrder && savedSectionOrder.length > 0) {
            const heroSec = secs.find((s: any) => s.type === 'hero');
            const others = secs.filter((s: any) => s.type !== 'hero');
            others.sort((a: any, b: any) => {
              const ai = savedSectionOrder.indexOf(a.type);
              const bi = savedSectionOrder.indexOf(b.type);
              return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
            });
            secs = heroSec ? [heroSec, ...others] : others;
          }
          (patchedData as any).sections = secs;
        }

        // Also update the business category in the business table if it changed
        if ((onboarding as any).businessCategory && website.businessId) {
          try {
            await updateBusiness(website.businessId, { category: (onboarding as any).businessCategory });
          } catch { /* non-critical */ }
        }

        // Sync phone/address/opening hours back to business table for future regenerations
        if (website.businessId) {
          const bizUpd: Record<string, any> = {};
          if (onboarding.legalPhone) bizUpd.phone = onboarding.legalPhone;
          if (addrStr) bizUpd.address = addrStr;
          if (ohRaw) bizUpd.openingHours = ohRaw;
          if (Object.keys(bizUpd).length > 0) {
            try { await updateBusiness(website.businessId, bizUpd); } catch { /* non-critical */ }
          }
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
        
        // Re-calculate ALL contrast colors to ensure readability and prevent sync errors
        if (patchedColorScheme.primary) patchedColorScheme.onPrimary = getContrastColor(patchedColorScheme.primary);
        if (patchedColorScheme.secondary) patchedColorScheme.onSecondary = getContrastColor(patchedColorScheme.secondary);
        if (patchedColorScheme.accent) patchedColorScheme.onAccent = getContrastColor(patchedColorScheme.accent);
        if (patchedColorScheme.surface) patchedColorScheme.onSurface = getContrastColor(patchedColorScheme.surface);
        if (patchedColorScheme.background) patchedColorScheme.onBackground = getContrastColor(patchedColorScheme.background);

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

        // Register in Umami Analytics (non-critical, fire-and-forget)
        const domain = website.slug + ".pageblitz.de";
        registerUmamiWebsite(website.slug, domain)
          .then((umamiId) => {
            if (umamiId) updateWebsite(input.websiteId, { umamiWebsiteId: umamiId });
          })
          .catch(() => { /* non-critical */ });

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

    // Fetch GMB photos for this business (shown in hero/about photo selection step)
    getGmbPhotos: publicProcedure
      .input(z.object({ websiteId: z.number() }))
      .query(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) return { photos: [] };
        const business = await getBusinessById((website as any).businessId);
        if (!business?.placeId || business.placeId.startsWith("self-") || business.placeId.startsWith("email-")) return { photos: [] };
        const photos = await getGmbPhotos(business.placeId, 7);
        return { photos };
      }),

    // Regenerate legal pages (Impressum & Datenschutz) after legal data changes
    regenerateLegalPages: publicProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        const onboarding = await getOnboardingByWebsiteId(input.websiteId);
        if (!onboarding) throw new TRPCError({ code: "NOT_FOUND", message: "Onboarding nicht gefunden" });
        
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website nicht gefunden" });
        
        // Only regenerate if we have the minimum required legal data
        if (!onboarding.legalOwner || !onboarding.legalEmail) {
          return { success: false, error: "Rechtliche Daten unvollständig (Eigentümer und E-Mail erforderlich)" };
        }
        
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
        
        const impressumHtml = generateImpressum(legalData);
        const datenschutzHtml = generateDatenschutz(legalData);
        
        // Update website with new legal pages
        const websiteData = website.websiteData as any || {};
        await updateWebsite(input.websiteId, {
          websiteData: {
            ...websiteData,
            impressumHtml,
            datenschutzHtml,
            hasLegalPages: true,
          },
          hasLegalPages: true,
        });
        
        return { success: true, impressumHtml: !!impressumHtml, datenschutzHtml: !!datenschutzHtml };
      }),
  }),

  // ── Self-Service: Start without GMB ────────────────────────────────
  // ── Customer Dashboard ──────────────────────────────
  customer: router({
    getMyWebsites: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      const rows = await getWebsitesByUserId(userId);
      // Enrich with business data + auto-sync currentPeriodEnd from Stripe if missing
      const results = await Promise.all(
        rows.map(async (row) => {
          const business = await getBusinessById(row.website.businessId);
          // Fetch currentPeriodEnd from Stripe if not yet stored (use compat client)
          if (row.subscription && !row.subscription.currentPeriodEnd && row.subscription.stripeSubscriptionId) {
            try {
              const stripeSub = await stripeCompat.subscriptions.retrieve(row.subscription.stripeSubscriptionId);
              const periodEnd = (stripeSub as any).current_period_end as number | undefined;
              if (periodEnd) {
                await updateSubscription(row.subscription.id, { currentPeriodEnd: periodEnd, updatedAt: Date.now() });
                (row.subscription as any).currentPeriodEnd = periodEnd;
              }
            } catch (e) {
              console.warn("[getMyWebsites] Could not fetch Stripe subscription period:", e);
            }
          }
          return { website: row.website, subscription: row.subscription, business };
        })
      );
      return results;
    }),

    // ── Setup-Flow ──────────────────────────────────────
    checkSlugAvailability: publicProcedure
      .input(z.object({ slug: z.string(), websiteId: z.number() }))
      .query(async ({ input }) => {
        if (input.slug.length < 3) return { available: false };
        const existing = await getWebsiteBySlug(input.slug);
        const available = !existing || existing.id === input.websiteId;
        return { available };
      }),

    updateSlug: protectedProcedure
      .input(z.object({
        websiteId: z.number(),
        slug: z.string().min(3).max(60).regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt"),
      }))
      .mutation(async ({ input, ctx }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row)
          throw new TRPCError({ code: "FORBIDDEN", message: "Website gehört nicht zu deinem Account" });
        const existing = await getWebsiteBySlug(input.slug);
        if (existing && existing.id !== input.websiteId)
          throw new TRPCError({ code: "CONFLICT", message: "Diese Adresse ist bereits vergeben" });
        // Preserve the old slug so old URLs can redirect
        const oldSlug = row.website.slug;
        await updateWebsite(input.websiteId, {
          slug: input.slug,
          ...(oldSlug !== input.slug ? { formerSlug: oldSlug } : {}),
        });
        return { success: true };
      }),

    setLive: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        if (!rows.find(r => r.website.id === input.websiteId))
          throw new TRPCError({ code: "FORBIDDEN", message: "Website gehört nicht zu deinem Account" });
        await updateWebsite(input.websiteId, { status: "active" });
        return { success: true };
      }),

    /** Saves legal owner/email to onboarding and generates Impressum + Datenschutz */
    generateLegalPages: protectedProcedure
      .input(z.object({
        websiteId: z.number(),
        legalOwner: z.string().min(2),
        legalEmail: z.string().email(),
        legalStreet: z.string().optional(),
        legalZip: z.string().optional(),
        legalCity: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        if (!rows.find(r => r.website.id === input.websiteId))
          throw new TRPCError({ code: "FORBIDDEN", message: "Website gehört nicht zu deinem Account" });

        // Save legal data to onboarding
        await updateOnboarding(input.websiteId, {
          legalOwner: input.legalOwner,
          legalEmail: input.legalEmail,
          ...(input.legalStreet ? { legalStreet: input.legalStreet } : {}),
          ...(input.legalZip    ? { legalZip:    input.legalZip    } : {}),
          ...(input.legalCity   ? { legalCity:   input.legalCity   } : {}),
        });

        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND" });
        const onboarding = await getOnboardingByWebsiteId(input.websiteId);

        const legalData = {
          businessName: (website.websiteData as any)?.businessName || onboarding?.businessName || "Unternehmen",
          legalOwner: input.legalOwner,
          legalStreet: input.legalStreet || onboarding?.legalStreet || "",
          legalZip:    input.legalZip    || onboarding?.legalZip    || "",
          legalCity:   input.legalCity   || onboarding?.legalCity   || "",
          legalCountry: "Deutschland",
          legalEmail: input.legalEmail,
          legalPhone:  onboarding?.legalPhone  || undefined,
          legalVatId:  onboarding?.legalVatId  || undefined,
        };

        const impressumHtml    = generateImpressum(legalData);
        const datenschutzHtml  = generateDatenschutz(legalData);
        const websiteData      = (website.websiteData as any) || {};

        await updateWebsite(input.websiteId, {
          websiteData: { ...websiteData, impressumHtml, datenschutzHtml, hasLegalPages: true },
        });

        return { success: true };
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
          sections: z.array(z.any()).optional(),
          hiddenSections: z.array(z.string()).optional(),
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
        const { tagline, description, businessName, phone, email, address, heroPhotoUrl, aboutPhotoUrl, sections, hiddenSections } = input.patch;
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
        // Full sections reordering from structure editor
        if (sections !== undefined) {
          websiteData.sections = sections;
        }
        // Hidden sections toggle
        if (hiddenSections !== undefined) {
          websiteData.hiddenSections = hiddenSections;
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

    // Update legal data and regenerate Impressum/Datenschutz pages
    updateLegalData: protectedProcedure
      .input(z.object({
        websiteId: z.number(),
        legalData: z.object({
          legalOwner: z.string().optional(),
          legalStreet: z.string().optional(),
          legalZip: z.string().optional(),
          legalCity: z.string().optional(),
          legalEmail: z.string().optional(),
          legalPhone: z.string().optional(),
          legalVatId: z.string().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership via subscription
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find((r) => r.website.id === input.websiteId);
        if (!owned) throw new TRPCError({ code: "FORBIDDEN", message: "Website gehört nicht zu deinem Account" });
        
        const website = owned.website;
        
        // Update onboarding with new legal data
        await updateOnboarding(input.websiteId, {
          ...input.legalData,
          updatedAt: Date.now(),
        });
        
        // Get updated onboarding data
        const onboarding = await getOnboardingByWebsiteId(input.websiteId);
        
        // Regenerate legal pages if we have minimum required data
        if (onboarding?.legalOwner && onboarding?.legalEmail) {
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
          
          const impressumHtml = generateImpressum(legalData);
          const datenschutzHtml = generateDatenschutz(legalData);
          
          const websiteData = website.websiteData as any || {};
          await updateWebsite(input.websiteId, {
            websiteData: {
              ...websiteData,
              impressumHtml,
              datenschutzHtml,
              hasLegalPages: true,
            },
            hasLegalPages: true,
          });
          
          return { success: true, regenerated: true };
        }
        
        return { success: true, regenerated: false };
      }),

    // Get onboarding data for a website (for dashboard editing)
    getOnboardingData: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify ownership
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find((r) => r.website.id === input.websiteId);
        if (!owned) throw new TRPCError({ code: "FORBIDDEN", message: "Website gehört nicht zu deinem Account" });

        const onboarding = await getOnboardingByWebsiteId(input.websiteId);
        return onboarding;
      }),

    // Update services for a website
    updateServices: protectedProcedure
      .input(z.object({
        websiteId: z.number(),
        services: z.array(z.object({
          title: z.string(),
          description: z.string().optional(),
        })),
        usp: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find((r) => r.website.id === input.websiteId);
        if (!owned) throw new TRPCError({ code: "FORBIDDEN", message: "Website gehört nicht zu deinem Account" });

        const website = owned.website;

        // Update onboarding data
        await updateOnboarding(input.websiteId, {
          topServices: input.services,
          usp: input.usp,
          updatedAt: Date.now(),
        });

        // Update websiteData sections
        const websiteData = (website.websiteData as any) || {};
        if (Array.isArray(websiteData.sections)) {
          websiteData.sections = websiteData.sections.map((s: any) => {
            if (s.type === "services" || s.type === "features") {
              return {
                ...s,
                items: input.services.map((svc: any) => ({
                  title: svc.title,
                  description: svc.description || "",
                  icon: "Sparkles",
                })),
              };
            }
            if (s.type === "hero" && input.usp) {
              return { ...s, usp: input.usp };
            }
            return s;
          });

          // Add services section if it doesn't exist
          const hasServicesSection = websiteData.sections.some((s: any) => s.type === "services" || s.type === "features");
          if (!hasServicesSection && input.services.length > 0) {
            websiteData.sections.push({
              type: "services",
              headline: "Unsere Leistungen",
              items: input.services.map((svc: any) => ({
                title: svc.title,
                description: svc.description || "",
                icon: "Sparkles",
              })),
            });
          }
        }

        await updateWebsite(input.websiteId, { websiteData });
        return { success: true };
      }),

    // Update design settings (colors, fonts)
    updateDesign: protectedProcedure
      .input(z.object({
        websiteId: z.number(),
        colorScheme: z.object({
          primary: z.string().optional(),
          secondary: z.string().optional(),
          accent: z.string().optional(),
          background: z.string().optional(),
          surface: z.string().optional(),
          text: z.string().optional(),
        }).optional(),
        designTokens: z.object({
          headlineFont: z.string().optional(),
          bodyFont: z.string().optional(),
          headlineSize: z.string().optional(),
          borderRadius: z.string().optional(),
          shadowStyle: z.string().optional(),
          sectionSpacing: z.string().optional(),
          buttonStyle: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find((r) => r.website.id === input.websiteId);
        if (!owned) throw new TRPCError({ code: "FORBIDDEN", message: "Website gehört nicht zu deinem Account" });

        const website = owned.website;
        const updateData: any = {};

        // Update color scheme
        if (input.colorScheme) {
          const currentScheme = (website.colorScheme as any) || {};
          updateData.colorScheme = { ...currentScheme, ...input.colorScheme };

          // Also update onboarding
          await updateOnboarding(input.websiteId, {
            brandColor: input.colorScheme.primary,
            brandSecondaryColor: input.colorScheme.secondary,
            updatedAt: Date.now(),
          });
        }

        // Update design tokens in websiteData
        if (input.designTokens) {
          const websiteData = (website.websiteData as any) || {};
          websiteData.designTokens = {
            ...(websiteData.designTokens || {}),
            ...input.designTokens,
          };
          updateData.websiteData = websiteData;

          // Update fonts in onboarding
          await updateOnboarding(input.websiteId, {
            headlineFont: input.designTokens.headlineFont,
            headlineSize: input.designTokens.headlineSize,
            updatedAt: Date.now(),
          });
        }

        await updateWebsite(input.websiteId, updateData);
        return { success: true };
      }),

    // Upload image for gallery
    uploadGalleryImage: protectedProcedure
      .input(z.object({
        websiteId: z.number(),
        imageData: z.string(), // base64
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find((r) => r.website.id === input.websiteId);
        if (!owned) throw new TRPCError({ code: "FORBIDDEN", message: "Website gehört nicht zu deinem Account" });

        try {
          const result = await uploadPhoto(input.imageData, input.mimeType, input.websiteId, Date.now());
          return { url: result.url };
        } catch (error: any) {
          console.error("Gallery upload error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Bild-Upload fehlgeschlagen: " + (error.message || "Unbekannter Fehler"),
          });
        }
      }),

    // Update add-ons (gallery, menu, pricelist, contact form)
    updateAddons: protectedProcedure
      .input(z.object({
        websiteId: z.number(),
        addOns: z.object({
          gallery: z.object({ enabled: z.boolean(), photos: z.array(z.string()).optional() }).optional(),
          menu: z.object({
            enabled: z.boolean(),
            categories: z.array(z.object({
              name: z.string(),
              items: z.array(z.any()),
            })).optional(),
            items: z.array(z.any()).optional(),
          }).optional(),
          pricelist: z.object({
            enabled: z.boolean(),
            categories: z.array(z.object({
              name: z.string(),
              items: z.array(z.any()),
            })).optional(),
            items: z.array(z.any()).optional(),
          }).optional(),
          contactForm: z.boolean().optional(),
          contactFormFields: z.array(z.object({
            id: z.string(),
            label: z.string(),
            placeholder: z.string(),
            type: z.enum(["text", "email", "textarea", "select"]),
            required: z.boolean(),
            options: z.array(z.string()).optional(),
          })).optional().nullable(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find((r) => r.website.id === input.websiteId);
        if (!owned) throw new TRPCError({ code: "FORBIDDEN", message: "Website gehört nicht zu deinem Account" });

        const website = owned.website;

        // Update onboarding with add-on settings
        await updateOnboarding(input.websiteId, {
          addOnGallery: input.addOns.gallery?.enabled,
          addOnMenu: input.addOns.menu?.enabled,
          addOnPricelist: input.addOns.pricelist?.enabled,
          addOnContactForm: input.addOns.contactForm,
          contactFormFields: input.addOns.contactFormFields,
          updatedAt: Date.now(),
        });

        // Update websiteData sections based on add-ons
        const websiteData = (website.websiteData as any) || {};
        let sections = Array.isArray(websiteData.sections) ? websiteData.sections : [];

        // Handle gallery - convert photos to items format expected by layouts
        if (input.addOns.gallery?.enabled) {
          const hasGallery = sections.some((s: any) => s.type === "gallery");
          const galleryItems = input.addOns.gallery.photos?.map((url: string) => ({ imageUrl: url, title: "" })) || [];
          if (!hasGallery) {
            sections.push({
              type: "gallery",
              headline: "Galerie",
              items: galleryItems,
            });
          } else {
            sections = sections.map((s: any) => {
              if (s.type === "gallery") {
                return { ...s, items: galleryItems };
              }
              return s;
            });
          }
        } else if (input.addOns.gallery?.enabled === false) {
          sections = sections.filter((s: any) => s.type !== "gallery");
        }

        // Handle menu - convert categories to items format expected by layouts
        if (input.addOns.menu?.enabled) {
          const hasMenu = sections.some((s: any) => s.type === "menu");
          // Convert categories format to items format
          const menuItems: any[] = [];
          const categories = input.addOns.menu.categories || [];
          categories.forEach((cat: any) => {
            const catItems = cat.items || [];
            catItems.forEach((item: any) => {
              menuItems.push({
                title: item.name || item.title,
                description: item.description,
                price: item.price,
                category: cat.name,
              });
            });
          });
          if (!hasMenu) {
            sections.push({
              type: "menu",
              headline: "Speisekarte",
              items: menuItems,
            });
          } else {
            sections = sections.map((s: any) => {
              if (s.type === "menu") {
                return { ...s, items: menuItems };
              }
              return s;
            });
          }
        } else if (input.addOns.menu?.enabled === false) {
          sections = sections.filter((s: any) => s.type !== "menu");
        }

        // Handle pricelist - convert categories to items format
        if (input.addOns.pricelist?.enabled) {
          const hasPricelist = sections.some((s: any) => s.type === "pricelist");
          // Convert categories format to items format
          const priceItems: any[] = [];
          const categories = input.addOns.pricelist.categories || [];
          categories.forEach((cat: any) => {
            const catItems = cat.items || [];
            catItems.forEach((item: any) => {
              priceItems.push({
                title: item.name || item.title,
                description: item.description,
                price: item.price,
                category: cat.name,
              });
            });
          });
          if (!hasPricelist) {
            sections.push({
              type: "pricelist",
              headline: "Preise",
              items: priceItems,
            });
          } else {
            sections = sections.map((s: any) => {
              if (s.type === "pricelist") {
                return { ...s, items: priceItems };
              }
              return s;
            });
          }
        } else if (input.addOns.pricelist?.enabled === false) {
          sections = sections.filter((s: any) => s.type !== "pricelist");
        }

        websiteData.sections = sections;

        // Save contact form fields to both websiteData (for rendering) and website record
        if (input.addOns.contactFormFields) {
          websiteData.contactFormFields = input.addOns.contactFormFields;
          await updateWebsite(input.websiteId, {
            websiteData,
            contactFormFields: input.addOns.contactFormFields,
          });
        } else {
          await updateWebsite(input.websiteId, { websiteData });
        }
        return { success: true };
      }),

    purchaseAddon: protectedProcedure
      .input(z.object({
        websiteId: z.number(),
        addonKey: z.enum(["contactForm", "gallery", "menu", "pricelist"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find(r => r.website.id === input.websiteId);
        if (!row) throw new TRPCError({ code: "FORBIDDEN" });
        if (!row.subscription) throw new TRPCError({ code: "NOT_FOUND", message: "Kein aktives Abonnement gefunden." });

        const stripeSubscriptionId = row.subscription.stripeSubscriptionId;
        if (stripeSubscriptionId) {
          // Step 1: create a standalone price with inline product (prices.create supports
          // product_data across all API versions; subscriptionItems.create does not)
          const price = await stripe.prices.create({
            currency: "eur",
            unit_amount: PRICING.addon,
            recurring: { interval: "month" },
            product_data: { name: `Pageblitz Add-on: ${ADDON_NAMES[input.addonKey]}` },
          } as any);

          // Step 2: add the price to the existing subscription (proration charged immediately)
          await stripe.subscriptionItems.create({
            subscription: stripeSubscriptionId,
            price: price.id,
            quantity: 1,
            proration_behavior: "create_prorations",
          } as any);
        }

        // Update addOns record in DB
        const currentAddOns = (row.subscription.addOns as Record<string, boolean>) || {};
        const newAddOns = { ...currentAddOns, [input.addonKey]: true };
        await updateSubscription(row.subscription.id, { addOns: newAddOns, updatedAt: Date.now() });
        return { success: true };
      }),

    createBillingPortalSession: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const row = rows.find((r) => r.website.id === input.websiteId);
        if (!row) throw new TRPCError({ code: "FORBIDDEN" });
        const stripeCustomerId = row.subscription?.stripeCustomerId;
        if (!stripeCustomerId) throw new TRPCError({ code: "NOT_FOUND", message: "Kein Stripe-Kundenkonto gefunden. Bitte kontaktiere den Support." });
        const origin = ctx.req.headers.origin || "https://pageblitz.de";
        const session = await stripe.billingPortal.sessions.create({
          customer: stripeCustomerId,
          return_url: `${origin}/my-account`,
        });
        return { url: session.url };
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

    getAnalytics: protectedProcedure
      .input(z.object({ websiteId: z.number() }))
      .query(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find((r) => r.website.id === input.websiteId);
        if (!owned) throw new TRPCError({ code: "FORBIDDEN", message: "Keine Berechtigung" });
        const umamiWebsiteId = (owned.website as any).umamiWebsiteId as string | null | undefined;
        if (!umamiWebsiteId) return null;
        const stats = await getUmamiStats(umamiWebsiteId);
        return stats;
      }),

    updateContactEmail: protectedProcedure
      .input(z.object({
        websiteId: z.number(),
        contactEmail: z.string().email().max(320).or(z.literal("")),
      }))
      .mutation(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find((r) => r.website.id === input.websiteId);
        if (!owned) throw new TRPCError({ code: "FORBIDDEN", message: "Keine Berechtigung" });
        await updateWebsite(input.websiteId, { contactEmail: input.contactEmail || null } as any);
        return { success: true };
      }),

    getSubmissions: protectedProcedure
      .input(z.object({ websiteId: z.number(), includeArchived: z.boolean().default(false) }))
      .query(async ({ ctx, input }) => {
        const rows = await getWebsitesByUserId(ctx.user.id);
        const owned = rows.find((r) => r.website.id === input.websiteId);
        if (!owned) throw new TRPCError({ code: "FORBIDDEN", message: "Keine Berechtigung" });
        const submissions = await getContactSubmissionsByWebsiteId(input.websiteId, { includeArchived: input.includeArchived });
        const unreadCount = await countUnreadSubmissions(input.websiteId);
        return { submissions, unreadCount };
      }),

    markSubmissionRead: protectedProcedure
      .input(z.object({ submissionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markSubmissionRead(input.submissionId);
        return { success: true };
      }),

    archiveSubmission: protectedProcedure
      .input(z.object({ submissionId: z.number(), archive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership via website
        const rows = await getWebsitesByUserId(ctx.user.id);
        // We trust the client here (submissionId belongs to one of the user's websites)
        await archiveSubmission(input.submissionId, input.archive);
        return { success: true };
      }),

    deleteSubmission: protectedProcedure
      .input(z.object({ submissionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteContactSubmission(input.submissionId);
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
            const detailsTypes = (r as any)?.types as string[] | undefined;
            const resolvedCategory = extractGmbCategory(detailsTypes || place.types) || null;

            return {
              resolved: true,
              businessName: r?.name || businessName,
              placeId: place.place_id,
              address: r?.formatted_address || place.formatted_address || null,
              phone: r?.formatted_phone_number || null,
              website: r?.website || null,
              rating: r?.rating || null,
              reviewCount: r?.user_ratings_total || 0,
              category: resolvedCategory,
              openingHours: r?.opening_hours?.weekday_text || [],
              reviews: r?.reviews || [],
            };
          } catch (err) {
            console.error("[resolveLink] share.google catch:", err);
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
            if (!nameMatch) return { resolved: false, businessName: null, placeId: null };
            const businessName = decodeURIComponent(nameMatch[1].replace(/\+/g, " "));
            // Call Places API to get proper place_id, category, hours, etc.
            try {
              const placesResult = await makeRequest<PlacesSearchResult>(
                "/maps/api/place/textsearch/json",
                { query: businessName, language: "de" }
              );
              const place = placesResult.results?.[0];
              if (!place) return { resolved: true, businessName, placeId: null, address: null, phone: null, category: null };
              const details = await makeRequest<PlaceDetailsResult>(
                "/maps/api/place/details/json",
                { place_id: place.place_id, fields: "name,formatted_address,formatted_phone_number,rating,user_ratings_total,opening_hours,types,reviews", language: "de" }
              );
              const rd = details.result;
              const detailsTypes = (rd as any)?.types as string[] | undefined;
              const resolvedCategory = extractGmbCategory(detailsTypes || place.types) || null;

              return {
                resolved: true,
                businessName: rd?.name || businessName,
                placeId: place.place_id,
                address: rd?.formatted_address || place.formatted_address || null,
                phone: rd?.formatted_phone_number || null,
                rating: rd?.rating || null,
                reviewCount: rd?.user_ratings_total || 0,
                category: resolvedCategory,
                openingHours: rd?.opening_hours?.weekday_text || [],
                reviews: rd?.reviews || [],
              };
            } catch {
              return { resolved: true, businessName, placeId: null, address: null, phone: null, category: null };
            }
          } catch {
            return { resolved: false, businessName: null, placeId: null };
          }
        }

        // ── Pattern 3: Full google.com/maps/place/NAME/... URL ────────────
        const fullUrlMatch = url.match(/google\.com\/maps\/place\/([^/@?]+)/);
        if (fullUrlMatch) {
          const businessName = decodeURIComponent(fullUrlMatch[1].replace(/\+/g, " "));
          // Try Places API for full data
          try {
            const placesResult = await makeRequest<PlacesSearchResult>(
              "/maps/api/place/textsearch/json",
              { query: businessName, language: "de" }
            );
            const place = placesResult.results?.[0];
            if (!place) return { resolved: true, businessName, placeId: null, address: null, phone: null, category: null };
            const details = await makeRequest<PlaceDetailsResult>(
              "/maps/api/place/details/json",
              { place_id: place.place_id, fields: "name,formatted_address,formatted_phone_number,rating,user_ratings_total,opening_hours,types,reviews", language: "de" }
            );
            const rd = details.result;
            const detailsTypes = (rd as any)?.types as string[] | undefined;
            const resolvedCategory = extractGmbCategory(detailsTypes || place.types) || null;
            return {
              resolved: true,
              businessName: rd?.name || businessName,
              placeId: place.place_id,
              address: rd?.formatted_address || place.formatted_address || null,
              phone: rd?.formatted_phone_number || null,
              rating: rd?.rating || null,
              reviewCount: rd?.user_ratings_total || 0,
              category: resolvedCategory,
              openingHours: rd?.opening_hours?.weekday_text || [],
              reviews: rd?.reviews || [],
            };
          } catch {
            return { resolved: true, businessName, placeId: null, address: null, phone: null, category: null };
          }
        }

        return { resolved: false, businessName: null, placeId: null };
      }),

    generateWebsiteAsync: publicProcedure
      .input(z.object({ websiteId: z.number() }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });

        // Check if there's already a pending/processing job for this website
        const existingJob = await getGenerationJobByWebsiteId(input.websiteId);
        if (existingJob && (existingJob.status === "pending" || existingJob.status === "processing")) {
          return { jobId: existingJob.id, status: existingJob.status };
        }

        // Create a new generation job
        const jobId = await createGenerationJob({
          websiteId: input.websiteId,
          status: "pending",
          progress: 0,
        });

        // Start background generation (don't await - it runs in background)
        runWebsiteGeneration(jobId, input.websiteId).catch((err) => {
          console.error(`[Generation Job ${jobId}] Background generation failed:`, err);
        });

        return { jobId, status: "pending" };
      }),

    getGenerationStatus: publicProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        const job = await getGenerationJobById(input.jobId);
        if (!job) throw new TRPCError({ code: "NOT_FOUND", message: "Generation job not found" });

        return {
          jobId: job.id,
          websiteId: job.websiteId,
          status: job.status,
          progress: job.progress,
          result: job.result,
          error: job.error,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        };
      }),

    start: publicProcedure
      .input(z.object({
        gmbUrl: z.string().optional(), // optional GMB URL
        businessName: z.string().optional(), // optional pre-filled name
        placeId: z.string().optional(), // optional Place ID from resolveLink
        address: z.string().optional(),
        phone: z.string().optional(),
        category: z.string().optional(),
        customerEmail: z.string().email().optional(), // Email for external visitors (required for landing page)
        source: z.enum(["admin", "external"]).optional().default("external"), // Source tracking
        googleReviews: z.array(z.any()).optional(), // Google reviews from resolveLink
        openingHours: z.array(z.string()).optional(), // Opening hours from resolveLink
        rating: z.string().optional(), // Google rating from resolveLink
        reviewCount: z.number().optional(), // Google review count from resolveLink
      }))
      .mutation(async ({ input, ctx }) => {
        // Validate email for external sources (when no user is logged in)
        const isLoggedIn = !!ctx.user;
        if (!isLoggedIn && input.source === "external" && !input.customerEmail) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "E-Mail-Adresse ist erforderlich" });
        }

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
          email: input.customerEmail || (isLoggedIn ? ctx.user.email : null),
          googleReviews: input.googleReviews?.length ? input.googleReviews : null,
          openingHours: input.openingHours?.length ? input.openingHours : null,
          rating: input.rating || null,
          reviewCount: input.reviewCount || null,
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
          source: input.source,
          customerEmail: input.customerEmail || (isLoggedIn ? ctx.user.email : null),
          captureStatus: (input.customerEmail || isLoggedIn) ? "email_captured" : undefined,
        });

        // If user is logged in, create a subscription to link website to user
        if (isLoggedIn && ctx.user) {
          await createSubscription({
            websiteId,
            userId: ctx.user.id,
            status: "incomplete", // Not paid yet
            plan: "base",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }

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

    /**
     * Update capture status for external leads (onboarding_started, onboarding_completed, etc.)
     */
    updateCaptureStatus: publicProcedure
      .input(z.object({
        websiteId: z.number(),
        captureStatus: z.enum(["email_captured", "onboarding_started", "onboarding_completed", "converted", "abandoned"]),
      }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
        
        await updateWebsite(input.websiteId, { captureStatus: input.captureStatus });
        return { success: true };
      }),

    /**
     * Save customer email for admin-generated websites (called from Onboarding Chat step 1)
     * Sets customerEmail + captureStatus=email_captured on the website record.
     */
    saveCustomerEmail: publicProcedure
      .input(z.object({
        websiteId: z.number(),
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
        await updateWebsite(input.websiteId, {
          customerEmail: input.email,
          captureStatus: "email_captured",
        });
        return { success: true };
      }),

    /**
     * Send lead nurturing email automatically based on capture status
     */
    sendLeadEmail: publicProcedure
      .input(z.object({
        websiteId: z.number(),
        template: z.enum(["onboardingStarted", "onboardingCompleted", "abandonedEmailCaptured", "abandonedOnboarding"]),
      }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });
        if (!website.customerEmail) throw new TRPCError({ code: "BAD_REQUEST", message: "No customer email found" });

        const { sendLeadEmail: sendEmailFn } = await import("./_core/email");
        
        const business = await getBusinessById(website.businessId);
        const businessName = business?.name || "Ihr Unternehmen";
        const previewUrl = `${ENV.appId}/preview/${website.previewToken}/onboarding`;
        const startUrl = `${ENV.appId}/start`;

        const result = await sendEmailFn({
          to: website.customerEmail,
          template: input.template,
          data: {
            businessName,
            previewUrl,
            websiteId: website.id,
            startUrl,
          },
        });

        if (!result.success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error || "Failed to send email" });
        }

        return { success: true, emailId: result.id };
      }),

    /**
     * Capture email address as first funnel step – creates a lightweight lead record
     * with captureStatus=email_captured before the visitor chooses GMB or manual.
     */
    captureEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        // Create a minimal placeholder business so we can attach a website record
        const baseSlug = `lead-${nanoid(8)}`;
        const businessId = await upsertBusiness({
          name: "Lead (E-Mail erfasst)",
          slug: baseSlug,
          placeId: `email-${nanoid(8)}`,
          category: "",
          address: "",
          phone: "",
          email: input.email,
        });
        const previewToken = nanoid(32);
        const websiteId = await createGeneratedWebsite({
          businessId,
          slug: `email-lead-${baseSlug}`,
          status: "preview",
          previewToken,
          onboardingStatus: "pending",
          source: "external",
          customerEmail: input.email,
          captureStatus: "email_captured",
        });
        return { websiteId, previewToken };
      }),

    /**
     * Test email configuration - sends a test email
     */
    testEmail: publicProcedure
      .input(z.object({
        to: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const { sendEmail } = await import("./_core/email");
        
        const result = await sendEmail({
          to: input.to,
          subject: "Resend Test - Pageblitz",
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; text-align: center;">
              <h1 style="font-size: 28px; font-weight: 700; color: #6366f1;">✅ Resend funktioniert!</h1>
              <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Deine E-Mail-Konfiguration ist korrekt eingerichtet.
              </p>
              <p style="font-size: 14px; color: #64748b;">
                Zeitpunkt: ${new Date().toLocaleString('de-DE')}
              </p>
            </div>
          `,
        });

        if (!result.success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error || "Failed to send test email" });
        }

        return { success: true, emailId: result.id };
      }),

    /**
     * Generate initial website content based on business category and name.
     * Called automatically when user provides both category and name in onboarding.
     * Returns generated headline, tagline, and description.
     */
    generateInitialContent: publicProcedure
      .input(z.object({
        websiteId: z.number(),
        businessName: z.string(),
        businessCategory: z.string(),
        addressingMode: z.enum(['du', 'Sie']).optional().default('du'),
      }))
      .mutation(async ({ input }) => {
        const website = await getWebsiteById(input.websiteId);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website not found" });

        const business = await getBusinessById(website.businessId);
        if (!business) throw new TRPCError({ code: "NOT_FOUND", message: "Business not found" });

        const { businessName, businessCategory, addressingMode } = input;

        // Build StoryBrand-aligned prompt for all website content
        const prompt = `Du bist ein Experte für das StoryBrand-Framework von Donald Miller und erstellst Website-Texte für deutsche Kleinunternehmen.

Das StoryBrand-Prinzip: Der KUNDE ist der Held – nicht das Unternehmen. Das Unternehmen ist der GUIDE, der dem Kunden hilft, sein Ziel zu erreichen und sein Problem zu lösen.

Unternehmensname: ${businessName}
Branche/Kategorie: ${businessCategory}
Anrede: ${addressingMode === 'Sie' ? 'Besucher IMMER siezen – also "Sie", "Ihnen", "Ihr" verwenden. Niemals "du", "dir", "dein".' : 'Besucher IMMER duzen – also "du", "dir", "dein" verwenden. Niemals "Sie", "Ihnen", "Ihr".'}

Erstelle folgende Website-Texte strikt nach StoryBrand:

1. "headline": Die Hero-Hauptüberschrift. Formuliere sie AUS KUNDENSICHT: Was ist das Ergebnis/Ziel, das der Kunde erreichen will? (max. 7 Wörter, kein "Wir"-Anfang, kein Unternehmensname)
   Beispiele guter Headlines: "Endlich eine Website, die Kunden bringt" / "Ihr Recht. Klar und konsequent durchgesetzt." / "Traumküche nach Maß – pünktlich und sauber"

2. "tagline": Ein Untertitel, der das Kundenproblem oder den Hauptnutzen auf den Punkt bringt. (max. 15 Wörter)
   Formulierung: Konkret, nutzenorientiert, spricht das tägliche Problem des Kunden an.

3. "aboutHeadline": Headline für die "Über uns"-Sektion. Positioniert das Unternehmen als kompetenten, empathischen GUIDE – nicht als Selbstdarstellung. (max. 6 Wörter)
   Beispiele: "Wir kennen Ihre Herausforderung" / "Seit 20 Jahren Ihr Partner" / "Handwerk, das für sich spricht"

4. "description": Text für die About-Sektion (3-4 Sätze). Struktur PFLICHT:
   Satz 1: Empathie – zeige, dass du das Problem des Kunden verstehst.
   Satz 2: Kompetenz/Autorität – kurzer Beweis (Jahre Erfahrung, Anzahl Kunden, Zertifizierung etc.).
   Satz 3-4: Versprechen – was passiert konkret, wenn der Kunde mit euch arbeitet?

5. "processHeadline": Headline für den 3-Schritte-Plan. Kurz, einladend, leicht. (max. 5 Wörter)
   Beispiele: "In 3 Schritten zum Ziel" / "So einfach starten Sie" / "Ihr Weg zu uns"

6. "processSteps": Array mit GENAU 3 Schritten. Jeder Schritt aus KUNDENPERSPEKTIVE formuliert – was TUT der Kunde, was BEKOMMT er?
   Format: { "title": "Kurzer Schritttitel (2-3 Wörter)", "description": "Was passiert in diesem Schritt für den Kunden? (1 Satz, max. 12 Wörter)" }
   Schritt 1: Erster, einfacher Kontaktschritt (niedrige Hemmschwelle)
   Schritt 2: Was das Unternehmen für den Kunden erarbeitet/plant
   Schritt 3: Das Ergebnis – was der Kunde in Händen hält / erlebt

7. "services": Array mit 3-5 Leistungen. Jede Leistung BENEFIT-FIRST: Erst was der Kunde gewinnt, dann wie.
   Format: { "title": "Leistungsname (2-4 Wörter)", "description": "Nutzen für den Kunden zuerst, dann Beschreibung. (1-2 Sätze)" }
   KEINE generischen Titel wie "Beratung", "Service", "Leistung 1".

WICHTIGE REGELN:
- Nie "Wir sind", "Unser Team", "Wir bieten" als Satzanfang in Headlines
- Immer konkret und branchenspezifisch für "${businessCategory}"
- Deutsch, professionell, keine Anglizismen außer Fachbegriffe
- Keine Ausrufezeichen in Headlines

Antworte AUSSCHLIESSLICH mit validem JSON:
{
  "headline": "...",
  "tagline": "...",
  "aboutHeadline": "...",
  "description": "...",
  "processHeadline": "...",
  "processSteps": [
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ],
  "services": [
    { "title": "...", "description": "..." }
  ]
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Du bist ein Conversion-Texter, der das StoryBrand-Framework von Donald Miller beherrscht. Du schreibst deutsche Website-Texte, die Kunden als Helden positionieren und das Unternehmen als kompetenten Guide. Antworte AUSSCHLIESSLICH mit validem JSON." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== "string") {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "LLM hat keinen Inhalt zurückgegeben" });
        }

        let generatedContent: {
          headline?: string;
          tagline?: string;
          aboutHeadline?: string;
          description?: string;
          processHeadline?: string;
          processSteps?: Array<{ title: string; description: string }>;
          services?: Array<{ title: string; description: string }>;
        };
        try {
          const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
          generatedContent = JSON.parse(cleaned);
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "LLM hat kein valides JSON zurückgegeben" });
        }

        // Update websiteData with StoryBrand-aligned content
        const currentWebsiteData = (website.websiteData || {}) as Record<string, any>;

        // Format services (benefit-first)
        const generatedServices = generatedContent.services?.slice(0, 5).map((svc: any) => ({
          title: svc.title || "Leistung",
          description: svc.description || "Professionelle Ausführung",
          icon: null,
        })) || [];

        // Format process steps (customer-outcome-oriented)
        const generatedProcessSteps = generatedContent.processSteps?.slice(0, 3).map((step: any, i: number) => ({
          step: String(i + 1),
          title: step.title || ["Kontakt", "Beratung", "Ergebnis"][i],
          description: step.description || "",
        })) || null;

        const updatedWebsiteData = {
          ...currentWebsiteData,
          businessName,
          headline: generatedContent.headline || currentWebsiteData.headline,
          tagline: generatedContent.tagline || currentWebsiteData.tagline,
          description: generatedContent.description || currentWebsiteData.description,
          sections: currentWebsiteData.sections?.map((section: any) => {
            if (section.type === "hero") {
              return {
                ...section,
                headline:    generatedContent.headline    || section.headline,
                subheadline: generatedContent.tagline     || section.subheadline,
                ctaText:     section.ctaText, // preserve existing CTA
              };
            }
            if (section.type === "about") {
              return {
                ...section,
                headline: generatedContent.aboutHeadline || section.headline,
                content:  generatedContent.description   || section.content,
              };
            }
            if ((section.type === "services" || section.type === "features") && generatedServices.length > 0) {
              return {
                ...section,
                items: generatedServices,
              };
            }
            if (section.type === "process" && generatedProcessSteps) {
              return {
                ...section,
                headline: generatedContent.processHeadline || section.headline,
                items: generatedProcessSteps,
              };
            }
            return section;
          }) || [],
        };

        await updateWebsite(input.websiteId, { websiteData: updatedWebsiteData });

        return {
          success: true,
          headline:       generatedContent.headline,
          tagline:        generatedContent.tagline,
          aboutHeadline:  generatedContent.aboutHeadline,
          description:    generatedContent.description,
          processHeadline: generatedContent.processHeadline,
          processSteps:   generatedProcessSteps,
          services:       generatedServices,
        };
      }),
  }),

  // ── Public: Contact Form ──────────────────────────────────────
  contact: router({
    submit: publicProcedure
      .input(z.object({
        slug: z.string(),
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
        phone: z.string().max(50).optional(),
        message: z.string().min(1).max(5000),
        customFields: z.record(z.string(), z.string()).optional(),
        // Honeypot: filled by bots, must be empty for humans
        website_url: z.string().max(0).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Honeypot check – bots fill this field
        if (input.website_url && input.website_url.length > 0) {
          return { success: true }; // silently ignore
        }

        // Look up website by slug
        const website = await getWebsiteBySlug(input.slug);
        if (!website) throw new TRPCError({ code: "NOT_FOUND", message: "Website nicht gefunden" });

        // IP-based rate limiting: max 5 submissions per IP per hour
        const ip = (ctx as any).req?.ip
          || (ctx as any).req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim()
          || "unknown";
        const recentCount = await countRecentSubmissionsByIp(ip, 60 * 60 * 1000);
        if (recentCount >= 5) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Zu viele Anfragen. Bitte versuche es später erneut." });
        }

        // Save to DB
        await createContactSubmission({
          websiteId: website.id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.message,
          customFields: input.customFields ?? {},
          ipAddress: ip,
        });

        // Send email notification to business owner
        const business = website.businessId ? await getBusinessById(website.businessId) : null;
        // contactEmail on website overrides business.email
        const recipientEmail = (website as any).contactEmail || business?.email;

        if (recipientEmail) {
          const { sendEmail } = await import("./_core/email");
          const businessName = business?.name ?? website.slug;
          await sendEmail({
            to: recipientEmail,
            from: `Pageblitz Kontaktformular <kontakt@pageblitz.de>`,
            replyTo: input.email, // Business owner hits "Reply" → antwort geht direkt an Besucher
            subject: `Neue Kontaktanfrage – ${businessName}`,
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 32px 16px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #18181b; padding: 28px 32px;">
      <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.08em;">Neue Kontaktanfrage</p>
      <h1 style="color: #ffffff; font-size: 22px; font-weight: 600; margin: 0;">${businessName}</h1>
    </div>
    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #71717a; font-size: 13px; width: 30%;">Name</td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #18181b; font-size: 14px; font-weight: 500;">${input.name}</td></tr>
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #71717a; font-size: 13px;">E-Mail</td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${input.email}" style="color: #6366f1; font-size: 14px; text-decoration: none;">${input.email}</a></td></tr>
        ${input.phone ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #71717a; font-size: 13px;">Telefon</td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #18181b; font-size: 14px;">${input.phone}</td></tr>` : ""}
      </table>
      <div style="margin-top: 24px; background: #f9f9f9; border-radius: 8px; padding: 20px;">
        <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.06em;">Nachricht</p>
        <p style="color: #18181b; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${input.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      </div>
      <div style="margin-top: 24px; text-align: center;">
        <a href="mailto:${input.email}?subject=Re: Kontaktanfrage" style="display: inline-block; background: #18181b; color: #fff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 12px 28px; border-radius: 8px;">Direkt antworten</a>
      </div>
    </div>
    <div style="padding: 20px 32px; border-top: 1px solid #f0f0f0; text-align: center;">
      <p style="color: #a1a1aa; font-size: 12px; margin: 0;">Gesendet via <a href="https://pageblitz.de" style="color: #6366f1; text-decoration: none;">pageblitz.de</a></p>
    </div>
  </div>
</body>
</html>`,
          }).catch(() => { /* non-critical */ });
        }

        return { success: true };
      }),
  }),

  // ── Admin: Lead Funnel ──────────────────────────────────────
  leads: router({
    funnel: adminProcedure
      .query(async () => {
        return getLeadFunnelStats();
      }),

    list: adminProcedure
      .input(z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
        captureStatus: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const leads = await listExternalLeads(input.limit ?? 100, input.offset ?? 0, input.captureStatus);
        const total = await countExternalLeads(input.captureStatus);
        return { leads, total };
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        captureStatus: z.enum(["email_captured", "onboarding_started", "onboarding_completed", "converted", "abandoned"]),
      }))
      .mutation(async ({ input }) => {
        await updateWebsite(input.id, { captureStatus: input.captureStatus });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
