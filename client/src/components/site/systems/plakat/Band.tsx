import React from "react";
import { useSystem } from "../SystemContext";
import { versalEszett, newTabIfMaps } from "../shared";
import { plakatActions, tickerItems } from "./facts";
import { SYS_DOCK } from "../shared/dockAutoHide";

/**
 * Laufband (Systemblatt 09): genau eins je Seite, direkt nach dem Einstieg,
 * tief. Inhalt nur aus Daten (Leistungen, Straße, Zeiten-Kurzform), Trenner
 * ist ein Signalpunkt. Die Spur trägt die Runde mehrfach, damit sie auch
 * bei 1440 px nahtlos läuft (translateX −50 %); nur die erste Runde ist für
 * Vorleser sichtbar, die Kopien sind aria-hidden. Das Band läuft erst,
 * wenn das Script die Seite freigibt (motion.ts, `data-pk-ready`) — ohne
 * Script und bei reduzierter Bewegung steht es still (erste Runde
 * sichtbar). Solange es läuft, zeigt es einen Pause-Knopf (WCAG 2.2.2):
 * Name bleibt „Laufband anhalten", `aria-pressed` trägt den Zustand, der
 * Tooltip wechselt zu „Laufband abspielen".
 * Weniger als zwei Einträge: kein Laufband.
 */

/** Name des Pause-Knopfs (bleibt; der Zustand steht in aria-pressed). */
export const TICK_PAUSE = "Laufband anhalten";
/** Tooltip im angehaltenen Zustand. */
export const TICK_PLAY = "Laufband abspielen";

/** Runden je Spur (gerade, damit −50 % genau eine Hälfte ist). */
const ROUNDS = 4;

function Round({ items, hidden }: { items: string[]; hidden: boolean }) {
  return (
    <ul className="pk-tick-run" {...(hidden ? { "aria-hidden": true } : {})}>
      {items.map((item, i) => (
        <li key={`${item}-${i}`}>{versalEszett(item)}</li>
      ))}
    </ul>
  );
}

export function PlakatTicker() {
  const { data } = useSystem();
  const items = tickerItems(data);
  if (items.length === 0) return null;
  return (
    <div className="pk-tick" role="region" aria-label="Auf einen Blick">
      <button
        type="button"
        className="pk-tick-toggle"
        aria-pressed="false"
        aria-label={TICK_PAUSE}
        title={TICK_PAUSE}
      >
        <i aria-hidden="true" />
      </button>
      <div className="pk-tick-track">
        {Array.from({ length: ROUNDS }, (_, i) => (
          <Round key={i} items={items} hidden={i > 0} />
        ))}
      </div>
    </div>
  );
}

/**
 * Dock (Systemblatt: unter 48 rem, zwei Knöpfe auf Tinte — Neben-Weg und
 * Hauptaktion in Signal). Nur Wege aus sichtbaren Abschnitten. Die Seite
 * bekommt unten so viel Luft, dass nichts verdeckt bleibt (CSS).
 */
export function PlakatDock({ anchorPrefix }: { anchorPrefix: string }) {
  const { data, blueprint } = useSystem();
  const { primary, other } = plakatActions(data, blueprint, anchorPrefix);
  if (!primary) return null;
  return (
    <nav
      className={other ? "pk-dock" : "pk-dock pk-dock--one"}
      aria-label="Schnellkontakt"
      {...SYS_DOCK}
    >
      {other && (
        <a className="pk-dock-a" href={other.href} {...newTabIfMaps(other.href)}>
          {other.label}
        </a>
      )}
      <a className="pk-dock-b" href={primary.href} {...newTabIfMaps(primary.href)}>
        {primary.label}
      </a>
    </nav>
  );
}
