import type { WebsiteDataV2 } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { visibleDoc } from "./brand";
import { systemShows } from "./sections";

/**
 * Ziel eines Links aus den Daten (Aufruf, Abschnitts-Link): absolute
 * http(s)-, tel:- und mailto:-Ziele bleiben; ein Anker nur, wenn sein
 * Abschnitt auf der Startseite sichtbar ist — dann mit Präfix (Unter- und
 * Rechtsseiten zeigen zur Startseite). Alles andere → undefined (der
 * Aufrufer fällt auf den Hauptweg zurück oder lässt den Link weg).
 * Aus Klar (K4–K6) herausgelöst, geteilt mit Nacht; Verhalten unverändert.
 */
export function systemHref(
  href: string | undefined,
  doc: WebsiteDataV2,
  anchorPrefix = ""
): string | undefined {
  const h = href?.trim();
  if (!h) return undefined;
  if (/^(https?:\/\/|tel:|mailto:)/i.test(h)) return h;
  if (!h.startsWith("#") || h.length < 2) return undefined;
  const id = h.slice(1);
  const shown = visibleDoc(doc)
    .sections.filter(systemShows)
    .some(s => SECTION_ANCHORS[s.type] === id);
  return shown ? `${anchorPrefix}${h}` : undefined;
}
