import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookingFormFields } from "./BookingFormFields";
import { BookingDateStep, BookingSlotStep } from "./BookingSteps";
import { trapTabKey } from "./focusTrap";
import { notifyIslandOpened, subscribeToOtherIslandOpen } from "./islandEvents";
import {
  buildDateOptions,
  formatSlotLabel,
  mapBookingError,
  resolveSubmitFailure,
  type BookingSettings,
  type DateOption,
} from "./bookingHelpers";

type Step = "dates" | "slots" | "form" | "success";

/**
 * Terminbuchungs-Insel: schwebender Button unten rechts öffnet ein Panel mit
 * Datumsauswahl → Uhrzeitauswahl → Formular → Erfolg, das gegen die
 * bestehende v1-Routen-Gruppe `GET/POST /api/booking/:slug/*` bucht
 * (unverändert, siehe `server/_core/bookingRoutes.ts`).
 *
 * Client-only Widget wie `ChatIsland`: `client/src/site-islands/main.tsx`
 * hydratisiert per `createRoot` (nicht `hydrateRoot`) — das SSR-Markup
 * (geschlossener Button + `hidden`-Panel würde ohnehin erst nach dem Öffnen
 * echten Inhalt zeigen) dient nur dem flackerfreien ersten Bild, React
 * übernimmt danach komplett neu.
 *
 * `businessName` kommt wie bei `ChatIsland` sowohl als normale Prop als auch
 * redundant als `data-business-name`-Attribut auf dem Insel-Wurzelknoten an
 * (siehe `SiteIslands.tsx`) — Letzteres liest `main.tsx` beim Hydrieren aus.
 *
 * `disabled` (gesetzt von `SiteIslands` im CSR-Vorschau-Modus, siehe
 * `mode`-Prop dort): rendert nur den ausgegrauten Button, nie den Dialog —
 * verhindert echte Buchungs-`fetch`-Aufrufe aus internen Vorschau-Bildschirmen
 * (Dashboard/Editor), die dieselbe Insel-Komponente client-seitig rendern wie
 * die echte Kundenseite.
 *
 * Gegenseitiger Ausschluss mit `ChatIsland`: beide Panels teilen sich
 * denselben Fixpunkt unten rechts. `islandEvents.ts` meldet über ein
 * `window`-CustomEvent, wenn diese Insel öffnet; ist diese Insel offen und
 * die ANDERE Insel öffnet, schließt sie sich selbst (`closePanel`, inkl.
 * Fokus-Rückgabe an den eigenen Fab-Button, siehe Task-8-Logik unten).
 */
export const BookingIsland: React.FC<{
  slug: string;
  businessName?: string;
  disabled?: boolean;
}> = ({ slug, businessName, disabled = false }) => {
  const panelId = useId();
  const [open, setOpen] = useState(false);

  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("dates");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const title =
    settings?.title ||
    (businessName ? `Termin bei ${businessName}` : "Termin buchen");

  // Einstellungen einmalig beim ersten Öffnen laden.
  useEffect(() => {
    if (!open || settings || settingsError || settingsLoading) return;
    setSettingsLoading(true);
    fetch(`/api/booking/${slug}/settings`)
      .then(res => {
        if (!res.ok) {
          setSettingsError(mapBookingError(res.status));
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) setSettings(data as BookingSettings);
      })
      .catch(() => setSettingsError(mapBookingError(undefined)))
      .finally(() => setSettingsLoading(false));
  }, [open, settings, settingsError, settingsLoading, slug]);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  // Schließt das Panel und gibt den Fokus an den auslösenden Fab-Button
  // zurück — sonst fällt der Fokus beim Schließen (Escape/„Schließen"/
  // gegenseitiger Ausschluss mit der Chat-Insel) auf `document.body` und
  // geht für Tastatur-/Screenreader-Nutzung verloren.
  function closePanel(): void {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function openPanel(): void {
    notifyIslandOpened("booking");
    setOpen(true);
  }

  // Escape schließt das Panel.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") closePanel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Schließt dieses Panel, sobald die Chat-Insel öffnet (gegenseitiger
  // Ausschluss, siehe islandEvents.ts) — nur abonniert, solange dieses Panel
  // selbst offen ist, sonst würde ein Öffnen der Chat-Insel bei bereits
  // geschlossener Buchungs-Insel unnötig deren Fab-Button fokussieren.
  useEffect(() => {
    if (!open) return;
    return subscribeToOtherIslandOpen("booking", closePanel);
  }, [open]);

  const dateOptions: DateOption[] = settings
    ? buildDateOptions(settings.schedule, settings.advanceDays, new Date())
    : [];

  const loadSlots = useCallback(
    async (dateIso: string, options?: { keepError?: boolean }): Promise<void> => {
      setSlotsLoading(true);
      // `keepError`: nach einem 409-Race soll der „bereits vergeben"-Hinweis
      // sichtbar bleiben, während die Slots neu geladen werden — ohne diesen
      // Schalter würde dieses `setError(null)` denselben Render-Batch wie
      // `handleSubmit`s `setError(mapBookingError(409))` treffen und ihn
      // sofort wieder löschen (React batcht beide Aufrufe zusammen).
      if (!options?.keepError) setError(null);
      try {
        const res = await fetch(`/api/booking/${slug}/slots?date=${dateIso}`);
        if (!res.ok) {
          setError(mapBookingError(res.status));
          setSlots([]);
          return;
        }
        const data = await res.json().catch(() => null);
        setSlots(Array.isArray(data?.slots) ? data.slots : []);
      } catch {
        setError(mapBookingError(undefined));
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    },
    [slug]
  );

  function selectDate(iso: string): void {
    setSelectedDate(iso);
    setSelectedSlot(null);
    setStep("slots");
    setError(null);
    void loadSlots(iso);
  }

  function backToDates(): void {
    setStep("dates");
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
    setError(null);
  }

  function selectSlot(time: string): void {
    setSelectedSlot(time);
    setStep("form");
    setError(null);
  }

  function backToSlots(): void {
    setStep("slots");
    setSelectedSlot(null);
    setError(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (!selectedDate || !selectedSlot || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/booking/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone.trim() || undefined,
          message: message.trim() || undefined,
          date: selectedDate,
          time: selectedSlot,
        }),
      });
      if (!res.ok) {
        const result = resolveSubmitFailure(res.status);
        setError(result.error);
        setStep(result.step);
        if (result.clearSelectedSlot) {
          setSelectedSlot(null);
          void loadSlots(selectedDate, { keepError: true });
        }
        return;
      }
      setStep("success");
    } catch {
      setError(mapBookingError(undefined));
    } finally {
      setSubmitting(false);
    }
  }

  const selectedOption = dateOptions.find(opt => opt.iso === selectedDate);
  const selectedDateLabel = selectedOption
    ? `${selectedOption.weekday}, ${selectedOption.label}`
    : selectedDate;
  const successMessage =
    selectedDateLabel && selectedSlot
      ? `Danke — dein Termin am ${selectedDateLabel} um ${formatSlotLabel(selectedSlot)} ist angefragt. Du bekommst eine Bestätigung per E-Mail.`
      : "Danke — dein Termin ist angefragt. Du bekommst eine Bestätigung per E-Mail.";

  const panel = (
    <div
      id={panelId}
      className="pb-island-panel"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      hidden={!open}
      onKeyDown={event => trapTabKey(event, event.currentTarget)}
    >
      <div className="pb-island-panel-header">
        <span>{title}</span>
        <button
          ref={closeButtonRef}
          type="button"
          className="pb-island-panel-close"
          onClick={closePanel}
        >
          Schließen
        </button>
      </div>

      {settingsError && (
        <div className="pb-island-panel-body">
          <p className="pb-island-status" data-state="error" role="alert">
            {settingsError}
          </p>
        </div>
      )}

      {!settingsError && settingsLoading && (
        <div className="pb-island-panel-body">
          <p className="pb-island-status" aria-live="polite">
            Lädt…
          </p>
        </div>
      )}

      {!settingsError && !settingsLoading && settings && step === "dates" && (
        <BookingDateStep
          dateOptions={dateOptions}
          selectedDate={selectedDate}
          error={error}
          onSelect={selectDate}
        />
      )}

      {!settingsError && step === "slots" && (
        <BookingSlotStep
          slots={slots}
          slotsLoading={slotsLoading}
          selectedSlot={selectedSlot}
          error={error}
          onBack={backToDates}
          onSelect={selectSlot}
        />
      )}

      {!settingsError && step === "form" && (
        <form
          className="pb-island-panel-body"
          onSubmit={event => void handleSubmit(event)}
        >
          <button
            type="button"
            className="pb-island-step-back"
            onClick={backToSlots}
          >
            ← Andere Uhrzeit
          </button>
          {selectedDateLabel && selectedSlot && (
            <p className="pb-island-summary">
              {selectedDateLabel} · {formatSlotLabel(selectedSlot)}
            </p>
          )}
          <BookingFormFields
            name={name}
            email={email}
            phone={phone}
            message={message}
            onNameChange={setName}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
            onMessageChange={setMessage}
            error={error}
            submitting={submitting}
          />
        </form>
      )}

      {!settingsError && step === "success" && (
        <div className="pb-island-panel-body">
          <p className="pb-island-status" data-state="success" role="status">
            {successMessage}
          </p>
        </div>
      )}
    </div>
  );

  if (disabled) {
    return (
      <button
        type="button"
        className="pb-island-fab-btn"
        disabled
        aria-disabled="true"
        title="In der Vorschau nicht aktiv"
      >
        Termin
      </button>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="pb-island-fab-btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? closePanel() : openPanel())}
      >
        Termin
      </button>
      {/* Portal aus demselben Grund wie in ChatIsland.tsx: `.pb-island--fab`
          ist `position:fixed` und bekommt dadurch einen eigenen
          Stacking-Context — als Kind von `document.body` konkurriert das
          Panel stattdessen zuverlässig im Root-Stacking-Context. Ohne
          `document` (SSR über renderToStaticMarkup) bleibt das Panel
          inline, dort ist es ohnehin nur `hidden`-Markup ohne Interaktion. */}
      {typeof document !== "undefined"
        ? createPortal(panel, document.body)
        : panel}
    </>
  );
};
