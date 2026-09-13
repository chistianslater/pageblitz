import React, { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/landing/primitives";
import { PRICING, formatEuro } from "@shared/pricing";
import { HOME_FAQ_VISIBLE } from "@shared/faq";
import { SEO_INDUSTRY_LINKS } from "@shared/seoIndustryLinks";

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
      {HOME_FAQ_VISIBLE.map(f => (
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
/**
 * Branchenseiten (/website-erstellen/<slug>, serverseitig gerendert).
 *
 * Sie existierten bisher nur fuer Crawler: der Prerender verlinkte sie, React
 * ersetzt den Prerender beim Mounten — fuer Besucherinnen waren sie damit
 * unerreichbar. Hier stehen sie sichtbar, direkt ueber dem Fuss, und die
 * Startseite gibt ihre interne Verlinkung an sie weiter.
 *
 * Die Liste kommt aus shared/seoIndustryLinks.ts; server/seo.links.test.ts
 * haelt sie deckungsgleich mit SEO_INDUSTRIES auf der Serverseite.
 */
export function IndustryLinks() {
  return (
    <section className="lc-industries" aria-labelledby="lc-industries-title">
      <h2 id="lc-industries-title">Website für deine Branche</h2>
      <div>
        {SEO_INDUSTRY_LINKS.map(link => (
          <a key={link.slug} href={`/website-erstellen/${link.slug}`}>
            {link.name}
          </a>
        ))}
      </div>
      <a className="lc-industries-all" href="/website-erstellen">
        Alle Branchen ansehen
        <ArrowRight size={15} />
      </a>
    </section>
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
