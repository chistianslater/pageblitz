import type { DesignSystemId } from "../../../shared/designSystems/types";
import { mountSiteEntrance } from "../components/site/artDirection/siteEntrance";
import { mountJournalMotion } from "../components/site/systems/journal/motion";
import { mountRasterMotion } from "../components/site/systems/raster/motion";
import { mountWerkstoffMotion } from "../components/site/systems/werkstoff/motion";
import { mountPlakatMotion } from "../components/site/systems/plakat/motion";
import { mountKlarMotion } from "../components/site/systems/klar/motion";
import { mountDockAutoHide } from "../components/site/systems/shared/dockAutoHide";

type Mount = (root: HTMLElement) => () => void;

/** Bewegung je Designsystem (Quelle für den Abgleich mit SYSTEMS_WITH_MOTION). */
export const ISLAND_MOTION: Partial<Record<DesignSystemId, Mount>> = {
  journal: mountJournalMotion,
  raster: mountRasterMotion,
  werkstoff: mountWerkstoffMotion,
  plakat: mountPlakatMotion,
  klar: mountKlarMotion,
};

/**
 * Wurzel eines Designsystems. Alte Rev-2-Packs tragen teils dieselbe Klasse
 * (`.pb-plakat`, `.pb-raster`) — erst `data-pb-system` macht es eindeutig.
 */
export function systemRootSelector(id: DesignSystemId): string {
  return `.pb-${id}[data-pb-system="${id}"]`;
}

/** Montiert alle Bewegungen der Seite; liefert die Aufräumfunktionen. */
export function mountSiteMotion(doc: ParentNode): Array<() => void> {
  const all = (selector: string, mount: Mount) =>
    Array.from(doc.querySelectorAll<HTMLElement>(selector)).map(mount);
  return [
    ...all('.pb-site[data-pb-revision="2"]', mountSiteEntrance),
    ...Object.entries(ISLAND_MOTION).flatMap(([id, mount]) =>
      all(systemRootSelector(id as DesignSystemId), mount!)
    ),
    // Handy-Leiste aller Designsysteme: aus, solange dieselben Knöpfe sichtbar sind.
    ...all(".pb-site[data-pb-system]", mountDockAutoHide),
  ];
}

/**
 * Aufräumen nur beim echten Verlassen. Wandert die Seite in den
 * Back/Forward-Cache (`persisted`), bleibt alles montiert: nach „Zurück"
 * laufen Beobachter und Knöpfe weiter, statt Abschnitte unsichtbar und den
 * Laufband-Knopf tot zu hinterlassen.
 */
export function cleanupOnPageExit(
  win: Pick<Window, "addEventListener" | "removeEventListener">,
  cleanups: ReadonlyArray<() => void>
): void {
  const onHide = (event: PageTransitionEvent) => {
    if (event.persisted) return;
    win.removeEventListener("pagehide", onHide);
    cleanups.forEach(cleanup => cleanup());
  };
  win.addEventListener("pagehide", onHide);
}
