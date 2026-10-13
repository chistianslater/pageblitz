# Postkarten Welle 2 — Ablauf für den Betreiber

Stand 2026-10-13, Branch `feat/postkarten-welle2`. Vier Batches à 5 Karten,
alle am selben Tag beauftragt. Jeder Batch ändert genau **eine** Größe
gegenüber Welle 1 (32 Friseure, 3 Scans):

| Batch | Variable | Branche | Layout | Text | HeyMail-Vorlage |
|---|---|---|---|---|---|
| A | Branche | Kosmetik | standard | `ungefragt` (wie Welle 1) | `HEYMAIL_TEMPLATE_ID` |
| B | Kartendesign | Friseur | screenshot | `screenshot` | `HEYMAIL_TEMPLATE_ID_SCREENSHOT` |
| C | Wortlaut | Friseur | standard | `angebot` | `HEYMAIL_TEMPLATE_ID` |
| D | Nachfass | Friseur (Welle 1, ohne Scan) | standard | `nachfass` | `HEYMAIL_TEMPLATE_ID` |

> **Geld:** Nur „Beauftragen" (bzw. `--senden` in Skripten) kostet Porto und
> Druck und ist nicht rückholbar. Alles bis einschließlich „Vorschau
> erzeugen" ist kostenlos. Beauftragt wird erst nach ausdrücklichem OK des
> Betreibers.

## 0. Einmalig: Deploy, Migration, Vorlage B

1. Branch mergen und wie üblich deployen (`docs/BETRIEB-V2.md`).
2. Migration auf Prod (vorher sichern):
   ```bash
   mysqldump -uroot pageblitz postcards > /root/backups/postcards-vor-0039-$(date +%F).sql
   mysql -uroot pageblitz < drizzle/0039_postkarten_welle_layout.sql
   ```
   Die 32 Karten der ersten Welle behalten `welle = NULL` und erscheinen in der
   Auswertung als `welle-1`.
3. Vorlage B in `/root/pageblitz/.env` eintragen und neu starten:
   ```
   HEYMAIL_TEMPLATE_ID_SCREENSHOT=6f088796-1890-4b1a-ae5f-ec43e50ce20b
   ```
   (Vorlage „Pageblitz Welle 2 – B Screenshot vorne"; `HEYMAIL_TEMPLATE_ID`
   bleibt die Vorlage der ersten Welle.) Fehlt die Variable, bricht jeder
   Lauf mit Layout „screenshot" ab — es gibt **keinen** Rückfall auf die
   Standardvorlage.
4. Im Admin unter Postkarten → Karten erzeugen das Feld „HeyMail-Vorlage"
   **leer lassen**. Es gilt jetzt je Layout und wird je Layout im Browser
   gemerkt; der alte globale Wert (`pb-heymail-template`) wird nicht mehr
   gelesen. Eine Vorlage, die zum anderen Layout gehört, lehnt der Server ab.

## 1. Vorschau-Seiten erzeugen (auf dem Server, kostet nur API/LLM)

Gleiche Region wie Welle 1. Erst trocken ansehen, dann erzeugen:

```bash
cd /root/pageblitz
# Batch A — Kosmetik
npx tsx scripts/stapel-vorschauen.ts --branche "Kosmetik" --stadt "Bocholt"  --anzahl 4 --trocken
npx tsx scripts/stapel-vorschauen.ts --branche "Kosmetik" --stadt "Borken"   --anzahl 3 --trocken
npx tsx scripts/stapel-vorschauen.ts --branche "Kosmetik" --stadt "Duisburg" --anzahl 4 --trocken
# danach dieselben Aufrufe ohne --trocken

# Batch B und C — neue Friseure (10 Stück; die 31 der ersten Welle sind schon vergeben)
npx tsx scripts/stapel-vorschauen.ts --branche "Friseur" --stadt "Duisburg" --anzahl 6 --trocken
npx tsx scripts/stapel-vorschauen.ts --branche "Friseur" --stadt "Bocholt"  --anzahl 4 --trocken
npx tsx scripts/stapel-vorschauen.ts --branche "Friseur" --stadt "Borken"   --anzahl 3 --trocken
```

Etwas mehr erzeugen als gebraucht (5 je Batch): Ohne zerlegbare Anschrift
fällt ein Betrieb raus. Bereits vorhandene Betriebe überspringt das Skript.
Findet der Filter „Kosmetik" später im Admin nichts, steht die Kategorie
anders in Google (z. B. „Kosmetikstudio", „Beauty") — im Feld Branche
entsprechend suchen.

## 2. Batches im Admin anlegen (Postkarten → Karten erzeugen)

Für jeden Batch:

1. Oben „Welle und Batch": Welle `welle-2`, Batch wählen. Layout, Text und
   der Branchenfilter werden aus der Vorgabe gesetzt. Steht rot ein
   Widerspruch daneben, nicht weitermachen.
2. Stadt eingrenzen, 5 Zeilen anhaken (bei B und C: verschiedene Betriebe —
   jeder Friseur gehört nur in einen Batch).
3. **Motive aufnehmen.** Das speichert Welle/Batch/Layout an der Karte.
   - A, C, D: Laptop-Motiv wie in Welle 1.
   - B: komplette Vorderseite 214 × 109 mm (DIN lang + 2 mm Beschnitt),
     2528 × 1287 px bei 300 dpi, mit Schlagzeile „Das ist deine neue
     Website." und dem Screenshot der eigenen Seite; Datei
     `postkarten/<code>-screenshot.jpg`. Ein Laptop-Motiv an einer B-Karte
     gilt als „Motiv veraltet" und lässt sich nicht beauftragen.
4. **Vorschau erzeugen** (kostenlos) — siehe Schritt 4.

### Batch D (Nachfass) zuerst anlegen

Unten auf derselben Seite: „Nachfass (Welle 2 · Batch D)". Die Liste zeigt
alle Karten der ersten Welle mit Sperrgrund (Testkarte 7N38, gescannt,
gekauft, storniert …). Vorausgewählt sind fünf, reihum über die Städte, je
Stadt nach Kurzcode — derselbe Vorschlag bei jedem Öffnen. „Nachfass-Karten
anlegen" erzeugt je Salon eine **neue** Kartenzeile mit neuem Code; die alte
Karte bleibt unverändert und zählt weiter für Welle 1. Danach oben Batch D
wählen, nach „Friseur" filtern, die fünf (Zustand „ohne Motiv") anhaken und
wie oben Motive + Vorschau.

## 3. Muster für Batch B ansehen (ohne Datenbank)

```bash
npx tsx scripts/postkarte-b-muster.ts --bild client/public/showcases/friseur.webp \
  --betrieb "Salon Beispiel" --stadt Bocholt --aus .superpowers/postkarte-b-muster.jpg [--zonen]
```

`--zonen` legt die Flächen der Vorlage (Preiszeile, QR, Pfeil, „scan mich",
Kurz-Link) magenta darüber — dort darf nichts von uns liegen.

## 4. Prüfen — kostenlos

Je Karte erzeugt „Vorschau erzeugen" ein PDF bei HeyMail (Spalte „Karte" →
PDF). Prüfen:

- Kopfzeile „Für … in …" bricht nicht um (max. 38 Zeichen).
- Preis steht überall als „ab 19,90 €" (gilt nur jährlich; Zahl kommt aus
  `shared/pricing.ts`).
- B: Screenshot sitzt rechts, QR/Preiszeile/Pfeil/Kurz-Link liegen frei auf
  Schwarz; Lime der Eyebrow passt zum Lime der Vorlage.
- C: „Deine Website ist fertig." + „Schau sie dir kostenlos an –
  freischalten nur, wenn sie dir gefällt." + „Erst dann ab 19,90 € im
  Monat."
- D: „Deine Website wartet noch auf dich." + „Wir haben dir vor ein paar
  Wochen geschrieben. Deine Seite steht noch."
- Anschrift, Kurzcode unter dem QR, QR führt auf `pageblitz.de/k/<code>`.

Bei HeyMail zeigt der Vorschau-Button am Auftrag nur Musterdaten — echte
Daten unter Auftrag → „Empfänger" → Vorschau (Befund 2026-09-18).

## 5. Beauftragen — nur nach OK des Betreibers

Je Batch: Batch wählen, die 5 Zeilen anhaken, „Beauftragen", `VERSENDEN`
eintippen. Der Dialog nennt Welle, Batch, Layout und Text des Laufs. HeyMail
drosselt ab ~12 Aufträgen kurz hintereinander; der Server wartet bei 429 von
selbst. Danach unter Übersicht den Druckstatus pflegen.

## 6. Auswerten

Postkarten → Übersicht → „Nach Welle und Batch": je Arm beauftragt →
gescannt → Design bestätigt → E-Mail → gekauft, Welle 1 als Vergleichszeile.
Bei 5 Karten ist eine Karte 20 % — die Zahlen sind Hinweise, keine Beweise.
Eine Karte der ersten Welle, die durch den Nachfass abgelöst wurde und selbst
nie gescannt hat, bekommt spätere Studio-Fortschritte nicht gutgeschrieben
(die zählen für D).
