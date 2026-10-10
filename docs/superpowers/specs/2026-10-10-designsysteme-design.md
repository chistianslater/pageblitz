# Designsysteme für Kundenseiten — Konzept

**Datum:** 2026-10-10 · **Status:** vom Betreiber im Gespräch freigegeben, Spec zur Durchsicht

## 1. Ziel

Kundenseiten sollen zwei Dinge gleichzeitig leisten:

1. **Wow in den ersten 5 Sekunden.** Der Betrieb (Postkarte → Vorschau auf dem Handy)
   denkt: „Das ist besser als alles in meiner Branche.“
2. **Agenturqualität bis zum Fuß.** Jede Seite hält dem Blick eines Designers
   stand, durchgehend.

Maßstab für die Qualität sind die Entwürfe Journal/Raster/Plakat aus der
Sitzung vom 2026-10-10 (`.superpowers/brainstorm/…/systeme-beispiel.html`),
typografisch und im Spacing noch strenger umgesetzt.

## 2. Diagnose: warum es heute zusammengewürfelt wirkt

Eine Seite entsteht heute aus unabhängig gemischten Schichten: 20 Packs
(Farbe/Schrift) × 2 Einstiege (Bühne/Farbfläche) × 3 Fassungen × 6 Abschnitte
mit je 3 Fassungen (per Modulo verteilt, `entryLayouts.ts`) × 12 Branchen-
Baupläne × freie Schriftpaare und Farbwelten. Viele Kombinationen, keine davon
ist gestaltet. Jeder Abschnitt hat seine eigene Idee. Ausgezeichnete Seiten
halten **eine** Idee von oben bis unten durch.

## 3. Grundprinzip

**Ein System ist ein vollständiges, durchgestaltetes Design, kein Thema.**
Variiert wird pro Betrieb nur: System, Farbstimmung, Inhalte, Fotos.

Jedes System legt fest:

| Ebene | Inhalt |
|---|---|
| Schriftskala | feste Stufen; je Stufe Größe, Zeilenhöhe, Laufweite (nach Größe, groß = enger), Gewicht; Kursiv-Regeln; `hyphens`, `text-wrap: balance/pretty`, deutsche Umbrüche |
| Abstandsrhythmus | Basiseinheit und eine Skala; Abschnitts-, Block- und Überschrift→Text-Abstände nur aus der Skala |
| Raster | eigenes Raster für Handy (375) und Desktop (1440), Zwischenstufe 768 |
| Bildbehandlung | Zuschnitt, Formen, Farbbehandlung, Bildunterschriften, **Regeln für schwache Fotos** (Schrift und Aufbau müssen die Seite tragen, nicht das Foto) |
| Bewegung | Erscheinen des Einstiegs, Hereinkommen der Abschnitte; sparsam; `prefers-reduced-motion` |
| Abschnitte | Einstieg, Leistungen, Über uns, Stimmen, Ablauf, Gut zu wissen, Preise/Speisekarte-Platzhalter, Team, Kontakt, Fuß, Unterseiten (Impressum, Datenschutz, Galerie) — **je System eigens gestaltet**, keine geteilten Fassungen |
| Farbstimmungen | 3 kuratierte Paletten je System, keine freie Farbwahl |

**Bleibt unverändert:** Branchen-Baupläne (`blueprints.ts`, `blueprintFamilies.ts`)
bestimmen weiterhin Abschnitte, Reihenfolge, Hauptaktion, Vertrauenszeichen,
Vokabular. Texterzeugung, Fotoprüfung (`heroPhoto.ts`), Unsplash-Ergänzung,
Seitenvertrag, Studio-Grundablauf.

**Fällt weg (nach vollständiger Umstellung):** 20 Packs, Einstiege
Bühne/Farbfläche mit `ENTRY_VARIANT`, Abschnitts-Fassungen a/b/c
(`entryLayouts.ts`), `alternativeLooks`, freie Schriftpaare (`PACK_FONT_PAIRS`).

## 4. Die 6 Systeme

| System | Charakter | Schrift-Idee | Bild |
|---|---|---|---|
| **Journal** | Magazin, ruhig, gebildet | Serife leicht + kursiv, kleine gesperrte Grotesk | Bildunterschriften, Bildpaare in zwei Größen, Haarlinien |
| **Raster** | Swiss, präzise, sachlich | eine Grotesk, nur Größe/Gewicht | Schwarzweiß kontrastreich, sichtbares Spaltenraster, große Zahlen, eine Signalfarbe |
| **Plakat** | laut, fröhlich, selbstbewusst | schmale Display-Schrift + ruhige Grotesk, wenige Wörter, riesig | in Formen geschnitten (Bogen, Kreis, Pille), Sticker |
| **Nacht** | dunkel, edel, Abendstimmung | feine Serife oder elegante Grotesk, viel Luft | abgedunkelt, wenige große Bilder |
| **Werkstoff** | warm, Material, ehrlich | Grotesk mit Charakter oder Slab | warme Töne, Nahaufnahmen, Material-Flächen |
| **Klar** | ruhig, vertrauensvoll, freundlich | humanistische Grotesk, gut lesbar | hell, viel Weißraum, weiche Ecken |

Konkrete Schriften, Skalen und Paletten entstehen je System im Schritt
„Systemblatt“ (Abschnitt 7) auf Basis des freigegebenen Referenz-Boards.

## 5. Zuordnung Branche → System

Haupt = Vorschlag bei Erzeugung; Alternativen = die zwei weiteren Vorschläge im
Studio. Die drei sind je Familie immer verschieden.

| Branchenfamilie | Haupt | Alternative 1 | Alternative 2 |
|---|---|---|---|
| Friseur / Kosmetik | Journal | Nacht | Plakat |
| Barbier | Plakat | Nacht | Raster |
| Handwerk / Haus-Dienste | Werkstoff | Raster | Plakat |
| Restaurant | Nacht | Journal | Werkstoff |
| Imbiss | Plakat | Werkstoff | Raster |
| Café / Bäckerei | Werkstoff | Journal | Plakat |
| Gesundheit / Praxis | Klar | Journal | Raster |
| Beratung | Raster | Klar | Journal |
| Handel | Werkstoff | Journal | Plakat |
| Auto / Werkstatt | Raster | Plakat | Nacht |
| Kurse / Fitness | Plakat | Klar | Raster |
| Unterkunft | Journal | Nacht | Werkstoff |
| Kreativ | Journal | Raster | Plakat |
| Sofort-Dienst | Raster | Klar | Plakat |
| Hersteller / Industrie | Raster | Werkstoff | Klar |
| Rest (ohne Familie) | Raster | Journal | Klar |

Barbier und Restaurant/Imbiss/Café sind Unterarten, die `blueprints.ts`
schon erkennt (Barber-Erkennung über Name „barb|herren“ in der Beauty-Familie,
`GastroKind`); die Zuordnung liest diese vorhandene Unterart.

**Palette:** aus den 3 Paletten des Systems wird nach Branche gewählt; liegt
eine Logo- oder Fotofarbe vor, gewinnt die Palette mit dem nächsten Akzent
(Farbabstand, `colorMath.ts`).

## 6. Technischer Einbau

- **Seitenvertrag:** `designRevision: 3`; neue Felder `system`
  (`journal|raster|plakat|nacht|werkstoff|klar`) und `palette` (ID innerhalb des
  Systems). Zod `.strict()` wie bisher. Rev 1/2 rendern unverändert weiter.
- **Definitionen:** `shared/designSystems/` — je System eine Datei mit Tokens
  (Skalen, Paletten, Schriften) und Metadaten; `assignment.ts` mit der Tabelle
  aus Abschnitt 5; `index.ts` als Register.
- **Renderer:** `client/src/components/site/systems/<system>/` — je System in
  sich geschlossen: eigene Abschnitts-Komponenten und eigenes CSS auf Basis der
  Tokens. Gemeinsam bleiben nur reine Datenhelfer (z. B. `heroFacts.ts`,
  Öffnungszeiten-Formatierung), keine gemeinsamen Layout-Bausteine.
- **SSR/Inseln:** `server/ssr/` wählt bei rev 3 den System-Renderer; Inseln
  (Navigation, Dock, Akkordeons) werden pro System gestylt, Logik geteilt.
- **Schriften:** selbst gehostet, `font-display: swap`, höchstens 2 Schnitte
  vorgeladen je System.
- **Generierung:** `runJob.ts` setzt bei rev 3 `system` (Haupt) und `palette`;
  Texterzeugung unverändert.
- **Studio:** `DesignSplash.tsx`, `StylePanel.tsx`,
  `server/onboardingV2/router.ts` zeigen 3 Systeme (Haupt + 2 Alternativen)
  und darunter die 3 Paletten des gewählten Systems. Keine Schriftwahl.
  Vorschau-Parameter `?system=&palette=`.
- **Schrittweise Freischaltung:** Ein System ist erst nach Abnahme aktiv
  (Liste `RELEASED_SYSTEMS`). Neue Seiten bekommen rev 3, wenn ihr Hauptsystem
  freigeschaltet ist; Alternativen ohne fertiges System fallen auf heutige
  Packs zurück.
- **Design-Übersicht:** `/design-review` zeigt je System die Prüfbetriebe in
  allen Paletten (Handy/Desktop).

## 7. Ablauf je System (Abnahme-Kette)

1. **Referenz-Board** — 8–12 echte Seiten (Refero, Award-Seiten, Web) →
   Freigabe durch den Betreiber.
2. **Systemblatt** — Schriftskala, Abstandsskala, Raster, 3 Paletten,
   Bildregeln, Bewegung auf einer Seite → Freigabe.
3. **Ganze Seite** — 3 echte Betriebe aus der DB (mindestens einer mit
   schwachen Fotos), bei 375/768/1440, in allen 3 Paletten, inkl. Unterseiten.
4. **Prüfung** — `impeccable`-Audit, `apple-design`-Audit, Kontrast (WCAG AA),
   Tastatur, reduzierte Bewegung, Lighthouse (LCP < 2,5 s, CLS < 0,1,
   kein horizontales Scrollen).
5. **Abnahme** durch den Betreiber → mergen, deployen, System freischalten.

**Skills:** Recherche `refero-design`; Gestaltung `high-end-visual-design`,
`design-taste-frontend`, `emil-design-eng`; Bewegung `motion-design`; Prüfung
`impeccable`, `apple-design`.

**Reihenfolge:** Journal (Postkarten-Betriebe Friseur/Kosmetik,
typografisch anspruchsvollstes) → Raster → Werkstoff → Plakat → Klar → Nacht.
Journal setzt den Maßstab; erst nach seiner Abnahme beginnen die anderen.

## 8. Umstellung des Bestands

Erst nachdem alle 6 Systeme abgenommen sind:

1. Sicherung `generated_websites` auf dem VPS.
2. Die 35 Seiten (32 Postkarten 558–607 ohne 593, 504 Demo-Werkstatt,
   613 Wilde Aparthotels) per `website.regenerate({ keepLinks: true })` bzw.
   `scripts/regenerate-keep-links.ts` auf rev 3 mit Hauptsystem setzen —
   Texte, Fotos, Slug, Token, Status bleiben; Verlaufsstand vorher.
3. Packs, Bühne/Farbfläche, Fassungen a/b/c, `alternativeLooks`,
   `PACK_FONT_PAIRS` samt Tests entfernen.
4. `CLAUDE.md` („20 Packs — kein 21.“ → „6 Systeme“), `docs/claude-handoff/`
   und Memory aktualisieren.

## 9. Tests

- Unit: Zuordnung Familie/Unterart → (Haupt, Alt1, Alt2) für alle Familien,
  drei verschiedene Systeme je Zeile; Palettenwahl nach Akzentfarbe.
- Schema: rev 3 mit `system`/`palette`, Ablehnung unbekannter Werte.
- Renderer: jeder Abschnitt jedes Systems rendert mit vollem und minimalem
  Inhalt (fehlende Fotos, keine Bewertungen, kein Team).
- Playwright: Screenshot-Vergleich je System × Palette × 375/1440.

## 10. Risiken

- **Webfonts / Ladezeit:** max. 2 vorgeladene Schnitte, Subsetting.
- **Unterseiten** müssen mitgestaltet werden, sonst bricht der Look beim Klick.
- **Schwache Fotos:** jedes System braucht eine Fassung, die ohne gutes
  Titelbild trägt (Typo-Einstieg).
- **Aufwand:** ein System bis zur Abnahme ≈ eine konzentrierte Arbeitsrunde;
  alle sechs plus Umstellung = mehrere Sitzungen.
- **Parallelbetrieb rev 2/3** bis zur Umstellung: Studio muss beide sauber
  anzeigen.

## 11. Nicht Teil dieses Vorhabens

Landing-Seite `/`, Studio-Look selbst, Texterzeugung/Prompts, Preise,
neue Branchenfamilien.
