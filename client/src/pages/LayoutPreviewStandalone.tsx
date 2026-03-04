/**
 * Standalone layout preview page – renders any of the 10 premium layouts with mock data.
 * Route: /layout-preview/:key?scheme=trust|warm|elegant|modern
 * Opens without any admin chrome so the layout fills the full viewport.
 */

import { useRoute, useLocation } from "wouter";
import {
  BoldLayoutV2, ElegantLayoutV2, CleanLayoutV2, CraftLayoutV2,
  DynamicLayoutV2, FreshLayoutV2, LuxuryLayoutV2, ModernLayoutV2,
  NaturalLayoutV2, PremiumLayoutV2,
} from "@/components/layouts/PremiumLayoutsV2";
import { PREDEFINED_COLOR_SCHEMES } from "@shared/layoutConfig";
import { withOnColors } from "@shared/layoutConfig";

// ── Mock business data – realistic German small business ──────────
const MOCK_DATA: Record<string, any> = {
  BOLD: {
    businessName: "Müller Bau GmbH",
    tagline: "Solide gebaut – seit 1987",
    googleRating: 4.8,
    googleReviewCount: 127,
    sections: [
      { type: "hero", headline: "Ihr Spezialist für Hochbau & Sanierung", subheadline: "Lange Wartezeiten? Nicht bei uns. Wir planen, bauen und liefern – termingerecht und zum Festpreis.", ctaText: "Angebot anfragen" },
      { type: "services", items: [
        { title: "Hochbau & Rohbau", description: "Von der Bodenplatte bis zum Dachstuhl – wir realisieren Ihr Bauprojekt mit modernster Technik und jahrzehntelanger Erfahrung." },
        { title: "Sanierung & Umbau", description: "Wir modernisieren Altbauten und schaffen neuen Wohnraum mit minimalem Aufwand für Sie als Bauherr." },
        { title: "Tiefbau & Erdarbeiten", description: "Fundamente, Kanalarbeiten, Entwässerung – unser Fuhrpark ist für jede Bautiefe ausgestattet." },
      ]},
      { type: "process", headline: "In 3 Schritten zum Festpreis", items: [
        { step: "1", title: "Beratungsgespräch", description: "Kostenloser Termin vor Ort – wir besichtigen gemeinsam und nehmen alle Maße auf." },
        { step: "2", title: "Detailofferte", description: "Sie erhalten ein transparentes Festpreisangebot ohne versteckte Kosten innerhalb von 48 Stunden." },
        { step: "3", title: "Baubeginn", description: "Nach Ihrer Freigabe starten wir zum vereinbarten Termin – pünktlich und professionell." },
      ]},
      { type: "about", headline: "35 Jahre Erfahrung im Hochbau", content: "Seit 1987 bauen wir für private Bauherren und gewerbliche Kunden im Raum München. Über 800 erfolgreich abgeschlossene Projekte sprechen für sich. Unser Team aus 42 Fachkräften steht für Qualität, die Generationen überdauert." },
      { type: "contact", items: [
        { icon: "MapPin", description: "Industriestraße 14, 80339 München" },
        { icon: "Phone", description: "+49 89 123 456 78" },
        { icon: "Clock", description: "Mo–Fr: 07:00–17:00 Uhr" },
      ]},
      { type: "testimonials", items: [
        { author: "Thomas K.", rating: 5, description: "Absolut professionelle Arbeit. Unser Anbau wurde termingerecht und zum vereinbarten Preis fertiggestellt." },
        { author: "Sabine M.", rating: 5, description: "Von der Planung bis zur Übergabe – alles reibungslos. Sehr empfehlenswert!" },
        { author: "Georg F.", rating: 5, description: "Die Sanierung unseres Altbaus war eine große Aufgabe. Müller Bau hat sie perfekt gemeistert." },
      ]},
    ],
  },
};

// Generate generic mock for all other layouts
const genericMock = (name: string, tagline: string, cta: string, services: [string, string][], aboutHeadline: string) => ({
  businessName: name,
  tagline,
  googleRating: 4.7,
  googleReviewCount: 84,
  sections: [
    { type: "hero", headline: tagline, subheadline: "Professionell, zuverlässig und immer für Sie da – vereinbaren Sie noch heute Ihren Termin.", ctaText: cta },
    { type: "services", items: services.map(([title, desc]) => ({ title, description: desc })) },
    { type: "process", headline: "So einfach geht's", items: [
      { step: "1", title: "Kontakt aufnehmen", description: "Rufen Sie uns an oder senden Sie eine Nachricht – wir melden uns innerhalb von 24 Stunden." },
      { step: "2", title: "Persönliche Beratung", description: "Wir analysieren Ihre Situation und erarbeiten gemeinsam die optimale Lösung für Sie." },
      { step: "3", title: "Ergebnis genießen", description: "Lehnen Sie sich zurück – wir kümmern uns um alles und informieren Sie zu jedem Schritt." },
    ]},
    { type: "about", headline: aboutHeadline, content: "Mit jahrelanger Erfahrung und echtem Herzblut für unsere Arbeit stehen wir für Qualität, die man spürt. Unser Team aus erfahrenen Fachleuten ist täglich mit Leidenschaft für Sie im Einsatz." },
    { type: "contact", items: [
      { icon: "MapPin", description: "Hauptstraße 42, 80331 München" },
      { icon: "Phone", description: "+49 89 987 654 32" },
      { icon: "Clock", description: "Mo–Fr: 09:00–18:00 Uhr" },
    ]},
    { type: "testimonials", items: [
      { author: "Maria S.", rating: 5, description: "Einfach toll! Kompetente Beratung und ein hervorragendes Ergebnis. Sehr empfehlenswert." },
      { author: "Klaus H.", rating: 5, description: "Professionell von Anfang bis Ende. Ich bin sehr zufrieden und komme gerne wieder." },
      { author: "Anna B.", rating: 4, description: "Tolle Arbeit, schnelle Umsetzung. Meine Erwartungen wurden vollständig erfüllt." },
    ]},
  ],
});

const MOCK: Record<string, any> = {
  BOLD: MOCK_DATA.BOLD,
  ELEGANT: genericMock("Studio Belle", "Schönheit, die bewegt", "Termin buchen", [
    ["Haarpflege & Styling", "Von der klassischen Pflege bis zum modernen Statement-Look – wir bringen Ihren Stil zum Strahlen."],
    ["Kosmetik & Gesichtspflege", "Professionelle Gesichtsbehandlungen mit hochwertigen Produkten für jugendlich frische Haut."],
    ["Nägel & Maniküre", "Gepflegte Hände und perfekte Nägel – für jeden Anlass und jeden Stil."],
  ], "Unser Konzept"),
  CLEAN: genericMock("Dr. med. Lena Hoffmann", "Ihre Gesundheit in guten Händen", "Termin vereinbaren", [
    ["Allgemeinmedizin", "Umfassende Grundversorgung für die ganze Familie – von der Vorsorge bis zur akuten Behandlung."],
    ["Check-up & Vorsorge", "Regelmäßige Gesundheitschecks erkennen Risiken früh und sichern Ihre Lebensqualität langfristig."],
    ["Hausbesuche", "Für Patienten, die nicht mobil sind – wir kommen zu Ihnen nach Hause."],
  ], "Über die Praxis"),
  CRAFT: genericMock("Tischler Grünwald", "Handwerk mit Seele", "Angebot anfragen", [
    ["Maßmöbel & Einbauküchen", "Jedes Möbelstück wird individuell für Sie geplant und gefertigt – Handarbeit vom Feinsten."],
    ["Treppen & Böden", "Holztreppen und Parkettböden die Generationen überdauern. Verlegt mit Präzision und Leidenschaft."],
    ["Renovierung & Restaurierung", "Alten Möbeln neues Leben einhauchen – wir restaurieren mit Respekt vor dem Original."],
  ], "Unsere Werkstatt"),
  DYNAMIC: genericMock("Iron Forge Gym", "Stärker werden. Jeden Tag.", "Training buchen", [
    ["Personal Training", "1:1-Betreuung mit unserem erfahrenen Trainer-Team – individuell auf Ihre Ziele abgestimmt."],
    ["Gruppentraining", "Gemeinsam stärker: HIIT, CrossFit, Boxen und Yoga in energiegeladener Gruppenatmosphäre."],
    ["Ernährungsberatung", "Die Basis für Ihren Erfolg: professionelle Ernährungspläne, die wirklich funktionieren."],
  ], "Unsere Mission"),
  FRESH: genericMock("Café Morgenrot", "Frisch. Regional. Mit Liebe.", "Reservieren", [
    ["Frühstück & Brunch", "Hausgemachte Aufschnitte, regionale Bio-Eier und unser legendäres Sauerteigbrot – täglich ab 8 Uhr."],
    ["Mittagstisch", "Täglich wechselnde Gerichte mit saisonalen Zutaten direkt von Bauern aus der Region."],
    ["Catering & Events", "Für Ihre Veranstaltung liefern wir – von der Geburtstagsfeier bis zur Firmenveranstaltung."],
  ], "Unsere Philosophie"),
  LUXURY: genericMock("Galerie Noir", "Exzellenz ohne Kompromisse", "Termin vereinbaren", [
    ["Premium Beratung", "Diskrete Einzelberatung auf Einladung – für Kunden, die das Beste erwarten."],
    ["Exklusive Objekte", "Kuratierte Auswahl seltener Stücke aus den renommiertesten Häusern Europas."],
    ["Private Events", "Exklusive Abendveranstaltungen und Präsentationen für ausgewählte Gäste."],
  ], "Über uns"),
  MODERN: genericMock("Pixel & Code Agency", "Digitale Lösungen die wirken", "Projekt starten", [
    ["Webdesign & Entwicklung", "Individuelle Websites und Web-Apps, die Ihre Marke perfekt repräsentieren und konvertieren."],
    ["SEO & Performance", "Mehr Sichtbarkeit, mehr Besucher, mehr Kunden – datengetriebene Strategien mit messbaren Ergebnissen."],
    ["Branding & Design", "Von der Visitenkarte bis zur kompletten Corporate Identity – wir schaffen Identitäten, die in Erinnerung bleiben."],
  ], "Über die Agentur"),
  NATURAL: genericMock("Naturheilpraxis Waldquelle", "Im Einklang mit der Natur", "Beratung anfragen", [
    ["Naturheilkunde", "Ganzheitliche Therapieansätze, die den Menschen in seiner Einheit aus Körper, Geist und Seele sehen."],
    ["Kräuterkunde & Phytotherapie", "Heilpflanzen in der Behandlung: traditionelles Wissen, modern angewendet."],
    ["Entspannung & Stressabbau", "Shiatsu, Aromatherapie und Meditation für innere Balance und nachhaltiges Wohlbefinden."],
  ], "Unsere Philosophie"),
  PREMIUM: genericMock("Consulting Partners GmbH", "Strategie trifft Wirkung", "Kontakt aufnehmen", [
    ["Unternehmensberatung", "Strategische Weiterentwicklung, Prozessoptimierung und Change Management für nachhaltiges Wachstum."],
    ["M&A Advisory", "Diskreter Begleiter bei Unternehmenstransaktionen – von der Due Diligence bis zum Closing."],
    ["Executive Coaching", "Individuelle Führungskräfteentwicklung für Top-Manager und Geschäftsführer."],
  ], "Unsere Expertise"),
};

const LAYOUTS: Record<string, { component: React.ComponentType<any>; label: string; heroImage: string }> = {
  BOLD:    { component: BoldLayoutV2,    label: "Bold – Bau & Industrie",       heroImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80&fit=crop" },
  ELEGANT: { component: ElegantLayoutV2, label: "Elegant – Beauty & Lifestyle",  heroImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80&fit=crop" },
  CLEAN:   { component: CleanLayoutV2,   label: "Clean – Medizin & Praxis",      heroImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80&fit=crop" },
  CRAFT:   { component: CraftLayoutV2,   label: "Craft – Handwerk & Tischler",   heroImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80&fit=crop" },
  DYNAMIC: { component: DynamicLayoutV2, label: "Dynamic – Sport & Fitness",     heroImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&fit=crop" },
  FRESH:   { component: FreshLayoutV2,   label: "Fresh – Café & Gastronomie",    heroImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80&fit=crop" },
  LUXURY:  { component: LuxuryLayoutV2,  label: "Luxury – Premium & Mode",       heroImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80&fit=crop" },
  MODERN:  { component: ModernLayoutV2,  label: "Modern – IT & Agentur",         heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&fit=crop" },
  NATURAL: { component: NaturalLayoutV2, label: "Natural – Bio & Natur",         heroImage: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1600&q=80&fit=crop" },
  PREMIUM: { component: PremiumLayoutV2, label: "Premium – Business & Consulting", heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&fit=crop" },
};

export default function LayoutPreviewStandalone() {
  const [match, params] = useRoute("/layout-preview/:key");
  const [location] = useLocation();

  // Parse query params
  const urlParams = new URLSearchParams(window.location.search);
  const schemeId = urlParams.get("scheme") || "trust";

  const key = (params?.key || "BOLD").toUpperCase();
  const layout = LAYOUTS[key] || LAYOUTS.BOLD;
  const LayoutComponent = layout.component;
  const mockData = MOCK[key] || MOCK.BOLD;

  // Find color scheme
  const scheme = PREDEFINED_COLOR_SCHEMES.find(s => s.id === schemeId) || PREDEFINED_COLOR_SCHEMES[0];

  return (
    <LayoutComponent
      websiteData={mockData}
      cs={scheme.colors}
      heroImageUrl={layout.heroImage}
      isLoading={false}
    />
  );
}
