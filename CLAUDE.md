# Pageblitz — Einstieg für Claude Code

Deutsche Website-Baukästen-App für lokale Betriebe. Domain: **pageblitz.de**.
Dieses File zuerst lesen, dann `docs/claude-handoff/`.

- **Aktueller Stand:** `docs/claude-handoff/STAND.md`
- **Landing (Showroom `/`):** `docs/claude-handoff/LANDING.md`
- **Harte Regeln:** `docs/claude-handoff/REGELN.md`
- **Betrieb (Build, Deploy, DB):** `docs/BETRIEB-V2.md`

Antworten an den Betreiber: **Deutsch, informell (du)**.

## Produkt in einem Satz

Pageblitz erzeugt aus Firmenname oder Google-Profil in ~3 Minuten eine fertige
Website-Vorschau. 7 Designsysteme mit je 3 Farbstimmungen, Studio unter `/onboarding/:token`,
Live-Vorschau same-origin `/preview-ssr/<token>`.

## Preise (einzige Quelle)

Nur `shared/pricing.ts`: Jahrestarif **19,90 €**/Monat bei 12 Monaten
Laufzeit (monatlich abgebucht, Verlängerung um 12 Monate, 1 Monat Frist),
Monatstarif **24,90 €**/Monat monatlich kündbar, alles inkl. 19 % MwSt.
Texte nur aus `shared/pricingText.ts` (Wächter: `server/pricingLiterals.test.ts`),
Regeln in `docs/BETRIEB-V2.md` „Preise & Laufzeit“. Keine erfundenen Preise,
keine erfundenen Testimonials.

## 7 Designsysteme — kein 8.

`journal`, `raster`, `werkstoff`, `plakat`, `klar`, `nacht`, `freundlich` — je System drei
Farbstimmungen. IDs in `shared/designSystems/types.ts`, Definitionen in
`shared/designSystems/<id>.ts`, Zuordnung Branche → Systeme in
`shared/designSystems/assignment.ts`. Renderer: `client/src/components/site/systems/<id>/`.
Alle sieben sind freigeschaltet (Freundlich seit 2026-10-13: Kita, Hebamme,
Tiere, Eisdiele, Kinderkurse, Kinderfotografie).

- **Nur rev 3.** Jede Kundenseite trägt `designRevision: 3` + `system` +
  `palette`. Das alte Pack-System (Renderer, Bühne/Farbfläche, Fassungen,
  Schriftpaare, Farbwelten) ist entfernt; alte Stände (rev 1/2) werden an
  jeder Lesegrenze per `asSystemDoc` in ein System-Dokument gewandelt.
- **Textstimmen** (`shared/textVoices/`, 20 Stück, IDs in
  `shared/siteContract/packIds.ts`) steuern nur noch die Texterzeugung — keine
  Farben, Schriften oder Formen. Das Feld heißt aus Rollback-Gründen weiter
  `stylePackId`. Keine neue Stimme/Pack-ID ohne Auftrag.
- **Byte-Gleichheit:** Das SSR-HTML der Systeme ändert sich nur bewusst.
  Nachweis mit `scripts/seiten-fingerabdruck.ts` (Basis vorher, Vergleich nachher).

## Landing vs. Studio

| Fläche | Tokens | Anfassen |
|---|---|---|
| Marketing `/` (Klasse `.lp`) | Grau `#e5e5e5`, Mint `#d1ffca`, Volt `#fff100`, Carbon-CTAs | `client/src/index.css` unter `.lp`, `client/src/components/landing/` |
| Studio / Kunden-Sites | Papier/Grün in `:root` und `studio.css` | **nicht** für Marketing-Looks umstylen |

## Commands

```bash
npm run dev          # Dev-Server, Default-Port 3000
npm run check        # tsc --noEmit
npm run test         # vitest
npm run test:visual  # Playwright (Projekt dev)
npm run build        # vite → islands → server-bundle
```

Produktion deployt von **`origin/main`**. Nach Merge: auf dem VPS
`git fetch && git reset --hard origin/main && npm run build && pm2 restart pageblitz`
(Details: `docs/BETRIEB-V2.md`, Key `~/.ssh/claude_pageblitz`).
