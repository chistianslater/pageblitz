import {
  GLOW_CORE,
  GLOW_OPACITY,
  HEAD_H,
  NAV,
  ROUND,
  WIDE,
  step,
} from "./step";

/**
 * Einstieg (Systemblatt 9 Handy, 14 Desktop).
 *
 * Foto-Fassung: Das Foto bekommt den System-Filter (dunkler, wärmer), einen
 * Schleier in Grundfarbe (22 %) und einen Verlauf zur Grundfarbe. Text
 * liegt nur dort, wo der Verlauf ihn trägt: der Kopf im oberen Band, Name
 * und Satz ab der unteren Zone. Höhen sind feste Token-Vielfache, die
 * Textkante ein fester Anteil davon — so gilt der Kontrast auch für eine
 * rein weiße Fotostelle (contrast.test.ts).
 */

/** Schleier in Grundfarbe über jedem Foto. */
export const PHOTO_VEIL = 0.22;

/** Verlauf zur Grundfarbe: [Anteil der Fotohöhe, Deckung]. */
export const HERO_SCRIM: readonly (readonly [number, number])[] = [
  [0, 0.85],
  [0.15, 0.7],
  [0.34, 0],
  [0.4, 0],
  [0.64, 0.9],
  [0.8, 1],
];

/** Fotohöhe je Breite (Vielfache von 2xl = 6,5 rem: 520 / 624 / 780 px). */
export const HERO_H = { base: 5, wide: 6, nav: 7.5 } as const;
/** Textkante: der Text beginnt bei diesem Anteil der Fotohöhe. */
export const TEXT_START = { base: 0.7, wide: 0.7, nav: 0.64 } as const;
/** Kopfzeile in Vielfachen von xl (76 px), liegt über dem oberen Band. */
export const HEAD_XL = 1.1875;

const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
const paper = (a: number) =>
  a >= 1
    ? "var(--sys-paper)"
    : a <= 0
      ? "transparent"
      : `color-mix(in srgb,var(--sys-paper) ${Math.round(a * 100)}%,transparent)`;

/** Hintergrund des Schleiers (zwei Ebenen: Schleier, dann Verlauf). */
export const SCRIM_BG = [
  `linear-gradient(${paper(PHOTO_VEIL)},${paper(PHOTO_VEIL)})`,
  `linear-gradient(180deg,${HERO_SCRIM.map(([at, a]) => `${paper(a)} ${pct(at)}`).join(",")})`,
].join(",");

const heroH = (n: number) => `calc(var(--sys-space-2xl) * ${n})`;
const lift = (n: number, start: number) =>
  `calc(var(--sys-space-2xl) * ${n} * -${Math.round((1 - start) * 1000) / 1000})`;

export const ENTRY_CSS = `/* Einstieg: photo · framed · plain */
.pb-nacht .nc-entry{position:relative;isolation:isolate;overflow:hidden}
.pb-nacht .nc-entry-in{position:relative;max-width:var(--sys-space-max);margin-inline:auto;padding:0 var(--sys-space-gutter)}
.pb-nacht .nc-kicker{${step("kicker")};display:block;color:var(--sys-accent)}
.pb-nacht .nc-title{margin:0;color:var(--sys-accent)}
.pb-nacht .nc-display{${step("display")};display:block;color:var(--sys-accent);margin-top:var(--sys-space-xs);overflow-wrap:anywhere;hyphens:manual;text-wrap:balance}
/* Foto-Fassung: Name größer, am Handy auf die Breite begrenzt (kein Trennstrich in „WEINBERG") */
.pb-nacht .nc-display--photo{font-size:min(calc(var(--sys-display-size) * 1.18),14vw)}
.pb-nacht .nc-lede{${step("lede")};margin-top:var(--sys-space-m);max-width:var(--sys-space-measure);color:var(--sys-ink)}
.pb-nacht .nc-today{${step("small")};display:flex;flex-wrap:wrap;gap:calc(var(--sys-space-2xs) * 1.5) calc(var(--sys-space-s) * 1.125);margin-top:var(--sys-space-m);color:var(--sys-muted)}
.pb-nacht .nc-today b{font-weight:500;color:var(--sys-ink)}
.pb-nacht .nc-actions{display:grid;gap:calc(var(--sys-space-s) * .75);margin-top:var(--sys-space-l)}
.pb-nacht .nc-actions .nc-btn{width:100%}

/* photo: Foto mit Filter, Schleier und Verlauf; Text in der unteren Zone */
.pb-nacht .nc-entry--photo{--nc-hero-h:${heroH(HERO_H.base)};text-align:center}
.pb-nacht .nc-bg{position:relative;height:var(--nc-hero-h);overflow:hidden;background:var(--sys-paper)}
.pb-nacht .nc-bg img{width:100%;height:100%;object-fit:cover;filter:var(--sys-image-filter)}
.pb-nacht .nc-bg::after{content:"";position:absolute;inset:-2px;background:${SCRIM_BG}}
.pb-nacht .nc-entry--photo .nc-entry-in{margin-top:${lift(HERO_H.base, TEXT_START.base)}}
.pb-nacht .nc-entry--photo .nc-lede{margin-inline:auto}
.pb-nacht .nc-entry--photo .nc-today{justify-content:center}
.pb-nacht .nc-vl{display:block;position:relative;width:1px;height:var(--sys-space-l);margin:var(--sys-space-m) auto 0;background:var(--sys-accent)}
.pb-nacht .nc-vl::after{content:"";position:absolute;left:50%;bottom:calc(var(--sys-space-2xs) * -1.5);width:calc(var(--sys-space-xs) * 1.125);height:calc(var(--sys-space-xs) * 1.125);border-radius:${ROUND};background:var(--sys-accent);transform:translateX(-50%)}

/* framed · plain: Name, Ziffer (+ kleines Hochformat), Schein */
.pb-nacht .nc-entry--framed .nc-entry-in,.pb-nacht .nc-entry--plain .nc-entry-in{padding-top:calc(${HEAD_H} + var(--sys-space-l))}
/* Schein läuft nach unten weich aus (keine harte Kante am Abschnittsende) */
.pb-nacht .nc-glowbox{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none;-webkit-mask-image:linear-gradient(black 45%,transparent);mask-image:linear-gradient(black 45%,transparent)}
.pb-nacht .nc-glow{position:absolute;width:140vw;max-width:calc(var(--sys-space-2xl) * 13.5);aspect-ratio:1;border-radius:${ROUND};pointer-events:none;
  background:radial-gradient(circle closest-side,color-mix(in srgb,var(--sys-glow-2) ${GLOW_CORE * 100}%,transparent),transparent 72%);opacity:${GLOW_OPACITY};filter:blur(var(--sys-space-l))}
.pb-nacht .nc-glow--entry{right:-60%;top:-20%}
.pb-nacht .nc-figure{margin-top:var(--sys-space-l)}
.pb-nacht .nc-figrow{display:grid;grid-template-columns:minmax(0,1fr);align-items:end;gap:var(--sys-space-s)}
.pb-nacht .nc-figrow--pic{grid-template-columns:minmax(0,1fr) minmax(0,46%)}
.pb-nacht .nc-fig{${step("figure")};color:var(--sys-accent);white-space:nowrap;font-variant-numeric:lining-nums;padding-bottom:.04em}
.pb-nacht .nc-figrow--pic .nc-fig{font-size:min(var(--sys-figure-size),34vw)}
.pb-nacht .nc-figrow--pic .nc-fig--long{font-size:min(var(--sys-figure-size),24vw)}
.pb-nacht .nc-fig sup{font-size:.36em;vertical-align:top;line-height:1;margin-left:.04em;position:relative;top:.12em}
.pb-nacht .nc-pic{margin:0;position:relative;aspect-ratio:3/4;overflow:hidden;background:var(--sys-surface)}
.pb-nacht .nc-pic img{width:100%;height:100%;object-fit:cover;filter:var(--sys-image-filter)}
.pb-nacht .nc-pic::after{content:"";position:absolute;inset:0;background:linear-gradient(${paper(PHOTO_VEIL)},${paper(PHOTO_VEIL)}),linear-gradient(200deg,transparent 45%,${paper(0.6)})}
.pb-nacht .nc-pic--solo{width:min(100%,calc(var(--sys-space-2xl) * 3.5))}
.pb-nacht .nc-figl{${step("kicker")};margin-top:var(--sys-space-m);color:var(--sys-ink)}
.pb-nacht .nc-cl{display:flex;align-items:center;margin-top:var(--sys-space-l);height:calc(var(--sys-space-xs) * .875)}
.pb-nacht .nc-cl::before{content:"";flex:none;width:calc(var(--sys-space-xs) * .875);height:calc(var(--sys-space-xs) * .875);border-radius:${ROUND};background:var(--sys-accent)}
.pb-nacht .nc-cl::after{content:"";flex:1;height:1px;background:color-mix(in srgb,var(--sys-accent) 55%,transparent)}
.pb-nacht .nc-entry--framed .nc-lede,.pb-nacht .nc-entry--plain .nc-lede{margin-top:var(--sys-space-l)}

@media (min-width:${WIDE}){
  .pb-nacht .nc-entry--photo{--nc-hero-h:${heroH(HERO_H.wide)}}
  .pb-nacht .nc-entry--photo .nc-entry-in{margin-top:${lift(HERO_H.wide, TEXT_START.wide)}}
  .pb-nacht .nc-actions{display:flex;flex-wrap:wrap}
  .pb-nacht .nc-actions .nc-btn{width:auto}
  .pb-nacht .nc-entry--photo .nc-actions{justify-content:center}
  .pb-nacht .nc-figrow--pic{grid-template-columns:minmax(0,1fr) minmax(0,40%)}
}
@media (min-width:${NAV}){
  .pb-nacht .nc-entry--photo{--nc-hero-h:${heroH(HERO_H.nav)}}
  .pb-nacht .nc-entry--photo .nc-entry-in{margin-top:${lift(HERO_H.nav, TEXT_START.nav)}}
  .pb-nacht .nc-display--photo{font-size:calc(var(--sys-display-size) * 1.3)}
  .pb-nacht .nc-entry--framed .nc-entry-in,.pb-nacht .nc-entry--plain .nc-entry-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);column-gap:var(--sys-space-2xl);
    grid-template-areas:"title figure" "lede figure" "today figure" "actions figure";grid-template-rows:auto auto auto 1fr;padding-top:calc(${HEAD_H} + var(--sys-space-xl));align-items:start}
  .pb-nacht .nc-entry--framed .nc-titlebox,.pb-nacht .nc-entry--plain .nc-titlebox{grid-area:title}
  .pb-nacht .nc-entry--framed .nc-figure,.pb-nacht .nc-entry--plain .nc-figure{grid-area:figure;margin-top:0}
  .pb-nacht .nc-entry--framed .nc-lede,.pb-nacht .nc-entry--plain .nc-lede{grid-area:lede}
  .pb-nacht .nc-entry--framed .nc-today,.pb-nacht .nc-entry--plain .nc-today{grid-area:today}
  .pb-nacht .nc-entry--framed .nc-actions,.pb-nacht .nc-entry--plain .nc-actions{grid-area:actions;align-self:start}
  .pb-nacht .nc-glow--entry{right:-30%;top:-30%}
}`;

/** Kopfzeile als CSS-Länge (für Tests und die Grundschicht). */
export const HEAD_HEIGHT = HEAD_H;
