/**
 * Zusätzliche Styles für die Terminbuchungs-Insel (`BookingIsland.tsx`) —
 * Datums-/Slot-Chips und die Zusammenfassung im Formular-Schritt. Eigene
 * Datei statt direkt in `islandsCss.ts`, damit Task-9-Änderungen nicht in
 * dieselben Zeilen wie die Task-6–8-Styles greifen; `islandsCss.ts` hängt
 * diesen String an seinen eigenen an, `SiteIslands` rendert weiterhin nur
 * EIN `<style>`-Tag.
 *
 * Schritt-Inhalte der Insel (Datumsliste, Slot-Liste, Formular, Erfolg)
 * stecken jeweils in `.pb-island-panel-body` (Padding/Scroll kommt von dort,
 * siehe islandsCss.ts) — hier nur die Chip- und Grid-Optik.
 */
export const bookingCss = `
.pb-island-step-back{align-self:flex-start;background:none;border:none;color:var(--pb-muted);font-family:var(--pb-font-utility,var(--pb-font-body));font-size:13px;cursor:pointer;padding:2px 0}
.pb-island-step-back:hover,.pb-island-step-back:focus-visible{color:var(--pb-ink)}
.pb-island-dates{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px;scrollbar-width:thin}
.pb-island-slots{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.pb-island-chip{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:var(--pb-surface);color:var(--pb-ink);border:1px solid var(--pb-line);border-radius:var(--pb-radius-card);padding:8px 12px;font-family:var(--pb-font-body);font-size:13px;line-height:1.2;cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.pb-island-chip span{font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:var(--pb-muted)}
.pb-island-chip:hover,.pb-island-chip:focus-visible{border-color:var(--pb-accent)}
.pb-island-chip[aria-pressed="true"]{background:var(--pb-accent);color:var(--pb-accent-contrast);border-color:var(--pb-accent)}
.pb-island-chip[aria-pressed="true"] span{color:inherit;opacity:.8}
.pb-island-summary{margin:0;padding:10px 14px;border-radius:var(--pb-radius-card);background:color-mix(in srgb, var(--pb-ink) 6%, transparent);font-size:13px}
.pb-island-empty{margin:0;font-size:14px;color:var(--pb-muted)}
`;
