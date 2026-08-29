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
Website-Vorschau. 14 kuratierte Style-Packs, Studio unter `/onboarding/:token`,
Live-Vorschau same-origin `/preview-ssr/<token>`.

## Preise (einzige Quelle)

Nur `shared/pricing.ts`: Basis **19,90 €**/Monat jährlich bzw. **24,90 €**
monatlich. Keine erfundenen Preise, keine erfundenen Testimonials.

## 14 Packs — kein 15.

`werkbank`, `patina`, `kanzlei`, `salon-noir`, `morgenlicht`, `marktplatz`,
`gusto`, `landgut`, `atelier`, `klarwerk`, `verve`, `zunft`, `schimmer`,
`fundament` — IDs in `shared/siteContract/packIds.ts`.

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
