# B7 Feinschliff-Regelwerk — globale Strukturqualität aller 14 Packs

**Status:** verbindlich für die Feintuning-Wellen (B7 Task 6a–c) · **Quelle:** User-Feedback 2026-08-23 („Leistungen sehr weit linksbündig", „Über uns: riesiges Bild und verlorener Text", „Header setzt sich nicht ab, nicht sticky — grundsätzliche Schwächen global mit dem passenden Skill überarbeiten") + Eigen-Kritik `.superpowers/sdd/2026-08-23-b7/pack-fixliste.md`.

**Grundsatz:** Die Verfassungs-Identität jedes Packs (Signatur-Komposition, Palette, Typo, Dekor) bleibt unangetastet — dieses Regelwerk definiert die handwerkliche Untergrenze, die JEDES Pack in seiner eigenen Sprache erfüllen muss. Kein Pack darf danach aussehen wie ein anderes; aber keines darf mehr gegen diese Regeln verstoßen. Umsetzung mit `impeccable`-Skill (craft-floor lesen!).

## R1 — Navigation/Header
- **Sticky überall:** `position: sticky; top: 0` (oder Pack-Variante wie morgenlicht/schimmer mit `top: 12px`-Pille) + sinnvoller `z-index` (über allen Sektionen, unter Modals).
- **Klar abgesetzt:** Im gescrollten Zustand muss die Nav sich vom Inhalt trennen — je Pack-Sprache: Grundfläche (canvas/surface/ink) + 1px-Hairline unten, ODER Pillen-/Karten-Form mit Schatten (morgenlicht), ODER Vollton (dunkle Packs). Nie transparent über Inhalt schwebender Text. Wenn der Hero denselben Grund hat, reicht die Hairline; bei Bild-Heroes braucht die Nav eine Fläche.
- Aktive/Hover-Zustände der Links bleiben wie in B6 (aria-current-Unterstreichung).
- Mobil: Nav darf umbrechen, aber kontrolliert (max 2 Zeilen, kleinere Schrift) — kein Zeilen-Chaos.

## R2 — Sektions-Container & Balance („weit linksbündig")
- Jede Sektion sitzt in einem Container mit `max-width` (Richtwert 1160–1240px, Pack darf enger/weiter, aber bewusst) und **ausgewogener** Nutzung der Breite: kein Inhalt, der bei 1440px links klebt und rechts > 35 % tote Fläche lässt — außer die Asymmetrie ist Signatur UND die Restfläche ist gestaltet (Dekor, Nummer, Linie, Bild).
- **Leistungen/Services:** Karten/Zeilen füllen das Raster — Desktop 2–3 Spalten (bzw. Pack-Signatur wie Zeilenliste), gleiche Kartenhöhen pro Reihe (`align-items: stretch`), letzte unvollständige Reihe bewusst gesetzt (zentriert, gespannt oder mit Abschluss-Element) statt links verwaist.
- Überschrift + Intro einer Sektion gehören sichtbar zur Sektion (Abstand nach oben > Abstand nach unten zur eigenen Liste).

## R3 — Über uns (Bild/Text-Balance)
- Bild und Text teilen sich die Breite in einem bewussten Verhältnis (z. B. 5/7, 6/6, 7/5) — das Bild dominiert nie so, dass der Text „verloren" wirkt: Text-Spalte ≥ 40 % der Breite auf Desktop, Fließtext `max-width` 55–65ch, Zeilenhöhe ≥ 1.55.
- Bilder mit festem Seitenverhältnis (`aspect-ratio` + `object-fit: cover`, Fokus über `object-position`), nie natürliche Riesenhöhe; Rahmen/Behandlung laut Verfassung (`imageTreatment`).
- Auf Mobil: Bild oben in kontrollierter Höhe (max ~55vw), Text direkt darunter.

## R4 — Bilder allgemein
- Jede `<img>` mit definiertem Verhältnis (aspect-ratio oder feste Box) + `object-fit: cover`; keine Vollbreiten-Bilder in natürlicher Höhe, keine Briefmarken (< 280px Breite auf Desktop) als Sektions-Hauptbild.
- Galerie: einheitliche Kachel-Verhältnisse je Pack (z. B. 4:3 oder 1:1), Lücken über `gap`, kein Mauerwerk-Zufall.
- Illustrations-Packs (klarwerk, fundament, verve, salon-noir, marktplatz, atelier): Illustration auf passendem Grund (Verfassung `imageTreatment` — Rahmen/Fläche), nie randlos-fotografisch behandelt.

## R5 — Rhythmus & Typo
- Vertikaler Sektionsabstand konsistent aus einer Skala (z. B. `clamp(56px, 5vw+24px, 112px)`), keine Doppel-Paddings an Sektionsgrenzen (Sprung > 1,5× Skala = Fehler).
- Fließtext nie breiter als 65–70ch; Headlines mit `text-wrap: balance`; keine einzelnen Widow-Wörter in Heroes (manueller Umbruch/`max-width` in ch).
- Kleintext ≥ 13px, Kontraste wie gehabt ≥ 4,5:1 (accent-text-Regeln aus B6 Task 9 nicht rückbauen).

## R6 — Unterseiten
- `pageHeader` wirkt zugehörig: gleicher Container/Rhythmus wie die Startseite, unter der (sticky) Nav mit ausreichend Abstand; erste Content-Sektion beginnt nicht doppelt eingerückt.

## Verfahren je Welle
1. Agent lädt `impeccable` (craft-floor) + dieses Regelwerk + die Pack-Abschnitte der Fixliste.
2. Je Pack: Screenshots vorher (Desktop/Mobil/Unterseite) → Regeln R1–R6 + P1/P2-Fixes umsetzen (nur `packs/<pack>/css.ts` + `index.tsx`, Verfassung nur wenn ein Wert dort dokumentiert gehört) → Screenshots nachher → selbst vergleichen, eine Korrekturrunde.
3. Gates: tsc 0, vitest (moduleParity!), `packs.spec.ts` Baselines der Welle neu (2. Lauf grün), a11y grün, `npm run build:previews` für die Wellen-Packs (eigener Server, sauber beenden), Farbassertionen unverändert.
4. Vorher/Nachher-Bildpaar je Pack in den Scratchpad für die Abnahme; Katalog-Artifact wird nach jeder Welle aktualisiert.
