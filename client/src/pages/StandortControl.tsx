import React from "react";
import { Loader2, Locate } from "lucide-react";
import { textLink } from "@/components/landing/primitives";
import type { StandortControlMode } from "./startLocation";

/**
 * Klick-Steuerung für Geolocation auf dem Stadt-/GMB-Schritt.
 * Kein Prompt ohne Geste — der Button ist die Geste.
 */
export function StandortControl({
  mode,
  onClick,
  disabled,
}: {
  mode: StandortControlMode;
  onClick: () => void;
  disabled?: boolean;
}) {
  if (mode === "hidden") return null;

  if (mode === "loading") {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-lp-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Standort wird ermittelt…
      </p>
    );
  }

  if (mode === "active") {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-lp-accent">
        <Locate className="h-4 w-4 shrink-0" aria-hidden="true" />
        Treffer in deiner Nähe
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`${textLink} inline-flex items-center gap-2 text-sm disabled:opacity-50`}
      >
        <Locate className="h-4 w-4 shrink-0" aria-hidden="true" />
        Standort nutzen
      </button>
      <p className="text-xs text-lp-muted">
        Optional. Wir speichern deinen Standort nicht.
      </p>
    </div>
  );
}
