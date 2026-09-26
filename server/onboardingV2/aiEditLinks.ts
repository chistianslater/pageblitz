import type { SectionOf, WebsiteDataV2 } from "../../shared/siteContract/types";
import {
  linksInText,
  normalizeButtonHref,
} from "../../shared/onboardingV2/buttonLink";
import { SECTION_ANCHORS } from "../../client/src/components/site/engine";

/**
 * Link-Ziele, die der KI-Chat setzen darf (2026-09-26). Bis dahin galt
 * jedes ctaHref als Fakt und wurde zurückgesetzt — „Button zur
 * Bestellplattform" war unmöglich. Jetzt darf die KI Links setzen, aber nur
 * auf Ziele, die belegt sind: vom Kunden im Chat geschrieben, als Website
 * im Google-Profil hinterlegt, schon im Dokument vorhanden, Abschnitte der
 * Seite oder die eigene Telefonnummer. Alles andere setzt aiEditFacts zurück.
 */
export function allowedLinkTargets(args: {
  doc: WebsiteDataV2;
  /** Kundennachricht plus bisheriger Dialog. */
  texts: string[];
  businessWebsite?: string | null;
}): Set<string> {
  const allowed = new Set<string>();
  const add = (href: string | null | undefined) => {
    if (href) allowed.add(href);
  };
  for (const text of args.texts) linksInText(text).forEach(add);
  if (args.businessWebsite) {
    add(args.businessWebsite.trim());
    add(normalizeButtonHref(args.businessWebsite));
  }
  for (const section of args.doc.sections) {
    add(`#${SECTION_ANCHORS[section.type]}`);
    if ("ctaHref" in section) add(section.ctaHref);
    if ("link" in section) add(section.link?.href);
    if (section.type === "contact") {
      const tel = normalizeButtonHref(
        (section as SectionOf<"contact">).phone ?? ""
      );
      if (tel?.startsWith("tel:")) add(tel);
    }
  }
  return allowed;
}
