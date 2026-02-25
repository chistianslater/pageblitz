/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ── Website Generation Types ───────────────────────────

export interface WebsiteSection {
  type: "hero" | "about" | "services" | "testimonials" | "gallery" | "contact" | "cta" | "features" | "faq" | "team";
  headline?: string;
  subheadline?: string;
  content?: string;
  items?: Array<{
    title?: string;
    description?: string;
    icon?: string;
    rating?: number;
    author?: string;
    question?: string;
    answer?: string;
  }>;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

export interface WebsiteData {
  businessName: string;
  tagline: string;
  description: string;
  sections: WebsiteSection[];
  seoTitle: string;
  seoDescription: string;
  footer: {
    text: string;
    links?: Array<{ label: string; href: string }>;
  };
  // Real Google data injected at generation time
  googleRating?: number | null;
  googleReviewCount?: number | null;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textLight: string;
  gradient?: string;
}

export interface BusinessSearchResult {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  lat?: number;
  lng?: number;
  openingHours?: string[];
  hasWebsite: boolean;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  enabled: boolean;
}

export const AVAILABLE_ADDONS: Addon[] = [
  { id: "contact-form", name: "Kontaktformular", description: "Professionelles Kontaktformular mit E-Mail-Benachrichtigung", price: 49, icon: "MessageSquare", enabled: false },
  { id: "ai-chat", name: "KI-Chat", description: "Intelligenter Chatbot für automatische Kundenanfragen", price: 99, icon: "Bot", enabled: false },
  { id: "booking", name: "Terminbuchung", description: "Online-Terminbuchungssystem für Ihre Kunden", price: 79, icon: "Calendar", enabled: false },
  { id: "custom-domain", name: "Eigene Domain", description: "Verbinden Sie Ihre eigene Domain", price: 29, icon: "Globe", enabled: false },
];
