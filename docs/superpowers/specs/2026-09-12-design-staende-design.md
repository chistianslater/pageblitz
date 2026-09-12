# Spec: Design-Stände — Verbesserungen als Angebot, nicht als Überraschung

**Datum:** 2026-09-12 · **Status:** Entwurf, noch nicht beschlossen · **Anlass:** Betreiber-Wunsch — Bestandskunden sollen neue Design-Fassungen selbst übernehmen können.

## 1. Befund

Das Design einer Kundenseite liegt **nicht im Dokument, sondern im Code**.
Gespeichert ist nur die Zuordnung:

```
stylePackId: "salon-noir"      // welches Pack
fontPairId:  "elegant"         // Kundenwahl
colorOverrides: { accent: … }  // Kundenwahl
designProfile: { … }           // gewürfelte Layout-Achse
```

Wie `salon-noir` aussieht, entsteht bei **jedem Seitenaufruf** neu aus
`client/src/components/site/packs/salon-noir/css.ts` plus `toCssVars`. Eine
geänderte Zeile dort verändert jede Seite auf diesem Pack beim nächsten
Aufruf — ohne Zutun des Kunden und ohne Möglichkeit zur Rückkehr.

Bei null zahlenden Kunden ist das folgenlos. Ab dem ersten ist es eine
Haftung: Eine Abstandskorrektur kann die Preisliste eines Friseursalons
verschieben, während er schläft.

`websiteData.version` hilft hier nicht — das ist die **Vertragsversion**
(`z.literal(1)` / `z.literal(2)`, `shared/siteContract/schema.ts:540,574`),
also die Form des Dokuments, nicht sein Aussehen.

## 2. Entscheidungen

1. **Zwei Klassen von Änderungen, getrennt bei jedem Commit.**
   - **Korrektur** — Kontrast, Umbruch, Klickbarkeit, Sicherheit, Performance.
     Gilt sofort für alle. Niemand wird gefragt, ob er einen Fehler behalten
     möchte.
   - **Gestaltung** — Hero-Komposition, Typo-Skala, Sektionsreihenfolge,
     Farbwelten. Nur auf Zustimmung.

   Die Einstufung ist eine **Disziplin, keine Technik**. Ohne sie rutscht mit
   der Zeit alles in „Korrektur", und der Mechanismus wird wertlos.

2. **Ein gemeinsamer, datierter Design-Stand** — kein Versionsschlüssel je
   Pack und keine Schalter je Verbesserung:

   ```
   designStand: "2026-09"
   ```

   Neue Seiten bekommen immer den aktuellen Stand. Bestandsseiten behalten
   ihren, bis der Kunde wechselt.

3. **Höchstens zwei Stände gleichzeitig im Code.** Feste Obergrenze statt
   wachsender Altlast.

4. **Ein Wechsel fasst Inhalte nicht an.** Texte, Fotos, Öffnungszeiten,
   Preise bleiben. Ein Stand wechselt die Hülle.

5. **Kundenwahl schlägt Pack-Standard, auch beim Wechsel.** Die Regel steht
   bereits in `shared/stylePacks/toCssVars.ts`: ein Override auf `accent`
   gewinnt gegen den Lock. Ein Stand-Wechsel darf sie nicht aushebeln, sonst
   bekommt der Kunde fremde Farben.

6. **Vor jedem Wechsel wird eine Version geschrieben.** `website_versions`
   speichert vollständige Dokumentstände mit Auslöser und Klartext-Label
   (`drizzle/schema.ts:579`). Rückkehr ist ein Klick, kein Support-Fall.

7. **Umgestellt wird nur auf ausdrückliches Ja.** „Später" heißt später,
   nicht automatisch in vier Wochen.

## 3. Warum nicht die Alternativen

**Versionen je Pack** (`salon-noir v1/v2/v3`): 20 Packs mal N Versionen
müssen dauerhaft lauffähig bleiben und jedes Framework-Update mitmachen. Der
Wartungsaufwand wächst multiplikativ.

**Schalter je Verbesserung:** Zehn unabhängige Schalter ergeben über tausend
Kombinationen. Keine davon ist real getestet.

**Ein gemeinsamer Stand** hat eine feste Obergrenze von zwei Varianten und
ist für den Kunden benennbar. „Fassung September" ist verständlich,
`salon-noir v3 mit heroCompact` nicht.

## 4. Was der Kunde sieht

Im Konto eine Karte, die **nur erscheint, wenn es etwas zu sehen gibt** —
also wenn der neue Stand für das Pack dieser Seite sichtbare Änderungen
enthält:

> **Neue Design-Fassung verfügbar**
> Seit September: ruhigere Abstände, klarere Kontaktsektion.
> [Vorher/Nachher ansehen] · [Später]

Der Blick darauf ist der Kern. Niemand stimmt zu, was er nicht gesehen hat.

**Vorhandene Bausteine:** Die Vorschau-Route rendert bereits einen beliebigen
gespeicherten Stand über `?version=<id>` (`server/ssr/routes.ts`). Dasselbe
Muster mit `?stand=2026-09` zeigt die eigene Seite in der neuen Fassung, ohne
etwas zu speichern. Auch die Auswahl-Oberfläche existiert — der Bildschirm
„Gefällt dir das Design?" aus dem Onboarding ist die passende Form.

## 5. Verfallsregel

Ein alter Stand lebt **sechs Monate**. Danach Stilllegung mit Ankündigung,
verbliebene Seiten wandern.

Ohne diese Regel sammeln sich in zwei Jahren fünf Stände an, und keine
Pack-Änderung ist mehr ohne fünffache Prüfung möglich.

## 6. Reihenfolge

1. **Einstufung Korrektur/Gestaltung** als Regel in
   `docs/claude-handoff/REGELN.md`. Kostet nur Disziplin, wirkt sofort.
2. **`designStand` ins Dokument**, neue Seiten bekommen den aktuellen Wert.
   Noch ohne zweiten Stand — reine Aufzeichnung.
3. **Vorschau mit `?stand=`** — sichtbar machen, bevor etwas wählbar ist.
4. **Karte im Konto** plus Wechsel mit vorherigem Versionseintrag.
5. **Verfallsregel** dokumentieren und terminieren.

Schritte 1 und 2 gehören **vor den ersten zahlenden Kunden**. Rückwirkend
lässt sich nicht feststellen, mit welcher Fassung eine Seite gebaut wurde.

## 7. Offen (Betreiber entscheidet)

- **Taktung:** Vierteljährlich ein neuer Stand? Monatlich wäre für Kunden
  Lärm, jährlich verschenkt die Verbesserungen.
- **Nie-Zustimmer:** Nach sechs Monaten umstellen (Empfehlung) oder dauerhaft
  auf dem alten Stand lassen, solange gezahlt wird? Letzteres bedeutet
  Software-Archäologie für Einzelfälle.

## 8. Nicht Teil dieser Spec

- **Inhaltliche Verbesserungen** (bessere Texte aus neuen Prompts). Inhalte
  gehören dem Kunden; Vorschläge dafür brauchen einen anderen Mechanismus als
  einen Design-Stand.
- **Migration bestehender Seiten:** entfällt, solange es keine zahlenden
  Kunden gibt (Stand 2026-09-12: null). Genau deshalb ist jetzt der richtige
  Zeitpunkt.
