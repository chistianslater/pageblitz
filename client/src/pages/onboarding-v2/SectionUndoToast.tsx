import React, { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { SectionType } from "@shared/siteContract/types";
import { SECTION_LABELS } from "@shared/onboardingV2/aiEdit";

/**
 * Abschnitt entfernen mit Rückweg (2026-10-13, Betreiber: „Wenn ich mir
 * unsicher bin und eine Sektion hinzufüge, kann ich sie nicht wieder
 * einfach entfernen"). Statt einer Rückfrage vor dem Entfernen steht danach
 * ein Hinweis mit „Rückgängig" — rund 8 Sekunden, danach bleibt der Verlauf.
 * Nach dem Einfügen bietet derselbe Hinweis „Wieder entfernen" an.
 */
export const SECTION_TOAST_MS = 8000;

export type SectionToast =
  | { kind: "inserted"; type: SectionType }
  | { kind: "removed"; type: SectionType; note?: string };

export function useSectionRemoval({
  token,
  onApplied,
}: {
  token: string;
  onApplied: () => void;
}) {
  const [toast, setToast] = useState<SectionToast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const remove = trpc.onboardingV2.removeSection.useMutation();
  const restore = trpc.onboardingV2.restoreSection.useMutation();

  const removeSection = (type: SectionType) => {
    setError(null);
    remove.mutate(
      { token, type },
      {
        onSuccess: result => {
          setToast({ kind: "removed", type, note: result.addonNote });
          onApplied();
        },
        onError: e => setError(e.message),
      }
    );
  };

  const undo = () => {
    if (toast?.kind !== "removed") return;
    const { type } = toast;
    setToast(null);
    setError(null);
    restore.mutate(
      { token, type },
      { onSuccess: () => onApplied(), onError: e => setError(e.message) }
    );
  };

  return {
    toast,
    error,
    busy: remove.isPending || restore.isPending,
    removeSection,
    undo,
    showInserted: (type: SectionType) => setToast({ kind: "inserted", type }),
    dismiss: () => setToast(null),
  };
}

export function SectionUndoToast({
  toast,
  onUndo,
  onRemove,
  onDismiss,
  busy = false,
}: {
  toast: SectionToast | null;
  onUndo: () => void;
  onRemove: (type: SectionType) => void;
  onDismiss: () => void;
  busy?: boolean;
}) {
  // Ref statt Abhängigkeit: ein neuer onDismiss pro Render soll die Uhr
  // nicht neu starten — nur ein neuer Hinweis tut das.
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => dismissRef.current(), SECTION_TOAST_MS);
    return () => window.clearTimeout(id);
  }, [toast]);

  if (!toast) return null;
  const label = SECTION_LABELS[toast.type];
  return (
    <div className="pb-section-toast" role="status" data-kind={toast.kind}>
      <p>
        <b>
          {toast.kind === "removed"
            ? `„${label}“ entfernt.`
            : `„${label}“ eingefügt.`}
        </b>
        {toast.kind === "removed" && toast.note && (
          <span className="pb-section-toast-note">{toast.note}</span>
        )}
      </p>
      {toast.kind === "removed" ? (
        <button type="button" disabled={busy} onClick={onUndo}>
          Rückgängig
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => onRemove(toast.type)}
        >
          Wieder entfernen
        </button>
      )}
      <button
        type="button"
        className="pb-section-toast-close"
        aria-label="Hinweis schließen"
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  );
}
