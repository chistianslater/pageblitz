# Self-hosted Fonts

## Space Grotesk (Systemschrift: Landing, Studio, Dashboard, Admin)

- Datei: `space-grotesk-latin-wght.woff2` — **eine** Variable-Font-Datei
  (Achse `wght` 300–700), Subset **latin** (deckt Deutsch inkl. Umlaute/ß,
  Euro-Zeichen, typografische Anführungszeichen/Gedankenstriche ab),
  22 320 Bytes.
- Quelle: Google Fonts, Familie „Space Grotesk" v22
  (`https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff2`,
  identisch mit dem latin-Eintrag der CSS-API-Antwort für
  `family=Space+Grotesk:wght@300..700`, abgerufen 2026-08-23).
  Upstream-Projekt: https://github.com/floriankarsten/space-grotesk
- Lizenz: SIL Open Font License 1.1 — siehe `OFL.txt` (Copyright 2020 The
  Space Grotesk Project Authors).
- Eingebunden über `@font-face` in `client/src/index.css` (`font-display:
  swap`, `unicode-range` latin) und `<link rel="preload" as="font">` in
  `client/index.html`. Die Datei wird von `server/_core/static.ts` mit
  einem Jahr `immutable`-Cache ausgeliefert — **bei einem Font-Update die
  Datei umbenennen** (z. B. Versionssuffix), sonst sehen Rückkehrer den alten
  Stand.
- Nicht enthalten: latin-ext/vietnamese-Subsets (Zeichen außerhalb latin
  fallen auf `system-ui`), kursive Schnitte (Space Grotesk hat keine).

## Barlow Condensed 700 (Landing-Display, nur `.lp`)

- Datei: `barlow-condensed-latin-700.woff2` — Schnitt **700**, Subset
  **latin**, 22 444 Bytes.
- Quelle: Google Fonts, Familie „Barlow Condensed" v13
  (`https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B46r2z3bWuQ.woff2`,
  latin-Eintrag der CSS-API für `family=Barlow+Condensed:wght@700`,
  abgerufen 2026-08-29).
- Lizenz: SIL Open Font License 1.1 (Copyright 2017 The Barlow Project
  Authors, https://github.com/jpt/barlow).
- Nur auf der Marketing-Landingpage als Display-Schrift (Versalien,
  0.9 Zeilenhöhe). Studio, Dashboard und Admin bleiben bei Space Grotesk.

Die v2-Style-Packs der Kundenseiten laden ihre eigenen Schriften weiterhin
von Google Fonts (SSR-Head aus der Pack-Verfassung bzw.
`client/src/lib/packFonts.ts` im CSR-Fallback) — das ist hier bewusst nicht
enthalten.
