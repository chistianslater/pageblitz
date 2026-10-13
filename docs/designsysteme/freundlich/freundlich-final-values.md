# Freundlich – Endwerte (Systemblatt 13.10.2026)

Designsystem 7 „Freundlich“. Anker: **Bright Path** (brightpath-wbs.framer.website), nachgebaut und optimiert, keine weiteren Vorlagen eingemischt. Blatt: `systemblatt.html`, Aufnahmen `systemblatt-1.jpg` bis `systemblatt-19.jpg`, Schriften in `fonts/`.

## Anker gemessen (getComputedStyle, 1440 und 390 px)

| Rolle | Bright Path | Freundlich |
|---|---|---|
| Einstieg-Titel | Bricolage 700, 103 / 50 px, Zeile 1,0, −0,06 em, Tinte #14261d, Schlusswort Grün #497e64 + Kritzel | 700, 46 → 91 px (max 96), Zeile 1,02, −0,04 em, zweiter Satzteil #33684e, kein Kritzel |
| Abschnittstitel | 600, 82 / 40 px, Zeile 1,1, −0,08 em | 650, 36 → 72 px, Zeile 1,06, −0,035 em |
| Kartentitel | 500, 30 / 22 px | 600, 22 → 30 px, −0,02 em |
| Fließtext | Instrument Sans 16 px, Zeile 1,4, #45564b | 18 → 19 px, Zeile 1,6, Neben-Grau #3f5045 |
| Hauptknopf | Pille 54 px, #e8722c + Weiß (3,05 : 1), Druckkante 0 4px 0 #b26e45, Hover 7 px | Pille 56 px, #be5219 + Weiß (4,76), Rand 1,5 + Kante 4 px #84360d, Hover −2 px / Kante 6, Drücken +3 px / Kante 1 |
| Karten | Ecke 16/20, Polster 20/30, Kachel Ecke 10 mit 3px 3px 0 Pastellkante | Ecke 20, Kachel 46 px Ecke 12, Rand 1,5 + 3 px Kante |
| Raster | max 1380 px, Rand 30 | max 86,25 rem, Rand 20 → 32 |
| Kanten | Wolkenkante (Bild), Wolken im Fuß | Wolke in CSS aus zwei versetzten Kreisreihen, 56 / 72 px |
| Bewegung | Framer-Einblenden, Laufband auf Pfad, Farbwechsel 0,4 s | ein Federmoment (Einstiegsfoto), Aufstieg 16 px, Knopf heben/drücken |

## Entscheidungen

- **Schrift:** Bricolage Grotesque (Display) + Instrument Sans (Text), beide OFL, self-hosted. Bricolage als feste Instanz **opsz 72, wdth 100, wght 500–800** (38,9 kB latin statt 128 kB), Instrument Sans wdth 100, wght 400–700 (29,9 kB). Vorladen 68,8 kB. Keine Versalien, Laufweite nie enger als −0,04 em.
- **Paletten** (Text auf Pastell immer Tinte; Werte im Blatt live geprüft):
  - **Wald** (anker-treu): Papier #f4f0e5, Band #eae4d3, Tinte #14261d, Grau #3f5045 (7,54), Akzent #33684e (5,71), Tief #1b3428, Signal #be5219 / Weiß (4,76), Kante #84360d. Pastelle Blau #c9e0f2, Limette #d6e59a, Rosa #f6d7e8, Pfirsich #f9d8c0 (Anker-Werte).
  - **Himmel**: Papier #f5f1e8, Tinte #16233b, Akzent #28508f (7,07), Tief #1d3157, Signal Sonne #f2b632 mit Tintenschrift (8,61), Kante = Tinte. Pastelle Himmel #cfe3f6, Sonne #f7e6a6, Pfirsich #fad9c2, Flieder #e2dcf5.
  - **Beere**: Papier #f7f0ea, Tinte #2b1627, Akzent #8a2f62 (6,99), Tief #45203d, Signal #c94a3a / Weiß (4,64), Kante #7d2a1f. Pastelle Rose #f7d4de, Aprikose #fbdcc0, Flieder #e6dcf3, Butter #f4e7ad.
- **Form:** Radien 12 (Kachel, Feld, Kartenfoto) · 20 (Karte, Zettel, Galerie) · 28 (Einstiegsfoto) · Pille. Druckkante 4 px (Knöpfe), 3 px (Kacheln, Bewertungspille). Kippwinkel 1,5° (Einstiegsfoto −, schwaches Foto +, Zettel ±, Ablauf ±0,9°), am Handy gerade. Wolkenkante vor Band, Team-Fläche, Schlussaufruf, Fuß.
- **Fokus:** 3 px Akzent, Abstand 4 px; auf Tief in onDeep. Auswahl in Pastell 1.
- **Bewegung:** nur transform/opacity/box-shadow. Einstiegsfoto setzt sich einmal mit sanfter Feder `cubic-bezier(.3,1.22,.6,1)` 0,9 s; Abschnitte 16 px Aufstieg via `animation-timeline: view()`; reduced motion = alles sofort.
- **Bilder:** Filter `saturate(1.04) contrast(1.03) brightness(1.02) sepia(.04)`, runde Masken, max. ein großes Foto, kein Text auf Fotos, keine Clipart.

### Einstieg nach Fotolage

| Fotolage | Erkennung | Einstieg |
|---|---|---|
| Gutes Foto | Prüfung „gut“, ≥ 1200 px, Mensch/Tier/Raum | Satz zentriert (Pille, Display, Leitsatz, 2 Knöpfe), darunter **ein** Foto Ecke 28, −1,5°, 2–3 Faktenpillen über der Unterkante, Wolkenkante |
| Schwaches Foto | Prüfung „mittel“ | Pastellfläche (Pastell 1), Satz links, Faktenpillen in Pastell 2–4, Foto klein (≤ 58 %, Ecke 20, +1,5°, weißer Rand 6 px) |
| Kein Foto | keine eigenen Fotos | wie „schwach“ ohne Foto; Faktenpillen tragen; Galerie entfällt, Team mit Initialen |

Faktenpillen, Preise, Bewertungen, „Wo steht ihr gerade?“ (erst ab ≥ 3 echten Einstiegen) nur aus Daten.

## Abweichungen von der Token-Form (alle optional, rückwärtsverträglich)

1. `DESIGN_SYSTEM_IDS` um `"freundlich"` erweitern.
2. **`shape?` am System** → `--sys-radius-s|m|l|pill`, `--sys-press`, `--sys-tile`, `--sys-tilt`, `--sys-edge`:
   ```ts
   export type SystemShape = {
     radius: { s: string; m: string; l: string; pill: string };
     press: string; tile: string; tilt: string;
     edge: "straight" | "cloud";
   };
   // DesignSystemDef: shape?: SystemShape;
   ```
3. **Palette `band?`** (Wechselfläche zwischen Abschnitten, `--sys-band`) und **`edge?`** (Druckkante/Rand des Hauptknopfs, `--sys-edge-color`; Pflicht, wenn `signal` gegen `paper` < 3 : 1 wie bei Himmel).
4. **Palette `tints?`**: genau vier Pastelle `{ id, bg, ink, muted, edge }` → `--sys-tint-1..4-bg|ink|muted|edge`. Nicht über `fields` gelöst, weil `fields` ein Dreier-Tupel mit tiefem Feld ist (Plakat) und hier vier helle Rollenfarben mit Kante nötig sind.
5. `toCss.ts`: neue Variablen nur ausgeben, wenn gesetzt (wie `glow`/`fields`), Werte durch `assertSafeCssValue`.

## TS-Objekt (`shared/designSystems/freundlich.ts`)

```ts
import type { DesignSystemDef } from "./types";

/** Googles latin-ext-Bereich (Fonts-API, Stand 2026-10). */
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF";

export const FREUNDLICH: DesignSystemDef = {
  id: "freundlich",
  name: "Freundlich",
  essence: "Weich, hell, man fühlt sich willkommen",
  // Jedes Foto einmal je Seite (claimPhotos), wie Klar und Nacht.
  freeGalleryBeyondShown: true,
  fonts: {
    display: {
      family: "Bricolage Grotesque",
      fallback: "'Avenir Next', 'Trebuchet MS', system-ui, sans-serif",
      files: [
        // Instanz opsz 72, wdth 100, wght 500–800.
        { file: "bricolage-latin-wght.woff2", weight: "500 800", style: "normal" },
        { file: "bricolage-latin-ext-wght.woff2", weight: "500 800", style: "normal", unicodeRange: LATIN_EXT },
      ],
    },
    text: {
      family: "Instrument Sans",
      fallback: "'Helvetica Neue', Arial, system-ui, sans-serif",
      files: [
        // Instanz wdth 100, wght 400–700.
        { file: "instrument-sans-latin-wght.woff2", weight: "400 700", style: "normal" },
        { file: "instrument-sans-latin-ext-wght.woff2", weight: "400 700", style: "normal", unicodeRange: LATIN_EXT },
      ],
    },
  },
  preload: ["bricolage-latin-wght.woff2", "instrument-sans-latin-wght.woff2"],
  type: {
    display: { font: "display", size: "clamp(2.875rem, 1.9rem + 4.2vw, 6rem)", line: 1.02, track: "-0.04em", weight: 700 },
    figure: { font: "display", size: "clamp(2.75rem, 2rem + 3.2vw, 4.5rem)", line: 1, track: "-0.035em", weight: 650 },
    h2: { font: "display", size: "clamp(2.25rem, 1.45rem + 3.4vw, 4.75rem)", line: 1.06, track: "-0.035em", weight: 650 },
    h3: { font: "display", size: "clamp(1.375rem, 1.2rem + 0.75vw, 1.875rem)", line: 1.18, track: "-0.02em", weight: 600 },
    lede: { font: "text", size: "clamp(1.1875rem, 1.1rem + 0.4vw, 1.375rem)", line: 1.5, track: "0em", weight: 400 },
    body: { font: "text", size: "clamp(1.125rem, 1.09rem + 0.15vw, 1.1875rem)", line: 1.6, track: "0em", weight: 400 },
    small: { font: "text", size: "1rem", line: 1.5, track: "0em", weight: 400 },
    kicker: { font: "text", size: "1rem", line: 1.25, track: "0em", weight: 500 },
    link: { font: "text", size: "1.0625rem", line: 1.2, track: "0em", weight: 600 },
    mark: { font: "display", size: "clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)", line: 1, track: "-0.03em", weight: 700 },
    data: { font: "text", size: "1.0625rem", line: 1.35, track: "0em", weight: 600 },
  },
  space: {
    "2xs": ".25rem", xs: ".5rem", s: "1rem", m: "1.5rem", l: "2.5rem", xl: "4rem", "2xl": "6rem",
    section: "clamp(4.5rem, 3.3rem + 5vw, 8rem)",
    gutter: "clamp(1.25rem, 0.95rem + 1.3vw, 2rem)",
    measure: "36rem", max: "86.25rem",
  },
  // Abweichung 1: `shape` (Radien, Druckkante, Kippwinkel, Wolkenkante).
  shape: {
    radius: { s: "12px", m: "20px", l: "28px", pill: "999px" },
    press: "4px", tile: "3px", tilt: "1.5deg", edge: "cloud",
  },
  // Abweichung 2: `band` + `edge` je Palette. Abweichung 3: `tints` (genau vier Pastelle).
  palettes: [
    { id: "wald", name: "Wald", paper: "#f4f0e5", surface: "#ffffff", band: "#eae4d3", ink: "#14261d", muted: "#3f5045", rule: "#ddd6c3",
      accent: "#33684e", deep: "#1b3428", onDeep: "#f4f0e5", signal: "#be5219", onSignal: "#ffffff", edge: "#84360d",
      tints: [
        { id: "blau", bg: "#c9e0f2", ink: "#14261d", muted: "#34485a", edge: "#5488b2" },
        { id: "limette", bg: "#d6e59a", ink: "#14261d", muted: "#3b4a24", edge: "#93a452" },
        { id: "rosa", bg: "#f6d7e8", ink: "#14261d", muted: "#553a49", edge: "#b9849f" },
        { id: "pfirsich", bg: "#f9d8c0", ink: "#14261d", muted: "#57402f", edge: "#b98b69" },
      ] },
    { id: "himmel", name: "Himmel", paper: "#f5f1e8", surface: "#ffffff", band: "#e9e3d6", ink: "#16233b", muted: "#414c63", rule: "#dcd6c8",
      accent: "#28508f", deep: "#1d3157", onDeep: "#f5f1e8", signal: "#f2b632", onSignal: "#16233b", edge: "#16233b",
      tints: [
        { id: "himmel", bg: "#cfe3f6", ink: "#16233b", muted: "#33496a", edge: "#5d8fc4" },
        { id: "sonne", bg: "#f7e6a6", ink: "#16233b", muted: "#4f4423", edge: "#b89a3a" },
        { id: "pfirsich", bg: "#fad9c2", ink: "#16233b", muted: "#5a412f", edge: "#c08a64" },
        { id: "flieder", bg: "#e2dcf5", ink: "#16233b", muted: "#463e66", edge: "#8b7cc0" },
      ] },
    { id: "beere", name: "Beere", paper: "#f7f0ea", surface: "#ffffff", band: "#eee3da", ink: "#2b1627", muted: "#57424f", rule: "#e3d6cd",
      accent: "#8a2f62", deep: "#45203d", onDeep: "#f7f0ea", signal: "#c94a3a", onSignal: "#ffffff", edge: "#7d2a1f",
      tints: [
        { id: "rose", bg: "#f7d4de", ink: "#2b1627", muted: "#5a3644", edge: "#c0879a" },
        { id: "aprikose", bg: "#fbdcc0", ink: "#2b1627", muted: "#5b3f28", edge: "#c6915f" },
        { id: "flieder", bg: "#e6dcf3", ink: "#2b1627", muted: "#4a3b62", edge: "#9784bf" },
        { id: "butter", bg: "#f4e7ad", ink: "#2b1627", muted: "#4f4420", edge: "#b8a24b" },
      ] },
  ],
  // Hebt Handyfotos minimal an, wärmt einen Hauch zur Creme.
  imageFilter: "saturate(1.04) contrast(1.03) brightness(1.02) sepia(.04)",
};
```

## Offene Fragen an den Betreiber

1. **Himmel-Signal Sonne #f2b632:** freundlichster Knopf, hebt sich aber nur 1,6 : 1 vom Grund ab; gelöst über Tintenrand + Tintenkante. Okay so, oder lieber ein satteres Signal (z. B. Mandarine mit Tintenschrift)?
2. **Signal Wald dunkler als im Anker** (#be5219 statt #e8722c), damit Weiß AA hält. Alternative: Anker-Orange behalten und Knopfschrift in Tinte (5,19 : 1). Was ist dir lieber?
3. **„Wo steht ihr gerade?“** braucht ein neues Datenfeld (Einstiege nach Situation, ≥ 3 Einträge mit Titel + Satz). Soll das Studio das abfragen, oder bleibt der Block vorerst aus?
4. **Pille über dem Titel** ist Anker-Kern (Ort/Zielgruppe). Bleibt sie Pflicht, oder nur, wenn Ort und Zielgruppe in den Daten stehen?
5. **Schwaches-Foto-Einstieg** zeigt das Foto noch klein. Soll bei „mittel“ das Foto lieber ganz in die Galerie wandern (Einstieg wie „kein Foto“)?
6. **Kartenfotos in Angebotskarten** (wie im Anker) nur, wenn jedes Angebot eins hat: einverstanden, oder grundsätzlich weglassen?

## Bilder

1 Kopf · 2 Anker vermessen · 3 Schrift · 4 Stufen · 5 Raum, Form, Paletten · 6 Einstieg nach Fotolage · 7–8 Bausteine · 9 Bilder und Bewegung · 10 Handy erster Blick (Kita ohne Foto, Fellfreunde gutes Foto, Gelato Mio schwaches Foto) · 11–15 ganze Seiten Handy 390 · 16–17 Desktop Fellfreunde · 18 Desktop Kita Pusteblume ohne Foto · 19 Endwerte (TS).
