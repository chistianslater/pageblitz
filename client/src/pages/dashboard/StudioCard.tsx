import React from "react";
import type { ReactNode } from "react";
import {
  Palette,
  Image,
  Type,
  ShoppingBag,
  Scale,
  Sparkles,
} from "lucide-react";
import { CHECKLIST_ORDER } from "@shared/onboardingV2/checklist";
import { withPanelParam } from "@/pages/onboarding-v2/studioUrl";

const PANEL_META: Record<
  (typeof CHECKLIST_ORDER)[number],
  { label: string; hint: string; icon: ReactNode }
> = {
  style: {
    label: "Stil",
    hint: "Look & Farben wechseln",
    icon: <Palette className="w-4 h-4" />,
  },
  photos: {
    label: "Fotos",
    hint: "Bilder austauschen",
    icon: <Image className="w-4 h-4" />,
  },
  texts: {
    label: "Texte",
    hint: "Überschriften & Über-uns",
    icon: <Type className="w-4 h-4" />,
  },
  offer: {
    label: "Angebot",
    hint: "Leistungen, Speisekarte, Preise",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  legal: {
    label: "Rechtliches",
    hint: "Impressum-Angaben",
    icon: <Scale className="w-4 h-4" />,
  },
  addons: {
    label: "Extras",
    hint: "Kontaktformular, Galerie, Buchung & mehr",
    icon: <Sparkles className="w-4 h-4" />,
  },
};

/** Baut den Deep-Link ins Studio für einen Checklisten-Bereich. Reine
 * Funktion — separat testbar ohne Rendering (Studio-Link-Bau). */
export function studioPanelHref(
  previewToken: string,
  panel: (typeof CHECKLIST_ORDER)[number]
): string {
  return `/onboarding/${previewToken}${withPanelParam("", panel)}`;
}

interface StudioCardProps {
  previewToken: string;
}

/** "Im Studio bearbeiten"-Karte: Inhalte, Design und Rechtstexte werden seit
 * dem v2-Cutover ausschließlich im Studio gepflegt (Cutover-Spec §2) — das
 * Dashboard verlinkt nur noch dorthin, je Checklisten-Bereich per
 * `?panel=<id>`-Deep-Link (siehe `withPanelParam`, StudioPage.tsx). */
export function StudioCard({ previewToken }: StudioCardProps) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Im Studio bearbeiten
        </h2>
        <a
          href={`/onboarding/${previewToken}`}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          Studio öffnen →
        </a>
      </div>
      <p className="text-slate-400 text-xs mb-4">
        Stil, Texte, Fotos und Angebot bearbeitest du direkt im Studio — die
        Änderungen erscheinen sofort in der Vorschau.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {CHECKLIST_ORDER.map(id => {
          const meta = PANEL_META[id];
          return (
            <a
              key={id}
              href={studioPanelHref(previewToken, id)}
              className="flex items-center gap-2 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-700/50 hover:border-blue-500/40 rounded-xl px-3 py-2.5 text-left transition-colors group"
            >
              <span className="text-blue-400 flex-shrink-0">{meta.icon}</span>
              <span className="min-w-0">
                <span className="block text-white text-sm font-medium truncate group-hover:text-blue-300">
                  {meta.label}
                </span>
                <span className="block text-slate-500 text-[11px] truncate">
                  {meta.hint}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
