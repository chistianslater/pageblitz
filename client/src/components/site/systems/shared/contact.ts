import { SECTION_ANCHORS } from "../../engine";
import { telHref } from "../../artDirection/heroFacts";
import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";

/** Kontakt-Helfer, die alle Designsysteme (rev 3) teilen. */

export function contactOf(
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

const MAPS_PREFIX = "https://www.google.com/maps/";

/** Link auf Google Maps (Route/Anfahrt)? */
export const isMapsHref = (href: string) => href.startsWith(MAPS_PREFIX);

const NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Maps-Links öffnen in allen Systemen einheitlich einen neuen Tab (Nacht N0);
 * alle anderen Ziele bekommen keine Attribute (leeres Objekt → Ausgabe
 * unverändert).
 */
export function newTabIfMaps(
  href: string | undefined
): typeof NEW_TAB | Record<string, never> {
  return href && isMapsHref(href) ? NEW_TAB : {};
}

/**
 * `mailto:`-Link nur für eine plausible, einzelne Adresse. Die Adresse kommt
 * aus Kundendaten: Zeichen, die einen mailto-Link umbauen könnten (?, &, #,
 * Komma, Leerraum, spitze Klammern, Anführungszeichen), schließen sie aus.
 * Der Betreff wird kodiert.
 */
const MAIL = /^[^\s@?&#,;:<>"'()\\]+@[^\s@?&#,;:<>"'()\\]+\.[a-z]{2,}$/i;
export function mailHref(
  email: string | undefined,
  subject?: string
): string | undefined {
  const value = email?.trim();
  if (!value || !MAIL.test(value)) return undefined;
  return subject
    ? `mailto:${value}?subject=${encodeURIComponent(subject)}`
    : `mailto:${value}`;
}

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
