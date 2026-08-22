/**
 * Styles für die SSR-Inseln (Kontaktformular, KI-Chat, Terminbuchung).
 *
 * Nur `--pb-*`-Variablen + eigene `pb-island-*`-Klassen — auf Kundenseiten
 * gibt es kein Tailwind. Wird nur in den HTML-Head geschrieben, wenn
 * `hasActiveFeatures(data)` true ist (siehe renderSite.tsx).
 *
 * Mehrere `.pb-island--fab`-Geschwister (KI-Chat + Terminbuchung gleichzeitig
 * aktiv) würden sich sonst am selben `right/bottom`-Fixpunkt überlappen —
 * der `~`-Selektor schiebt jeden weiteren Fab-Button nach oben.
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
.pb-island--fab{position:fixed;right:20px;bottom:20px;z-index:60}
.pb-island--fab ~ .pb-island--fab{bottom:88px}
.pb-island-fab-button{display:inline-flex;align-items:center;gap:8px;background:var(--pb-ink);color:var(--pb-canvas);border:none;border-radius:var(--pb-radius-button);padding:14px 22px;font-family:var(--pb-font-utility,var(--pb-font-body));font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.04em;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.18);transition:transform .15s,opacity .15s}
.pb-island-fab-button:hover,.pb-island-fab-button:focus-visible{transform:translateY(-2px)}
.pb-island-fab-button:disabled{opacity:.6;cursor:progress}
.pb-island-panel{position:fixed;right:20px;bottom:90px;width:min(360px,calc(100vw - 40px));max-height:min(520px,calc(100vh - 140px));background:var(--pb-surface);color:var(--pb-ink);border-radius:var(--pb-radius-card);box-shadow:0 20px 60px rgba(0,0,0,.24);z-index:60;overflow:hidden}
@media(max-width:480px){.pb-island--fab{right:12px;bottom:12px}.pb-island--fab ~ .pb-island--fab{bottom:80px}.pb-island-panel{right:12px;left:12px;width:auto}}
@media(prefers-reduced-motion:reduce){.pb-island-fab-button{transition:none}.pb-island-fab-button:hover,.pb-island-fab-button:focus-visible{transform:none}}
`;
