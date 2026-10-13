# Projektstand (2026-08-29, Nachtrag 2026-10-13)

> **Nachtrag 2026-10-13 („Packs entfernen“):** Das alte Style-Pack-System ist
> weg. Kundenseiten rendern ausschließlich über eines von sieben Designsystemen
> (rev 3: `journal`, `raster`, `werkstoff`, `plakat`, `klar`, `nacht`,
> `freundlich` — Freundlich live seit 2026-10-13). Die 20 früheren Pack-Verfassungen
> leben nur als **Textstimmen** (`shared/textVoices/`) weiter. Rollback nur
> per Commit-Deploy, siehe `docs/BETRIEB-V2.md` §3. Die Landing-Tabellen unten
> sind Stand 2026-08-29 (Landing selbst: `LANDING.md`, inzwischen `Klarstart`).

## Live auf `main`

Commit **`4a5b74d`**. Produktion zieht von `origin/main` (VPS + PM2).

### Zuletzt gemergte Landing-Arbeit (nicht wiederholen)

| PR | Commit / Merge | Was |
|---|---|---|
| #38 | KI-Website-Chat | Kunden-Chat als klassischer Messenger |
| #39 | `52f66db` | Brutalist-editorial: Grau/Mint/Carbon auf `.lp` |
| #40 | `31d399f` | Space Grotesk wieder Display; Remotion-Hero |
| #41 | `1b1e04e` | Apple-optical: Tracking nach Größe, Glass-Nav, Press |
| #42 | `4a5b74d` | Dayos-Sektionsrhythmus (Billboard, Echo, Manifesto, Pillars) |

Referenz der letzten Design-Runde: [dayos.com](https://www.dayos.com/).
Der Betreiber fand die **einzelnen Sektionen** dort cool — nicht einen
1:1-Klon von Copy oder Produkt.

## Architektur (kurz)

| Teil | Pfad |
|---|---|
| Marketing `/` | `client/src/pages/LandingPage.tsx` + `client/src/components/landing/` |
| Landing-Tokens | `client/src/index.css` → Block `.lp { … }` |
| Studio | `client/src/pages/onboarding-v2/`, Server `server/onboardingV2/` |
| 7 System-Renderer | `client/src/components/site/systems/<id>/` (Definitionen `shared/designSystems/`) |
| Vertrag | `shared/siteContract/` (Zod `.strict()`) |
| Generierung | `server/generationV2/runJob.ts` |
| SSR Kundenseiten | `server/ssr/` |
| Preise | `shared/pricing.ts` |
| FAQ | `shared/faq.ts` |
| Systeme (IDs) | `shared/designSystems/types.ts` |
| Textstimmen (nur Texterzeugung) | `shared/textVoices/` (IDs `shared/siteContract/packIds.ts`) |

v1-Onboarding/Layouts/Chat sind gelöscht (B4b). Kein `PB_LAYOUT_V2`-Flag mehr.
Details: `docs/BETRIEB-V2.md`.

## Was bewusst offen / unangetastet ist

- **`Testimonials.tsx`**: leere Liste, Sektion rendert nichts. Erst füllen,
  wenn echte, nachweisbare Stimmen da sind.
- **Studio-Look** (Papier/Grün, Space Grotesk) — nicht Teil der Dayos-Runde.
- **Start-Funnel `/start`**, Rechtsseiten, SEO-Branchenseiten — nicht
  restyled.
- **Hero-Film-Stimme** (Arial Black, Werkbank „Maßarbeit / aus Holz. / Punkt.")
  — nur ändern, wenn ausdrücklich gewünscht.
- Lokale untracked Snapshots (`islands-werkbank-features-*.png`) gehören nicht ins Repo, solange niemand einen
  Visual-Test dafür committet.

## Sinnvolle nächste Schritte (nicht beauftragt)

Nur falls der Betreiber danach fragt — nicht von allein anfangen:

1. Production-Deploy nach `main` (VPS-Reset auf `origin/main`).
2. Echte Kundenstimmen → `Testimonials.tsx`.
3. ~~Kontaktadresse angleichen~~ — erledigt 2026-10-13: überall `hello@pageblitz.de`.
4. Landing weiter feilen: Echo-Stärke, Manifesto-Länge, Showroom — nur
   nach sichtbarem Feedback, kein dritter Token-Reset.

## Lokaler Start

```bash
npm run dev
# http://localhost:3000/   Landing
# /onboarding/:token       Studio
# /demo/system/<system>/<beispiel>   System-Demo (/demo/<alte Pack-ID> leitet per 301 dorthin)
```

Inseln-Bundle wird im Dev **nicht** automatisch gebaut:
`npm run build:islands` vor Tests an Kundenseiten.

## Kontakt / Marke

- Wordmark: Blitz + „Pageblitz“ (`primitives.tsx`)
- Mail: `hello@pageblitz.de`
- Instagram: `https://www.instagram.com/pageblitz.de`
