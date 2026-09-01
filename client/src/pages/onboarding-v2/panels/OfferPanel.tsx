import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { SectionOf, WebsiteDataV2 } from "@shared/siteContract/types";
import type { OfferPatch } from "@shared/onboardingV2/patches";
import {
  ADDON_EDITORS,
  withAddOnEnabled,
} from "@shared/onboardingV2/addonEditors";
import { SECTION_ANCHORS } from "@/components/site/engine";
import { FALLBACK_PACK, getConstitution } from "@shared/stylePacks";
import type { AddOnFlags } from "@shared/pricing";
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
      // price bewusst gestrippt (Betreiber 2026-09-01): das Patch-Schema
      // kennt kein price mehr — Bestands-Preise fallen beim nächsten
      // Speichern weg, Preise leben in den Extras Preisliste/Speisekarte.
      items: services.items.map(({ title, description }) => ({
        title,
        ...(description !== undefined ? { description } : {}),
      })),
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

/**
 * Entwürfe für alle drei Angebots-Modi — Speisekarte und Preisliste bleiben
 * erhalten, auch wenn gerade eine Leistungen-Sektion aktiv ist. Extra-Klick
 * auf „Speisekarte" darf nicht mit einem leeren Entwurf starten, nur weil
 * `offerFromDoc` Leistungen bevorzugt.
 */
export function offerDraftsFromDoc(
  doc: WebsiteDataV2
): Record<OfferMode, OfferPatch> {
  const services = doc.sections.find(
    (s): s is SectionOf<"services"> => s.type === "services"
  );
  const menu = doc.sections.find(
    (s): s is SectionOf<"menu"> => s.type === "menu"
  );
  const pricelist = doc.sections.find(
    (s): s is SectionOf<"pricelist"> => s.type === "pricelist"
  );
  return {
    services: services
      ? {
          mode: "services",
          headline: services.headline,
          ...(services.intro !== undefined ? { intro: services.intro } : {}),
          items: services.items,
        }
      : blankOffer("services"),
    menu: menu
      ? {
          mode: "menu",
          ...(menu.headline !== undefined ? { headline: menu.headline } : {}),
          categories: menu.categories,
        }
      : blankOffer("menu"),
    pricelist: pricelist
      ? {
          mode: "pricelist",
          ...(pricelist.headline !== undefined
            ? { headline: pricelist.headline }
            : {}),
          categories: pricelist.categories,
        }
      : blankOffer("pricelist"),
  };
}

/**
 * Extra-Klick auf Speisekarte/Preisliste gewinnt gegen `offerFromDoc`, das
 * eine vorhandene Leistungen-Sektion bevorzugt.
 */
export function initialOfferMode(
  doc: WebsiteDataV2,
  requested?: OfferMode
): OfferMode {
  return requested ?? offerFromDoc(doc).mode;
}

/** Vorschau-Anker zum aktuellen Angebots-Modus — trifft engine.SECTION_ANCHORS. */
export function previewAnchorForOfferMode(mode: OfferMode): string {
  if (mode === "services") return SECTION_ANCHORS.services;
  return ADDON_EDITORS[mode].previewAnchor;
}

/** Titel/Intro zum festen Editor-Modus — kein Typ-Wechsel mehr im Panel. */
export function offerPanelCopy(mode: OfferMode): { title: string; intro: string } {
  if (mode === "menu") {
    return {
      title: "Speisekarte pflegen",
      intro:
        "Gerichte, Kategorien und Preise — so erscheint die Speisekarte auf der Website. Leistungen aus dem Basispaket und die Preisliste als Extra bleiben eigene Bereiche.",
    };
  }
  if (mode === "pricelist") {
    return {
      title: "Preisliste pflegen",
      intro:
        "Kategorien und Preise — so erscheint die Preisliste auf der Website. Leistungen pflegst du unter Angebot, die Speisekarte ist ein eigenes Extra.",
    };
  }
  return {
    title: "Leistungen pflegen",
    intro:
      "Das sind die Leistungen aus deinem Basispaket. Speisekarte und Preisliste buchst du unter Extras — jeweils mit eigenem Editor.",
  };
}

interface OfferPanelProps {
  token: string;
  doc: WebsiteDataV2;
  /**
   * Server-Stand der Extras (`state.addOns`). Extra-Klick auf Speisekarte/
   * Preisliste schaltet das Flag sofort mit ein, damit die Vorschau die
   * Sektion zeigt — ohne Umweg über die Extras-Übersicht.
   */
  addOns?: AddOnFlags;
  onApplied: () => void;
  onClose: () => void;
  /** Geführter Modus (Studio-Wizard): Primary-Button wird zu „Speichern & weiter". */
  onNext?: () => void;
  onPreviewFocus?: (anchor: string) => void;
  /** Deep-Link aus Extra Speisekarte/Preisliste. */
  initialMode?: OfferMode;
}

export function OfferPanel({
  token,
  doc,
  addOns = {},
  onApplied,
  onClose,
  onNext,
  onPreviewFocus,
  initialMode,
}: OfferPanelProps) {
  const [mode] = useState<OfferMode>(() =>
    initialOfferMode(doc, initialMode)
  );
  const [value, setValue] = useState<OfferPatch>(
    () => offerDraftsFromDoc(doc)[initialOfferMode(doc, initialMode)]
  );
  const [hint, setHint] = useState<string | null>(null);
  useEffect(() => {
    onPreviewFocus?.(previewAnchorForOfferMode(mode));
  }, [mode, onPreviewFocus]);

  const updateOffer = trpc.onboardingV2.updateOffer.useMutation();
  const updateAddons = trpc.onboardingV2.updateAddons.useMutation();
  const suggestOffer = trpc.onboardingV2.suggestOffer.useMutation();

  // Extra-Editor (Speisekarte/Preisliste): Flag sofort setzen, damit die
  // Vorschau zur Sektion scrollen kann — auch bevor der User im Editor
  // speichert. updateOffer zieht das Flag beim Speichern zusätzlich mit.
  useEffect(() => {
    if (initialMode !== "menu" && initialMode !== "pricelist") return;
    if (doc.addOns?.[initialMode] === true || addOns[initialMode] === true) {
      return;
    }
    updateAddons.mutate(
      { token, addOns: withAddOnEnabled(addOns, initialMode) },
      { onSuccess: onApplied }
    );
    // Nur beim Öffnen des Extra-Editors, nicht bei jedem Draft-Tastendruck.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSuggest = () => {
    setHint(null);
    suggestOffer.mutate(
      { token, mode },
      {
        onSuccess: result => {
          setValue(result.offer);
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
  const copy = offerPanelCopy(mode);

  return (
    <PanelFrame
      step="Schritt 4"
      title={copy.title}
      panelId="offer"
      onClose={onClose}
      intro={copy.intro}
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
      <OfferEditor value={value} onChange={setValue} />
      {updateOffer.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {updateOffer.error.message}
        </p>
      )}
    </PanelFrame>
  );
}
