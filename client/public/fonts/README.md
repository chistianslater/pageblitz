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

Die v2-Style-Packs der Kundenseiten laden ihre eigenen Schriften weiterhin
von Google Fonts (SSR-Head aus der Pack-Verfassung bzw.
`client/src/lib/packFonts.ts` im CSR-Fallback) — das ist hier bewusst nicht
enthalten.
