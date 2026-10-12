import React from "react";
import type { NavItem } from "../../engine";
import { SECTION_ANCHORS, orderedSections } from "../../engine";
import { telHref } from "../../artDirection/heroFacts";
import { shortHours } from "../../artDirection/heroFacts";
import { groupOpeningHours } from "../../../../../../shared/onboardingV2/openingHours";
import type { SectionType } from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import { useSystem } from "../SystemContext";
import {
  contactOf,
  detailsMenuJs,
  mailHref,
  nameOf,
  systemShows,
} from "../shared";
import { SYS_ACTIONS, SYS_DOCK } from "../shared/dockAutoHide";
import { hoursLabel, klarActions, monogram, shortLabel } from "./facts";
import { realHours } from "./hours";
import { Icon } from "./icons";

/**
 * Kopf, Fuß und Handy-Leiste von Klar nach Systemblatt 8–13: Kopf mit
 * Monogramm-Kachel und Name, „Menü"-Pille (geteiltes <details>-Menü);
 * Desktop Navigation, Telefon-Pille und Termin-Knopf. Fuß auf dem tiefen
 * Feld mit Marke, Adresse, Kontakt, Zeiten und Rechtslinks. Leiste unter
 * 48 rem mit Anrufen + Termin, nur aus sichtbaren Abschnitten.
 */

/** Klar-Wortwahl der Navigation; Bauplan-Labels gewinnen. */
function navLabels(blueprint: Blueprint): Partial<Record<SectionType, string>> {
  return {
    process: blueprint.id === "advice" ? "Erstgespräch" : "Erster Termin",
    gallery: "Einblicke",
    testimonials: "Stimmen",
    faq: "Fragen",
    contact: "Anfahrt",
  };
}

export function klarNavItems(items: NavItem[], blueprint: Blueprint): NavItem[] {
  const labels = navLabels(blueprint);
  return items.map(item =>
    item.sectionType && !item.fixedLabel && labels[item.sectionType]
      ? { ...item, label: labels[item.sectionType]! }
      : item
  );
}

/** Menü-Script (schließt bei Link-Klick, Escape, Klick daneben). */
export const KLAR_MENU_JS = detailsMenuJs("kl");

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
 * Lange Namen („Gemeinschaftspraxis für Allgemeinmedizin Dr. med. …")
 * stapelten sich am Handy neben der Menü-Pille über viele Zeilen: Ab
 * dieser Länge steht der Name im Kopf kleiner und unter 30 rem nur für
 * Vorleser — sichtbar steht er gleich darunter in der Pille (h1).
 */
export const BRAND_LONG = 26;
/** Mehr Einträge passen nicht in eine Desktop-Zeile: Menü bleibt. */
export const NAV_MAX = 5;

/** Marke: Monogramm-Kachel (dekorativ) und Name. */
function Brand({ href }: { href?: string }) {
  const { data } = useSystem();
  const name = nameOf(data);
  const long = name.length > BRAND_LONG;
  const inner = (
    <>
      <span className="kl-logo" aria-hidden="true">
        {monogram(name)}
      </span>
      <span className={long ? "kl-mark kl-mark--long" : "kl-mark"}>{name}</span>
    </>
  );
  return href ? (
    <a className="kl-brand" href={href}>
      {inner}
    </a>
  ) : (
    <p className="kl-brand">{inner}</p>
  );
}

export function KlarHead({
  navItems,
  anchorPrefix,
}: {
  navItems: NavItem[];
  anchorPrefix: string;
}) {
  const { data, blueprint } = useSystem();
  const { appointment, phone } = klarActions(data, blueprint, anchorPrefix);
  return (
    <header
      className={
        navItems.length > NAV_MAX ? "kl-head kl-head--menu" : "kl-head"
      }
    >
      <div className="kl-head-bar">
        <Brand href={`${anchorPrefix}#${SECTION_ANCHORS.hero}`} />
        <nav className="kl-nav" aria-label="Hauptnavigation">
          <NavLinks items={navItems} />
        </nav>
        {(phone || appointment) && (
          <div className="kl-head-actions">
            {phone && (
              <a className="kl-pillbtn" href={phone.href}>
                <Icon name="phone" />
                {phone.label}
              </a>
            )}
            {appointment && (
              <a className="kl-btn kl-btn--p kl-btn--head" href={appointment.href}>
                {shortLabel(appointment.label)}
                <span className="kl-btn-ic">
                  <Icon name="calendar" />
                </span>
              </a>
            )}
          </div>
        )}
        {/* Menü ohne JS: <details>/<summary> (SSR-Kundenseiten hydrieren nicht). */}
        {navItems.length > 0 && (
          <details className="kl-menu">
            <summary className="kl-menu-toggle kl-pillbtn">
              <Icon name="menu" />
              Menü
            </summary>
            <nav className="kl-menu-panel" aria-label="Menü">
              <NavLinks items={navItems} />
            </nav>
          </details>
        )}
      </div>
      <script dangerouslySetInnerHTML={{ __html: KLAR_MENU_JS }} />
    </header>
  );
}

/** Zeiten im Fuß: zusammengefasst und kurz („Mo–Fr 8–13 Uhr"). */
function footHours(hours: ReturnType<typeof realHours>): string[] {
  if (!hours) return [];
  return groupOpeningHours(hours).map(
    h =>
      `${h.day.trim()} ${/geschlossen|closed|ruhetag/i.test(h.hours) ? "geschlossen" : shortHours(h.hours)}`
  );
}

export function KlarFoot({ basePath }: { basePath: string }) {
  const { data, blueprint, now } = useSystem();
  const visible = orderedSections(data).filter(systemShows);
  const contact = contactOf(visible);
  const tel = telHref(contact?.phone);
  const mail = mailHref(contact?.email);
  const street = contact?.street?.trim();
  const place = [contact?.zip, contact?.city].filter(Boolean).join(" ");
  const hours = footHours(realHours(contact?.openingHours));
  return (
    <footer className="kl-foot">
      <div className="kl-wrap">
        <div className="kl-foot-cols">
          <div className="kl-foot-col kl-foot-col--brand">
            <Brand />
          </div>
          {(street || place) && (
            <div className="kl-foot-col">
              <p className="kl-foot-h">Adresse</p>
              <address>
                {street}
                {street && place && <br />}
                {place}
              </address>
            </div>
          )}
          {((tel && contact?.phone) || (mail && contact?.email)) && (
            <div className="kl-foot-col">
              <p className="kl-foot-h">Kontakt</p>
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
          {hours.length > 0 && (
            <div className="kl-foot-col">
              <p className="kl-foot-h">{hoursLabel(blueprint)}</p>
              <ul>
                {hours.map(line => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="kl-foot-legal">
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

/**
 * Handy-Leiste (Systemblatt: Anrufen + Termin). Blendet aus, solange die
 * Knöpfe im Einstieg sichtbar sind (`data-sys-actions`, dockAutoHide).
 */
export function KlarDock({ anchorPrefix }: { anchorPrefix: string }) {
  const { data, blueprint } = useSystem();
  const { appointment, phone, primary } = klarActions(
    data,
    blueprint,
    anchorPrefix
  );
  const main = appointment ?? (phone ? undefined : primary);
  if (!phone && !main) return null;
  return (
    <nav
      className={phone && main ? "kl-dock" : "kl-dock kl-dock--one"}
      aria-label="Schnellkontakt"
      {...SYS_DOCK}
    >
      {phone && (
        <a className="kl-btn kl-btn--s" href={phone.href}>
          <Icon name="phone" />
          Anrufen
        </a>
      )}
      {main && (
        <a className="kl-btn kl-btn--p" href={main.href}>
          <Icon name="calendar" />
          {shortLabel(main.label)}
        </a>
      )}
    </nav>
  );
}
