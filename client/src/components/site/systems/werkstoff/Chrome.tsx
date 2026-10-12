import React from "react";
import type { NavItem } from "../../engine";
import { SECTION_ANCHORS, orderedSections } from "../../engine";
import {
  isPlaceholderHours,
  shortHours,
  telHref,
} from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import {
  contactOf,
  detailsMenuJs,
  mailHref,
  primaryAction,
  systemShows,
  newTabIfMaps,
} from "../shared";
import { groupOpeningHours } from "../../../../../../shared/onboardingV2/openingHours";
import { WERKSTOFF } from "../../../../../../shared/designSystems/werkstoff";
import type {
  SectionOf,
  SectionType,
} from "../../../../../../shared/siteContract/types";
import {
  actionPair,
  brandParts,
  branchOf,
  nameOf,
  visibleDoc,
} from "./facts";
import { fitFootWord } from "./fit";
import { SYS_ACTIONS } from "../shared/dockAutoHide";

/**
 * Kopf und Fuß von Werkstoff nach Systemblatt (Anker Hollis): Kopf hell
 * mit Name in Slab und Gewerk in Mono, Menü als zwei Striche; Desktop
 * Navigation und Signal-Knopf. Fuß als einzige dunkle Fläche: Aufforderung,
 * Telefon-Knopf, vier Spalten, Rechtslinks, große Wortmarke.
 */

/** Werkstoff-Wortwahl der Navigation; Bauplan-Labels gewinnen. */
const NAV_LABELS: Partial<Record<SectionType, string>> = {
  gallery: "Arbeiten",
  testimonials: "Stimmen",
  process: "Ablauf",
  faq: "Fragen",
  contact: "Kontakt",
};

export function werkstoffNavItems(items: NavItem[]): NavItem[] {
  return items.map(item =>
    item.sectionType && !item.fixedLabel && NAV_LABELS[item.sectionType]
      ? { ...item, label: NAV_LABELS[item.sectionType]! }
      : item
  );
}

/** Menü-Script (schließt bei Link-Klick, Escape, Klick daneben). */
export const WERKSTOFF_MENU_JS = detailsMenuJs("ws");

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

export function WerkstoffHead({
  navItems,
  anchorPrefix,
}: {
  navItems: NavItem[];
  anchorPrefix: string;
}) {
  const { data, blueprint } = useSystem();
  const { mark, sub } = brandParts(nameOf(data), branchOf(data, blueprint));
  const [first] = actionPair(data, blueprint, anchorPrefix);
  return (
    <header className="ws-head">
      <div className="ws-head-bar">
        <a className="ws-brand" href={`${anchorPrefix}#${SECTION_ANCHORS.hero}`}>
          <span className="ws-brand-mark">{mark}</span>
          {sub && <span className="ws-brand-sub">{sub}</span>}
        </a>
        <nav className="ws-nav" aria-label="Hauptnavigation">
          <NavLinks items={navItems} />
          {first && (
            <a className="ws-btn" href={first.href} {...newTabIfMaps(first.href)}>
              {first.label}
            </a>
          )}
        </nav>
        {/* Weg im Kopf zwischen Leiste (< 48 rem) und Navigation (≥ 64 rem). */}
        {first && (
          <a className="ws-btn ws-head-btn" href={first.href} {...newTabIfMaps(first.href)}>
            {first.label}
          </a>
        )}
        {/* Menü ohne JS: <details>/<summary> (SSR-Kundenseiten hydrieren nicht). */}
        <details className="ws-menu">
          <summary className="ws-menu-toggle">
            <span className="ws-sr">Menü</span>
            <i aria-hidden="true" />
            <i aria-hidden="true" />
          </summary>
          <nav className="ws-menu-panel" aria-label="Menü">
            <NavLinks items={navItems} />
          </nav>
        </details>
      </div>
      <script dangerouslySetInnerHTML={{ __html: WERKSTOFF_MENU_JS }} />
    </header>
  );
}

/** „Mo–Fr 7–17 Uhr": nur echte Zeiten, gleiche Folgetage zusammengefasst. */
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
    <div className="ws-foot-col">
      <p className="ws-foot-h">{title}</p>
      {children}
    </div>
  );
}

/** Wortmarke im Fuß: eine Zeile, so breit wie die Spalte. */
const FOOT_TRACK = parseFloat(WERKSTOFF.type.figure!.track);

export function WerkstoffFoot({
  basePath,
  anchorPrefix,
  navItems,
}: {
  basePath: string;
  anchorPrefix: string;
  navItems: NavItem[];
}) {
  const { data, blueprint, now } = useSystem();
  const visible = orderedSections(data).filter(systemShows);
  const contact = contactOf(visible);
  const tel = telHref(contact?.phone);
  const mail = mailHref(contact?.email);
  const cta = visible.find((s): s is SectionOf<"cta"> => s.type === "cta");
  const [first] = actionPair(data, blueprint, anchorPrefix);
  const action = primaryAction(visibleDoc(data), blueprint, anchorPrefix);
  const hours = hoursRows(contact);
  const name = nameOf(data);
  const { mark } = brandParts(name, branchOf(data, blueprint));
  const word = fitFootWord(mark, FOOT_TRACK);
  const street = contact?.street?.trim();
  const place = [contact?.zip, contact?.city].filter(Boolean).join(" ");
  const pages = navItems.slice(0, 4);
  return (
    <footer className="ws-foot">
      <div className="ws-wrap">
        {/* Aufforderung: Aufruf-Abschnitt, sonst die Hauptaktion — nichts erfunden. */}
        <p className="ws-foot-call">{cta?.headline ?? action.label}</p>
        {tel && contact?.phone ? (
          <a className="ws-btn ws-foot-btn" href={tel} {...SYS_ACTIONS}>
            {contact.phone.trim()}
          </a>
        ) : (
          first && (
            <a
              className="ws-btn ws-foot-btn"
              href={first.href}
              {...SYS_ACTIONS}
              {...newTabIfMaps(first.href)}
            >
              {first.label}
            </a>
          )
        )}
        <div className="ws-foot-cols">
          {(street || place) && (
            <FootCol title="Adresse">
              <address>
                {street}
                {street && place && <br />}
                {place}
              </address>
            </FootCol>
          )}
          {((tel && contact?.phone) || mail) && (
            <FootCol title="Kontakt">
              <ul>
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
            </FootCol>
          )}
          {hours.length > 0 && (
            <FootCol title="Zeiten">
              <ul>
                {hours.map((h, i) => (
                  <li key={`${h.day}-${i}`}>
                    {h.day} <span className="ws-nowrap">{h.hours}</span>
                  </li>
                ))}
              </ul>
            </FootCol>
          )}
          {pages.length > 0 && (
            <FootCol title="Seiten">
              <ul>
                {pages.map(item => (
                  <li key={item.key}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </FootCol>
          )}
        </div>
        <p className="ws-foot-legal">
          <a href={`${basePath}/impressum`}>Impressum</a>
          <a href={`${basePath}/datenschutz`}>Datenschutz</a>
          <span>
            © {now.getFullYear()} {data.businessName}
          </span>
        </p>
        <p
          className="ws-foot-word"
          aria-hidden="true"
          style={{ "--ws-fit": word.widthEm.toFixed(3) } as React.CSSProperties}
        >
          {word.lines.length > 1
            ? word.lines.map(line => <span key={line}>{line}</span>)
            : mark}
        </p>
      </div>
    </footer>
  );
}
