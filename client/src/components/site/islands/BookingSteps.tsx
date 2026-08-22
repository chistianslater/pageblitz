import React from "react";
import { formatSlotLabel, type DateOption } from "./bookingHelpers";

/**
 * Schritt-Inhalte "Datum wählen" und "Uhrzeit wählen" der Terminbuchungs-
 * Insel — ausgelagert wie `BookingFormFields.tsx`, damit `BookingIsland.tsx`
 * unter der 400-Zeilen-Grenze bleibt. Reine Präsentationskomponenten: State
 * und Fetch-Logik bleiben in `BookingIsland.tsx`.
 */
export const BookingDateStep: React.FC<{
  dateOptions: DateOption[];
  selectedDate: string | null;
  error: string | null;
  onSelect: (iso: string) => void;
}> = ({ dateOptions, selectedDate, error, onSelect }) => (
  <div className="pb-island-panel-body">
    {dateOptions.length === 0 ? (
      <p className="pb-island-empty">Aktuell sind keine Termine verfügbar.</p>
    ) : (
      <div className="pb-island-dates" role="group" aria-label="Datum wählen">
        {dateOptions.map(opt => (
          <button
            key={opt.iso}
            type="button"
            className="pb-island-chip"
            aria-pressed={selectedDate === opt.iso}
            onClick={() => onSelect(opt.iso)}
          >
            <span>{opt.weekday}</span>
            {opt.label}
          </button>
        ))}
      </div>
    )}
    {error && (
      <p className="pb-island-status" data-state="error" role="alert">
        {error}
      </p>
    )}
  </div>
);

export const BookingSlotStep: React.FC<{
  slots: string[];
  slotsLoading: boolean;
  selectedSlot: string | null;
  error: string | null;
  onBack: () => void;
  onSelect: (time: string) => void;
}> = ({ slots, slotsLoading, selectedSlot, error, onBack, onSelect }) => (
  <div className="pb-island-panel-body">
    <button type="button" className="pb-island-step-back" onClick={onBack}>
      ← Anderes Datum
    </button>
    {slotsLoading && (
      <p className="pb-island-status" aria-live="polite">
        Lädt…
      </p>
    )}
    {!slotsLoading && slots.length === 0 && (
      <p className="pb-island-empty">An diesem Tag sind keine Termine frei.</p>
    )}
    {!slotsLoading && slots.length > 0 && (
      <div className="pb-island-slots" role="group" aria-label="Uhrzeit wählen">
        {slots.map(time => (
          <button
            key={time}
            type="button"
            className="pb-island-chip"
            aria-pressed={selectedSlot === time}
            onClick={() => onSelect(time)}
          >
            {formatSlotLabel(time)}
          </button>
        ))}
      </div>
    )}
    {error && (
      <p className="pb-island-status" data-state="error" role="alert">
        {error}
      </p>
    )}
  </div>
);
