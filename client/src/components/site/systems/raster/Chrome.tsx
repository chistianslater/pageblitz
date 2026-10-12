import React from "react";
import type { NavItem } from "../../engine";
import { SECTION_ANCHORS, orderedSections } from "../../engine";
import { shortHours, telHref } from "../../artDirection/heroFacts";
import { isPlaceholderHours } from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import {
  addressLine,
  contactOf,
  detailsMenuJs,
  mailHref,
  primaryAction,
  systemShows,
  newTabIfMaps,
} from "../shared";
import { displayName } from "../../../../../../shared/designSystems/displayName";
import { groupOpeningHours } from "../../../../../../shared/onboardingV2/openingHours";
import { REFERENCE_COLUMN_REM, fitWordmark } from "./fit";
import type {
  SectionOf,
  SectionType,
} from "../../../../../../shared/siteContract/types";
import { SYS_ACTIONS } from "../shared/dockAutoHide";

/**
 * Kopf und Fuß von Raster nach Systemblatt (Anker Colophon): Handy
 * Wortmarke links, „Menü" rechts; Desktop Navigation rechts mit
 * Signal-Knopf. Fuß dunkel mit Aufforderung, vier Spalten Fakten und
 * Rechtszeile.
 */

/** Raster-Wortwahl der Navigation (Systemblatt); Bauplan-Labels gewinnen. */
const NAV_LABELS: Partial<Record<SectionType, string>> = {
  testimonials: "Stimmen",
  process: "Ablauf",
  faq: "Fragen",
  contact: "Kontakt",
  stats: "In Zahlen",
  usp: "Grundsätze",
  story: "Geschichte",
};

export function rasterNavItems(items: NavItem[]): NavItem[] {
  return items.map(item =>
    item.sectionType && !item.fixedLabel && NAV_LABELS[item.sectionType]
      ? { ...item, label: NAV_LABELS[item.sectionType]! }
      : item
  );
}

/** Menü-Script (schließt bei Link-Klick, Escape, Klick daneben). */
export const RASTER_MENU_JS = detailsMenuJs("rs");

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

export function RasterHead({
  navItems,
  anchorPrefix,
  overPhoto = false,
}: {
  navItems: NavItem[];
  anchorPrefix: string;
  /** Über dem Foto-Einstieg: transparent, helle Schrift. */
  overPhoto?: boolean;
}) {
  const { data, blueprint } = useSystem();
  const action = primaryAction(data, blueprint, anchorPrefix);
  const home = `${anchorPrefix}#${SECTION_ANCHORS.hero}`;
  // Kopf zeigt den Namen ohne Rechtsform; Fuß und Rechtstexte behalten ihn.
  // Ist das Gewerk im Einstieg in den Kicker gewandert, trägt der Kopf die
  // kurze Wortmarke (Systemblatt: YILMAZ statt KFZ-MEISTERBETRIEB YILMAZ).
  const brand = fitWordmark(
    displayName(data.businessName),
    REFERENCE_COLUMN_REM
  ).wordmark;
  return (
    <header className={overPhoto ? "rs-head rs-head--over" : "rs-head"}>
      <div className="rs-head-bar">
        <a className="rs-brand" href={home}>
          {brand}
        </a>
        <nav className="rs-nav" aria-label="Hauptnavigation">
          <NavLinks items={navItems} />
          <a className="rs-btn" href={action.href} {...newTabIfMaps(action.href)}>
            {action.label}
          </a>
        </nav>
        {/* Menü ohne JS: <details>/<summary> (SSR-Kundenseiten hydrieren nicht). */}
        <details className="rs-menu">
          <summary className="rs-menu-toggle">Menü</summary>
          <nav className="rs-menu-panel" aria-label="Menü">
            <NavLinks items={navItems} />
          </nav>
        </details>
      </div>
      <script dangerouslySetInnerHTML={{ __html: RASTER_MENU_JS }} />
    </header>
  );
}

/** Höchstens so viele Leistungen stehen im Fuß (Rest im Abschnitt). */
const FOOT_SERVICES = 6;

/**
 * „Montag–Freitag 8–17 Uhr": Zeiten-Spalte nur mit echten Zeiten, gleiche
 * Folgetage zusammengefasst wie im Kontakt-Kapitel (sonst fünf Zeilen).
 */
function hoursRows(contact: SectionOf<"contact"> | undefined) {
  const hours = contact?.openingHours;
  if (!hours?.length || isPlaceholderHours(hours)) return [];
  return groupOpeningHours(hours).map(h => ({
    day: h.day,
    hours: shortHours(h.hours),
  }));
}

function FootCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rs-foot-col">
      <p className="rs-foot-h">{title}</p>
      {children}
    </div>
  );
}

export function RasterFoot({
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
  const mail = mailHref(contact?.email);
  const action = primaryAction(data, blueprint, anchorPrefix);
  // Nur sichtbare Abschnitte: ausgeblendete Leistungen bzw. Aufruf dürfen
  // im Fuß weder auftauchen noch auf einen fehlenden Anker zeigen.
  const visible = orderedSections(data).filter(systemShows);
  const services = visible.find(
    (s): s is SectionOf<"services"> => s.type === "services"
  );
  const cta = visible.find((s): s is SectionOf<"cta"> => s.type === "cta");
  const hours = hoursRows(contact);
  const serviceTitles = (services?.items ?? [])
    .map(i => i.title.trim())
    .filter(Boolean)
    .slice(0, FOOT_SERVICES);
  const servicesHref = `${anchorPrefix}#${SECTION_ANCHORS.services}`;
  return (
    <footer className="rs-foot">
      <div className="rs-wrap">
        {/* Aufforderung: Aufruf-Abschnitt, sonst die Hauptaktion — nichts erfunden. */}
        <p className="rs-foot-call" {...SYS_ACTIONS}>
          <a href={action.href} {...newTabIfMaps(action.href)}>{cta?.headline || action.label}</a>
        </p>
        <div className="rs-foot-cols">
          {serviceTitles.length > 0 && (
            <FootCol title="Leistungen">
              <ul>
                {serviceTitles.map(title => (
                  <li key={title}>
                    <a href={servicesHref}>{title}</a>
                  </li>
                ))}
              </ul>
            </FootCol>
          )}
          {(address || tel || mail) && (
            <FootCol title="Kontakt">
              <address>
                <ul>
                  {tel && contact?.phone && (
                    <li>
                      <a className="rs-num" href={tel}>
                        {contact.phone}
                      </a>
                    </li>
                  )}
                  {mail && contact?.email && (
                    <li>
                      <a href={mail}>{contact.email.trim()}</a>
                    </li>
                  )}
                  {address && <li>{address}</li>}
                </ul>
              </address>
            </FootCol>
          )}
          {hours.length > 0 && (
            <FootCol title="Zeiten">
              <ul className="rs-num">
                {hours.map((h, i) => (
                  <li key={`${h.day}-${i}`}>
                    {h.day} <span className="rs-nowrap">{h.hours}</span>
                  </li>
                ))}
              </ul>
            </FootCol>
          )}
          <FootCol title="Rechtliches">
            <ul>
              <li>
                <a href={`${basePath}/impressum`}>Impressum</a>
              </li>
              <li>
                <a href={`${basePath}/datenschutz`}>Datenschutz</a>
              </li>
            </ul>
          </FootCol>
        </div>
        <div className="rs-foot-legal">
          <span>
            © {now.getFullYear()} {data.businessName}
          </span>
          {contact?.city && <span>{contact.city}</span>}
        </div>
      </div>
    </footer>
  );
}
