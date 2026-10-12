import React from "react";
import type { NavItem } from "../../engine";
import { SECTION_ANCHORS, orderedSections } from "../../engine";
import { telHref } from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import {
  brandParts,
  branchOf,
  contactOf,
  detailsMenuJs,
  mailHref,
  nameOf,
  systemShows,
  versalEszett,
} from "../shared";
import { PLAKAT } from "../../../../../../shared/designSystems/plakat";
import type { SectionType } from "../../../../../../shared/siteContract/types";
import { plakatActions } from "./facts";
import { footWord, lineEm } from "./fit";
import { SYS_ACTIONS } from "../shared/dockAutoHide";

/**
 * Lange Wortmarken (geschätzt über die gemessene 88-%-Breite, ×1,15 für
 * volle Breite) bekommen im Kopf eine schmalere, kleinere Fassung — sonst
 * stapelt sich der Name am Handy neben der Menü-Pille über vier Zeilen.
 */
export const BRAND_LONG_EM = 5;
export const brandIsLong = (mark: string) =>
  lineEm(mark, 88) * 1.15 > BRAND_LONG_EM;

/**
 * Kopf und Fuß von Plakat nach Systemblatt (Anker Arcadia): Kopf auf Grund
 * mit Name in League Gothic und „Menü"-Pille; Desktop Navigation und
 * Hauptaktion als Pille mit Signal-Kreis. Fuß auf dem tiefen Feld: Adresse,
 * Kontakt, Riesenname (füllt die Breite, nie abgeschnitten), Rechtslinks.
 */

/** Plakat-Wortwahl der Navigation; Bauplan-Labels gewinnen. */
const NAV_LABELS: Partial<Record<SectionType, string>> = {
  gallery: "Bilder",
  testimonials: "Stimmen",
  process: "Ablauf",
  faq: "Fragen",
  contact: "Zeiten",
};

export function plakatNavItems(items: NavItem[]): NavItem[] {
  return items.map(item =>
    item.sectionType && !item.fixedLabel && NAV_LABELS[item.sectionType]
      ? { ...item, label: NAV_LABELS[item.sectionType]! }
      : item
  );
}

/** Menü-Script (schließt bei Link-Klick, Escape, Klick daneben). */
export const PLAKAT_MENU_JS = detailsMenuJs("pk");

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

/** Wortmarke im Kopf: Name ohne Gewerk („Kante Barbershop" → „Kante"). */
function useMark(): string {
  const { data, blueprint } = useSystem();
  return brandParts(nameOf(data), branchOf(data, blueprint)).mark;
}

export function PlakatHead({
  navItems,
  anchorPrefix,
}: {
  navItems: NavItem[];
  anchorPrefix: string;
}) {
  const { data, blueprint } = useSystem();
  const mark = useMark();
  const { primary } = plakatActions(data, blueprint, anchorPrefix);
  return (
    <header className="pk-head">
      <div className="pk-head-bar">
        <a
          className={brandIsLong(mark) ? "pk-brand pk-brand--long" : "pk-brand"}
          href={`${anchorPrefix}#${SECTION_ANCHORS.hero}`}
        >
          {versalEszett(mark)}
        </a>
        <nav className="pk-nav" aria-label="Hauptnavigation">
          <NavLinks items={navItems} />
          {primary && (
            <a className="pk-btn pk-btn--head" href={primary.href}>
              {primary.label}
              <i aria-hidden="true">→</i>
            </a>
          )}
        </nav>
        {/* Menü ohne JS: <details>/<summary> (SSR-Kundenseiten hydrieren nicht). */}
        {navItems.length > 0 && (
          <details className="pk-menu">
            <summary className="pk-menu-toggle">
              <i aria-hidden="true" />
              Menü
            </summary>
            <nav className="pk-menu-panel" aria-label="Menü">
              <NavLinks items={navItems} />
            </nav>
          </details>
        )}
      </div>
      <script dangerouslySetInnerHTML={{ __html: PLAKAT_MENU_JS }} />
    </header>
  );
}

const FOOT_TRACK = parseFloat(PLAKAT.type.figure!.track);

export function PlakatFoot({ basePath }: { basePath: string }) {
  const { data, now } = useSystem();
  const visible = orderedSections(data).filter(systemShows);
  const contact = contactOf(visible);
  const tel = telHref(contact?.phone);
  const mail = mailHref(contact?.email);
  const mark = useMark();
  const word = footWord(versalEszett(mark), FOOT_TRACK);
  const street = contact?.street?.trim();
  const place = [contact?.zip, contact?.city].filter(Boolean).join(" ");
  return (
    <footer className="pk-foot pk-deep">
      <div className="pk-wrap">
        <div className="pk-foot-cols">
          {(street || place) && (
            <div className="pk-foot-col">
              <p className="pk-foot-h">Adresse</p>
              <address>
                {street}
                {street && place && <br />}
                {place}
              </address>
            </div>
          )}
          {((tel && contact?.phone) || (mail && contact?.email)) && (
            <div className="pk-foot-col">
              <p className="pk-foot-h">Kontakt</p>
              <ul {...SYS_ACTIONS}>
                {tel && contact?.phone && (
                  <li>
                    <a href={tel}>{contact.phone.trim()}</a>
                  </li>
                )}
                {mail && contact?.email && (
                  <li>
                    <a href={mail}>{contact.email.trim()}</a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="pk-foot-fit">
          <p
            className="pk-foot-word"
            aria-hidden="true"
            style={
              { "--pk-fit": word.widthEm.toFixed(3) } as React.CSSProperties
            }
          >
            {word.lines.map(line => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </div>
        <p className="pk-foot-legal">
          <a href={`${basePath}/impressum`}>Impressum</a>
          <a href={`${basePath}/datenschutz`}>Datenschutz</a>
          <span>
            © {now.getFullYear()} {data.businessName}
          </span>
        </p>
      </div>
    </footer>
  );
}
