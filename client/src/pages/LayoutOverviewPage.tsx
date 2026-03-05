/**
 * Admin: Layout Overview – zeigt alle 10 Premium-Layouts als anklickbare Karten.
 * Jede Karte öffnet die Vollansicht in einem neuen Tab.
 */

import { useState } from "react";
import { ExternalLink, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PREDEFINED_COLOR_SCHEMES } from "@shared/layoutConfig";

const LAYOUTS = [
  {
    key: "BOLD",
    label: "Bold",
    industry: "Bau & Industrie",
    headline: "Space Grotesk 900",
    body: "Plus Jakarta Sans 400",
    bg: "#0A0A0A",
    text: "#FFFFFF",
    accent: "#E8C13A",
    description: "Industrielle Präzision – brutalistisches Raster, diagonaler Hero-Cut mit Overlaps, Grain-Textur.",
  },
  {
    key: "ELEGANT",
    label: "Elegant",
    industry: "Beauty & Lifestyle",
    headline: "Cormorant Garamond 300 italic",
    body: "Jost 300",
    bg: "#FFFDFB",
    text: "#2A2018",
    accent: "#967B5C",
    description: "Premium Editorial – asymmetrischer Hero mit Überlappungen, Grain-Overlay, Haarlinien-Akzente.",
  },
  {
    key: "CLEAN",
    label: "Clean",
    industry: "Medizin & Praxis",
    headline: "Outfit 800",
    body: "Outfit 400",
    bg: "#FFFFFF",
    text: "#0F172A",
    accent: "#1B3D6F",
    description: "Klinische Exzellenz – 12-Spalten Hero-Grid, abgerundete Ecken, minimalistische Präzision.",
  },
  {
    key: "CRAFT",
    label: "Craft",
    industry: "Handwerk & Tischler",
    headline: "Playfair Display 900",
    body: "Source Sans 3 400",
    bg: "#F2EBD9",
    text: "#3D2B1A",
    accent: "#A0522D",
    description: "Handwerk-Wärme – Pergament-Hintergrund, Ecknummern-Badges, Werkzeug-Icon.",
  },
  {
    key: "DYNAMIC",
    label: "Dynamic",
    industry: "Sport & Fitness",
    headline: "Bebas Neue",
    body: "Rajdhani 500",
    bg: "#080808",
    text: "#FFFFFF",
    accent: "#E53E3E",
    description: "Kinetische Energie – riesige Schrift, diagonaler Clip-Path bei Hero-Bild, Grid-Cards.",
  },
  {
    key: "FRESH",
    label: "Fresh",
    industry: "Café & Gastronomie",
    headline: "Fraunces 700 italic",
    body: "Fraunces 300",
    bg: "#FBF7F0",
    text: "#2D1E12",
    accent: "#C05A2C",
    description: "Food-Editorial – rotierendes SVG-Stempel-Badge auf dem Hero-Bild, organische Rundungen.",
  },
  {
    key: "LUXURY",
    label: "Luxury",
    industry: "Premium & Mode",
    headline: "Playfair Display italic",
    body: "Tenor Sans 400",
    bg: "#0C0A09",
    text: "#F5F5F0",
    accent: "#C9A43A",
    description: "Cinematic High-End – Full-screen Hero mit dramatischen Overlays, maximale Exklusivität, Grain-Textur.",
  },
  {
    key: "MODERN",
    label: "Modern",
    industry: "IT & Agentur",
    headline: "Clash Display 800",
    body: "Satoshi 400",
    bg: "#FFFFFF",
    text: "#111827",
    accent: "#2563EB",
    description: "Tech-Avantgarde – Gradient Meshes, asymmetrisches Grid, moderne Typografie, floating Badges.",
  },
  {
    key: "NATURAL",
    label: "Natural",
    industry: "Bio & Natur",
    headline: "Cormorant Garamond 300",
    body: "DM Sans 400",
    bg: "#fcfaf7",
    text: "#2D2A20",
    accent: "#3D5A4C",
    description: "Botanisch-organisch – pillenförmige Bilder-Paare, organische Hintergründe, weiche Erdtöne.",
  },
  {
    key: "PREMIUM",
    label: "Premium",
    industry: "Business & Consulting",
    headline: "Instrument Serif italic",
    body: "Plus Jakarta Sans 400",
    bg: "#0F1E3C",
    text: "#FFFFFF",
    accent: "#C9A43A",
    description: "Autorität & Klasse – dunkles Navy-Panel links, weißes Bild-Panel rechts.",
  },
];

export default function LayoutOverviewPage() {
  const [selectedScheme, setSelectedScheme] = useState("trust");

  const openPreview = (key: string) => {
    window.open(`/layout-preview/${key}?scheme=${selectedScheme}`, "_blank");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Layout Vorschau</h1>
        <p className="text-muted-foreground text-sm">Alle 10 Premium-Layouts mit Mock-Daten. Klicke auf "Vorschau öffnen" um das Layout im Vollbild zu sehen.</p>
      </div>

      {/* Color scheme switcher */}
      <div className="mb-8 p-4 bg-muted/50 rounded-xl border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Farbschema für Vorschau wählen</p>
        <div className="flex flex-wrap gap-3">
          {PREDEFINED_COLOR_SCHEMES.map(scheme => (
            <button
              key={scheme.id}
              onClick={() => setSelectedScheme(scheme.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                selectedScheme === scheme.id
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scheme.colors.primary }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scheme.colors.accent }} />
              </div>
              {scheme.label}
            </button>
          ))}
        </div>
      </div>

      {/* Layout grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {LAYOUTS.map(layout => (
          <div key={layout.key} className="bg-card border rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
            {/* Color preview bar */}
            <div className="h-24 relative flex items-end" style={{ backgroundColor: layout.bg }}>
              <div className="absolute inset-0 flex items-center justify-center select-none">
                <span style={{ fontFamily: "serif", fontStyle: "italic", fontSize: "4rem", fontWeight: 700, color: layout.accent, opacity: 0.12, lineHeight: 1 }}>
                  {layout.label.charAt(0)}
                </span>
              </div>
              <div className="relative z-10 px-4 pb-3 flex items-end justify-between w-full">
                <span style={{ color: layout.text, fontWeight: 700, fontSize: "1.1rem", textShadow: layout.bg === "#FFFFFF" ? "none" : "0 1px 2px rgba(0,0,0,0.5)" }}>
                  {layout.label}
                </span>
                <div className="flex gap-1.5">
                  <div className="w-4 h-4 rounded-full ring-1 ring-white/20" style={{ backgroundColor: layout.bg === "#FFFFFF" ? layout.accent : "#FFFFFF" }} />
                  <div className="w-4 h-4 rounded-full ring-1 ring-white/20" style={{ backgroundColor: layout.accent }} />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-2 mb-3">
                <Badge variant="secondary" className="text-xs font-medium">{layout.industry}</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{layout.description}</p>

              {/* Font info */}
              <div className="space-y-1 mb-4 text-xs text-muted-foreground">
                <div className="flex gap-2">
                  <span className="font-medium text-foreground/70 w-16 shrink-0">Display</span>
                  <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">{layout.headline}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-foreground/70 w-16 shrink-0">Body</span>
                  <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">{layout.body}</span>
                </div>
              </div>

              <div className="mt-auto">
                <Button
                  onClick={() => openPreview(layout.key)}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Monitor size={15} />
                  Vorschau öffnen
                  <ExternalLink size={13} className="ml-auto opacity-60" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300">
        <p className="font-semibold mb-1">Wie wird das Layout zugewiesen?</p>
        <p className="text-blue-700/80 dark:text-blue-400/80">
          Das Layout wird automatisch anhand der Branche des Unternehmens ausgewählt (z.B. "Friseur" → Elegant, "Gym" → Dynamic).
          Das Farbschema wählt der Kunde im Onboarding-Chat. Die hier gezeigte Farbe entspricht der Auswahl oben.
        </p>
      </div>
    </div>
  );
}
