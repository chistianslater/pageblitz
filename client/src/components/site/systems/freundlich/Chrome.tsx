import React from "react";
import type { NavItem } from "../../engine";
import { SECTION_ANCHORS, orderedSections } from "../../engine";
import { telHref } from "../shared/heroFacts";
import type { SectionType } from "../../../../../../shared/siteContract/types";
import { useSystem } from "../SystemContext";
import {
  contactOf,
  detailsMenuJs,
  mailHref,
  nameOf,
  newTabIfMaps,
  systemShows,
} from "../shared";
import { SYS_ACTIONS, SYS_DOCK } from "../shared/dockAutoHide";
import { dockPair, freundlichActions, monogramOf } from "./facts";
import { Cloud } from "./Entry";
import { Icon, wayIcon } from "./icons";

/**
 * Kopf, Fuß und Handy-Leiste von Freundlich nach Systemblatt 10/16/18:
 * Kopf mit Zeichen (Buchstabe auf Tief, Ecke 12) und Name, „Menü" als
 * Pille mit Tintenrand (geteiltes <details>-Menü); Desktop Navigation,
 * Telefon (Zweitknopf) und Hauptweg. Fuß auf Tief mit Wolkenkante.
 * Leiste unter 48 rem: Anrufen + Hauptweg.
 */

/** Freundliche Wortwahl der Navigation; Bauplan-Labels gewinnen. */
const NAV_LABELS: Partial<Record<SectionType, string>> = {
  services: "Angebot",
  process: "Ablauf",
  gallery: "Einblicke",
  testimonials: "Stimmen",
  faq: "Fragen",
  contact: "Besuch uns",
};

export function freundlichNavItems(items: NavItem[]): NavItem[] {
  return items.map(item =>
    item.sectionType && !item.fixedLabel && NAV_LABELS[item.sectionType]
      ? { ...item, label: NAV_LABELS[item.sectionType]! }
      : item
  );
}

/** Menü-Script (schließt bei Link-Klick, Escape, Klick daneben). */
export const FREUNDLICH_MENU_JS = detailsMenuJs("fr");

/** Desktop: bis zu fünf Einträge direkt, mehr → „Menü" bleibt. */
export const NAV_MAX = 5;

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

/** Zeichen (dekorativ) und Name; der Link heißt wie der ganze Betrieb. */
function Brand({ href }: { href: string }) {
  const { data } = useSystem();
  const name = nameOf(data);
  return (
    <a className="fr-brand" href={href} aria-label={name}>
      <span className="fr-logo" aria-hidden="true">
        {monogramOf(name)}
      </span>
      <span className="fr-mark" aria-hidden="true">
        {name}
      </span>
    </a>
  );
}

export function FreundlichHead({
  navItems,
  anchorPrefix,
}: {
  navItems: NavItem[];
  anchorPrefix: string;
}) {
  const { data, blueprint } = useSystem();
  const { primary, phone } = freundlichActions(data, blueprint, anchorPrefix);
  const desk = navItems.length > 0 && navItems.length <= NAV_MAX;
  const calls = primary?.href.startsWith("tel:");
  return (
    <header className="fr-head">
      <div className="fr-head-bar">
        <Brand href={`${anchorPrefix}#${SECTION_ANCHORS.hero}`} />
        {desk && (
          <nav className="fr-nav" aria-label="Hauptnavigation">
            <NavLinks items={navItems} />
          </nav>
        )}
        {phone && !calls && (
          <a className="fr-btn fr-btn--s fr-btn--head" href={phone.href}>
            <Icon name="phone" />
            {phone.label}
          </a>
        )}
        {primary && (
          <a
            className="fr-btn fr-btn--p fr-btn--head"
            href={primary.href}
            {...newTabIfMaps(primary.href)}
          >
            <Icon name={wayIcon(primary.href)} />
            {primary.label}
          </a>
        )}
        {/* Menü ohne JS: <details>/<summary> (SSR-Kundenseiten hydrieren nicht). */}
        {navItems.length > 0 && (
          <details
            className={
              desk
                ? "fr-menu fr-menu--main"
                : "fr-menu fr-menu--main fr-menu--always"
            }
          >
            <summary className="fr-menu-toggle">
              <Icon name="list" />
              <span className="fr-menu-word">Menü</span>
            </summary>
            <nav className="fr-menu-panel" aria-label="Menü">
              <NavLinks items={navItems} />
            </nav>
          </details>
        )}
      </div>
      <script dangerouslySetInnerHTML={{ __html: FREUNDLICH_MENU_JS }} />
    </header>
  );
}

export function FreundlichFoot({ basePath }: { basePath: string }) {
  const { data, now } = useSystem();
  const contact = contactOf(orderedSections(data).filter(systemShows));
  const tel = telHref(contact?.phone);
  const mail = mailHref(contact?.email);
  const street = contact?.street?.trim();
  const place = [contact?.zip, contact?.city].filter(Boolean).join(" ");
  const name = nameOf(data);
  return (
    <footer className="fr-foot">
      <Cloud tone="deep" />
      <div className="fr-wrap">
        <span className="fr-logo fr-logo--foot" aria-hidden="true">
          {monogramOf(name)}
        </span>
        <p className="fr-foot-name">{name}</p>
        <div className="fr-foot-cols">
          {((tel && contact?.phone) || (mail && contact?.email)) && (
            <div className="fr-foot-col">
              <p className="fr-foot-h">Kontakt</p>
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
          {(street || place) && (
            <div className="fr-foot-col">
              <p className="fr-foot-h">Adresse</p>
              <address>
                {street}
                {street && place && <br />}
                {place}
              </address>
            </div>
          )}
        </div>
        <p className="fr-foot-legal">
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
 * Handy-Leiste (Systemblatt 10): weiße Insel, links „Anrufen", rechts der
 * Hauptweg in Kurzform. Blendet aus, solange die Knöpfe im Einstieg
 * sichtbar sind (`data-sys-actions`, dockAutoHide).
 */
export function FreundlichDock({ anchorPrefix }: { anchorPrefix: string }) {
  const { data, blueprint } = useSystem();
  const pair = dockPair(freundlichActions(data, blueprint, anchorPrefix));
  if (!pair) return null;
  const { left, main } = pair;
  return (
    <nav
      className={left ? "fr-dock" : "fr-dock fr-dock--one"}
      aria-label="Schnellkontakt"
      {...SYS_DOCK}
    >
      {left && (
        <a
          className="fr-btn fr-btn--s"
          href={left.href}
          {...newTabIfMaps(left.href)}
        >
          <Icon name={wayIcon(left.href)} />
          {left.label}
        </a>
      )}
      <a
        className="fr-btn fr-btn--p"
        href={main.href}
        {...newTabIfMaps(main.href)}
      >
        <Icon name={wayIcon(main.href)} />
        {main.label}
      </a>
    </nav>
  );
}
