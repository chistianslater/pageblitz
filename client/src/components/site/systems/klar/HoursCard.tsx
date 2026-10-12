import React from "react";
import { Icon } from "./icons";
import type { HoursRow, TodayHours } from "./hours";

/**
 * Sprechzeiten-Karte (Systemblatt 8 rechts, 9): Titel aus dem Bauplan
 * („Sprechzeiten", „Bürozeiten"), Tabelle mit Tag als Zeilenkopf; die
 * heutige Zeile trägt das Wort „heute" (nicht nur Farbe). `id` hält den
 * Titel eindeutig, wenn die Karte zweimal auf der Seite steht.
 */
export function KlarHoursCard({
  id,
  label,
  rows,
  className,
}: {
  id: string;
  label: string;
  rows: HoursRow[];
  className?: string;
}) {
  if (rows.length === 0) return null;
  const titleId = `${id}-titel`;
  return (
    <div className={className ? `kl-hours ${className}` : "kl-hours"}>
      <p className="kl-hours-hd">
        <span id={titleId}>{label}</span>
        <Icon name="clock" />
      </p>
      <table className="kl-hours-table" aria-labelledby={titleId}>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={
                [r.today ? "kl-now" : "", r.closed ? "kl-zu" : ""]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
            >
              <th scope="row">
                {r.label}
                {r.today && <span className="kl-today-tag"> heute</span>}
              </th>
              <td>
                {r.lines.map((line, k) => (
                  <span key={k} className={r.spans ? "kl-span" : undefined}>
                    {line}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Heute-Karte am Foto: „Heute, Montag" und die Spannen. */
export function KlarTodayCard({ today }: { today: TodayHours }) {
  return (
    <div className="kl-todaycard">
      <span className="kl-tile">
        <Icon name="clock" />
      </span>
      <p>
        <span className="kl-todaycard-day">Heute, {today.day}</span>
        {today.lines.map((line, k) => (
          <b key={k}>{line}</b>
        ))}
      </p>
    </div>
  );
}
