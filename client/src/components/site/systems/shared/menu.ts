/**
 * Inline-Script für das <details>-Menü der Designsysteme: schließt nach
 * Klick auf einen Eintrag (Sprung zum Anker), per Escape (Fokus zurück auf
 * den Schalter) und per Klick daneben. Inline, weil SSR-Kundenseiten nicht
 * hydrieren; ohne JS bleibt das Menü per <summary> bedienbar.
 * `prefix` ist das Klassenkürzel des Systems (Journal `jr`, Raster `rs`).
 */
export function detailsMenuJs(prefix: string): string {
  return `(function(){
var d=document;
d.querySelectorAll(".${prefix}-menu").forEach(function(m){
var t=m.querySelector("summary");
m.addEventListener("click",function(e){if(e.target.closest&&e.target.closest(".${prefix}-menu-panel a"))m.open=false});
d.addEventListener("keydown",function(e){if(e.key==="Escape"&&m.open){m.open=false;t&&t.focus()}});
d.addEventListener("click",function(e){if(m.open&&!m.contains(e.target))m.open=false});
});
})();`;
}
