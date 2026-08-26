import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { SectionOf, WebsiteDataV2 } from "@shared/siteContract/types";
import type { OfferPatch } from "@shared/onboardingV2/patches";
import { FALLBACK_PACK, getConstitution } from "@shared/stylePacks";
import { PanelFrame } from "./PanelFrame";
import {
  OfferEditor,
  blankOffer,
  validateOffer,
  type OfferMode,
} from "./offerParts";

export { OfferEditor, validateOffer };

/**
 * Reine Ableitung: bestehende Angebots-Sektion (services/menu/pricelist) →
 * Patch; ohne Sektion ein leerer Entwurf. Der Startmodus des leeren
 * Entwurfs richtet sich nach der Pack-Verfassung: Gastro-Packs
 * (`prefersMenu: true`, z. B. gusto/zunft/marktplatz — siehe
 * shared/stylePacks/types.ts) starten im Speisekarten- statt
 * Leistungen-Modus (B4c Task 7). Unbekannte/nicht registrierte Pack-IDs
 * fallen auf FALLBACK_PACK zurück (kein prefersMenu → Leistungen), analog
 * zu client/src/lib/packAccent.ts.
 */
export function offerFromDoc(doc: WebsiteDataV2): OfferPatch {
  const services = doc.sections.find(
    (s): s is SectionOf<"services"> => s.type === "services"
  );
  if (services) {
    return {
      mode: "services",
      headline: services.headline,
      ...(services.intro !== undefined ? { intro: services.intro } : {}),
      items: services.items,
    };
  }
  const menu = doc.sections.find(
    (s): s is SectionOf<"menu"> => s.type === "menu"
  );
  if (menu) {
    return {
      mode: "menu",
      ...(menu.headline !== undefined ? { headline: menu.headline } : {}),
      categories: menu.categories,
    };
  }
  const pricelist = doc.sections.find(
    (s): s is SectionOf<"pricelist"> => s.type === "pricelist"
  );
  if (pricelist) {
    return {
      mode: "pricelist",
      ...(pricelist.headline !== undefined
        ? { headline: pricelist.headline }
        : {}),
      categories: pricelist.categories,
    };
  }
  let constitution;
  try {
    constitution = getConstitution(doc.stylePackId);
  } catch {
    constitution = getConstitution(FALLBACK_PACK);
  }
  return blankOffer(constitution.prefersMenu ? "menu" : "services");
}

interface OfferPanelProps {
  token: string;
  doc: WebsiteDataV2;
  onApplied: () => void;
  onClose: () => void;
  /** Geführter Modus (Studio-Wizard): Primary-Button wird zu „Speichern & weiter". */
  onNext?: () => void;
  onPreviewFocus?: (anchor: string) => void;
}

export function OfferPanel({
  token,
  doc,
  onApplied,
  onClose,
  onNext,
  onPreviewFocus,
}: OfferPanelProps) {
  const initial = offerFromDoc(doc);
  // Ein Entwurf pro Modus im lokalen State (Ambiguität #2 der Task-Vorgabe):
  // Moduswechsel im Editor verwirft nichts — beim Zurückwechseln steht der
  // zuletzt bearbeitete Entwurf für diesen Modus wieder da.
  const [drafts, setDrafts] = useState<Record<OfferMode, OfferPatch>>({
    services: initial.mode === "services" ? initial : blankOffer("services"),
    menu: initial.mode === "menu" ? initial : blankOffer("menu"),
    pricelist: initial.mode === "pricelist" ? initial : blankOffer("pricelist"),
  });
  const [mode, setMode] = useState<OfferMode>(initial.mode);
  const [hint, setHint] = useState<string | null>(null);
  useEffect(() => {
    onPreviewFocus?.(
      mode === "services"
        ? "leistungen"
        : mode === "menu"
          ? "speisekarte"
          : "preisliste"
    );
  }, [mode, onPreviewFocus]);

  const value = drafts[mode];

  // OfferEditor meldet bei einem Moduswechsel intern einen leeren Entwurf
  // über onChange (siehe offerParts.tsx) — hier wird dieser Fall erkannt und
  // stattdessen der gemerkte Entwurf für den neuen Modus aktiviert, statt
  // ihn mit dem leeren Wert zu überschreiben.
  const handleChange = (next: OfferPatch) => {
    if (next.mode !== mode) {
      setMode(next.mode);
      return;
    }
    setDrafts(prev => ({ ...prev, [mode]: next }));
  };

  const updateOffer = trpc.onboardingV2.updateOffer.useMutation();
  const suggestOffer = trpc.onboardingV2.suggestOffer.useMutation();

  const handleSuggest = () => {
    setHint(null);
    suggestOffer.mutate(
      { token, mode },
      {
        onSuccess: result => {
          setDrafts(prev => ({ ...prev, [mode]: result.offer }));
          setHint("Vorschlag übernommen — Preise bitte prüfen.");
        },
      }
    );
  };

  const handleSave = () => {
    updateOffer.mutate(
      { token, offer: value },
      {
        onSuccess: () => {
          onApplied();
          onNext?.();
        },
      }
    );
  };

  const busy = updateOffer.isPending;
  const suggesting = suggestOffer.isPending;
  const errors = validateOffer(value);

  return (
    <PanelFrame
      step="Schritt 4"
      title="Angebot pflegen"
      panelId="offer"
      onClose={onClose}
      intro="Leistungen, Speisekarte oder Preisliste — wähle den passenden Typ und pflege die Positionen."
      footer={
        <>
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            onClick={onClose}
          >
            Schließen
          </button>
          <button
            type="button"
            className="pb-studio-btn"
            disabled={busy || errors.length > 0}
            onClick={handleSave}
          >
            {busy
              ? "Bitte warten…"
              : onNext
                ? "Speichern & weiter"
                : "Speichern"}
          </button>
        </>
      }
    >
      <button
        type="button"
        className="pb-studio-btn"
        data-variant="ghost"
        disabled={suggesting}
        onClick={handleSuggest}
      >
        {suggesting ? "Wird vorgeschlagen…" : "KI-Vorschlag"}
      </button>
      {/* Feedback direkt am Button (2026-08-25): Der KI-Request braucht
          spürbar Zeit; Fehler landeten vorher unter dem Editor außerhalb
          des sichtbaren Bereichs — wirkte wie „nichts passiert". */}
      {suggesting && (
        <p role="status" style={{ color: "var(--st-muted)", fontSize: "0.85rem" }}>
          Die KI stellt einen Vorschlag zusammen — das kann bis zu 30
          Sekunden dauern …
        </p>
      )}
      {suggestOffer.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {suggestOffer.error.message}
        </p>
      )}
      {hint && <p style={{ color: "var(--st-accent)" }}>{hint}</p>}
      <OfferEditor value={value} onChange={handleChange} />
      {updateOffer.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {updateOffer.error.message}
        </p>
      )}
    </PanelFrame>
  );
}
