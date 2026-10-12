import type { SystemSection } from "../shared";

/**
 * Feld-Rhythmus nach Systemblatt (Abschnitt „Farbflächen"): Grund und Feld
 * wechseln sich ab, nie zweimal dasselbe Feld hintereinander, das tiefe
 * Feld höchstens dreimal — Laufband, Stimme, Fuß. Der Einstieg steht auf
 * Grund oder einem hellen Feld, nie auf dem tiefen.
 *
 * Reine Funktion: geordnete, sichtbare Abschnitte → Fläche je Abschnitt.
 * Laufband und Fuß sind feste Bänder außerhalb der Liste (immer tief); das
 * Laufband zählt im Wechsel nicht mit (Systemblatt Kante: Einstieg Grund,
 * Laufband, Leistungen auf Rosa).
 *
 *  - Einstieg: `entry` (Grund oder erstes helles Feld)
 *  - Stimme (testimonials, sonst quote): tief — höchstens einmal, nie
 *    direkt vor dem Fuß (zweimal tief hintereinander)
 *  - Kopf einer Unterseite (pageHeader): Grund
 *  - alle anderen: nach einer Fläche Grund, nach Grund das nächste helle
 *    Feld (1, 2, 1, …)
 */
export type Field = "ground" | "f1" | "f2" | "deep";

export type EntryGround = "ground" | "field";

/** Abschnitte, die die eine tiefe Stimme tragen dürfen (Vorrang: Bewertungen). */
const VOICE: readonly SystemSection["type"][] = ["testimonials", "quote"];

/** Abschnitte ohne eigene Fläche (Banner über dem Kopf). */
const FLOATING: ReadonlySet<SystemSection["type"]> = new Set(["notice"]);

export function fieldRhythm(
  types: readonly SystemSection["type"][],
  entry: EntryGround = "ground"
): Field[] {
  const placed = types.filter(t => !FLOATING.has(t));
  const lastPlaced = placed.length - 1;
  // Die Stimme: Bewertungen vor Zitat, nie der letzte Abschnitt (Fuß tief).
  const voiceAt = VOICE.map(v => placed.indexOf(v)).find(
    i => i >= 0 && i !== lastPlaced
  );
  let light = 0;
  const nextLight = (): Field => (light++ % 2 === 0 ? "f1" : "f2");
  let prev: Field | undefined;
  let k = -1;
  return types.map(type => {
    if (FLOATING.has(type)) return "ground";
    k += 1;
    let field: Field;
    if (type === "hero") field = entry === "field" ? nextLight() : "ground";
    else if (type === "pageHeader") field = "ground";
    else if (k === voiceAt && prev !== "deep") field = "deep";
    else field = prev === undefined || prev === "ground" ? nextLight() : "ground";
    prev = field;
    return field;
  });
}
