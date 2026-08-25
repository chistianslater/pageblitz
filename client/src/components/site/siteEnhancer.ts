/**
 * SITE_ENHANCER_JS — winziges Vanilla-JS, das `renderSite.tsx` als Inline-
 * <script> am Ende jeder SSR-Kundenseite einbettet (immer, unabhängig von
 * den React-Islands, die nur bei gebuchten Add-ons laden). Zwei Aufgaben
 * (User-Feedback 2026-08-25):
 *
 * 1. Scroll-Reveal: Sektionen faden beim Hereinscrollen ein. Läuft über
 *    IntersectionObserver statt `animation-timeline: view()`, weil die
 *    native scroll-driven Variante in Safari < 26 / älterem Firefox nicht
 *    existiert und dort schlicht nichts animierte. Die versteckende Klasse
 *    `pb-io-on` wird NUR per JS gesetzt — ohne JS, ohne IO oder bei
 *    `prefers-reduced-motion: reduce` bleibt alles statisch sichtbar.
 *    (Name bewusst NICHT "pb-reveal-*": der String "pb-reveal" ist der
 *    Marker der Zeitmaschinen-Einblendung, renderSite.test.tsx assertiert
 *    seine Abwesenheit im Live-Default.)
 * 2. Lightbox: Klick auf ein Galerie-Bild (`#galerie img`, Anker ist in
 *    allen 14 Packs derselbe, engine.ts SECTION_ANCHORS) öffnet die
 *    Großansicht — Schließen per ×/Esc/Klick auf den Hintergrund, Blättern
 *    per Pfeil-Buttons/Tastatur, mit Scroll-Lock und Fokus-Rückgabe.
 *
 * Bewusst kein React: Die Pack-Bäume werden nie hydriert; ein Inline-
 * Script spart den Islands-Bundle-Download auf Seiten ohne Add-ons.
 */
export const SITE_ENHANCER_JS = `(function(){
var d=document,de=d.documentElement;
if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window){
de.classList.add("pb-io-on");
var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("pb-in");io.unobserve(en.target)}})},{rootMargin:"0px 0px -8% 0px",threshold:0.05});
d.querySelectorAll(".pb-site section").forEach(function(s){io.observe(s)});
}
var imgs=Array.prototype.slice.call(d.querySelectorAll(".pb-site #galerie img"));
if(!imgs.length)return;
de.classList.add("pb-lb-on");
var lb=d.createElement("div");
lb.className="pb-lb";lb.setAttribute("role","dialog");lb.setAttribute("aria-modal","true");lb.setAttribute("aria-label","Bildansicht");lb.hidden=true;
lb.innerHTML='<button type="button" class="pb-lb-close" aria-label="Schlie\u00dfen">&times;</button><button type="button" class="pb-lb-prev" aria-label="Vorheriges Bild">&lsaquo;</button><img class="pb-lb-img" alt=""><p class="pb-lb-cap"></p><button type="button" class="pb-lb-next" aria-label="N\u00e4chstes Bild">&rsaquo;</button>';
d.body.appendChild(lb);
var imgEl=lb.querySelector(".pb-lb-img"),capEl=lb.querySelector(".pb-lb-cap");
var closeBtn=lb.querySelector(".pb-lb-close"),prevBtn=lb.querySelector(".pb-lb-prev"),nextBtn=lb.querySelector(".pb-lb-next");
var i=0,lastFocus=null;
function show(n){i=(n+imgs.length)%imgs.length;var s=imgs[i];imgEl.src=s.currentSrc||s.src;imgEl.alt=s.alt||"";capEl.textContent=s.alt||"";}
function open(n){lastFocus=d.activeElement;show(n);lb.hidden=false;d.body.style.overflow="hidden";closeBtn.focus();}
function close(){lb.hidden=true;d.body.style.overflow="";if(lastFocus&&lastFocus.focus)lastFocus.focus();}
d.addEventListener("click",function(e){var t=e.target&&e.target.closest?e.target.closest(".pb-site #galerie img"):null;if(t){var n=imgs.indexOf(t);if(n>-1)open(n);}});
lb.addEventListener("click",function(e){if(e.target===lb)close();});
closeBtn.addEventListener("click",close);
prevBtn.addEventListener("click",function(){show(i-1);});
nextBtn.addEventListener("click",function(){show(i+1);});
d.addEventListener("keydown",function(e){if(lb.hidden)return;if(e.key==="Escape")close();else if(e.key==="ArrowLeft")show(i-1);else if(e.key==="ArrowRight")show(i+1);});
})();`;
