import React from "react";

interface LiveCardProps {
  /** website.slug — die öffentliche Website liegt unter `https://<slug>.pageblitz.de`. */
  slug: string;
}

/**
 * Ersetzt die CheckoutBar, sobald die Website verkauft/aktiv ist (Spec §2.1
 * „Live-Modus"): kein Checkout, keine E-Mail-Abfrage mehr — stattdessen die
 * öffentliche URL und ein Link ins Dashboard. Die Checkliste bleibt darüber
 * sichtbar, Bearbeitung im Studio funktioniert unverändert weiter.
 */
export function LiveCard({ slug }: LiveCardProps) {
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
