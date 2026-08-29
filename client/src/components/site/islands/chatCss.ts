/**
 * Optik des KI-Website-Chats (`ChatIsland.tsx`) — klassisches Chatfenster
 * statt des generischen Insel-Panels (Pack-Kartenradius 2 px, Times nach
 * dem Portal, Text-Buttons „Senden"/„Schließen").
 *
 * Eigene Datei analog zu `bookingCss.ts`; `islandsCss.ts` hängt den String
 * an, `SiteIslands` rendert weiterhin nur ein `<style>`-Tag. Nur `--pb-*`
 * plus `pb-island-*`-Klassen, kein Tailwind (Kundenseiten haben keins).
 *
 * Fenster-Radius ist fest 16 px — Pack-`radius-card` (oft 2 px) würde das
 * Fenster wie eine Visitenkarte aussehen lassen, nicht wie einen Messenger.
 * Schrift fällt ohne Token auf ui-sans-serif, damit das Portal nie Times
 * zeigt, selbst wenn `copySiteCssVars` einmal leer bleibt.
 */
export const chatCss = `
.pb-island-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.pb-island-chat-fab{width:56px;height:56px;padding:0;border-radius:50%;justify-content:center;text-transform:none;letter-spacing:0}
.pb-island-chat-fab[aria-expanded="true"]{opacity:1}
.pb-island-chat-fab svg{width:24px;height:24px;display:block}
.pb-island-chat-panel{width:min(380px,calc(100vw - 2rem));max-height:min(560px,72vh);border-radius:16px;font-family:var(--pb-font-body,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif);background:var(--pb-surface,#fff);color:var(--pb-ink,#1a1a1a);border:1px solid var(--pb-line,#e5e2dc);box-shadow:0 24px 48px -12px rgba(0,0,0,.28)}
.pb-island-chat-header{display:flex;align-items:center;gap:12px;padding:14px 14px 14px 16px;border-bottom:1px solid var(--pb-line,#e5e2dc);background:var(--pb-surface,#fff);flex-shrink:0}
.pb-island-chat-avatar{width:36px;height:36px;border-radius:50%;background:var(--pb-accent,#333);color:var(--pb-accent-contrast,#fff);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pb-island-chat-avatar svg{width:18px;height:18px;display:block}
.pb-island-chat-header-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.pb-island-chat-title{font-family:var(--pb-font-body,ui-sans-serif,system-ui,sans-serif);font-weight:650;font-size:14px;line-height:1.25;color:var(--pb-ink,#1a1a1a);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:0;text-transform:none}
.pb-island-chat-status{display:flex;align-items:center;gap:6px;font-family:var(--pb-font-body,ui-sans-serif,system-ui,sans-serif);font-size:12px;font-weight:400;line-height:1.3;color:var(--pb-muted,#666);letter-spacing:0;text-transform:none}
.pb-island-chat-status-dot{width:6px;height:6px;border-radius:50%;background:var(--pb-accent,#2e7d32);flex-shrink:0}
.pb-island-chat-close{width:32px;height:32px;border-radius:50%;background:transparent;border:none;color:var(--pb-muted,#666);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;flex-shrink:0}
.pb-island-chat-close:hover,.pb-island-chat-close:focus-visible{color:var(--pb-ink,#1a1a1a);background:color-mix(in srgb,var(--pb-ink,#000) 8%,transparent)}
.pb-island-chat-close svg{width:18px;height:18px;display:block}
.pb-island-chat-body{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;min-height:180px;background:var(--pb-canvas,#f6f5f2)}
.pb-island-chat-panel .pb-island-msg{margin:0;padding:10px 14px;font-size:14px;line-height:1.45;max-width:82%;font-family:var(--pb-font-body,ui-sans-serif,system-ui,sans-serif);overflow-wrap:anywhere}
.pb-island-chat-panel .pb-island-msg--assistant{align-self:flex-start;background:var(--pb-surface,#fff);color:var(--pb-ink,#1a1a1a);border:1px solid var(--pb-line,#e5e2dc);border-radius:16px 16px 16px 4px}
.pb-island-chat-panel .pb-island-msg--user{align-self:flex-end;background:var(--pb-accent,#333);color:var(--pb-accent-contrast,#fff);border:none;border-radius:16px 16px 4px 16px}
.pb-island-chat-panel .pb-island-msg--busy{opacity:1;padding:12px 16px}
.pb-island-chat-dots{display:flex;align-items:center;gap:5px;min-height:8px}
.pb-island-chat-dot{width:6px;height:6px;border-radius:50%;background:var(--pb-muted,#888);animation:pb-island-chat-dot .9s ease-in-out infinite}
.pb-island-chat-dot:nth-child(2){animation-delay:.15s}
.pb-island-chat-dot:nth-child(3){animation-delay:.3s}
@keyframes pb-island-chat-dot{0%,80%,100%{opacity:.35;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
.pb-island-chat-panel>.pb-island-status{padding:0 16px 4px;margin:0}
.pb-island-chat-composer{display:flex;align-items:center;gap:8px;padding:12px 14px 14px;border-top:1px solid var(--pb-line,#e5e2dc);background:var(--pb-surface,#fff);flex-shrink:0}
.pb-island-chat-composer input{flex:1;min-width:0;font-family:var(--pb-font-body,ui-sans-serif,system-ui,sans-serif);font-size:14px;line-height:1.4;padding:10px 14px;border:1px solid var(--pb-line,#e5e2dc);border-radius:999px;background:var(--pb-canvas,#f6f5f2);color:var(--pb-ink,#1a1a1a)}
.pb-island-chat-composer input::placeholder{color:var(--pb-muted,#888)}
.pb-island-chat-composer input:focus{outline:2px solid var(--pb-accent,#333);outline-offset:1px}
.pb-island-chat-composer input:disabled{opacity:.6}
.pb-island-chat-send{width:40px;height:40px;border-radius:50%;background:var(--pb-accent,#333);color:var(--pb-accent-contrast,#fff);border:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;padding:0;transition:opacity .15s}
.pb-island-chat-send:disabled{opacity:.4;cursor:not-allowed}
.pb-island-chat-send svg{width:18px;height:18px;display:block}
@media(max-width:480px){.pb-island-chat-panel{left:0;right:0;bottom:0;width:100%;max-width:none;max-height:85vh;border-radius:16px 16px 0 0}}
@media(prefers-reduced-motion:reduce){.pb-island-chat-dot{animation:none;opacity:.55}.pb-island-chat-send{transition:none}}
`;
