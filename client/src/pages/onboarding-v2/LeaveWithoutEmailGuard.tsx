import React, { useEffect, useRef, useState } from "react";

export const LEAVE_WITHOUT_EMAIL = {
  modalTitle: "Vorschau wirklich verlassen?",
  modalBody:
    "Wenn du jetzt gehst, ohne eine E-Mail zu hinterlassen, wird diese Vorschau-Website nach 24 Stunden gelöscht. Mit E-Mail bleibt sie sieben Tage und du bekommst einen Link zum Weitermachen.",
  stay: "E-Mail hinterlassen",
  leave: "Trotzdem verlassen",
};

export interface LeaveClickSnapshot {
  defaultPrevented: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  targetBlank: boolean;
  download: boolean;
  href: string | null;
}

/**
 * Interne Studio-/Vorschau-Ziele nicht abfangen (inkl. `/preview-ssr/…`).
 * Hash, javascript:, mailto:, tel: gelten ebenfalls als „bleib hier".
 */
export function isStudioStayHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();
  if (trimmed.startsWith("#") || lower.startsWith("javascript:")) return true;
  if (lower.startsWith("mailto:") || lower.startsWith("tel:")) return true;
  try {
    const path = new URL(trimmed, "https://pageblitz.de/onboarding/_").pathname;
    return path.startsWith("/onboarding/") || path.startsWith("/preview");
  } catch {
    return false;
  }
}

/** Ob ein In-App-Klick das Leave-Modal statt der Navigation zeigen soll. */
export function shouldInterceptLeaveClick(snap: LeaveClickSnapshot): boolean {
  if (snap.defaultPrevented) return false;
  if (snap.targetBlank || snap.download) return false;
  if (snap.metaKey || snap.ctrlKey || snap.shiftKey || snap.altKey) return false;
  if (!snap.href) return false;
  return !isStudioStayHref(snap.href);
}

interface LeaveWithoutEmailDialogProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

/**
 * Alert-Dialog beim Verlassen: zwei klare Aktionen, kein Backdrop-Dismiss.
 * Escape = bleiben (E-Mail-Feld), nicht wegklicken.
 */
export function LeaveWithoutEmailDialog({
  open,
  onStay,
  onLeave,
}: LeaveWithoutEmailDialogProps) {
  const stayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    stayRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onStay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onStay]);

  if (!open) return null;

  return (
    <div
      className="pb-studio-leave-modal"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="pb-leave-title"
      aria-describedby="pb-leave-body"
    >
      <div className="pb-studio-leave-modal-card">
        <h2 id="pb-leave-title">{LEAVE_WITHOUT_EMAIL.modalTitle}</h2>
        <p id="pb-leave-body">{LEAVE_WITHOUT_EMAIL.modalBody}</p>
        <div className="pb-studio-leave-modal-actions">
          <button
            ref={stayRef}
            type="button"
            className="pb-studio-btn"
            autoFocus
            onClick={onStay}
          >
            {LEAVE_WITHOUT_EMAIL.stay}
          </button>
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            onClick={onLeave}
          >
            {LEAVE_WITHOUT_EMAIL.leave}
          </button>
        </div>
      </div>
    </div>
  );
}

interface LeaveWithoutEmailGuardProps {
  armed: boolean;
  onStay: () => void;
  /**
   * Testhilfe / gesteuerter Open-State: Modal sofort offen, als hätte
   * jemand einen Outbound-Link geklickt. Produktion setzt das nicht.
   */
  initialPendingHref?: string | null;
}

type PendingLeave = { kind: "href"; href: string } | { kind: "back" };

/**
 * Best-effort-Schutz, wenn jemand Studio schließt ohne E-Mail:
 *
 * 1. `beforeunload` — moderne Browser (Chrome u. a.) zeigen NUR den
 *    Standard-Dialog „Seite verlassen?" und ignorieren jeden eigenen Text.
 *    Deshalb kein Custom-String hier; der deutsche Hinweis steht im Modal.
 * 2. Alert-Modal bei In-App-Verlassen: Outbound-Links und Browser-Zurück.
 * 3. Kein dauerhafter Banner — der ruhige 24h/7-Tage-Hinweis sitzt im Checkout.
 *
 * Die echte Garantie gegen Backend-Müll ist der Server-TTL
 * (`deleteAbandonedPreviewSites`).
 */
export function LeaveWithoutEmailGuard({
  armed,
  onStay,
  initialPendingHref = null,
}: LeaveWithoutEmailGuardProps) {
  const [pending, setPending] = useState<PendingLeave | null>(() =>
    initialPendingHref ? { kind: "href", href: initialPendingHref } : null
  );
  const allowBackRef = useRef(false);

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
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      const snap: LeaveClickSnapshot = {
        defaultPrevented: event.defaultPrevented,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        targetBlank: anchor.target === "_blank",
        download: anchor.hasAttribute("download"),
        href: anchor.getAttribute("href"),
      };
      if (!shouldInterceptLeaveClick(snap)) return;
      event.preventDefault();
      setPending({ kind: "href", href: anchor.href });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [armed]);

  // Browser-Zurück: extra History-Eintrag als Falle, Modal statt sofort weg.
  useEffect(() => {
    if (!armed) return;
    allowBackRef.current = false;
    const state = window.history.state;
    if (!state || state.pbLeaveGuard !== 1) {
      window.history.pushState({ ...(state ?? {}), pbLeaveGuard: 1 }, "");
    }
    const onPopState = () => {
      if (allowBackRef.current) return;
      window.history.pushState(
        { ...(window.history.state ?? {}), pbLeaveGuard: 1 },
        ""
      );
      setPending({ kind: "back" });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [armed]);

  if (!armed) return null;

  const dismiss = () => setPending(null);

  const confirmLeave = () => {
    const next = pending;
    dismiss();
    if (!next) return;
    if (next.kind === "href") {
      window.location.assign(next.href);
      return;
    }
    allowBackRef.current = true;
    window.history.back();
  };

  return (
    <LeaveWithoutEmailDialog
      open={pending !== null}
      onStay={() => {
        dismiss();
        onStay();
      }}
      onLeave={confirmLeave}
    />
  );
}
