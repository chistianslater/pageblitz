import React, { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/landing/primitives";
import { PRICING, formatEuro } from "@shared/pricing";
import { HOME_FAQ_ITEMS } from "@shared/faq";

export function Logo() {
  return (
    <a href="#top" aria-label="Pageblitz – nach oben">
      <Wordmark />
    </a>
  );
}
export function StartForm({
  id,
  yearly = true,
  label = "Kostenlosen Entwurf erstellen",
  placeholder = "Name deines Betriebs",
}: {
  id: string;
  yearly?: boolean;
  label?: string;
  placeholder?: string;
}) {
  return (
    <form className="lc-start" action="/start" method="get">
      <input
        type="hidden"
        name="billing"
        value={yearly ? "yearly" : "monthly"}
      />
      <label htmlFor={id}>Wie heißt dein Betrieb?</label>
      <div>
        <input
          id={id}
          name="name"
          autoComplete="organization"
          placeholder={placeholder}
        />
        <button type="submit">
          {label}
          <ArrowRight size={18} />
        </button>
      </div>
      <p>Vorschau kostenlos. Keine Kreditkarte. Du entscheidest danach.</p>
    </form>
  );
}
export function DemoLink({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <a
      className="lc-link"
      href={`/demo/${id}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={18} />
    </a>
  );
}
export function Price({ dark = false }: { dark?: boolean }) {
  const [yearly, setYearly] = useState(true);
  return (
    <div className={`lc-price ${dark ? "lc-price-dark" : ""}`}>
      <div className="lc-billing" role="group" aria-label="Abrechnung">
        <button aria-pressed={yearly} onClick={() => setYearly(true)}>
          Jahrestarif
        </button>
        <button aria-pressed={!yearly} onClick={() => setYearly(false)}>
          Monatlich
        </button>
      </div>
      <p className="lc-price-value">
        {formatEuro(yearly ? PRICING.base.yearly : PRICING.base.monthly)}
        <span>/ Monat</span>
      </p>
      <p>
        {yearly ? "Im Jahrestarif" : "Bei monatlicher Abrechnung"} · Keine
        Einrichtungsgebühr
      </p>
      <ul>
        <li>Deine Website mit individuellem Design</li>
        <li>Hosting und SSL inklusive</li>
        <li>Texte und Bilder im Studio bearbeiten</li>
        <li>Eigene Domain verbinden oder Subdomain nutzen</li>
      </ul>
      <a
        className="lc-button"
        href={`/start?billing=${yearly ? "yearly" : "monthly"}`}
      >
        Erst kostenlos ansehen
        <ArrowRight size={18} />
      </a>
      <p className="lc-extra">
        Optional: Galerie ab {formatEuro(PRICING.addon)}/Monat, Terminbuchung{" "}
        {formatEuro(PRICING.addonBooking)}/Monat, KI-Chat{" "}
        {formatEuro(PRICING.addonAiChat)}/Monat.
      </p>
    </div>
  );
}
export function Questions() {
  return (
    <div className="lc-faq">
      {[
        HOME_FAQ_ITEMS[0],
        HOME_FAQ_ITEMS[1],
        HOME_FAQ_ITEMS[2],
        HOME_FAQ_ITEMS[5],
      ].map(f => (
        <details key={f.q}>
          <summary>
            {f.q}
            <span aria-hidden="true">+</span>
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
export function Footer() {
  return (
    <footer className="lc-footer">
      <Logo />
      <span>Dein Geschäft. Deine Website.</span>
      <a href="/impressum">Impressum</a>
      <a href="/datenschutz">Datenschutz</a>
      <a href="mailto:hallo@pageblitz.de">Kontakt</a>
    </footer>
  );
}
