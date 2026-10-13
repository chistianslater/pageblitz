import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/blueprints/blueprints";
import { telHref } from "./heroFacts";
import { stripMarks } from "../../richText";
import { SECTION_ANCHORS } from "../../engine";
import {
  addressLine,
  contactOf,
  mailHref,
  mapsHref,
  telLabel,
} from "./contact";
import { visibleDoc } from "./brand";

/**
 * Wege eines Betriebs (Hauptknopf, Zweitknopf, Telefon) — aus Klar
 * (K2+K3) herausgelöst, geteilt mit Nacht (Reservieren, Termin,
 * Anfragen). Verhalten unverändert.
 */

export type Action = { label: string; href: string };

const plain = (t: string | undefined) => (t ? stripMarks(t).trim() : "");

/**
 * Ziel des Hauptknopfs, in dieser Reihenfolge:
 *  1. eigener Buchungslink im Einstieg (echtes http(s), kein Anker)
 *  2. `#kontakt` — nur mit gebuchtem Kontaktformular und sichtbarem
 *     Kontakt-Abschnitt
 *  3. Bauplan-Aktion: `tel` → Anruf, `route` → Karte
 *  4. Anruf
 *  (ohne Telefon zuletzt `#kontakt`, wenn der Kontakt sichtbar ist)
 * Text: Einstieg bzw. Bauplan, sonst „Termin vereinbaren"; ruft der Knopf
 * an, „Anrufen" — außer der Text nennt Anruf oder Telefon (telLabel).
 * Zweiter Knopf: die Telefonnummer — ruft der Hauptknopf schon an, statt
 * der Nummer die Route (mit Adresse) oder E-Mail. Nur sichtbare
 * Abschnitte zählen.
 */
export function systemActions(
  doc: WebsiteDataV2,
  blueprint: Blueprint,
  anchorPrefix = ""
): { primary?: Action; second?: Action; phone?: Action } {
  const data = visibleDoc(doc);
  const contact = contactOf(data.sections);
  const hero = data.sections.find(
    (s): s is SectionOf<"hero"> => s.type === "hero"
  );
  const own = plain(hero?.ctaText) || blueprint.ctaText;
  const tel = telHref(contact?.phone);
  const address = addressLine(contact);
  const mail = mailHref(contact?.email);
  const kontakt = `${anchorPrefix}#${SECTION_ANCHORS.contact}`;
  const link = hero?.ctaHref;
  const target =
    link && /^https?:\/\//i.test(link)
      ? link
      : doc.features?.contactForm === true && contact
        ? kontakt
        : blueprint.ctaAction === "route" && address
          ? mapsHref(address)
          : (tel ?? (contact ? kontakt : undefined));
  const phone =
    tel && contact?.phone ? { label: contact.phone.trim(), href: tel } : undefined;
  if (!target) return { phone };
  const calls = target === tel;
  const primary = {
    label: telLabel(own || "Termin vereinbaren", target),
    href: target,
  };
  const second = !calls
    ? phone
    : address
      ? { label: "Route", href: mapsHref(address) }
      : mail
        ? { label: "E-Mail", href: mail }
        : undefined;
  return { primary, second, phone };
}
