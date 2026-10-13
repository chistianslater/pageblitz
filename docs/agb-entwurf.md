# AGB-Entwurf Pageblitz — zur anwaltlichen Prüfung

Entwurf vom 13.10.2026, Fassung `2026-10-13`. Quelle des Texts ist
`shared/agb.ts` (Seite `/agb`); dieser Abschnitt unterhalb der Linie wird aus
dem Code erzeugt (`agbToMarkdown()`), ein Test prüft die Übereinstimmung.
Änderungen nach der Prüfung bitte in `shared/agb.ts` übernehmen, dann
`AGB_VERSION`/`AGB_STAND` hochsetzen und diese Datei neu erzeugen:

```bash
npx tsx -e 'import {agbToMarkdown} from "./shared/agb.ts"; process.stdout.write(agbToMarkdown())'
```

**Vom Betreiber freigegeben (13.10.2026):** Mahnfrist 14 Tage vor Sperrung,
Ankündigung von Preisänderungen 6 Wochen vorher. Offene Platzhalter gibt es
im AGB-Text nicht mehr.

## Bitte prüfen lassen

1. **Automatische Verlängerung im B2B (§ 7 Abs. 1):** 12 Monate Mindestlaufzeit
   ab erster Zahlung nach der Testphase, Verlängerung um je 12 Monate,
   Kündigungsfrist 1 Monat. Wirksam gegenüber Unternehmern (§ 307 BGB statt
   § 309 Nr. 9)? Auch gegenüber Kleinstbetrieben/Freiberuflern?
2. **B2B-Ausschluss (§ 2):** Reicht das Pflicht-Häkchen „Ich bestelle als
   Unternehmer … (§ 14 BGB)“ plus Fußnote „Angebot nur für Gewerbetreibende
   und Selbstständige“ als Ausschluss von Verbrauchern, oder sind weitere
   Maßnahmen nötig (z. B. Pflichtfeld Firma/USt-IdNr.)? Folge, wenn doch ein
   Verbraucher bestellt (Widerrufsrecht, § 312k BGB Kündigungsbutton)?
3. **Preisanpassungsklausel (§ 10):** Transparenz/Bestimmtheit der Gründe
   („gestiegene Kosten …“), Ankündigungsfrist 6 Wochen,
   Sonderkündigungsrecht, Zustimmungsfiktion bei Schweigen — trägt das im
   B2B?
4. **Haftungsbeschränkung (§ 16):** Kardinalpflicht-Formel, Ausschluss der
   verschuldensunabhängigen Haftung nach § 536a BGB (SaaS mietähnlich?),
   Datenverlust-Klausel. Soll zusätzlich eine Höchstsumme (z. B. Entgelt der
   letzten 12 Monate) rein?
5. **KI-Hinweis (§ 12):** Prüfpflicht des Kunden, „macht sich die Inhalte zu
   eigen“, kein Erfolg (Ranking/Besucher) geschuldet. Hält der Ausschluss,
   wenn die KI z. B. falsche Öffnungszeiten oder Preise erfindet? Bezug zur
   KI-Verordnung (Transparenz) nötig?
6. **Rechtstexte der Kundenwebsite (§ 13):** Pageblitz erzeugt Impressum und
   Datenschutzerklärung. Reicht „Vorlage, keine Rechtsberatung, Kunde
   verantwortlich“ (RDG, Haftung bei fehlerhafter Vorlage)?
7. **Zahlungsverzug/Sperrung (§ 9):** Mahnfrist 14 Tage,
   außerordentliche Kündigung ab Verzug mit zwei Monatsentgelten,
   Fortbestehen der Zahlungspflicht während der Sperrung.
8. **Leistungsänderungsvorbehalt (§ 3 Abs. 5):** zulässig in dieser Form?
9. **Freistellung (§ 11 Abs. 4)** und **Sperrrecht bei Rechtsverletzungen
   (§ 11 Abs. 3).**
10. **Auftragsverarbeitung (§ 17):** AVV-Entwurf liegt in
    `docs/avv-entwurf.md` (noch nicht veröffentlicht). Reicht „Bestandteil,
    auf Anfrage“, oder muss der AVV im Checkout mit abgeschlossen werden?
11. **Herausgabe nach Vertragsende (§ 18 Abs. 2):** 30 Tage, Inhalte (Texte,
    Fotos, Logo) „in einem gängigen Dateiformat“, kein Anspruch auf Code oder
    lauffähige Kopie. Es gibt dafür noch keine Export-Funktion — der Betreiber
    müsste es manuell leisten.
12. **Gerichtsstand (§ 19 Abs. 2):** nur gegenüber Kaufleuten wirksam
    (§ 38 ZPO); für Freiberufler/Kleingewerbe bleibt der gesetzliche
    Gerichtsstand. So gewollt?
13. **Einbeziehung:** Häkchen im Studio vor der Weiterleitung zu Stripe,
    Link auf `/agb` im neuen Tab, gespeichert werden Fassung und Zeitpunkt
    (Stripe-Metadaten `agb_version`, `agb_akzeptiert_at`; DB
    `subscriptions.agbVersion` + `b2bConfirmedAt`). Reicht das als Nachweis?
    Muss der AGB-Text zusätzlich per E-Mail (dauerhafter Datenträger)
    zugeschickt werden?
14. **Fehlende Klausel:** Es gibt bewusst keine Klausel zur einseitigen
    Änderung der AGB während der Laufzeit. Braucht es eine (mit
    Widerspruchsrecht)?

## Offene Fakten

- Export-/Herausgabeprozess (§ 18 Abs. 2) existiert noch nicht als Funktion.
- Domains: Pageblitz registriert keine Domains; der Kunde verbindet seine
  eigene Domain per CNAME beim eigenen Domain-Anbieter (inklusive, kein
  Add-on — die frühere gegenteilige SEO-FAQ ist korrigiert).
- Kontaktadresse ist überall `hello@pageblitz.de` (`shared/const.ts`
  `CONTACT_EMAIL`, Wächter `server/contactEmail.test.ts`).
- Telefon steht im Impressum, wird in den AGB aber nicht als Support-Kanal
  zugesagt.

## Technischer Hinweis: keine Stripe-`consent_collection`

Stripes eingebaute AGB-Abfrage (`consent_collection.terms_of_service`) nimmt
die Terms-URL aus den Account-Einstellungen. Der Stripe-Account ist mit
anderen Produkten geteilt — die Pageblitz-AGB würden dort auch fremde
Checkouts treffen. Die Zustimmung holt deshalb das Studio-Häkchen ein
(server-geprüft); der frühere Schalter `STRIPE_TERMS_URL` ist entfernt.

---

# Allgemeine Geschäftsbedingungen (AGB) von Pageblitz

Fassung 2026-10-13 · Stand: 13.10.2026

## § 1 Geltungsbereich und Anbieter

(1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über die Nutzung von Pageblitz zwischen Christian Nießing, Diplom Designer, Zum Waldschlösschen 19, 46395 Bocholt, Deutschland, handelnd unter „Pageblitz – eine Marke von Schau und Horch“ (USt-IdNr. DE277120646; nachfolgend „Anbieter“), und seinen Kunden (nachfolgend „Kunde“).

(2) Abweichende, entgegenstehende oder ergänzende Geschäftsbedingungen des Kunden werden nicht Vertragsbestandteil, auch wenn der Anbieter ihnen nicht ausdrücklich widerspricht.

## § 2 Nur für Unternehmer

(1) Das Angebot richtet sich ausschließlich an Unternehmer im Sinne von § 14 BGB, also an natürliche oder juristische Personen und rechtsfähige Personengesellschaften, die bei Vertragsschluss in Ausübung ihrer gewerblichen oder selbstständigen beruflichen Tätigkeit handeln. Verträge mit Verbrauchern (§ 13 BGB) schließt der Anbieter nicht.

(2) Der Kunde bestätigt vor der Bestellung ausdrücklich, als Unternehmer zu handeln. Der Anbieter darf den Nachweis der Unternehmereigenschaft verlangen (z. B. Gewerbeanmeldung oder USt-IdNr.). Hat der Kunde die Unternehmereigenschaft wahrheitswidrig bestätigt, darf der Anbieter den Vertrag außerordentlich kündigen.

## § 3 Leistungen

(1) Pageblitz erstellt mithilfe künstlicher Intelligenz (KI) aus den Angaben des Kunden – etwa Firmenname, Daten aus einem Google-Unternehmensprofil, Texten und Bildern – eine Website für den Betrieb des Kunden und stellt sie für die Vertragslaufzeit online bereit (Software as a Service).

(2) Zum Grundumfang gehören: Bereitstellung und Betrieb (Hosting) der Website auf Servern in der Europäischen Union einschließlich SSL-Verschlüsselung, eine Adresse unter einer Subdomain von pageblitz.de, die Möglichkeit, eine eigene Domain des Kunden zu verbinden, das Bearbeiten von Inhalten, Bildern und Gestaltung im Pageblitz-Studio (auch mithilfe der Studio-KI) sowie aus den Angaben des Kunden erzeugte Vorlagen für Impressum und Datenschutzerklärung (siehe § 13).

(3) Gegen gesondertes Entgelt können Erweiterungen („Extras“) hinzugebucht werden: Kontaktformular (3,90 €/Monat), Bildergalerie (3,90 €/Monat), Speisekarte (3,90 €/Monat), Preisliste (3,90 €/Monat), KI-Chat (9,90 €/Monat), Terminbuchung (4,90 €/Monat), Team (3,90 €/Monat), Unterseiten (3,90 €/Monat). Der jeweils aktuelle Funktionsumfang ergibt sich aus der Leistungsbeschreibung im Studio zum Zeitpunkt der Buchung.

(4) Support leistet der Anbieter über den Hilfe-Chat im Studio und Kundenkonto (KI-Assistent mit Weiterleitung an einen Menschen) sowie per E-Mail an hello@pageblitz.de. Bestimmte Reaktionszeiten sind nicht geschuldet, sofern nicht ausdrücklich anders vereinbart.

(5) Der Anbieter darf die Software weiterentwickeln und Funktionen ändern, soweit der vertraglich vereinbarte Kern der Leistung (Erstellung, Bearbeitung und Bereitstellung der Website) erhalten bleibt und die Änderung für den Kunden zumutbar ist.

## § 4 Vertragsschluss

(1) Die kostenlose Website-Vorschau ist noch kein Vertrag. Der Vertrag kommt zustande, wenn der Kunde im Studio Tarif und Extras wählt, die Unternehmereigenschaft bestätigt, diese AGB akzeptiert und die Bestellung beim Zahlungsdienstleister Stripe abschließt.

(2) Der Anbieter speichert den Zeitpunkt der Bestätigung und die akzeptierte Fassung dieser AGB. Die jeweils gültige Fassung ist unter pageblitz.de/agb abrufbar.

## § 5 Kostenlose Testphase

(1) Die ersten 7 Tage ab Bestellung sind kostenlos (Testphase). Kündigt der Kunde innerhalb der Testphase, endet der Vertrag mit Ablauf der Testphase, ohne dass Kosten entstehen.

(2) Kündigt der Kunde nicht, beginnt nach Ablauf der Testphase die kostenpflichtige Nutzung im gewählten Tarif; die erste Zahlung wird automatisch fällig.

## § 6 Preise und Zahlung

(1) Es gelten die bei Bestellung im Studio angezeigten Preise. Grundpreise: Jahrestarif 19,90 € pro Monat, Monatstarif 24,90 € pro Monat. Extras kosten in beiden Tarifen denselben Monatspreis (§ 3 Abs. 3). Alle Preise sind Bruttopreise inklusive 19 % Umsatzsteuer.

(2) Die Entgelte werden monatlich im Voraus fällig und über den Zahlungsdienstleister Stripe (Stripe Payments Europe Ltd., Dublin, Irland) mit dem bei der Bestellung hinterlegten Zahlungsmittel eingezogen. Rechnungen werden elektronisch bereitgestellt.

(3) Werden Extras während eines Abrechnungsmonats hinzugebucht oder abbestellt, wird das Entgelt für den angebrochenen Monat anteilig berechnet bzw. gutgeschrieben.

## § 7 Laufzeit und Kündigung

(1) Jahrestarif: Die Mindestlaufzeit beträgt 12 Monate und beginnt mit der ersten Zahlung nach der Testphase. Abgerechnet wird monatlich. Der Vertrag verlängert sich jeweils um weitere 12 Monate, wenn er nicht spätestens 1 Monat vor Ablauf der jeweiligen Laufzeit gekündigt wird. Eine verspätete Kündigung wird zum Ende der folgenden Laufzeit wirksam.

(2) Monatstarif: Der Vertrag läuft auf unbestimmte Zeit und kann jederzeit zum Ende des laufenden Abrechnungsmonats gekündigt werden.

(3) Extras haben keine eigene Mindestlaufzeit – auch nicht im Jahrestarif. Sie können jederzeit im Studio abbestellt werden und enden spätestens mit dem Vertrag über den Grundtarif.

(4) Die Kündigung erfolgt im Kundenkonto unter „Abonnement“ oder in Textform (z. B. per E-Mail an hello@pageblitz.de). Das Kundenkonto zeigt Laufzeitende und Kündigungsfrist an.

(5) Das Recht beider Seiten zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.

## § 8 Tarifwechsel

(1) Ein Wechsel vom Monatstarif in den Jahrestarif ist jederzeit im Kundenkonto möglich. Er gilt ab der nächsten Abbuchung; mit dieser Zahlung beginnt eine neue Mindestlaufzeit von 12 Monaten.

(2) Ein Wechsel vom Jahrestarif in den Monatstarif ist nur zum Ende der jeweiligen Laufzeit möglich. Der Wunsch ist dem Anbieter spätestens 1 Monat vor Laufzeitende in Textform mitzuteilen.

## § 9 Zahlungsverzug und Sperrung

(1) Schlägt ein Einzug fehl oder gerät der Kunde mit einer Zahlung in Verzug, gelten die gesetzlichen Regeln. Der Kunde trägt die Kosten, die durch eine von ihm zu vertretende Rücklastschrift oder Zahlungsablehnung entstehen.

(2) Ist der Kunde mit einer fälligen Zahlung in Verzug, darf der Anbieter die Website nach vorheriger Ankündigung in Textform und fruchtlosem Ablauf einer Zahlungsfrist von 14 Tagen vorübergehend sperren (offline nehmen). Die Pflicht zur Zahlung der vereinbarten Entgelte bleibt während der Sperrung bestehen. Nach Zahlung wird die Website unverzüglich wieder freigeschaltet.

(3) Bei Verzug mit einem Betrag, der zwei Monatsentgelten entspricht, darf der Anbieter den Vertrag außerordentlich kündigen.

## § 10 Preisänderungen

(1) Der Anbieter darf die Entgelte zum Beginn einer neuen Laufzeit (Jahrestarif) bzw. eines neuen Abrechnungsmonats (Monatstarif) anpassen, um gestiegene Kosten für Betrieb, Hosting, KI-Dienste oder Zahlungsabwicklung auszugleichen. Während einer laufenden Mindestlaufzeit bleibt der vereinbarte Preis unverändert.

(2) Preisänderungen kündigt der Anbieter mindestens 6 Wochen vor ihrem Wirksamwerden in Textform an. Der Kunde kann den Vertrag in diesem Fall bis zum Wirksamwerden der Änderung zu diesem Zeitpunkt kündigen (Sonderkündigungsrecht); der Anbieter weist in der Ankündigung darauf hin. Kündigt der Kunde nicht, gilt der neue Preis ab dem angekündigten Zeitpunkt.

(3) Ändert sich der gesetzliche Umsatzsteuersatz, ändern sich die Bruttopreise entsprechend.

## § 11 Pflichten des Kunden und Inhalte

(1) Der Kunde ist für alle Inhalte verantwortlich, die er bereitstellt, freigibt oder auf seiner Website veröffentlicht – insbesondere Texte, Fotos, Logos, Preise, Öffnungszeiten und Kontaktdaten. Er sichert zu, die erforderlichen Rechte (Urheber-, Marken-, Persönlichkeits- und Nutzungsrechte) an selbst gelieferten Inhalten zu besitzen.

(2) Der Kunde darf keine rechtswidrigen Inhalte veröffentlichen, insbesondere keine Inhalte, die Rechte Dritter verletzen, irreführend oder wettbewerbswidrig sind, gegen Jugendschutz- oder Strafgesetze verstoßen oder Schadsoftware enthalten. Die Website darf nicht für Spam oder für Zwecke genutzt werden, die den Betrieb von Pageblitz beeinträchtigen.

(3) Werden Rechtsverletzungen bekannt oder machen Dritte begründet Ansprüche geltend, darf der Anbieter betroffene Inhalte oder die Website vorübergehend sperren. Er informiert den Kunden und gibt ihm, soweit zumutbar, Gelegenheit zur Abhilfe.

(4) Der Kunde stellt den Anbieter von Ansprüchen Dritter frei, die auf von ihm bereitgestellten oder freigegebenen Inhalten beruhen, einschließlich angemessener Kosten der Rechtsverteidigung, soweit der Kunde die Rechtsverletzung zu vertreten hat.

(5) Der Kunde hält seine Zugangsdaten geheim und informiert den Anbieter unverzüglich, wenn er einen Missbrauch vermutet.

## § 12 KI-erzeugte Inhalte

(1) Texte, Bildvorschläge, Gestaltung und Antworten des KI-Chats werden ganz oder teilweise automatisch erzeugt. Sie können sachlich falsch, unvollständig oder unpassend sein und Angaben enthalten, die nicht auf den Betrieb des Kunden zutreffen.

(2) Der Kunde ist verpflichtet, alle erzeugten Inhalte vor der Veröffentlichung und bei Änderungen auf Richtigkeit, Vollständigkeit und Rechtmäßigkeit zu prüfen und bei Bedarf zu korrigieren. Mit der Freischaltung macht er sich die Inhalte zu eigen.

(3) Der Anbieter schuldet keinen bestimmten wirtschaftlichen Erfolg, insbesondere keine bestimmten Platzierungen in Suchmaschinen, Besucherzahlen, Anfragen oder Umsätze.

## § 13 Impressum und Datenschutzerklärung der Kundenwebsite

(1) Die von Pageblitz aus den Angaben des Kunden erzeugten Texte für Impressum und Datenschutzerklärung sind unverbindliche Vorlagen und keine Rechtsberatung. Sie können die Verhältnisse des Kunden nicht vollständig abbilden.

(2) Der Kunde bleibt als Betreiber seiner Website allein dafür verantwortlich, dass Impressum, Datenschutzerklärung und sonstige Pflichtangaben vollständig, richtig und aktuell sind. Er prüft die Vorlagen und lässt sie im Zweifel rechtlich prüfen.

## § 14 Nutzungsrechte

(1) Software, Designsysteme, Vorlagen und Programmcode von Pageblitz bleiben Eigentum des Anbieters. Der Kunde erhält für die Vertragslaufzeit das einfache, nicht übertragbare Recht, sie im Rahmen dieses Vertrags für seine Website zu nutzen.

(2) Der Kunde räumt dem Anbieter für die Vertragslaufzeit das einfache Recht ein, die von ihm bereitgestellten Inhalte zu speichern, zu bearbeiten (z. B. Bildgröße, Zuschnitt) und auf der Website öffentlich zugänglich zu machen, soweit dies zur Vertragserfüllung nötig ist.

(3) Bildnachweise eingebundener Stockfotos (z. B. von Unsplash) dürfen nicht entfernt werden, soweit die Lizenz sie verlangt.

## § 15 Verfügbarkeit und Wartung

(1) Der Anbieter bemüht sich um eine möglichst unterbrechungsfreie Erreichbarkeit der Websites. Eine bestimmte Verfügbarkeit ist nicht geschuldet, sofern sie nicht ausdrücklich gesondert vereinbart wird.

(2) Wartungsarbeiten führt der Anbieter nach Möglichkeit in nutzungsarmen Zeiten durch. Längere planbare Unterbrechungen kündigt er vorher an.

(3) Ausfälle, die der Anbieter nicht zu vertreten hat – etwa durch höhere Gewalt, Störungen im Internet außerhalb seines Einflussbereichs, Ausfälle von Vorleistern oder Angriffe Dritter –, begründen keine Ansprüche des Kunden.

## § 16 Haftung

(1) Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit, nach dem Produkthaftungsgesetz sowie im Umfang einer übernommenen Garantie.

(2) Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht), also einer Pflicht, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Kunde regelmäßig vertrauen darf. Die Haftung ist in diesem Fall auf den bei Vertragsschluss vorhersehbaren, vertragstypischen Schaden begrenzt.

(3) Im Übrigen ist die Haftung ausgeschlossen. Die verschuldensunabhängige Haftung für bei Vertragsschluss vorhandene Mängel (§ 536a Abs. 1 Alt. 1 BGB) ist ausgeschlossen.

(4) Für den Verlust von Daten haftet der Anbieter nur in Höhe des Aufwands, der bei ordnungsgemäßer, regelmäßiger Datensicherung zur Wiederherstellung erforderlich gewesen wäre. Der Kunde bewahrt Kopien seiner Originaldateien (z. B. Fotos, Logos, Texte) selbst auf.

(5) Die vorstehenden Beschränkungen gelten auch zugunsten der Erfüllungs- und Verrichtungsgehilfen des Anbieters.

## § 17 Datenschutz und Auftragsverarbeitung

(1) Wie der Anbieter personenbezogene Daten des Kunden verarbeitet, steht in der Datenschutzerklärung unter pageblitz.de/datenschutz.

(2) Soweit über die Website des Kunden personenbezogene Daten von Besuchern verarbeitet werden – etwa über Kontaktformular, Terminbuchung, KI-Chat oder Besucherstatistik –, ist der Kunde Verantwortlicher und der Anbieter Auftragsverarbeiter (Art. 28 DSGVO). Hierfür gilt der Vertrag über die Auftragsverarbeitung (AVV) des Anbieters, der Bestandteil dieses Vertrags ist und dem Kunden auf Anfrage bereitgestellt wird.

## § 18 Vertragsende, Herausgabe und Domains

(1) Mit Ende des Vertrags nimmt der Anbieter die Website offline; die Subdomain unter pageblitz.de wird freigegeben. Ein Anspruch auf eine bestimmte Subdomain besteht nicht, auch nicht nach Vertragsende.

(2) Auf Verlangen in Textform, das innerhalb von 30 Tagen nach Vertragsende beim Anbieter eingeht, stellt der Anbieter dem Kunden die von ihm eingebrachten Inhalte (Texte, Fotos, Logo) in einem gängigen Dateiformat zur Verfügung. Ein Anspruch auf Herausgabe des Programmcodes, der Designsysteme oder einer lauffähigen Kopie der Website besteht nicht. Nach Ablauf der 30 Tage darf der Anbieter die Daten löschen, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.

(3) Der Anbieter registriert keine Domains im Namen des Kunden. Eine eigene Domain bleibt beim Domain-Anbieter des Kunden registriert und wird lediglich per DNS-Eintrag mit Pageblitz verbunden. Nach Vertragsende entfernt oder ändert der Kunde diesen Eintrag selbst; einer Übertragung bedarf es nicht.

## § 19 Schlussbestimmungen

(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.

(2) Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand für alle Streitigkeiten aus diesem Vertrag der Sitz des Anbieters (Bocholt). Der Anbieter darf den Kunden auch an dessen allgemeinem Gerichtsstand verklagen.

(3) Erklärungen zum Vertrag (z. B. Kündigung, Ankündigungen, Herausgabeverlangen) bedürfen der Textform; eine E-Mail genügt. Die Kündigung im Kundenkonto steht der Textform gleich.

(4) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle der unwirksamen Bestimmung tritt die gesetzliche Regelung.
