import React from "react";
import { useSystem } from "../SystemContext";
import { actionPair } from "./facts";

/**
 * Handy-Leiste (Systemblatt: „Immer zwei Wege: Anrufen und Route. Bei
 * Läden zuerst Route."): Signal-Knopf und Kontur-Knopf, nur unter 48 rem,
 * steht von Anfang an. Die Seite bekommt unten genau so viel Luft, dass
 * nichts verdeckt wird (CSS). Nur Wege aus sichtbaren Abschnitten.
 */
export function WerkstoffDock({ anchorPrefix }: { anchorPrefix: string }) {
  const { data, blueprint } = useSystem();
  const actions = actionPair(data, blueprint, anchorPrefix);
  if (!actions.length) return null;
  return (
    <nav
      className={actions.length === 1 ? "ws-dock ws-dock--one" : "ws-dock"}
      aria-label="Schnellkontakt"
    >
      {actions.map((a, i) => (
        <a key={a.href} className={i === 0 ? "ws-btn" : "ws-btn2"} href={a.href}>
          {a.label}
        </a>
      ))}
    </nav>
  );
}
