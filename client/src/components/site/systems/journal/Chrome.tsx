import React from "react";
import type { NavItem } from "../../engine";
import { SECTION_ANCHORS } from "../../engine";
import { telHref } from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import type {
  SectionOf,
  SectionType,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";

/**
 * Kopf und Fuß von Journal nach Systemblatt (Anker Aman Venice):
 * Handy „Menü · MARKE · Anrufen", Desktop zusätzlich Telefon + Knopf und
 * eine zentrierte Navigationszeile; Fuß als helles Band mit Marke in
 * gesperrten Serifen-Versalien, Adresse, Telefon, Textlinks, Rechtszeile.
 */

function contactOf(
  sections: readonly { type: string }[]
): SectionOf<"contact"> | undefined {
  return sections.find((s): s is SectionOf<"contact"> => s.type === "contact");
}

/** „Hammer Straße 41, 48153 Münster" — leer, wenn nichts bekannt ist. */
export function addressLine(c: SectionOf<"contact"> | undefined): string {
  return [c?.street, [c?.zip, c?.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

export const mapsHref = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

/** Hauptaktion laut Bauplan: Anruf, Route oder Sprung zum Kontakt. */
export function primaryAction(
  data: WebsiteDataV2,
  blueprint: Blueprint,
  anchorPrefix = ""
): { label: string; href: string } {
  const contact = contactOf(data.sections);
  const hero = data.sections.find(
    (s): s is SectionOf<"hero"> => s.type === "hero"
  );
  const label = hero?.ctaText ?? blueprint.ctaText ?? "Kontakt";
  const tel = telHref(contact?.phone);
  if (blueprint.ctaAction === "tel" && tel) return { label, href: tel };
  const address = addressLine(contact);
  if (blueprint.ctaAction === "route" && address)
    return { label, href: mapsHref(address) };
  const href = hero?.ctaHref ?? `#${SECTION_ANCHORS.contact}`;
  return { label, href: href.startsWith("#") ? anchorPrefix + href : href };
}

/** Journal-Wortwahl der Navigation (Systemblatt); Bauplan-Labels gewinnen. */
const NAV_LABELS: Partial<Record<SectionType, string>> = {
  gallery: "Einblicke",
  testimonials: "Stimmen",
  process: "Ablauf",
  faq: "Gut zu wissen",
  contact: "Besuch",
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
  return (
    <header className="jr-head">
      <div className="jr-head-bar">
        {/* Menü ohne JS: <details>/<summary> (SSR-Kundenseiten hydrieren nicht). */}
        <details className="jr-menu">
          <summary className="jr-menu-toggle">
            <span className="jr-menu-icon" aria-hidden="true" />
            Menü
          </summary>
          <nav className="jr-menu-panel" aria-label="Menü">
            <NavLinks items={navItems} />
          </nav>
        </details>
        <a className="jr-brand" href={home}>
          {data.businessName}
        </a>
        <div className="jr-head-actions">
          {tel ? (
            <a className="jr-link jr-head-call" href={tel}>
              Anrufen
            </a>
          ) : (
            <a className="jr-link jr-head-call" href={action.href}>
              {action.label}
            </a>
          )}
          {tel && contact?.phone && (
            <a className="jr-link jr-head-phone" href={tel}>
              {contact.phone}
            </a>
          )}
          {/* Klassenname aus dem Plan; Gestalt laut Systemblatt eckig. */}
          <a className="jr-pill" href={action.href}>
            {action.label}
          </a>
        </div>
      </div>
      <nav className="jr-nav" aria-label="Hauptnavigation">
        <a className="jr-nav-home" href={home}>
          {data.businessName}
        </a>
        <NavLinks items={navItems} />
      </nav>
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
  const reach = [
    tel && contact?.phone ? (
      <a key="tel" href={tel}>
        {contact.phone}
      </a>
    ) : null,
    contact?.email ? (
      <a key="mail" href={`mailto:${contact.email}`}>
        {contact.email}
      </a>
    ) : null,
  ].filter(Boolean);
  return (
    <footer className="jr-foot">
      <div className="jr-wrap">
        <p className="jr-mark">{data.businessName}</p>
        {(address || reach.length > 0) && (
          <address className="jr-foot-contact">
            {address}
            {address && reach.length > 0 && <br />}
            {reach.flatMap((node, i) => (i === 0 ? [node] : [" · ", node]))}
          </address>
        )}
        <div className="jr-links">
          {address && (
            <a className="jr-link" href={mapsHref(address)}>
              Route planen
            </a>
          )}
          {!action.href.startsWith("tel:") && (
            <a className="jr-link" href={action.href}>
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
