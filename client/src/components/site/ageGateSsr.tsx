import React from "react";
import { AGE_GATE_MIN_AGE } from "@shared/ageGate";

/**
 * FSK-18 Age-Gate für den v2-SSR-Pfad (2026-08-31): Das alte AgeGate
 * (client/src/components/AgeGate.tsx) rendert nur in der Legacy-SPA —
 * SSR-Kundenseiten liefen bislang komplett ohne Gate. Diese Variante
 * rendert das Overlay statisch (fail-closed: ohne JS bleibt es stehen)
 * plus ein parser-blockierendes Inline-Script direkt dahinter, das vor
 * dem ersten Paint den localStorage prüft — bereits bestätigte Besucher
 * sehen keinen Flash. Gleicher Storage-Key wie die SPA-Variante
 * (`age-verified:<slug>`, 30 Tage), damit eine frühere Bestätigung
 * weiterzählt.
 */
interface AgeGateSsrProps {
  slug: string;
  businessName?: string;
}

export const AGE_GATE_CSS = `
.pb-age-gate{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.96);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.pb-age-card{max-width:500px;width:100%;background:#0a0a0a;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:40px 32px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.pb-age-badge{width:72px;height:72px;border-radius:50%;background:rgba(239,68,68,.15);color:#ef4444;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:32px;font-weight:700;border:2px solid rgba(239,68,68,.3)}
.pb-age-card h2{color:#fff;font-size:24px;font-weight:700;margin:0 0 12px;line-height:1.2}
.pb-age-card p{color:rgba(255,255,255,.7);font-size:15px;line-height:1.6;margin:0 0 32px}
.pb-age-card p strong{color:#fff}
.pb-age-actions{display:flex;flex-direction:column;gap:10px}
.pb-age-yes{width:100%;padding:14px 24px;background:#fff;color:#0a0a0a;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer}
.pb-age-yes:active{transform:scale(.98)}
.pb-age-no{width:100%;padding:12px 24px;background:transparent;color:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.15);border-radius:10px;font-size:14px;font-weight:500;cursor:pointer}
.pb-age-note{color:rgba(255,255,255,.35)!important;font-size:11px!important;line-height:1.5!important;margin:24px 0 0!important}
html[data-pb-age-lock]{overflow:hidden}
`;

/**
 * Verhalten als IIFE (kein siteEnhancer nötig — der läuft erst später):
 * gültige Bestätigung → Overlay sofort entfernen; sonst Scroll-Lock +
 * Klick-Handler (Ja: speichern + entfernen, Nein: zurück bzw. google.de —
 * gleiche Semantik wie das SPA-AgeGate).
 */
function gateScript(slug: string): string {
  const key = JSON.stringify(`age-verified:${slug}`);
  return (
    `(function(){var g=document.getElementById("pb-age-gate");if(!g)return;` +
    `var k=${key};` +
    `try{var t=parseInt(localStorage.getItem(k)||"",10);` +
    `if(isFinite(t)&&Date.now()-t<2592e6){g.remove();return;}}catch(e){}` +
    `document.documentElement.setAttribute("data-pb-age-lock","");` +
    `var y=g.querySelector(".pb-age-yes");if(y)y.addEventListener("click",function(){` +
    `try{localStorage.setItem(k,String(Date.now()))}catch(e){}` +
    `g.remove();document.documentElement.removeAttribute("data-pb-age-lock");});` +
    `var n=g.querySelector(".pb-age-no");if(n)n.addEventListener("click",function(){` +
    `if(history.length>1){history.back();` +
    `setTimeout(function(){location.href="https://www.google.de"},200);}` +
    `else{location.href="https://www.google.de";}});})();`
  );
}

export function AgeGateSsr({ slug, businessName }: AgeGateSsrProps) {
  const bizPart = businessName ? ` von ${businessName}` : "";
  return (
    <>
      <div
        id="pb-age-gate"
        className="pb-age-gate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pb-age-gate-title"
      >
        <div className="pb-age-card">
          <div className="pb-age-badge" aria-hidden="true">
            {AGE_GATE_MIN_AGE}+
          </div>
          <h2 id="pb-age-gate-title">Altersbestätigung erforderlich</h2>
          <p>
            Die Inhalte dieser Website{bizPart} sind nur für Personen ab{" "}
            <strong>{AGE_GATE_MIN_AGE} Jahren</strong> bestimmt. Bitte
            bestätige dein Alter, um fortzufahren.
          </p>
          <div className="pb-age-actions">
            <button type="button" className="pb-age-yes">
              Ja, ich bin {AGE_GATE_MIN_AGE} oder älter
            </button>
            <button type="button" className="pb-age-no">
              Nein, Seite verlassen
            </button>
          </div>
          <p className="pb-age-note">
            Mit der Bestätigung versicherst du, dass du das gesetzliche
            Mindestalter erreicht hast. Falschangaben können rechtliche
            Konsequenzen haben.
          </p>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: gateScript(slug) }} />
    </>
  );
}
