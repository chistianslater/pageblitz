import React from "react";

type LiveStatus = "sold" | "active" | "inactive";

interface LiveCardProps {
  /** website.slug — die öffentliche Website liegt unter `https://<slug>.pageblitz.de`. */
  slug: string;
  /** website.status ohne "preview" (siehe StudioPage: isLive = status !== "preview"). */
  status: LiveStatus;
}

/**
 * Ersetzt die CheckoutBar, sobald die Website verkauft/aktiv/inaktiv ist
 * (Spec §2.1 „Live-Modus"): kein Checkout, keine E-Mail-Abfrage mehr. Der
 * Inhalt unterscheidet sich nach Status:
 * - "active": Website ist live erreichbar → öffentliche URL verlinkt.
 * - "sold": gekauft, aber Einrichtung (Subdomain-Wahl) noch nicht
 *   abgeschlossen → kein Live-Link (die Adresse steht noch nicht fest,
 *   `slug` kann z. B. noch der Platzhalter sein), stattdessen Hinweis aufs
 *   Dashboard, wo die Adresse festgelegt wird.
 * - "inactive": Website war live, ist aber pausiert (z. B. Abo gekündigt).
 * Die Checkliste bleibt darüber sichtbar, Bearbeitung im Studio funktioniert
 * in allen drei Fällen unverändert weiter.
 */
export function LiveCard({ slug, status }: LiveCardProps) {
  if (status === "sold") {
    return (
      <div className="pb-studio-checkout" aria-label="Live-Status">
        <p className="pb-studio-checkout-ready">
          Freigeschaltet — Einrichtung läuft
        </p>
        <p className="pb-studio-checkout-hint">
          Deine Adresse legst du im Dashboard fest.
        </p>
        <a className="pb-studio-btn" href="/my-website">
          Zum Dashboard
        </a>
      </div>
    );
  }

  if (status === "inactive") {
    return (
      <div className="pb-studio-checkout" aria-label="Live-Status">
        <p className="pb-studio-checkout-ready">Deine Website ist pausiert</p>
        <a className="pb-studio-btn" href="/my-website">
          Zum Dashboard
        </a>
      </div>
    );
  }

  const publicUrl = `https://${slug}.pageblitz.de`;
  return (
    <div className="pb-studio-checkout" aria-label="Live-Status">
      <p className="pb-studio-checkout-ready">Deine Website ist live</p>
      <a
        className="pb-studio-checkout-total"
        href={publicUrl}
        target="_blank"
        rel="noreferrer"
      >
        {publicUrl}
      </a>
      <a className="pb-studio-btn" href="/my-website">
        Zum Dashboard
      </a>
    </div>
  );
}
