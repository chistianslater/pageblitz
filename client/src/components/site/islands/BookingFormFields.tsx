import React from "react";

/**
 * Formularfelder des letzten Buchungsschritts in `BookingIsland.tsx` —
 * ausgelagert, damit `BookingIsland.tsx` unter der 400-Zeilen-Grenze bleibt
 * (Datei-Organisationsregel: viele kleine Dateien statt einer großen).
 * Reine Präsentationskomponente: der State (Werte + Setter) lebt weiter in
 * `BookingIsland.tsx`, hier nur kontrollierte Inputs + Submit-Button.
 */
export const BookingFormFields: React.FC<{
  name: string;
  email: string;
  phone: string;
  message: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  error: string | null;
  submitting: boolean;
}> = ({
  name,
  email,
  phone,
  message,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onMessageChange,
  error,
  submitting,
}) => (
  <div className="pb-island-form">
    <label>
      Name
      <input
        type="text"
        value={name}
        onChange={e => onNameChange(e.target.value)}
        required
        autoComplete="name"
      />
    </label>
    <label>
      E-Mail
      <input
        type="email"
        value={email}
        onChange={e => onEmailChange(e.target.value)}
        required
        autoComplete="email"
      />
    </label>
    <label>
      Telefon (optional)
      <input
        type="tel"
        value={phone}
        onChange={e => onPhoneChange(e.target.value)}
        autoComplete="tel"
      />
    </label>
    <label>
      Nachricht (optional)
      <textarea value={message} onChange={e => onMessageChange(e.target.value)} rows={3} />
    </label>
    {error && (
      <p className="pb-island-status" data-state="error" role="alert">
        {error}
      </p>
    )}
    <button type="submit" className="pb-island-submit" disabled={submitting}>
      {submitting ? "Wird gesendet…" : "Termin anfragen"}
    </button>
  </div>
);
