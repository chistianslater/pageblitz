import React from "react";
import { telHref } from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import { addressLine, contactOf } from "../shared";
import { brandParts, branchOf, nameOf, todayStatus, visibleDoc } from "./facts";
import { SYS_ACTIONS } from "../shared/dockAutoHide";

/**
 * Werkzettel (Systemblatt, DM Mono): liegt als eigenes Stück über der
 * Bildkante bzw. trägt den Typo-Einstieg. Nur echte Daten — Name und
 * Gewerk, Telefon, Adresse, heute; keine Versprechen, kein Gründungsjahr.
 * Fehlt etwas, fällt die Zeile weg; ohne Telefon, Adresse und Zeiten gibt
 * es keinen Zettel. Leiste in Signal: „Anrufen" (tel) und der Heute-Stand.
 */
export function WerkstoffSlip() {
  const { data, blueprint, now } = useSystem();
  const contact = contactOf(visibleDoc(data).sections);
  const phone = contact?.phone?.trim();
  const tel = telHref(phone);
  const address = addressLine(contact);
  const today = todayStatus(contact?.openingHours, now);
  if (!tel && !address && !today) return null;
  const name = nameOf(data);
  const { sub } = brandParts(name, branchOf(data, blueprint));
  // Gewerk nur, wenn es nicht schon im Namen steht.
  const trade = sub && !name.toLocaleLowerCase("de").includes(sub.toLocaleLowerCase("de")) ? sub : undefined;
  const status = today?.status && (
    <span className="ws-slip-status">{today.status}</span>
  );
  return (
    <aside className="ws-slip" aria-label="Auf einen Blick">
      <p className="ws-slip-row">
        <span className="ws-slip-who">
          <span>{name}</span>
          {trade && <span className="ws-slip-trade">{trade}</span>}
        </span>
        {tel && <span className="ws-slip-phone">{phone}</span>}
      </p>
      {address && <p className="ws-slip-row">{address}</p>}
      {today?.big && (
        <p className="ws-slip-row ws-slip-big">
          <span>{today.big}</span>
          {today.side && <span className="ws-slip-side">{today.side}</span>}
        </p>
      )}
      {tel ? (
        <a className="ws-slip-bar" href={tel} {...SYS_ACTIONS}>
          <span>Anrufen</span>
          {status}
        </a>
      ) : (
        status && <p className="ws-slip-bar">{status}</p>
      )}
    </aside>
  );
}
