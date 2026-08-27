import React, { useEffect, useState } from "react";
import type { ContactFormConfig } from "../../../../../shared/siteContract/types";

type SubmitState = "idle" | "busy" | "success" | "error";

const SUCCESS_MESSAGE = "Danke — wir melden uns zeitnah.";
const GENERIC_ERROR_MESSAGE =
  "Etwas ist schiefgelaufen. Bitte versuche es später erneut.";

/**
 * Kontaktformular-Insel: SSR-Markup funktioniert ohne JS per echtem
 * Formular-POST auf `/api/site/:slug/contact` (No-JS-Fallback, Server-Logik
 * in `server/contactSubmit.ts`). `data-hydrate="contact"` markiert die
 * Wurzel für die Hydration in `client/src/site-islands/main.tsx`.
 *
 * Mit JS: `onSubmit` verhindert den echten Seiten-Reload, sendet die Daten
 * per fetch als JSON an denselben Endpunkt (der anhand von Content-Type /
 * Accept zwischen JSON- und Formular-Antwort unterscheidet) und zeigt Busy-,
 * Erfolgs- und Fehlerzustand direkt in der Insel.
 *
 * Ohne JS: der Server liefert nach dem echten POST einen 303-Redirect mit
 * `?kontakt=gesendet` bzw. `?kontakt=fehler` zurück auf die Formular-Sektion
 * — dieser Query-Parameter wird HIER erst im `useEffect` gelesen (nicht
 * während des Renderns), damit das allererste Render serverseitig identisch
 * zum ersten Client-Render bleibt (sonst Hydration-Mismatch).
 *
 * Honeypot-Feld `website_url`: visuell versteckt, `tabIndex={-1}` +
 * `autoComplete="off"` halten es aus Tab-Reihenfolge und Browser-Autofill
 * heraus — Bots füllen es trotzdem aus, echte Nutzer:innen nie.
 *
 * `disabled` (gesetzt von `SiteIslands` im CSR-Vorschau-Modus, siehe
 * `mode`-Prop dort): alle Felder bleiben sichtbar/ausfüllbar, nur der
 * Absenden-Button ist deaktiviert + ein Hinweis erscheint — verhindert
 * echte POSTs gegen `/api/site/:slug/contact` aus internen
 * Vorschau-Bildschirmen (Dashboard/Editor). `handleSubmit` bricht defensiv
 * zusätzlich früh ab, falls das Formular trotzdem submitted wird (z. B.
 * Enter-Taste in einem Feld).
 */
export const ContactFormIsland: React.FC<{
  slug: string;
  basePath?: string;
  disabled?: boolean;
  config?: ContactFormConfig;
}> = ({ slug, basePath = "", disabled = false, config }) => {
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState(GENERIC_ERROR_MESSAGE);
  const actionUrl = `/api/site/${slug}/contact`;

  useEffect(() => {
    const kontakt = new URLSearchParams(window.location.search).get("kontakt");
    if (kontakt === "gesendet") setState("success");
    else if (kontakt === "fehler") setState("error");
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (disabled) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const customFields = Object.fromEntries(
      (config?.customFields ?? []).map(field => [
        field.label,
        String(formData.get(`custom-${field.id}`) ?? ""),
      ])
    );
    setState("busy");
    try {
      const res = await fetch(actionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone") || undefined,
          message: formData.get("message"),
          customFields,
          website_url: formData.get("website_url") ?? "",
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setState("success");
      } else {
        setErrorMessage(
          typeof data?.error === "string" ? data.error : GENERIC_ERROR_MESSAGE
        );
        setState("error");
      }
    } catch {
      setErrorMessage(GENERIC_ERROR_MESSAGE);
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p className="pb-island-status" data-state="success" role="status">
        {config?.successMessage ?? SUCCESS_MESSAGE}
      </p>
    );
  }

  return (
    <form
      className="pb-island-form"
      data-hydrate="contact"
      method="post"
      action={actionUrl}
      onSubmit={handleSubmit}
    >
      <label>
        {config?.nameLabel ?? "Name"}
        <input type="text" name="name" required autoComplete="name" />
      </label>
      <label>
        {config?.emailLabel ?? "E-Mail"}
        <input type="email" name="email" required autoComplete="email" />
      </label>
      {config?.phoneEnabled !== false && (
        <label>
          {config?.phoneLabel ??
            (config?.phoneRequired ? "Telefon" : "Telefon (optional)")}
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            required={config?.phoneRequired}
          />
        </label>
      )}
      {(config?.customFields ?? []).map(field => (
        <label key={field.id}>
          {field.label}
          <input
            type="text"
            name={`custom-${field.id}`}
            required={field.required}
            maxLength={255}
          />
        </label>
      ))}
      <label>
        {config?.messageLabel ?? "Nachricht"}
        <textarea name="message" required rows={5} />
      </label>
      <div className="pb-island-honeypot" aria-hidden="true">
        <label htmlFor="website_url">Bitte leer lassen</label>
        <input
          id="website_url"
          type="text"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {/*
        Bewusst EIN Textkind vor dem Link statt Literal-Text + separatem
        `{" "}`-Ausdruck: renderSiteHtml nutzt renderToStaticMarkup, das
        (anders als renderToString) KEINEN `<!-- -->`-Trenner zwischen zwei
        benachbarten Text-Kindern einfügt. Im geparsten DOM verschmelzen zwei
        benachbarte Textknoten dann zu einem — die Insel-Hydration
        (hydrateRoot) sah dadurch einen Textknoten weniger als erwartet und
        schlug mit React-Fehler #418 fehl. Ein einzelnes Ausdruck-Kind vor
        dem `<a>` umgeht das.
      */}
      <p className="pb-island-privacy">
        {"Mit dem Absenden akzeptierst du unsere "}
        <a href={`${basePath}/datenschutz`}>Datenschutzerklärung</a>
        {"."}
      </p>
      {state === "error" && (
        <p className="pb-island-status" data-state="error" role="alert">
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        className="pb-island-submit"
        disabled={state === "busy" || disabled}
      >
        {state === "busy"
          ? "Wird gesendet…"
          : (config?.submitLabel ?? "Nachricht senden")}
      </button>
      {disabled && (
        <p className="pb-island-status" data-state="info">
          In der Vorschau nicht aktiv
        </p>
      )}
    </form>
  );
};
