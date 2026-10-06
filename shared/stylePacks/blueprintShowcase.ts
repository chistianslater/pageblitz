/**
 * Bauplan-Übersicht (2026-10-06, Betreiber: „wo kann ich die Templates in der
 * Übersicht sehen?"). Je Branche ein Beispielbetrieb aus den Fixtures, so
 * aufbereitet wie eine frisch erzeugte Seite: Einstieg Bühne oder
 * Farbfläche, Bauplan angewendet. Reine Beispieldaten — keine echte Firma.
 */
import { DEFAULT_DESIGN_PROFILE } from "../siteContract/designProfile";
import { getFixture } from "../siteContract/fixtures";
import type { SectionOf, WebsiteDataV2 } from "../siteContract/types";
import { withArtDirection, withEntryComposition } from "./artDirection";
import { pickArtTheme } from "./artThemes";
import { blueprintFor, withBlueprint } from "./blueprints";
import {
  SHOWCASES,
  type Showcase,
  type ShowcaseEntry,
} from "./blueprintShowcaseList";

export { SHOWCASES, type Showcase, type ShowcaseEntry };

/** Beispiel-Ablauf für Handwerk — die Fixtures haben keinen. */
const SAMPLE_PROCESS: SectionOf<"process"> = {
  type: "process",
  headline: "So läuft's ab",
  steps: [
    {
      title: "Anfrage",
      text: "Sie schildern Ihr Vorhaben am Telefon oder per E-Mail.",
    },
    {
      title: "Termin vor Ort",
      text: "Wir schauen uns alles an und nehmen die Maße.",
    },
    {
      title: "Angebot",
      text: "Sie erhalten ein nachvollziehbares, schriftliches Angebot.",
    },
    {
      title: "Ausführung",
      text: "Wir setzen das Vorhaben sauber und termingerecht um.",
    },
  ],
};

export function findShowcase(id: string): Showcase | undefined {
  return SHOWCASES.find(s => s.id === id);
}

/** Beispielseite wie eine frisch erzeugte: Einstieg + Bauplan. */
export function showcaseDoc(
  showcase: Showcase,
  entry: ShowcaseEntry
): WebsiteDataV2 {
  const fixture = getFixture(showcase.fixture, "full");
  // Unterseiten sind ein Extra — die Übersicht zeigt die Startseite.
  const { pages: _pages, ...withoutPages } = fixture;
  const named: WebsiteDataV2 = {
    ...withoutPages,
    ...(showcase.businessName ? { businessName: showcase.businessName } : {}),
    ...(showcase.businessCategory
      ? { businessCategory: showcase.businessCategory }
      : {}),
    ...(showcase.amenities ? { amenities: showcase.amenities } : {}),
  };
  const blueprint = blueprintFor(named.businessCategory, named.businessName);
  const withExtras: WebsiteDataV2 =
    blueprint.extraSections?.includes("process") &&
    !named.sections.some(s => s.type === "process")
      ? { ...named, sections: [...named.sections, SAMPLE_PROCESS] }
      : named;
  // Schrift und Farbwelt wie bei einer neuen Seite (runJob), nicht die
  // handgesetzten Werte der Fixture.
  const directed = withArtDirection({
    ...withExtras,
    ...pickArtTheme(
      withExtras.stylePackId,
      withExtras.businessName,
      withExtras.businessCategory
    ),
  });
  const designProfile = withEntryComposition(
    {
      ...(directed.designProfile ?? DEFAULT_DESIGN_PROFILE),
      composition: "portrait",
    },
    { heroLandscape: entry === "stage", extraPhotos: 3 }
  );
  return withBlueprint({ ...directed, designProfile }, blueprint);
}
