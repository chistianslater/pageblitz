/**
 * SITE_ENHANCER_JS — winziges Vanilla-JS, das `renderSite.tsx` als Inline-
 * <script> am Ende jeder SSR-Kundenseite einbettet (immer, unabhängig von
 * den React-Islands, die nur bei gebuchten Add-ons laden). Zwei Aufgaben
 * (User-Feedback 2026-08-25):
 *
 * 1. Scroll-Reveal: Sektionen nach dem Hero faden beim Hereinscrollen ein.
 *    Der Hero bleibt ausgenommen, damit seine pack-eigene Eingangsmotion
 *    sichtbar abläuft und nicht mit einer zweiten Transformation konkurriert. Läuft über
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
var d=document,de=d.documentElement,reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!reduced&&"IntersectionObserver" in window){
de.classList.add("pb-io-on");
var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("pb-in");io.unobserve(en.target)}})},{rootMargin:"0px 0px -8% 0px",threshold:0.05});
d.querySelectorAll(".pb-site section:not(:first-of-type)").forEach(function(s){io.observe(s)});
}
var imgs=Array.prototype.slice.call(d.querySelectorAll(".pb-site #galerie img"));
var albumTag=d.querySelector("script[data-pb-albums]");
if(albumTag){try{var albums=JSON.parse(albumTag.textContent||"[]")}catch(err){albums=null}
var grid=d.querySelector(".pb-site #galerie [data-pb-slot=gallery-items]");
if(albums&&albums.length&&grid){
var u2a={};albums.forEach(function(a,ai){a.urls.forEach(function(u){u2a[u]=String(ai)})});
Array.prototype.forEach.call(grid.children,function(ch){var im=ch.tagName==="IMG"?ch:(ch.querySelector?ch.querySelector("img"):null);if(!im)return;ch.setAttribute("data-pb-album-item","");var id=u2a[im.getAttribute("src")||""];if(id!==undefined)ch.setAttribute("data-pb-album",id)});
var bar=d.createElement("div");bar.className="pb-album-chips";bar.setAttribute("role","group");bar.setAttribute("aria-label","Alben");
function mkChip(label,val){var b=d.createElement("button");b.type="button";b.textContent=label;b.setAttribute("data-pb-album-chip",val);bar.appendChild(b)}
mkChip("Alle","alle");albums.forEach(function(a,ai){mkChip(a.title,String(ai))});
function setFilter(val){grid.setAttribute("data-pb-album-filter",val);Array.prototype.forEach.call(bar.children,function(b){b.setAttribute("aria-pressed",b.getAttribute("data-pb-album-chip")===val?"true":"false")})}
bar.addEventListener("click",function(e){var b=e.target&&e.target.closest?e.target.closest("[data-pb-album-chip]"):null;if(b)setFilter(b.getAttribute("data-pb-album-chip"))});
grid.parentNode.insertBefore(bar,grid);
setFilter("alle");
}}
if(!imgs.length)return;
function visibleImgs(){var v=imgs.filter(function(x){return x.offsetParent!==null});return v.length?v:imgs}
var list=imgs;
de.classList.add("pb-lb-on");
imgs.forEach(function(img){img.tabIndex=0;img.setAttribute("role","button");img.setAttribute("aria-label",img.alt?"Bild vergrößern: "+img.alt:"Bild vergrößern")});
var lb=d.createElement("div");
lb.className="pb-lb";lb.setAttribute("role","dialog");lb.setAttribute("aria-modal","true");lb.setAttribute("aria-label","Bildansicht");lb.setAttribute("aria-hidden","true");lb.hidden=true;
lb.innerHTML='<button type="button" class="pb-lb-close" aria-label="Schlie\u00dfen">&times;</button><button type="button" class="pb-lb-prev" aria-label="Vorheriges Bild">&lsaquo;</button><img class="pb-lb-img" alt=""><p class="pb-lb-cap"></p><button type="button" class="pb-lb-next" aria-label="N\u00e4chstes Bild">&rsaquo;</button>';
d.body.appendChild(lb);
var imgEl=lb.querySelector(".pb-lb-img"),capEl=lb.querySelector(".pb-lb-cap");
var closeBtn=lb.querySelector(".pb-lb-close"),prevBtn=lb.querySelector(".pb-lb-prev"),nextBtn=lb.querySelector(".pb-lb-next");
var i=0,lastFocus=null,bodyOverflow="",closeTimer=0,changeTimer=0,touchX=0;
function applyImage(n){i=(n+list.length)%list.length;var s=list[i];imgEl.src=s.currentSrc||s.src;imgEl.alt=s.alt||"";capEl.textContent=s.alt||"";}
function show(n,immediate){clearTimeout(changeTimer);if(immediate||reduced){applyImage(n);return}imgEl.classList.add("pb-lb-changing");capEl.classList.add("pb-lb-changing");changeTimer=setTimeout(function(){applyImage(n);requestAnimationFrame(function(){imgEl.classList.remove("pb-lb-changing");capEl.classList.remove("pb-lb-changing")})},130);}
function open(n){clearTimeout(closeTimer);lastFocus=d.activeElement;bodyOverflow=d.body.style.overflow;show(n,true);prevBtn.hidden=nextBtn.hidden=list.length<2;lb.hidden=false;lb.setAttribute("aria-hidden","false");d.body.style.overflow="hidden";requestAnimationFrame(function(){requestAnimationFrame(function(){lb.classList.add("pb-lb-open")})});closeBtn.focus();}
function finishClose(){lb.hidden=true;lb.setAttribute("aria-hidden","true");d.body.style.overflow=bodyOverflow;if(lastFocus&&lastFocus.focus)lastFocus.focus();}
function close(){if(lb.hidden)return;lb.classList.remove("pb-lb-open");clearTimeout(closeTimer);if(reduced)finishClose();else closeTimer=setTimeout(finishClose,280);}
d.addEventListener("click",function(e){var t=e.target&&e.target.closest?e.target.closest(".pb-site #galerie img"):null;if(t){list=visibleImgs();var n=list.indexOf(t);if(n>-1)open(n);}});
lb.addEventListener("click",function(e){if(e.target===lb)close();});
closeBtn.addEventListener("click",close);
prevBtn.addEventListener("click",function(){show(i-1);});
nextBtn.addEventListener("click",function(){show(i+1);});
lb.addEventListener("touchstart",function(e){touchX=e.changedTouches[0].clientX},{passive:true});
lb.addEventListener("touchend",function(e){var dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>50)show(i+(dx<0?1:-1))},{passive:true});
d.addEventListener("keydown",function(e){if(lb.hidden){if(imgs.indexOf(e.target)>-1&&(e.key==="Enter"||e.key===" ")){e.preventDefault();list=visibleImgs();var n=list.indexOf(e.target);if(n>-1)open(n)}return}if(e.key==="Escape")close();else if(e.key==="ArrowLeft")show(i-1);else if(e.key==="ArrowRight")show(i+1);else if(e.key==="Tab"){var fs=[closeBtn,prevBtn,nextBtn].filter(function(x){return !x.hidden}),first=fs[0],last=fs[fs.length-1];if(e.shiftKey&&d.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&d.activeElement===last){e.preventDefault();first.focus()}}});
})();`;
