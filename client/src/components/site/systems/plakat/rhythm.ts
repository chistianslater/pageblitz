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
 *    direkt vor dem Fuß und nie direkt nach dem Laufband (zweimal tief
 *    hintereinander); dann übernimmt die nächste Stimme oder keine
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
  entry: EntryGround = "ground",
  /** Laufband (tief) direkt nach dem Einstieg — die Stimme darf dort nicht tief folgen. */
  tickerAfterEntry = false
): Field[] {
  const placed = types.filter(t => !FLOATING.has(t));
  const lastPlaced = placed.length - 1;
  const heroAt = placed.indexOf("hero");
  // Plätze, an denen die tiefe Stimme stehen darf: nicht als letzter
  // Abschnitt (Fuß tief) und nicht direkt nach dem Laufband (tief).
  const eligible = (i: number) =>
    i >= 0 && i !== lastPlaced && !(tickerAfterEntry && heroAt >= 0 && i === heroAt + 1);
  // Bewertungen vor Zitat; ist der erste Platz verboten, rückt die nächste Stimme nach.
  const voiceAt = VOICE.map(v => placed.indexOf(v)).find(eligible);
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
