import React from "react";
import { useSystem } from "../SystemContext";
import { dockPlan } from "./facts";
import { SYS_DOCK } from "../shared/dockAutoHide";

/**
 * Handy-Leiste (Systemblatt: 64 px, unter 48 rem, immer sichtbar). Zwei
 * Felder — Signal-Fläche mit der Hauptaktion und ein zweites Feld — oder
 * beim Sofort-Dienst/24-h-Betrieb eine Anrufleiste mit Nummer. Die Seite
 * bekommt unten genau so viel Luft, dass nichts verdeckt wird (CSS).
 */
export function RasterDock({ anchorPrefix }: { anchorPrefix: string }) {
  const { data, blueprint } = useSystem();
  const plan = dockPlan(data, blueprint, anchorPrefix);
  if (!plan) return null;
  if (plan.kind === "call") {
    return (
      <nav
        className="rs-dock rs-dock--call"
        aria-label="Schnellkontakt"
        {...SYS_DOCK}
      >
        <a className="rs-dock-field rs-dock-field--signal" href={plan.href}>
          <span className="rs-dock-label">{plan.label}</span>
          <span className="rs-dock-number">{plan.number}</span>
        </a>
      </nav>
    );
  }
  return (
    <nav
      className={plan.fields.length === 1 ? "rs-dock rs-dock--one" : "rs-dock"}
      aria-label="Schnellkontakt"
      {...SYS_DOCK}
    >
      {plan.fields.map(f => (
        <a
          key={`${f.label}-${f.href}`}
          className={
            f.signal ? "rs-dock-field rs-dock-field--signal" : "rs-dock-field"
          }
          href={f.href}
        >
          <span className="rs-dock-label">{f.label}</span>
          {f.detail && <span className="rs-dock-detail">{f.detail}</span>}
        </a>
      ))}
    </nav>
  );
}
