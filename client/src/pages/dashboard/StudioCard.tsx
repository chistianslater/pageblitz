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
import { withStudioParams } from "@/pages/onboarding-v2/studioUrl";
import type { AddOnKey } from "@shared/pricing";

const PANEL_META: Record<
  (typeof CHECKLIST_ORDER)[number],
  { label: string; hint: string; icon: ReactNode }
> = {
  style: {
    label: "Designrichtung",
    hint: "Aufbau, Farben & Schriften",
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
    hint: "Leistungen aus dem Basispaket",
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

/** Baut den Deep-Link ins Studio für einen Checklisten-Bereich, optional
 * direkt in den Extra-Editor (`?extra=gallery` usw.). */
export function studioPanelHref(
  previewToken: string,
  panel: (typeof CHECKLIST_ORDER)[number],
  extra?: AddOnKey
): string {
  return `/onboarding/${previewToken}${withStudioParams("", panel, extra ?? null)}`;
}

interface StudioCardProps {
  previewToken: string;
}

/** "Im Studio bearbeiten"-Karte: Inhalte, Design und Rechtstexte werden seit
 * dem v2-Cutover ausschließlich im Studio gepflegt (Cutover-Spec §2) — das
 * Dashboard verlinkt nur noch dorthin, je Checklisten-Bereich per
 * `?panel=<id>`-Deep-Link (siehe `withStudioParams`, StudioPage.tsx). */
export function StudioCard({ previewToken }: StudioCardProps) {
  return (
    <div className="bg-lp-surface border border-lp-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lp-ink font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-lp-accent" />
          Im Studio bearbeiten
        </h2>
        <a
          href={`/onboarding/${previewToken}`}
          className="text-xs text-lp-accent hover:text-lp-accent transition-colors font-medium"
        >
          Studio öffnen →
        </a>
      </div>
      <p className="text-lp-muted text-xs mb-4">
        Designrichtung, Texte, Fotos und Angebot bearbeitest du direkt im Studio
        — die Änderungen erscheinen sofort in der Vorschau.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {CHECKLIST_ORDER.map(id => {
          const meta = PANEL_META[id];
          return (
            <a
              key={id}
              href={studioPanelHref(previewToken, id)}
              className="flex items-center gap-2 bg-lp-canvas hover:bg-lp-canvas border border-lp-line hover:border-lp-accent/40 rounded-xl px-3 py-2.5 text-left transition-colors group"
            >
              <span className="text-lp-accent flex-shrink-0">{meta.icon}</span>
              <span className="min-w-0">
                <span className="block text-lp-ink text-sm font-medium truncate group-hover:text-lp-accent">
                  {meta.label}
                </span>
                <span className="block text-lp-muted text-[11px] truncate">
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
