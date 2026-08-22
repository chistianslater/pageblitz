import { bookingCss } from "./bookingCss";

/**
 * Styles für die SSR-Inseln (Kontaktformular, KI-Chat, Terminbuchung).
 *
 * Nur `--pb-*`-Variablen + eigene `pb-island-*`-Klassen — auf Kundenseiten
 * gibt es kein Tailwind. Wird nur in den HTML-Head geschrieben, wenn
 * `hasActiveFeatures(data)` true ist (siehe renderSite.tsx).
 *
 * Mehrere `.pb-island--fab`-Geschwister (KI-Chat + Terminbuchung gleichzeitig
 * aktiv) würden sich sonst am selben `right/bottom`-Fixpunkt überlappen —
 * der `~`-Selektor schiebt jeden weiteren Fab-Button nach oben (vertikal
 * gestapelt statt nebeneinander, damit keine Insel die andere überdeckt).
 *
 * `.pb-island-panel` bekommt bewusst `z-index:61` (höher als `.pb-island--fab`
 * mit `z-index:60`): der Chat kommt im Markup vor der Terminbuchung (siehe
 * `SiteIslands.tsx`), bei gleichem z-index würde deren Fab-Button — der per
 * `~`-Offset weiter oben sitzt — sonst über dem geöffneten Chat-Panel
 * liegen und dessen Senden-Button für Klicks blockieren.
 *
 * Die Terminbuchungs-Insel (`BookingIsland.tsx`) bringt ihre eigenen
 * Klassen (Datums-/Slot-Chips, Zusammenfassung) aus `bookingCss.ts` mit —
 * hier nur angehängt, damit `SiteIslands` weiterhin ein einziges
 * `<style>`-Tag rendert.
 */
export const islandsCss = `
.pb-islands{font-family:var(--pb-font-body);color:var(--pb-ink)}
.pb-island-form{display:flex;flex-direction:column;gap:14px;max-width:520px}
.pb-island-form label{display:flex;flex-direction:column;gap:6px;font-family:var(--pb-font-utility,var(--pb-font-body));font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;color:var(--pb-muted)}
.pb-island-form input,.pb-island-form textarea{font-family:var(--pb-font-body);font-size:15px;padding:12px 14px;border:1px solid var(--pb-line);border-radius:var(--pb-radius-card);background:var(--pb-surface);color:var(--pb-ink)}
.pb-island-form input:focus,.pb-island-form textarea:focus{outline:2px solid var(--pb-accent);outline-offset:2px}
.pb-island-form textarea{min-height:120px;resize:vertical;font-family:inherit}
.pb-island-honeypot{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;padding:0;margin:-1px}
.pb-island-submit{align-self:flex-start;background:var(--pb-accent);color:var(--pb-accent-contrast);border:none;border-radius:var(--pb-radius-button);padding:14px 28px;font-weight:700;font-size:15px;cursor:pointer;transition:opacity .15s}
.pb-island-submit:hover,.pb-island-submit:focus-visible{opacity:.85}
.pb-island-submit:disabled{opacity:.5;cursor:not-allowed}
.pb-island-privacy{font-size:12px;color:var(--pb-muted);margin:0}
.pb-island-privacy a{color:var(--pb-ink);text-decoration:underline}
.pb-island-status{font-size:14px;margin-top:4px}
.pb-island-status[data-state="success"]{color:var(--pb-accent)}
.pb-island-status[data-state="error"]{color:#b3261e}
.pb-island-status[data-state="info"]{color:var(--pb-muted);font-size:12px}
.pb-island--fab{position:fixed;right:20px;bottom:20px;z-index:60}
.pb-island--fab ~ .pb-island--fab{bottom:88px}
.pb-island-fab-button{display:inline-flex;align-items:center;gap:8px;background:var(--pb-ink);color:var(--pb-canvas);border:none;border-radius:var(--pb-radius-button);padding:14px 22px;font-family:var(--pb-font-utility,var(--pb-font-body));font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.04em;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.18);transition:transform .15s,opacity .15s}
.pb-island-fab-button:hover,.pb-island-fab-button:focus-visible{transform:translateY(-2px)}
.pb-island-fab-button:disabled{opacity:.6;cursor:progress}
.pb-island-fab-btn{display:inline-flex;align-items:center;gap:8px;background:var(--pb-accent);color:var(--pb-accent-contrast);border:none;border-radius:var(--pb-radius-button);padding:14px 22px;font-family:var(--pb-font-utility,var(--pb-font-body));font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.04em;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.18);transition:transform .15s,opacity .15s}
.pb-island-fab-btn:hover,.pb-island-fab-btn:focus-visible{transform:translateY(-2px)}
.pb-island-fab-btn[aria-expanded="true"]{opacity:.85}
.pb-island-fab-btn:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
.pb-island-fab-btn:disabled:hover{transform:none}
.pb-island-panel{position:fixed;right:20px;bottom:90px;width:min(360px,calc(100vw - 2rem));max-height:70vh;background:var(--pb-surface);color:var(--pb-ink);border:1px solid var(--pb-line);border-radius:var(--pb-radius-card);box-shadow:0 20px 60px rgba(0,0,0,.24);z-index:61;display:flex;flex-direction:column;overflow:hidden}
.pb-island-panel[hidden]{display:none}
.pb-island-panel-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--pb-line);font-family:var(--pb-font-utility,var(--pb-font-body));font-weight:700;font-size:14px}
.pb-island-panel-close{background:none;border:none;color:var(--pb-muted);font-family:inherit;font-size:13px;cursor:pointer;padding:4px}
.pb-island-panel-close:hover,.pb-island-panel-close:focus-visible{color:var(--pb-ink)}
.pb-island-panel-body{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;min-height:120px}
.pb-island-msg{margin:0;padding:10px 14px;border-radius:var(--pb-radius-card);font-size:14px;line-height:1.4;max-width:85%}
.pb-island-msg--assistant{align-self:flex-start;background:rgba(0,0,0,.06);color:var(--pb-ink)}
.pb-island-msg--user{align-self:flex-end;background:var(--pb-accent);color:var(--pb-accent-contrast)}
.pb-island-msg--busy{opacity:.5}
.pb-island-panel-input-row{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--pb-line)}
.pb-island-panel-input-row input{flex:1;min-width:0;font-family:var(--pb-font-body);font-size:14px;padding:10px 12px;border:1px solid var(--pb-line);border-radius:var(--pb-radius-card);background:var(--pb-surface);color:var(--pb-ink)}
.pb-island-panel-input-row input:focus{outline:2px solid var(--pb-accent);outline-offset:2px}
.pb-island-panel-input-row input:disabled{opacity:.6}
.pb-island-panel-send{background:var(--pb-accent);color:var(--pb-accent-contrast);border:none;border-radius:var(--pb-radius-button);padding:0 18px;font-weight:700;font-size:13px;cursor:pointer;transition:opacity .15s}
.pb-island-panel-send:disabled{opacity:.5;cursor:not-allowed}
@media(max-width:480px){.pb-island--fab{right:12px;bottom:12px}.pb-island--fab ~ .pb-island--fab{bottom:80px}.pb-island-panel{left:0;right:0;bottom:0;width:100%;max-width:none;max-height:80vh;border-radius:var(--pb-radius-card) var(--pb-radius-card) 0 0}}
@media(prefers-reduced-motion:reduce){.pb-island-fab-button,.pb-island-fab-btn{transition:none}.pb-island-fab-button:hover,.pb-island-fab-button:focus-visible,.pb-island-fab-btn:hover,.pb-island-fab-btn:focus-visible{transform:none}}
${bookingCss}`;
