import type { WebsiteDataV2 } from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import { tradeLabel } from "../../../../../../shared/stylePacks/blueprints";
import { displayName } from "../../../../../../shared/designSystems/displayName";
import { telHref } from "../../artDirection/heroFacts";
import { orderedSections } from "../../engine";
import {
  addressLine,
  contactOf,
  mailHref,
  mapsHref,
  primaryAction,
  systemShows,
} from "../shared";

/**
 * Reine Daten-Regeln für Werkstoff (Kopf, Zettel, Einstieg, Leiste).
 * Nichts wird erfunden: Fehlt eine Angabe, entfällt das Element.
 */

/** Gewerk bzw. Branche („Schreinerei", „Bäckerei"). */
export function branchOf(
  data: WebsiteDataV2,
  blueprint: Blueprint
): string | undefined {
  const label =
    blueprint.id === "trade"
      ? tradeLabel(data.businessCategory, data.businessName)
      : data.businessCategory;
  return label?.trim() || undefined;
}

const lower = (t: string) => t.toLocaleLowerCase("de");

/**
 * Kopf nach Systemblatt: Name in Slab, Gewerk in Mono darunter
 * („Holtkamp / SCHREINEREI"). Beginnt oder endet der Name mit dem Gewerk,
 * steht es nur einmal (unten); sonst bleibt der Name ganz.
 */
export function brandParts(
  name: string,
  branch: string | undefined
): { mark: string; sub?: string } {
  if (!branch) return { mark: name };
  const n = lower(name);
  const b = lower(branch);
  if (n.startsWith(`${b} `))
    return { mark: name.slice(branch.length).trim(), sub: branch };
  if (n.endsWith(` ${b}`))
    return { mark: name.slice(0, -branch.length).trim(), sub: branch };
  return n.includes(b) ? { mark: name } : { mark: name, sub: branch };
}

/** Anzeigename ohne Rechtsform. */
export const nameOf = (data: WebsiteDataV2) => displayName(data.businessName);

/** Dokument nur mit den Abschnitten, die das System auch zeigt. */
export function visibleDoc(doc: WebsiteDataV2): WebsiteDataV2 {
  const shown = new Set(
    orderedSections(doc)
      .filter(systemShows)
      .map(s => s.type)
  );
  return { ...doc, sections: doc.sections.filter(s => shown.has(s.type)) };
}

export type Action = { label: string; href: string };

/**
 * Zwei Wege laut Systemblatt: Anrufen und Route; Läden (Bauplan mit
 * Route-Aktion) zuerst Route. Fehlt einer, rückt die Hauptaktion des
 * Bauplans nach (sonst E-Mail). Nur aus sichtbaren Abschnitten — ein
 * ausgeblendeter Kontakt liefert weder Telefon noch Route.
 */
export function actionPair(
  doc: WebsiteDataV2,
  blueprint: Blueprint,
  anchorPrefix = ""
): Action[] {
  const data = visibleDoc(doc);
  const contact = contactOf(data.sections);
  const tel = telHref(contact?.phone);
  const address = addressLine(contact);
  const call = tel ? { label: "Anrufen", href: tel } : undefined;
  const route = address
    ? { label: "Route", href: mapsHref(address) }
    : undefined;
  const mail = mailHref(contact?.email);
  const ways =
    blueprint.ctaAction === "route" ? [route, call] : [call, route];
  const fallback = [
    primaryAction(data, blueprint, anchorPrefix),
    mail ? { label: "E-Mail", href: mail } : undefined,
  ];
  const out: Action[] = [];
  for (const a of [...ways, ...fallback]) {
    if (a && !out.some(o => o.href === a.href)) out.push(a);
    if (out.length === 2) break;
  }
  return out;
}

/**
 * Knöpfe im Einstieg (Desktop, Systemblatt 14): erster Weg der Leiste in
 * Signal, daneben die Hauptaktion des Bauplans („Aufmaß anfragen"), wenn
 * sie etwas anderes tut — sonst der zweite Weg.
 */
export function entryActions(
  doc: WebsiteDataV2,
  blueprint: Blueprint,
  anchorPrefix = ""
): Action[] {
  const pair = actionPair(doc, blueprint, anchorPrefix);
  const primary = primaryAction(visibleDoc(doc), blueprint, anchorPrefix);
  if (!pair.length) return [];
  const second =
    primary.href !== pair[0].href ? primary : (pair[1] ?? undefined);
  return second ? [pair[0], second] : [pair[0]];
}
