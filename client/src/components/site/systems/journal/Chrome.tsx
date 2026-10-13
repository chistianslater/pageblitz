import React from "react";
import type { NavItem } from "../../engine";
import { SECTION_ANCHORS } from "../../engine";
import { telHref } from "../shared/heroFacts";
import { useSystem } from "../SystemContext";
import {
  addressLine,
  contactOf,
  detailsMenuJs,
  mailHref,
  mapsHref,
  primaryAction,
  newTabIfMaps,
} from "../shared";
import { displayName } from "../../../../../../shared/designSystems/displayName";
import type { SectionType } from "../../../../../../shared/siteContract/types";
import { SYS_ACTIONS } from "../shared/dockAutoHide";

/**
 * Kopf und Fuß von Journal nach Systemblatt (Anker Aman Venice):
 * Handy „Menü · MARKE · Anrufen", Desktop zusätzlich Telefon + Knopf und
 * eine zentrierte Navigationszeile; Fuß als helles Band mit Marke in
 * gesperrten Serifen-Versalien, Adresse, Telefon, Textlinks, Rechtszeile.
 */

/** Ab hier wird die Marke im Handy-Kopf kleiner bzw. verlässt die Versalien. */
const BRAND_LONG_WORD = 8;
const BRAND_LONG_TOTAL = 16;
const BRAND_XLONG_WORD = 12;
const BRAND_XLONG_TOTAL = 24;

/**
 * Größenstufe der Marke im Kopf, beim Rendern aus der Namenslänge: Gesperrte
 * Versalien passen auf schmalen Handys nur für kurze Namen zwischen „Menü"
 * und „Anrufen". `--long` verkleinert, `--xlong` setzt gemischte Schreibung.
 */
export function brandClasses(name: string): string {
  const longest = Math.max(...name.split(/[\s\-–/]+/).map(w => w.length), 0);
  if (longest > BRAND_XLONG_WORD || name.length > BRAND_XLONG_TOTAL)
    return "jr-brand jr-brand--xlong";
  if (longest > BRAND_LONG_WORD || name.length > BRAND_LONG_TOTAL)
    return "jr-brand jr-brand--long";
  return "jr-brand";
}

/** Journal-Wortwahl der Navigation (Systemblatt); Bauplan-Labels gewinnen. */
const NAV_LABELS: Partial<Record<SectionType, string>> = {
  gallery: "Einblicke",
  testimonials: "Stimmen",
  process: "Ablauf",
  faq: "Gut zu wissen",
  contact: "Besuch",
  story: "Geschichte",
  usp: "Grundsätze",
  stats: "In Zahlen",
};

export function journalNavItems(items: NavItem[]): NavItem[] {
  return items.map(item =>
    item.sectionType && !item.fixedLabel && NAV_LABELS[item.sectionType]
      ? { ...item, label: NAV_LABELS[item.sectionType]! }
      : item
  );
}

function NavLinks({ items }: { items: NavItem[] }) {
  return (
    <>
      {items.map(item => (
        <a
          key={item.key}
          href={item.href}
          aria-current={item.current ? "page" : undefined}
        >
          {item.label}
        </a>
      ))}
    </>
  );
}

/**
 * Schließt das Menü nach Klick auf einen Eintrag (Sprung zum Anker), per
 * Escape (Fokus zurück auf „Menü") und per Klick daneben. Inline-Script,
 * weil SSR-Kundenseiten nicht hydrieren; ohne JS bleibt das Menü per
 * <summary> bedienbar und schließt über einen zweiten Klick/Enter.
 */
export const JOURNAL_MENU_JS = detailsMenuJs("jr");

export function JournalHead({
  navItems,
  anchorPrefix,
}: {
  navItems: NavItem[];
  anchorPrefix: string;
}) {
  const { data, blueprint } = useSystem();
  const contact = contactOf(data.sections);
  const tel = telHref(contact?.phone);
  const action = primaryAction(data, blueprint, anchorPrefix);
  const home = `${anchorPrefix}#${SECTION_ANCHORS.hero}`;
  // Kopf zeigt den Namen ohne Rechtsform; Fuß und Rechtstexte behalten ihn.
  const brand = displayName(data.businessName);
  return (
    <header className="jr-head">
      <div className="jr-head-bar">
        {/* Menü ohne JS: <details>/<summary> (SSR-Kundenseiten hydrieren nicht). */}
        <details className="jr-menu">
          <summary className="jr-menu-toggle">
            <span className="jr-menu-icon" aria-hidden="true" />
            <span className="jr-menu-label">Menü</span>
          </summary>
          <nav className="jr-menu-panel" aria-label="Menü">
            <NavLinks items={navItems} />
          </nav>
        </details>
        <a className={brandClasses(brand)} href={home}>
          {brand}
        </a>
        <div className="jr-head-actions">
          {tel ? (
            <a className="jr-link jr-head-call" href={tel}>
              Anrufen
            </a>
          ) : (
            <a className="jr-link jr-head-call" href={action.href} {...newTabIfMaps(action.href)}>
              {action.label}
            </a>
          )}
          {tel && contact?.phone && (
            <a className="jr-link jr-head-phone" href={tel}>
              {contact.phone}
            </a>
          )}
          {/* Klassenname aus dem Plan; Gestalt laut Systemblatt eckig. */}
          <a className="jr-pill" href={action.href} {...newTabIfMaps(action.href)}>
            {action.label}
          </a>
        </div>
      </div>
      <nav className="jr-nav" aria-label="Hauptnavigation">
        <a className="jr-nav-home" href={home}>
          {brand}
        </a>
        <NavLinks items={navItems} />
      </nav>
      <script dangerouslySetInnerHTML={{ __html: JOURNAL_MENU_JS }} />
    </header>
  );
}

export function JournalFoot({
  basePath,
  anchorPrefix,
}: {
  basePath: string;
  anchorPrefix: string;
}) {
  const { data, blueprint, now } = useSystem();
  const contact = contactOf(data.sections);
  const address = addressLine(contact);
  const tel = telHref(contact?.phone);
  const action = primaryAction(data, blueprint, anchorPrefix);
  const mail = mailHref(contact?.email);
  const reach = [
    tel && contact?.phone ? (
      <a key="tel" href={tel}>
        {contact.phone}
      </a>
    ) : null,
    mail && contact?.email ? (
      <a key="mail" href={mail}>
        {contact.email.trim()}
      </a>
    ) : null,
  ].filter(Boolean);
  return (
    <footer className="jr-foot">
      <div className="jr-wrap">
        <p className="jr-mark">{data.businessName}</p>
        {(address || reach.length > 0) && (
          <address className="jr-foot-contact" {...SYS_ACTIONS}>
            {address}
            {address && reach.length > 0 && <br />}
            {reach.flatMap((node, i) => (i === 0 ? [node] : [" · ", node]))}
          </address>
        )}
        <div className="jr-links" {...SYS_ACTIONS}>
          {address && (
            <a className="jr-link" href={mapsHref(address)} target="_blank" rel="noopener noreferrer">
              Route planen
            </a>
          )}
          {!action.href.startsWith("tel:") && (
            <a className="jr-link" href={action.href} {...newTabIfMaps(action.href)}>
              {action.label}
            </a>
          )}
        </div>
        <div className="jr-foot-legal">
          <a href={`${basePath}/impressum`}>Impressum</a>
          <a href={`${basePath}/datenschutz`}>Datenschutz</a>
          <span>© {now.getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
