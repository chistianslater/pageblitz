# Designlabor: zweite Referenzrunde

Lokal starten: `npx vite --host 127.0.0.1 --port 5199`, dann
`http://127.0.0.1:5199/design-lab` öffnen. Die Route ist ausschließlich im
Development-Build verfügbar. Das Designlabor zeigt die ursprünglichen Referenzen; die Integration in den
Produktionsrenderer ist unten beschrieben.

## Drei Gestaltungsrichtungen

- **RAUMWERK / Architektur:** großzügige Typografie, panoramisches Raumbild,
  asymmetrische Bild-Text-Komposition und nachvollziehbare Planungsschritte.
- **SEMPRE / Restaurant:** dunkle olivgrüne Grundfläche, warme Serifentypografie,
  groß gesetzte Wortmarke und eine wechselbare Beispielkarte mit Bildwechsel.
- **FORME / Salon:** kühle helle Flächen, leichte Display-Typografie,
  geschichtete Fotografie, groß gesetzte Wortmarke und ausklappbare Leistungsbeschreibungen.

Die zweite Runde reagiert auf das Feedback „besser, aber stellenweise zu einfach“.
Die Restaurant-Richtung nimmt die geschätzte Wärme des bisherigen Packs wieder
auf. Architektur ergänzt einen Wechsel zwischen Raumwirkung und Entwurfsarbeit.
Abschnitte erhalten dezente einmalige Eintrittsbewegungen; reduzierte Bewegung
wird respektiert und Inhalte sind ohne Animation vollständig sichtbar.

Die Oberflächen erhalten statisch gekachelte Körnung, beim Salon zusätzlich
eine sehr feine Faserstruktur. Buttons reagieren auf Hover und Druck,
Navigationslinks zeichnen eine Unterstreichung, Bilder zoomen bei präzisen
Zeigegeräten minimal. Aktive Kartenbereiche, Accordion-Inhalte und fokussierte
Formularfelder geben dezentes Feedback. `prefers-reduced-motion` deaktiviert
Bewegung; Texturen benötigen keine externe Datei und keine Animationsschleife.

Alle Marken und Texte sind fiktive Demonstrationsinhalte. Fotos stammen aus den
bereits vorhandenen Demo-Assets. RAUMWERK verwendet das Raumbild zweimal, da der
Raster-Bildsatz nur zwei Motive enthält. Für eine Kundenumsetzung sollte die
zweite Ansicht durch ein eigenes Projekt- oder Materialfoto ersetzt werden.

Der Vergleich verwendet dieselben Kerntexte und Bildquellen in den bestehenden
Packs raster, gusto und salon-noir. Sektionen, Reihenfolge und visuelle
Komposition unterscheiden sich bewusst. Das ist ein Vergleich mit den
Pack-Defaults, nicht mit einem konkreten gespeicherten Kundendesign. Die zweite
Runde ergänzt in der neuen Restaurantansicht ausdrücklich fiktive Gerichte als
Beispielkarte; diese zusätzlichen Inhalte sind im alten Pack nicht enthalten.

Die Vorschau bietet Branchenwechsel, bisherigen/neuen Entwurf und ein echtes
390-Pixel-iframe für mobile Breakpoints. Formulare validieren im Browser und
zeigen eine lokale Bestätigung; sie speichern und senden nichts.

## Integration in das System

`/design-system` ist die zusätzliche lokale Prüfansicht aller 20 echten Packs.
`/design-system?salons=1` vergleicht zwölf Salon-Varianten mit denselben Inhalten.
Lange Texte, fehlende Bilder und knappe Inhalte sind als Testfälle wählbar.
Beide Laborrouten werden nur im Development-Build registriert.

Neue Generierungen und Dokumente ohne `designRevision` verwenden Revision 2.
Explizite Revision 1 bleibt für den ursprünglichen Referenzvergleich erhalten.
Da noch keine Kunden existieren, ist keine Bestandsmigration erforderlich.
Die öffentlichen Demo-Routen zeigen ebenfalls Revision 2.

Alle 20 Packs verwenden den neuen inhaltsbasierten Hero, abgestimmte
Kompositionsrezepte, Oberflächentexturen und Microinteractions. Ihre bestehenden
branchenspezifischen Inhaltssektionen, Features und Kontaktfunktionen bleiben
angebunden. Gusto, Raster und Salon Noir erhalten neue Grundpaletten. Die
Referenzprototypen werden nicht vollständig eins zu eins kopiert: Ihre fiktiven
Gerichte, Texte und lokalen Demo-Formulare gehören nicht zum Generator.

Ein Alias-Verzeichnis verbindet alle 234 Kategorien der aktuellen
Branchenauswahl mit geeigneten Pack-Pools. Das deckt diesen Katalog ab, nicht
jede denkbare Spezialbranche. Ästhetische Signale aus vorhandenen
Unternehmensbeschreibungen priorisieren ausschließlich geeignete Packs.

Innerhalb einer Branche und Stadt werden strukturelle Ähnlichkeiten unter den
letzten maximal 1.000 passenden Datensätzen verglichen. Farben und Schriftwechsel
zählen dabei nicht als neue Komposition. Kuratierte Varianten ändern Hero,
Leistungsdarstellung, Bild-Text-Anordnung und Galerie. Ein transaktionaler Zähler
verteilt parallele Generierungen auf Rezeptvarianten. Die Auswahl ist endlich;
sie garantiert keine weltweite Einzigartigkeit. Wiederholungsläufe behalten
bereits gespeicherte Profile und individuelle Farben/Schriften.

## Integrationsprüfung

- Tests über den kompletten Kategorienkatalog und alle 20 Renderer.
- Zwölf unterschiedliche strukturelle Salon-Profile mit identischen Inhalten.
- Desktop- und Mobile-Sichtprüfung aller 20 Packs.
- 60 mobile Extremfälle: lange Texte, keine Bilder, knappe Inhalte bei 320 Pixeln.
- Axe WCAG 2 A/AA auf allen 20 neuen Pack-Darstellungen.
- Datenbankabfragen und echte KI-Generierung wurden nicht gegen einen produktiven
  Dienst ausgeführt; deren Integration ist durch lokale Tests geprüft.
- Die Änderungen sind lokal und wurden nicht deployt.

## Prüfungen dieser Runde

- TypeScript: `npm run check`.
- Browser: 1440, 390 und 320 Pixel, Bildladefehler und horizontaler Overflow.
- Axe: WCAG 2 A/AA auf den drei neuen Referenzseiten.
- Interaktionen: Branchenwechsel, Vorher/Nachher, mobiles iframe,
  Formularvalidierung und lokale Bestätigung.
- Desktop- und Mobile-Screenshots unter `.probe/design-lab/` für lokale Sichtprüfung.

Nicht gemessen: Core Web Vitals unter realen Netzbedingungen. Der automatische
Accessibility-Scan ersetzt keine manuelle Prüfung mit assistiven Technologien.

## Detailkorrektur, Kundenvarianten und GSAP

Die weitere Prüfung berücksichtigt Textüberschneidungen innerhalb der Seite,
nicht nur die Dokumentbreite. Das Werkbank-Plus belegt nun eine eigene Zeile;
Fließtext und Raster-Ausrichtung wurden korrigiert. FAQ-Spalten dürfen ihre
Mindestbreite auf kleinen Displays unterschreiten. Kleine farbige Texte und
invertierte Kontaktflächen erhalten passende Kontrastfarben bei Themenwechseln.

`shared/stylePacks/artThemes.ts` vereint die Farb- und Schriftwahl für Generator
und Systemvorschau. Die drei neuen Referenzfamilien besitzen jeweils vier
abgestimmte Materialpaletten; die übrigen Packs verwenden ihre bisherigen
Farbwelten und Akzenttafeln. Jedes Pack hat drei passende Schriftpaarungen.
Die Auswahl erfolgt reproduzierbar anhand des Unternehmensnamens; vorhandene
individuelle Einstellungen bleiben bei erneuter Generierung erhalten. Gleiche
Namen können dieselbe Farb-/Typokombination erhalten; strukturelle Variation
wird separat über die vorhandenen Kompositionsrezepte verteilt.

Die Systemvorschau bietet zwölf Kundenbeispiele pro Pack und einen Knopf zum
erneuten Abspielen der Eingangsmotion. GSAP animiert Hero-Inhalte gestaffelt und
nachfolgende Inhalte beim Sichtbarwerden. Ein eigenes kleines Produktionsbundle
lädt unabhängig von Formular-/Chat-Add-ons. Die vorherige Scroll-Reveal-Schicht
wird auf Revision 2 ausgesetzt. Kein Scroll-Hijacking, kein dauerhaft verstecktes
SSR-Markup. Bei Fokus, reduzierter Bewegung und Komponentenwechseln werden
Animationen beendet beziehungsweise aufgeräumt.

Lokale Prüfskripte: `.probe/design-lab/detail-audit.mjs`,
`long-variant-audit.mjs`, `theme-audit.mjs`, `motion-check.mjs` und
`ssr-motion-check.mjs`. Screenshots und Prüfberichte liegen in
`.probe/design-detail/`. Die GSAP-Prüfung umfasst Animation, Abschluss,
reduzierte Bewegung, schnellen Pack-Wechsel und das eigenständige SSR-Bundle.

## Funktionsprüfung der Systemvorschau

Die serverseitigen Seiten aktivierten die Galerie über `siteEnhancer`; der
clientseitigen Systemvorschau fehlte dieser Schritt. `galleryInteractions.ts`
ergänzt dort Bilddialog, Vor/Zurück, Escape, Tastaturzugang, Fokus-Rückgabe,
Wischgesten und Albumfilter. Die Aktivierung ist auf die jeweilige Site begrenzt
und wird beim Wechsel des Dokuments vollständig entfernt. Unter „Galerie mit
Alben“ kann die Filterfunktion geprüft werden. Der Studio-Fotoeditor verwendet
weiterhin seinen eigenen Klickpfad zum Austauschen von Bildern.

`.probe/design-lab/function-check.mjs` prüft alle 20 Packs im Browser:
Galerien soweit vorhanden, Bildwechsel, Schließen, Fokus, mobile Menüs und
interne Hero-Linkziele; zusätzlich Albumfilter und Bereinigung beim Packwechsel.
Die vorhandenen 485 Renderer-/SSR-/Add-on-Tests wurden ebenfalls ausgeführt.
Es wurden keine echten Kontaktanfragen oder externen Buchungen versendet.
