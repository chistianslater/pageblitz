import { useCallback, useEffect, useRef } from "react";

/** Vom Server gerenderter Entwurf, aus dem die Vorschau die Sektion `anchor` übernimmt. */
export type DraftSection = { anchor: string; html: string };

/** Tipp-Pause, nach der ein Entwurf in die Vorschau gerendert wird. */
const LIVE_PREVIEW_DELAY_MS = 450;

/**
 * Live-Vorschau strukturierter Editoren (2026-09-26, Speisekarte, Team):
 * nach kurzer Tipp-Pause den Entwurf serverseitig rendern lassen (ohne zu
 * speichern) und die Sektion an die Vorschau melden. Der unveränderte
 * Startwert löst nichts aus; überholte Antworten (weitergetippt) werden
 * verworfen. Beim Schließen des Editors meldet der Hook `null` — das Studio
 * lädt dann den gespeicherten Stand. Nach erfolgreichem Speichern ruft der
 * Editor `endPreview()` VOR seinem onApplied.
 */
export function useLiveSectionPreview<T>({
  value,
  anchor,
  onDraftPreview,
  render,
}: {
  value: T;
  anchor: string;
  onDraftPreview?: (draft: DraftSection | null) => void;
  render: (value: T) => Promise<{ html: string | null }>;
}): { endPreview: () => void } {
  const firstValueRef = useRef(value);
  const requestSeqRef = useRef(0);
  const renderRef = useRef(render);
  renderRef.current = render;

  useEffect(() => {
    if (!onDraftPreview || value === firstValueRef.current) return;
    const seq = ++requestSeqRef.current;
    const timer = window.setTimeout(() => {
      renderRef
        .current(value)
        .then(result => {
          if (seq !== requestSeqRef.current || !result.html) return;
          onDraftPreview({ anchor, html: result.html });
        })
        // Best effort: scheitert das Rendern, zeigt die Vorschau weiter den
        // letzten Stand — Speichern läuft unabhängig davon über den Editor.
        .catch(() => undefined);
    }, LIVE_PREVIEW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [value, anchor, onDraftPreview]);

  useEffect(() => () => onDraftPreview?.(null), [onDraftPreview]);

  const endPreview = useCallback(() => {
    requestSeqRef.current++;
    onDraftPreview?.(null);
  }, [onDraftPreview]);

  return { endPreview };
}
