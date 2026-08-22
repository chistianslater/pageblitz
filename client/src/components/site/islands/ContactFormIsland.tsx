import React from "react";

/**
 * Statisches Kontaktformular-Markup — funktioniert ohne JS per echtem
 * Formular-POST auf `/api/site/:slug/contact` (Endpunkt kommt in Task 7).
 * `data-hydrate="contact"` markiert die Wurzel für die Hydration in
 * `client/src/site-islands/main.tsx`; das Fetch-basierte Absenden (statt
 * echtem Seiten-Reload) folgt ebenfalls in Task 7.
 *
 * Honeypot-Feld `website_url`: visuell versteckt, `tabIndex={-1}` +
 * `autoComplete="off"` halten es aus Tab-Reihenfolge und Browser-Autofill
 * heraus — Bots füllen es trotzdem aus, echte Nutzer:innen nie.
 */
export const ContactFormIsland: React.FC<{
  slug: string;
  basePath?: string;
}> = ({ slug, basePath = "" }) => {
  return (
    <form
      className="pb-island-form"
      data-hydrate="contact"
      method="post"
      action={`/api/site/${slug}/contact`}
    >
      <label>
        Name
        <input type="text" name="name" required autoComplete="name" />
      </label>
      <label>
        E-Mail
        <input type="email" name="email" required autoComplete="email" />
      </label>
      <label>
        Telefon (optional)
        <input type="tel" name="phone" autoComplete="tel" />
      </label>
      <label>
        Nachricht
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
      <p className="pb-island-privacy">
        Mit dem Absenden akzeptierst du unsere{" "}
        <a href={`${basePath}/datenschutz`}>Datenschutzerklärung</a>.
      </p>
      <button type="submit" className="pb-island-submit">
        Nachricht senden
      </button>
    </form>
  );
};
