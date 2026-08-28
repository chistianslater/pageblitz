import React, { useEffect, useState } from "react";

export const LEAVE_WITHOUT_EMAIL = {
  banner:
    "Ohne E-Mail wird deine Vorschau nach ein paar Tagen gelöscht. Hinterlasse sie, dann kannst du später weitermachen.",
  modalTitle: "Vorschau wirklich verlassen?",
  modalBody:
    "Wenn du jetzt gehst, ohne eine E-Mail zu hinterlassen, wird diese Vorschau-Website gelöscht. Mit E-Mail kannst du später über einen Link weitermachen.",
  stay: "E-Mail hinterlassen",
  leave: "Trotzdem verlassen",
};

interface LeaveWithoutEmailGuardProps {
  armed: boolean;
  onStay: () => void;
}

/**
 * Best-effort-Schutz, wenn jemand Studio schließt ohne E-Mail:
 *
 * 1. `beforeunload` — moderne Browser (Chrome u. a.) zeigen NUR den
 *    Standard-Dialog „Seite verlassen?" und ignorieren jeden eigenen Text.
 *    Deshalb kein Custom-String hier; der Hinweis steht im Banner/Modal.
 * 2. In-App-Dialog, wenn ein sichtbarer Link aus dem Studio hinausführt.
 * 3. Persistenter Banner (E-Mail braucht der Checkout sowieso).
 *
 * Die echte Garantie gegen Backend-Müll ist der Server-TTL
 * (`deleteAbandonedPreviewSites`).
 */
export function LeaveWithoutEmailGuard({
  armed,
  onStay,
}: LeaveWithoutEmailGuardProps) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!armed) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Chrome/Firefox/Safari ignorieren diesen String seit Jahren und
      // zeigen nur den Browser-Standard. Wir setzen ihn trotzdem, weil
      // ältere Browser ihn noch anzeigen können.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [armed]);

  useEffect(() => {
    if (!armed) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download"))
        return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:"))
        return;
      if (href.startsWith("/onboarding/") || href.startsWith("/preview"))
        return;
      event.preventDefault();
      setPendingHref(anchor.href);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [armed]);

  if (!armed) return null;

  const confirmLeave = () => {
    const href = pendingHref;
    setPendingHref(null);
    if (href) window.location.assign(href);
  };

  return (
    <>
      <aside className="pb-studio-leave-banner" role="status">
        <p>{LEAVE_WITHOUT_EMAIL.banner}</p>
        <button
          type="button"
          className="pb-studio-btn"
          onClick={onStay}
        >
          {LEAVE_WITHOUT_EMAIL.stay}
        </button>
      </aside>
      {pendingHref && (
        <div
          className="pb-studio-leave-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pb-leave-title"
        >
          <div className="pb-studio-leave-modal-card">
            <h2 id="pb-leave-title">{LEAVE_WITHOUT_EMAIL.modalTitle}</h2>
            <p>{LEAVE_WITHOUT_EMAIL.modalBody}</p>
            <div className="pb-studio-leave-modal-actions">
              <button
                type="button"
                className="pb-studio-btn"
                onClick={() => {
                  setPendingHref(null);
                  onStay();
                }}
              >
                {LEAVE_WITHOUT_EMAIL.stay}
              </button>
              <button
                type="button"
                className="pb-studio-btn"
                data-variant="ghost"
                onClick={confirmLeave}
              >
                {LEAVE_WITHOUT_EMAIL.leave}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
