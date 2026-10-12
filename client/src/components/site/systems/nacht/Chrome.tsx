import React from "react";
import type { NavItem } from "../../engine";
import { SECTION_ANCHORS, orderedSections } from "../../engine";
import { telHref } from "../../artDirection/heroFacts";
import type { SectionType } from "../../../../../../shared/siteContract/types";
import { useSystem } from "../SystemContext";
import {
  contactOf,
  detailsMenuJs,
  mailHref,
  newTabIfMaps,
  systemShows,
} from "../shared";
import { SYS_ACTIONS, SYS_DOCK } from "../shared/dockAutoHide";
import {
  dockPair,
  entryName,
  monogramOf,
  nachtActions,
  nachtShort,
} from "./facts";
import { Icon, wayIcon } from "./icons";

/**
 * Kopf, Fuß und Handy-Leiste von Nacht nach Systemblatt 9–14: Kopf mit
 * Monogramm im Kupferring und Name als Marke, „Menü" mit zwei Strichen
 * (geteiltes <details>-Menü); Desktop Navigation und Hauptweg. Fuß auf
 * dem tiefen Band: Monogramm, Name groß, Kontakt, Adresse, Rechtslinks.
 * Leiste unter 48 rem: Anrufen + Hauptweg.
 */

/** Nacht-Wortwahl der Navigation; Bauplan-Labels gewinnen. */
const NAV_LABELS: Partial<Record<SectionType, string>> = {
  menu: "Karte",
  gallery: "Einblicke",
  testimonials: "Gäste",
  faq: "Gut zu wissen",
  contact: "Anfahrt",
};

export function nachtNavItems(items: NavItem[]): NavItem[] {
  return items.map(item =>
    item.sectionType && !item.fixedLabel && NAV_LABELS[item.sectionType]
      ? { ...item, label: NAV_LABELS[item.sectionType]! }
      : item
  );
}

/** Menü-Script (schließt bei Link-Klick, Escape, Klick daneben). */
export const NACHT_MENU_JS = detailsMenuJs("nc");

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

/**
 * Monogramm im Kupferring (dekorativ) und Marke. Die Marke wird nie
 * abgeschnitten: Passt sie nicht in eine Zeile neben Monogramm und Menü,
 * bleibt nur das Monogramm (CSS: zweite Reihe wird weggeschnitten) — der
 * volle Name steht direkt darunter im h1. Der Link heißt für Vorleser
 * immer wie der ganze Betrieb.
 */
function Brand({ href }: { href: string }) {
  const { data, blueprint } = useSystem();
  const { name, mark } = entryName(data, blueprint);
  return (
    <a className="nc-brand" href={href} aria-label={name}>
      <span className="nc-mono" aria-hidden="true">
        {monogramOf(mark)}
      </span>
      <span className="nc-mark">{mark}</span>
    </a>
  );
}

export function NachtHead({
  navItems,
  anchorPrefix,
  over = false,
}: {
  navItems: NavItem[];
  anchorPrefix: string;
  /** Liegt über dem Einstiegsfoto (Startseite, Fassung „photo"). */
  over?: boolean;
}) {
  const { data, blueprint } = useSystem();
  const { primary } = nachtActions(data, blueprint, anchorPrefix);
  const desk = navItems.length > 0 && navItems.length <= NAV_MAX;
  return (
    <header className={over ? "nc-head nc-head--over" : "nc-head"}>
      <div className="nc-head-bar">
        <Brand href={`${anchorPrefix}#${SECTION_ANCHORS.hero}`} />
        {desk && (
          <nav className="nc-nav" aria-label="Hauptnavigation">
            <NavLinks items={navItems} />
          </nav>
        )}
        {primary && (
          <a
            className="nc-btn nc-btn--p nc-btn--head"
            href={primary.href}
            {...newTabIfMaps(primary.href)}
          >
            {nachtShort(primary.label)}
            <Icon name={wayIcon(primary.href)} />
          </a>
        )}
        {/* Menü ohne JS: <details>/<summary> (SSR-Kundenseiten hydrieren nicht). */}
        {navItems.length > 0 && (
          <details
            className={
              desk
                ? "nc-menu nc-menu--main"
                : "nc-menu nc-menu--main nc-menu--always"
            }
          >
            <summary className="nc-menu-toggle">
              <span className="nc-menu-word">Menü</span>
              <span className="nc-bars" aria-hidden="true" />
            </summary>
            <nav className="nc-menu-panel" aria-label="Menü">
              <NavLinks items={navItems} />
            </nav>
          </details>
        )}
      </div>
      <script dangerouslySetInnerHTML={{ __html: NACHT_MENU_JS }} />
    </header>
  );
}

export function NachtFoot({ basePath }: { basePath: string }) {
  const { data, blueprint, now } = useSystem();
  const contact = contactOf(orderedSections(data).filter(systemShows));
  const tel = telHref(contact?.phone);
  const mail = mailHref(contact?.email);
  const street = contact?.street?.trim();
  const place = [contact?.zip, contact?.city].filter(Boolean).join(" ");
  const { name, mark } = entryName(data, blueprint);
  return (
    <footer className="nc-foot">
      <div className="nc-wrap">
        <span className="nc-mono nc-mono--foot" aria-hidden="true">
          {monogramOf(mark)}
        </span>
        <p className="nc-foot-name">{name}</p>
        <div className="nc-foot-cols">
          {((tel && contact?.phone) || (mail && contact?.email)) && (
            <div className="nc-foot-col">
              <p className="nc-foot-h">Kontakt</p>
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
            <div className="nc-foot-col">
              <p className="nc-foot-h">Adresse</p>
              <address>
                {street}
                {street && place && <br />}
                {place}
              </address>
            </div>
          )}
        </div>
        <p className="nc-foot-legal">
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
 * Handy-Leiste (Systemblatt 9): links „Anrufen", rechts der Hauptweg in
 * Kurzform. Blendet aus, solange die Knöpfe im Einstieg sichtbar sind
 * (`data-sys-actions`, dockAutoHide).
 */
export function NachtDock({ anchorPrefix }: { anchorPrefix: string }) {
  const { data, blueprint } = useSystem();
  const pair = dockPair(nachtActions(data, blueprint, anchorPrefix));
  if (!pair) return null;
  const { left, main } = pair;
  return (
    <nav
      className={left ? "nc-dock" : "nc-dock nc-dock--one"}
      aria-label="Schnellkontakt"
      {...SYS_DOCK}
    >
      {left && (
        <a
          className="nc-btn nc-btn--s"
          href={left.href}
          {...newTabIfMaps(left.href)}
        >
          <Icon name={wayIcon(left.href)} />
          {left.label}
        </a>
      )}
      <a
        className="nc-btn nc-btn--p"
        href={main.href}
        {...newTabIfMaps(main.href)}
      >
        {main.label}
        <Icon name={wayIcon(main.href)} />
      </a>
    </nav>
  );
}
