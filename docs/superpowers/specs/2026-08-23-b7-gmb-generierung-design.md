# Spec-Entwurf: Plan B7 — GMB-Wahrheit, vollständige Erstgenerierung, Warte-UX, Pack-Feintuning

**Datum:** 2026-08-23 · **Status:** verbindlich (freigegeben 2026-08-23, „Das passt" — §5 alle wie empfohlen; „Zeitmaschine" = sichtbarer Aufbau der Website) · **Anlass:** User-Feedback nach B6-Livegang: (1) Packs von der Richtung passend, im Detail nicht feingetunt (Positionierung, Aufteilung, Bilder); (2) Wartezeit der Generierung braucht „Zeitmaschinen-Effekt" + bewegten Fortschrittsbalken; (3) System nutzt GMB nicht wirklich — SCHAU & HORCH bekam Texte über „Optik und Akustik"; (4) Erstwebsite wirkt leer/verloren.

## 0. Diagnose (auf Prod verifiziert, Website 491 „SCHAU & HORCH")

- **GMB wird gefunden, aber kaum genutzt.** Place-ID, Adresse (Bocholt), Rating 5,0/13 Reviews sind da. Aber: `category` = **„schau & horch"** — `extractGmbCategory(place.types)` findet bei diesem Place nur generische Types und fällt auf den **Suchbegriff = Firmenname** zurück (`server/routers.ts:389` u. a.). Der LLM rät aus „Schau & Horch" → „Präzisionsoptik und Akustik".
- **Stadt halluziniert:** Hero-Subline „…In München." — `facts.city` kommt aus `searchRegion` (leer beim Hero-Formular), die echte GMB-Adresse („…46395 Bocholt") wird nicht geparst; der LLM erfindet eine Stadt und nichts korrigiert sie (`server/generationV2/facts.ts`).
- **Daten liegen brach:** `businesses.website`, `openingHours`, `googleReviews` sind für diesen Place NULL — Website-URL, Öffnungszeiten, Review-Texte, Editorial Summary und weitere Fotos werden beim Details-Abruf gar nicht angefragt; nur 1 Foto landet im Hero.
- **Ergebnis dünn:** 4 Sektionen (hero, services×3, about, contact) — keine Bewertungen (obwohl 13×5,0!), keine Galerie, keine FAQ, keine Öffnungszeiten → „leer und verloren".

## 1. Ziel

Die Erstgenerierung wird **faktentreu** (Branche, Stadt, Leistungen aus GMB + echter Website des Betriebs, nie geraten) und **vollständig** (6–8 Sektionen mit echten Bewertungen, Fotos, Öffnungszeiten), die Wartezeit wird zur Show („Zeitmaschine": die Website baut sich sichtbar Sektion für Sektion auf, Fortschritt läuft immer), und die 14 Packs bekommen eine systematische Detail-Feintuning-Runde.

## 2. Umfang

### 2.1 GMB-Tiefenabruf & Branchenwahrheit
- Places-Details-Abruf erweitern (Felder: `types`, `website`, `editorial_summary`, `opening_hours`, `reviews`, `photos` bis 8, `formatted_address`, `address_components`); Ergebnisse in `businesses` persistieren (`website`, `openingHours`, `googleReviews`, neue Spalte `editorialSummary` — additive Migration 0030). Zusätzlich **Places API v1** für `primaryTypeDisplayName` (deutsch, z. B. „Werbeagentur") — beste Kategoriequelle; Fallback-Kette: primaryTypeDisplayName → spezifischer `types`-Eintrag (Mapping-Tabelle DE) → **Kategorie-Rückfrage im Studio** (Branchen-Auswahl vor der Generierung, wenn nichts Belastbares da ist). **Nie** der Firmenname.
- **Website-Crawl:** hat der Betrieb eine Website (GMB-Feld), holt der Job die Startseite (nur diese, 10 s Timeout, max ~200 kB, robots.txt respektieren), extrahiert Title/Meta-Description/sichtbaren Text (~2.000 Zeichen) → als `facts.existingSite` in den LLM-Prompt („Das macht der Betrieb wirklich"). Fehler → weiter ohne.
- Stadt/PLZ/Straße deterministisch aus `address_components` bzw. `formatted_address` parsen → `facts.contact` vollständig; `searchRegion` nur noch Nachrangquelle.

### 2.2 Vollständige, faktentreue Erstgenerierung
- Sektions-Soll je Branche: hero, services (4–6), about, **testimonials aus echten Google-Reviews** (Vorname + Sternchen, max 3, nur ≥ 4 Sterne), **gallery aus GMB-Fotos** (wenn ≥ 3 brauchbare), faq (4–6), contact **mit Öffnungszeiten** — Ziel 6–8 Sektionen statt 4. Fotos wie bisher über den Bild-Proxy/R2, nicht als Google-URL mit API-Key im Markup (heute leakt die Hero-URL den Places-Key! — prüfen/ersetzen).
- **Halluzinations-Guard nach dem LLM:** Städte-/Ortsnamen im generierten Text müssen aus den Fakten stammen (Abgleich gegen Stadt aus 2.1; fremde Stadt → Ersetzen/Retry); Branchenbegriffe müssen zur Kategorie passen (Retry mit explizitem Hinweis). Tests mit dem SCHAU-&-HORCH-Fall als Fixture.
- `industry`/`businessCategory` konsistent gespeichert (Website 491: `industry` NULL, `cat2` = Name — aufräumen).

### 2.3 Warte-UX „Zeitmaschine"
- `GenerationScreen` zeigt früh das Vorschau-iframe: erst Pack-Skeleton (Canvas + Platzhalterblöcke in Pack-Farben), dann **faden die echten Sektionen nacheinander ein**, sobald der Job sie liefert (Job schreibt Zwischenstand: nach Bild-Phase Doc mit Bildern + Platzhaltertexten, nach LLM-Phase final — Vorschau pollt wie heute und rendert Zwischenstände). Dazu ein **kontinuierlich animierter Fortschrittsbalken** (nie stehend: zeitbasiertes Easing zwischen Phasen-Ankern, wie bisherige `PHASE_BOUNDS`) + Phasentexte. *Interpretation „Zeitmaschine" = die Website entsteht sichtbar vor den Augen; bitte in §5 bestätigen.*

### 2.4 Pack-Feintuning (Detailrunde über alle 14)

**Nachtrag (User, 2026-08-23):** Es geht nicht nur um Einzel-Markierungen, sondern um **globale, systematische Schwächen**, die einmal komplett überarbeitet werden sollen („mit dem passenden Skill"): (a) Sektionen wie **Leistungen** hängen oft weit linksbündig mit toter Fläche rechts; (b) **Über uns** hat teils ein riesiges Bild und „verlorenen" Text (Bild/Text-Balance); (c) **Navigation/Header** setzt sich nicht ab und ist **nicht sticky**. → Task 6 wird zur globalen Struktur-Überarbeitung aller 14 Packs nach einem gemeinsamen Feinschliff-Regelwerk (sticky Nav mit klarer Absetzung in der Pack-Sprache, Kompositionsregeln je Sektionstyp, Bild/Text-Verhältnisse, Zeilenlängen, Rhythmus), plus die priorisierte Fixliste aus der Eigen-Kritik; Umsetzung mit impeccable-Skill in Wellen, Baselines/Vorschauen neu, Vorher/Nachher zur Abnahme.
- Verfahren: (a) Ich erzeuge einen **Screenshot-Katalog** aller 14 Packs (Desktop + Mobil, „full"-Fixture, inkl. Unterseite) als Artefakt zum Durchblättern; (b) parallel eine strukturierte Eigen-Kritik je Pack (impeccable-Craft-Floor: Positionierung, Aufteilung/Raster, Bildformate/-zuschnitt, Abstände, Typo-Details) → priorisierte Fixliste; (c) du markierst im Katalog, was dich konkret stört; (d) Umsetzung in 2–3 Wellen à 4–5 Packs mit Baselines/Vorschauen neu. Verfassungs-Identität (Signaturen, Paletten) bleibt — es geht um Feinschliff, nicht Neubau.

### 2.5 Abschluss
Gates wie B6 (tsc 0, vitest, Playwright dev + prod), `BETRIEB-V2.md`, Ergebnis-Doku; Migration 0030 additiv.

## 3. Nicht im Umfang
StartPage-Redesign, Dashboard-Optik, GMB-Kategorien-Buttons im Studio (Backlog), Blog/SEO.

## 4. Erfolgskriterien
- „SCHAU & HORCH" (echter Prod-Fall) generiert: richtige Branche (Werbe-/Medienagentur o. ä. aus GMB/Website), Bocholt statt München, 6–8 Sektionen inkl. 13×5,0-Bewertungen und GMB-Fotos; kein API-Key in Bild-URLs.
- Generierungs-Wartezeit fühlbar kürzer: Vorschau ab < 5 s sichtbar (Skeleton), Sektionen erscheinen fortlaufend, Balken steht nie.
- Feintuning-Welle 1 abgenommen (Katalog vorher/nachher).

## 5. Offene Entscheidungen (bitte absegnen)
1. „Zeitmaschinen-Effekt" = Website baut sich im Vorschau-iframe sichtbar auf (Skeleton → Sektionen faden ein) — richtig verstanden? Falls du etwas anderes meinst (z. B. Vorher/Nachher-Morph der alten Website zur neuen), kurz sagen.
2. Echte Google-Reviews als Testimonials anzeigen (Vorname + Bewertung, öffentlich einsehbare Daten) — ok? (Empfehlung: ja, max 3, nur ≥ 4 Sterne.)
3. Website-Crawl der bestehenden Betriebs-Website als Faktenquelle (nur Startseite, robots-konform) — ok? (Empfehlung: ja — größter Hebel gegen falsche Branche.)
4. Kategorie-Rückfrage im Studio, wenn GMB nichts Belastbares liefert (ein Schritt vor der Generierung) — ok? (Empfehlung: ja, selten nötig.)
5. Feintuning-Verfahren wie §2.4 (Katalog + deine Markierungen + meine Fixliste, Wellen) — ok?
