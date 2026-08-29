import React, { useEffect, useRef, useState } from "react";
import { TriangleAlert, X } from "lucide-react";

export const LEAVE_WITHOUT_EMAIL = {
  modalTitle: "Achtung — wenn du jetzt gehst, ist deine Website weg.",
  modalBody:
    "Ohne E-Mail wird diese Vorschau nach 24 Stunden gelöscht — alles, was gerade entstanden ist, verschwindet. Mit E-Mail bleibt sie sieben Tage und du bekommst einen Link, um genau hier weiterzumachen.",
  emailLabel: "Deine E-Mail-Adresse",
  emailPlaceholder: "name@firma.de",
  stay: "Website behalten",
  leave: "Trotzdem verlassen",
  errorInvalid: "Bitte gib eine gültige E-Mail-Adresse ein.",
  errorSave: "Speichern hat nicht geklappt — bitte versuch es noch einmal.",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  /** Speichert die E-Mail (tRPC-Mutation via StudioPage); wirft bei Fehler. */
  onSubmitEmail: (email: string) => Promise<void>;
  onLeave: () => void;
  /** Einfach schließen: bleiben, ohne E-Mail und ohne zu verlassen. */
  onDismiss: () => void;
}

/**
 * Alert-Dialog beim Verlassen: die E-Mail wird DIREKT HIER erfasst
 * (User-Bug 2026-08-29: der frühere „E-Mail hinterlassen"-Button sprang zu
 * einem Feld, das auf vielen Screens gar nicht existierte). Kein
 * Backdrop-Dismiss; Escape springt ins E-Mail-Feld statt zu schließen.
 */
export function LeaveWithoutEmailDialog({
  open,
  onSubmitEmail,
  onLeave,
  onDismiss,
}: LeaveWithoutEmailDialogProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    emailRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  if (!open) return null;

  const trimmed = email.trim();
  const valid = EMAIL_RE.test(trimmed);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    if (!valid) {
      setError(LEAVE_WITHOUT_EMAIL.errorInvalid);
      emailRef.current?.focus();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmitEmail(trimmed);
    } catch {
      setError(LEAVE_WITHOUT_EMAIL.errorSave);
      setSaving(false);
    }
  };

  return (
    <div
      className="pb-studio-leave-modal"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="pb-leave-title"
      aria-describedby="pb-leave-body"
    >
      <div className="pb-studio-leave-modal-card">
        <button
          type="button"
          className="pb-studio-leave-modal-close"
          aria-label="Schließen"
          onClick={onDismiss}
        >
          <X aria-hidden="true" />
        </button>
        <span className="pb-studio-leave-modal-icon" aria-hidden="true">
          <TriangleAlert />
        </span>
        <h2 id="pb-leave-title">{LEAVE_WITHOUT_EMAIL.modalTitle}</h2>
        <p id="pb-leave-body">{LEAVE_WITHOUT_EMAIL.modalBody}</p>
        <form className="pb-studio-leave-modal-form" onSubmit={submit}>
          <label htmlFor="pb-leave-email">
            {LEAVE_WITHOUT_EMAIL.emailLabel}
          </label>
          <input
            ref={emailRef}
            id="pb-leave-email"
            type="email"
            autoComplete="email"
            placeholder={LEAVE_WITHOUT_EMAIL.emailPlaceholder}
            value={email}
            onChange={event => {
              setEmail(event.target.value);
              setError(null);
            }}
          />
          {error && (
            <p role="alert" className="pb-studio-leave-modal-error">
              {error}
            </p>
          )}
          <div className="pb-studio-leave-modal-actions">
            <button
              type="submit"
              className="pb-studio-btn"
              disabled={saving || trimmed.length === 0}
            >
              {saving ? "Wird gespeichert …" : LEAVE_WITHOUT_EMAIL.stay}
            </button>
            <button
              type="button"
              className="pb-studio-btn"
              data-variant="ghost"
              onClick={onLeave}
              disabled={saving}
            >
              {LEAVE_WITHOUT_EMAIL.leave}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface LeaveWithoutEmailGuardProps {
  armed: boolean;
  /** Speichert die E-Mail; bei Erfolg schließt der Guard das Modal. */
  onSubmitEmail: (email: string) => Promise<void>;
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
  onSubmitEmail,
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
    // Ohne Referrer (Studio direkt geöffnet) zur Startseite, sonst zurück
    // zur Herkunft — history.back() allein bleibt auf der Guard-URL.
    window.location.assign(document.referrer || "/");
  };

  return (
    <LeaveWithoutEmailDialog
      open={pending !== null}
      onSubmitEmail={async email => {
        await onSubmitEmail(email);
        dismiss();
      }}
      onLeave={confirmLeave}
      onDismiss={dismiss}
    />
  );
}
