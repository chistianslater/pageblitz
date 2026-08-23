import { useEffect, useRef } from "react";
import type { ChecklistItemId } from "@shared/onboardingV2/checklist";

/**
 * Fokus-Management für ein Studio-Panel (Stil/Fotos/Texte/Angebot/
 * Rechtliches/Extras). Panels ersetzen die Checkliste in der Seitenleiste,
 * die Vorschau rechts (inkl. Geräte-Umschalter, "In neuem Tab öffnen")
 * bleibt daneben sichtbar UND bedienbar — anders als ein echtes
 * Overlay-Modal blockieren sie den Rest der Seite nicht. Deshalb bewusst
 * KEIN `role="dialog"`/`aria-modal` und KEINE Tab-Fokusfalle: Eine
 * Fokusfalle würde Tastatur-Nutzer:innen daran hindern, zur Vorschau oder
 * zum Geräte-Umschalter zu wechseln, während ein Panel offen ist — ein
 * echtes ARIA-Modal wäre hier semantisch falsch (B4c Task 7 a11y-Pass,
 * siehe Bericht).
 *
 * Stattdessen: Fokus wandert beim Öffnen auf die Panel-Überschrift (damit
 * Screenreader/Tastatur-Nutzer:innen den Kontextwechsel bemerken), Esc
 * schließt das Panel wie der "Fertig"-Button, und beim Schließen (Esc ODER
 * regulärer Footer-Button) kehrt der Fokus zum auslösenden
 * Checklisten-Eintrag zurück (`Checklist.tsx` vergibt dafür
 * `id="pb-checklist-<ChecklistItemId>"`).
 *
 * `onClose` wird über eine Ref statt als Effekt-Dependency verfolgt: Aufrufer
 * übergeben meist eine neue Inline-Funktion pro Render (z. B.
 * `onClose={() => setActiveId(null)}`) — als Dependency würde das den Effekt
 * bei jedem Tastenanschlag in einem Formularfeld neu ausführen und dabei
 * ungewollt den Fokus zurückreißen (Cleanup läuft bei jedem Re-Run).
 *
 * Esc wird ignoriert, wenn der Tastendruck aus einem Eingabefeld
 * (input/textarea/select/[contenteditable]) kommt oder Teil einer IME-
 * Komposition ist (`isComposing`) — sonst würde Esc beim Abbrechen einer
 * IME-Eingabe oder beim Verlassen eines Formularfelds versehentlich das
 * ganze Panel schließen und einen ungespeicherten Entwurf verwerfen (B4c
 * Final Review Fixwelle 2).
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}
export function usePanelFocus(
  panelId: ChecklistItemId,
  onClose: () => void
): React.RefObject<HTMLHeadingElement | null> {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    headingRef.current?.focus();

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") return;
      if (event.isComposing) return;
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
      onCloseRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.getElementById(`pb-checklist-${panelId}`)?.focus();
    };
    // panelId ist für die Lebensdauer einer gemounteten Panel-Instanz fix
    // (StudioPage mountet bei einem Panel-Wechsel eine andere Komponente,
    // siehe activeId-Conditional in StudioPage.tsx) — onClose bewusst nicht
    // in den Deps (siehe Kommentar oben).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelId]);

  return headingRef;
}
