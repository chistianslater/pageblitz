# AVV-Entwurf Pageblitz — zur anwaltlichen Prüfung

Entwurf vom 13.10.2026. **Nicht veröffentlicht** — weder als Seite noch im
Checkout verlinkt. Die AGB (§ 17, `shared/agb.ts`) verweisen auf diesen
Vertrag als Bestandteil, „auf Anfrage“ bereitgestellt.

Alle technischen Angaben (Anlage 1–3) sind aus dem Code und
`docs/BETRIEB-V2.md` erhoben (Stand main `a347734c`). Stellen mit
**`[PRÜFEN]`** sind dort nicht belegt und müssen vom Betreiber geklärt
werden, bevor der Vertrag verwendet wird.

## Bitte prüfen lassen

1. **Rollenverteilung:** Kunde = Verantwortlicher für Besucherdaten seiner
   Website; Pageblitz = Auftragsverarbeiter. Passt das auch für den
   KI-Chat (Pageblitz liefert Prompt und Modell) und die Besucherstatistik
   (Umami, von Pageblitz für alle Kunden betrieben)? Oder teils gemeinsame
   Verantwortung (Art. 26)?
2. **KI-Anbieter (Anlage 3):** Der Code spricht einen OpenAI-kompatiblen
   Endpunkt an, der per Env gesetzt wird (`BUILT_IN_FORGE_API_URL`; der Code
   kennt ausdrücklich Moonshot/Kimi, `api.moonshot.ai`) und fällt auf Google
   Gemini zurück. Welcher Anbieter in Produktion läuft, steht nicht im Repo.
   Bei einem Anbieter außerhalb der EU/des EWR (z. B. China) ist eine
   Drittlandübermittlung von Chat-Inhalten der Besucher zu klären
   (Kap. V DSGVO) — ggf. Anbieter wechseln.
3. **Hosting-Standort:** Die Datenschutzerklärung sagt „Server in der
   Europäischen Union“ (Hostinger), Server-Metatexte und `llms.txt` sagen
   „Hosting in Deutschland“. Was stimmt? Danach beides angleichen.
4. **Genehmigung von Unterauftragsverarbeitern:** allgemeine Genehmigung mit
   Widerspruchsrecht (§ 6) — Frist und Folge (Sonderkündigung) angemessen?
5. **Löschfristen:** Für Kontaktanfragen, Terminbuchungen und Chat-Leads
   gibt es im Code keine automatische Löschung (nur Chat-Verläufe laufen
   nach 30 Tagen ab). Sollen Fristen eingeführt werden?
6. **Unsplash-Bilder:** Kundenseiten binden Stockfotos direkt von
   `images.unsplash.com` ein — Besucher-IP geht an Unsplash. Kein
   Auftragsverarbeiter, aber Hinweis in der Datenschutz-Vorlage des Kunden
   nötig? Alternative: Bilder über eigenen Speicher ausliefern.
7. **TOMs (Anlage 2):** Reicht der Detailgrad? Fehlende Punkte (Verschlüsselung
   ruhender Daten, Backup-Ort, Zugriffskonzept) sind markiert.
8. **Haftung:** AVV ohne eigene Haftungsregel, es gilt § 16 AGB neben
   Art. 82 DSGVO — so gewollt?
9. **Abschluss:** Reicht Einbeziehung über die AGB, oder muss der AVV beim
   Checkout ausdrücklich abgeschlossen werden (Textform, Art. 28 Abs. 9)?

---

# Vertrag über die Auftragsverarbeitung (Art. 28 DSGVO)

zwischen dem **Kunden** von Pageblitz (Verantwortlicher, nachfolgend
„Auftraggeber“)

und

**Christian Nießing, Diplom Designer**, handelnd unter „Pageblitz – eine Marke
von Schau und Horch“, Zum Waldschlösschen 19, 46395 Bocholt, Deutschland,
E-Mail hello@pageblitz.de (Auftragsverarbeiter, nachfolgend „Auftragnehmer“).

## § 1 Gegenstand und Dauer

(1) Gegenstand ist die Verarbeitung personenbezogener Daten durch den
Auftragnehmer im Auftrag des Auftraggebers bei der Bereitstellung der
Website des Auftraggebers über Pageblitz (Hauptvertrag nach den AGB von
Pageblitz). Erfasst sind die Daten der **Besucher der Kundenwebsite**, die
über die dort aktivierten Funktionen anfallen (Anlage 1).

(2) Nicht erfasst sind die Daten, die der Auftragnehmer als eigener
Verantwortlicher verarbeitet, insbesondere Vertrags-, Konto- und
Zahlungsdaten des Auftraggebers selbst (siehe Datenschutzerklärung unter
pageblitz.de/datenschutz).

(3) Dieser Vertrag gilt für die Dauer des Hauptvertrags und endet mit ihm.
§ 9 (Rückgabe und Löschung) gilt darüber hinaus.

## § 2 Art, Zweck, Datenarten und Betroffene

Art und Zweck der Verarbeitung, die Arten personenbezogener Daten und die
Kategorien betroffener Personen ergeben sich aus **Anlage 1**.

## § 3 Weisungen

(1) Der Auftragnehmer verarbeitet die Daten nur auf dokumentierte Weisung des
Auftraggebers, auch in Bezug auf Übermittlungen in Drittländer, es sei denn,
er ist gesetzlich zur Verarbeitung verpflichtet; dann teilt er dem
Auftraggeber die rechtliche Anforderung vor der Verarbeitung mit, sofern das
Recht dies nicht verbietet.

(2) Die Weisungen sind durch den Hauptvertrag, diesen Vertrag und die vom
Auftraggeber im Studio und Kundenkonto gewählten Einstellungen (z. B.
aktivierte Extras, Formularfelder, Benachrichtigungsadresse) festgelegt.
Weitere Weisungen erteilt der Auftraggeber in Textform.

(3) Hält der Auftragnehmer eine Weisung für rechtswidrig, weist er den
Auftraggeber unverzüglich darauf hin. Er darf die Ausführung bis zur
Bestätigung oder Änderung aussetzen.

## § 4 Vertraulichkeit

Der Auftragnehmer gewährleistet, dass sich die zur Verarbeitung befugten
Personen zur Vertraulichkeit verpflichtet haben oder einer angemessenen
gesetzlichen Verschwiegenheitspflicht unterliegen.

## § 5 Technische und organisatorische Maßnahmen

(1) Der Auftragnehmer trifft die in **Anlage 2** beschriebenen Maßnahmen nach
Art. 32 DSGVO.

(2) Die Maßnahmen dürfen dem technischen Fortschritt angepasst werden, sofern
das Schutzniveau nicht unterschritten wird. Wesentliche Änderungen
dokumentiert der Auftragnehmer.

## § 6 Unterauftragsverarbeiter

(1) Der Auftraggeber genehmigt die in **Anlage 3** genannten
Unterauftragsverarbeiter.

(2) Der Auftragnehmer informiert den Auftraggeber in Textform mindestens
[PRÜFEN: 4 Wochen] vorher über die beabsichtigte Hinzuziehung oder Ersetzung
eines Unterauftragsverarbeiters. Der Auftraggeber kann innerhalb dieser Frist
aus wichtigem datenschutzrechtlichem Grund widersprechen. Kommt keine
Einigung zustande, kann der Auftraggeber den Hauptvertrag zum Zeitpunkt der
Änderung kündigen.

(3) Der Auftragnehmer legt Unterauftragsverarbeitern vertraglich dieselben
Datenschutzpflichten auf wie in diesem Vertrag. Bei Verarbeitung außerhalb
der EU/des EWR stellt er sicher, dass die Voraussetzungen der Art. 44 ff.
DSGVO erfüllt sind (z. B. Angemessenheitsbeschluss einschließlich EU-US Data
Privacy Framework oder Standardvertragsklauseln).

## § 7 Unterstützung des Auftraggebers

(1) Der Auftragnehmer unterstützt den Auftraggeber mit geeigneten Maßnahmen
bei der Erfüllung der Betroffenenrechte (Art. 12–23 DSGVO). Wendet sich ein
Betroffener direkt an den Auftragnehmer, leitet dieser die Anfrage
unverzüglich an den Auftraggeber weiter.

(2) Der Auftraggeber kann Kontaktanfragen, Terminbuchungen und Chat-Anfragen
im Kundenkonto einsehen. Auskunft oder Löschung einzelner Datensätze, die er
dort nicht selbst vornehmen kann, führt der Auftragnehmer auf Weisung in
Textform aus.

(3) Der Auftragnehmer unterstützt den Auftraggeber bei den Pflichten nach
Art. 32–36 DSGVO (Sicherheit, Meldung von Verletzungen,
Datenschutz-Folgenabschätzung, vorherige Konsultation) unter
Berücksichtigung der ihm vorliegenden Informationen.

## § 8 Meldung von Verletzungen

Der Auftragnehmer meldet dem Auftraggeber eine Verletzung des Schutzes
personenbezogener Daten unverzüglich, möglichst innerhalb von 24 Stunden
nach Bekanntwerden, in Textform mit den ihm vorliegenden Angaben nach
Art. 33 Abs. 3 DSGVO.

## § 9 Rückgabe und Löschung

Nach Ende des Hauptvertrags löscht der Auftragnehmer die im Auftrag
verarbeiteten Daten innerhalb von 30 Tagen, sofern nicht eine gesetzliche
Pflicht zur Speicherung besteht. Verlangt der Auftraggeber innerhalb dieser
Frist in Textform die Herausgabe (z. B. seiner Kontaktanfragen und
Terminbuchungen), stellt der Auftragnehmer sie vor der Löschung in einem
gängigen Dateiformat bereit. Datensicherungen werden im Rahmen ihres
regulären Zyklus überschrieben [PRÜFEN: Aufbewahrungsdauer der Backups].

## § 10 Nachweise und Kontrollen

(1) Der Auftragnehmer stellt dem Auftraggeber auf Anfrage die zum Nachweis
der Einhaltung dieses Vertrags erforderlichen Informationen zur Verfügung.

(2) Der Auftraggeber kann Überprüfungen, einschließlich Inspektionen, nach
rechtzeitiger Anmeldung (in der Regel 4 Wochen) während der üblichen
Geschäftszeiten durchführen oder durch einen zur Verschwiegenheit
verpflichteten Prüfer durchführen lassen. Vorrangig genügen aussagekräftige
Unterlagen, Selbstauskünfte oder Nachweise der Unterauftragsverarbeiter
(z. B. Zertifizierungen). Der Aufwand ist angemessen zu begrenzen.

## § 11 Pflichten des Auftraggebers

Der Auftraggeber ist für die Rechtmäßigkeit der Verarbeitung gegenüber den
Besuchern seiner Website verantwortlich, insbesondere für die Information
der Betroffenen (Datenschutzerklärung) und — soweit nötig — die Einholung
von Einwilligungen. Die von Pageblitz erzeugte Datenschutz-Vorlage ist nach
§ 13 AGB nur eine Vorlage.

## § 12 Schlussbestimmungen

(1) Bei Widersprüchen geht dieser Vertrag dem Hauptvertrag vor, soweit es um
den Schutz personenbezogener Daten geht.

(2) Änderungen und Ergänzungen bedürfen der Textform.

(3) Sollte eine Bestimmung unwirksam sein, bleibt der Vertrag im Übrigen
wirksam.

---

## Anlage 1 — Art, Zweck, Daten, Betroffene

**Betroffene:** Besucher der Website des Auftraggebers; Personen, die über
die Website Kontakt aufnehmen, Termine buchen oder den KI-Chat nutzen.

| Funktion (Extra) | Daten | Zweck | Speicherung (laut Code) |
|---|---|---|---|
| Aufruf der Website (immer) | IP-Adresse, Zeitpunkt, aufgerufene Seite, Browserangaben (Server-Logs) | Auslieferung, Sicherheit | Server-Logs beim Hosting [PRÜFEN: Dauer] |
| Besucherstatistik (Umami, bei aktiven Websites) | Seitenaufrufe, Verweildauer, Herkunft, Gerätetyp — cookielos, IP wird nicht gespeichert | Reichweitenmessung für den Auftraggeber (Statistik im Kundenkonto) | Umami-Datenbank [PRÜFEN: Dauer, Standort] |
| Kontaktformular | Name, E-Mail, Telefon (optional), Nachricht, vom Auftraggeber definierte Zusatzfelder, IP-Adresse (Missbrauchsschutz) | Weiterleitung der Anfrage an den Auftraggeber per E-Mail, Ablage im Kundenkonto | Tabelle `contact_submissions`, keine automatische Löschung |
| Terminbuchung | Name, E-Mail, Telefon (optional), Nachricht, gewünschter Termin, Status | Terminvereinbarung, Bestätigungs- und Absage-Mails | Tabelle `appointments`, keine automatische Löschung |
| KI-Chat | Chatverlauf, ggf. Name, E-Mail, Telefon, KI-Zusammenfassung des Anliegens | Beantwortung von Besucherfragen, Weitergabe von Anfragen an den Auftraggeber | Verlauf `chat_transcripts` 30 Tage (`expiresAt`); Anfragen `chat_leads` ohne automatische Löschung |

## Anlage 2 — Technische und organisatorische Maßnahmen (Zusammenfassung)

Erhoben aus Code und Betriebsdoku; Lücken markiert.

- **Hosting:** eigener virtueller Server (VPS) bei Hostinger, Betrieb mit
  Nginx und PM2, Datenbank MySQL auf demselben Server. Standort
  [PRÜFEN: Deutschland oder anderes EU-Land — Datenschutzerklärung sagt EU,
  Metatexte sagen Deutschland].
- **Verschlüsselung bei der Übertragung:** alle Seiten und Schnittstellen
  ausschließlich per HTTPS/TLS.
- **Verschlüsselung ruhender Daten:** [PRÜFEN: Datenträger-/Datenbankverschlüsselung
  auf dem VPS nicht dokumentiert].
- **Zugang zum Server:** nur per SSH mit Schlüssel [PRÜFEN: Passwort-Login
  deaktiviert? Firewall?]. Administrativer Zugang nur durch den Betreiber.
- **Zugang zur Anwendung:** Kundenkonto per Magic Link (Einmal-Token, als
  SHA-256-Hash gespeichert, begrenzte Gültigkeit) bzw. Google-Anmeldung;
  getrennter Admin-Zugang. Kunden sehen nur Daten ihrer eigenen Website
  (Besitzprüfung serverseitig).
- **Trennung:** Daten aller Kunden in einer Datenbank, logisch getrennt über
  die Website-Zuordnung (`websiteId`) und serverseitige Prüfung.
- **Missbrauchsschutz:** Ratenbegrenzung je IP für Kontaktformular und
  Chats, Honeypot-Feld gegen Bots.
- **Datensparsamkeit:** Besucherstatistik ohne Cookies und ohne
  IP-Speicherung; Chat-Verläufe laufen nach 30 Tagen ab.
- **Datensicherung:** Datenbank-Sicherungen auf dem Server (`/root/backups`)
  vor Migrationen [PRÜFEN: regelmäßige automatische Backups, Ort außerhalb
  des Servers, Aufbewahrungsdauer, Wiederherstellungstest].
- **Medien:** hochgeladene Bilder in Cloudflare R2 (Objektspeicher),
  ausgeliefert über `media.pageblitz.de`.
- **Verfügbarkeit:** Prozessüberwachung und Neustart durch PM2
  [PRÜFEN: Monitoring/Alarmierung].
- **Organisation:** Einzelunternehmen, Verarbeitung nur durch den Betreiber
  [PRÜFEN: weitere Personen mit Zugriff, Verpflichtung auf Vertraulichkeit].

## Anlage 3 — Unterauftragsverarbeiter

Nur Dienste, die laut Code **Besucherdaten der Kundenwebsites** verarbeiten.

| Dienst | Leistung | Daten | Sitz / Ort |
|---|---|---|---|
| Hostinger International Ltd., 61 Lordou Vironos str., 6023 Larnaca, Zypern | Server (VPS), Datenbank, Server-Logs | alle in Anlage 1 | Server in der EU [PRÜFEN: Land] |
| Cloudflare, Inc. (R2) | Speicherung/Auslieferung hochgeladener Bilder | Abruf durch Besucher (IP-Adresse, technische Daten) | [PRÜFEN: Vertragspartner, Bucket-Region] |
| Resend Inc., 2261 Market Street #5139, San Francisco, CA 94114, USA | Versand der Benachrichtigungs- und Bestätigungs-Mails (Kontaktformular, Terminbuchung, KI-Chat-Anfragen) | Name, E-Mail, Telefon, Nachricht, Termin | USA [PRÜFEN: Übermittlungsgrundlage, z. B. DPF/SCC] |
| KI-Anbieter, Endpunkt per `BUILT_IN_FORGE_API_URL` (laut Code z. B. Moonshot AI / Kimi) | Antworten des KI-Chats, Zusammenfassung von Anfragen | Chat-Inhalte, ggf. Kontaktdaten im Chat | [PRÜFEN: tatsächlicher Anbieter in Produktion und Sitz] |
| Google (Gemini API, `generativelanguage.googleapis.com`) | Ersatz-KI, wenn der Haupt-Anbieter ausfällt | wie KI-Anbieter | [PRÜFEN: Vertragspartner Google Ireland/LLC, Region] |
| Umami (Besucherstatistik, `analytics.pageblitz.de`) | Reichweitenmessung | siehe Anlage 1 | [PRÜFEN: selbst betrieben auf dem Hostinger-Server oder Umami Cloud?] |

**Keine Unterauftragsverarbeiter für Besucherdaten** (verarbeiten nur Daten
des Auftraggebers oder öffentliche Betriebsdaten, eigene Verantwortung des
Auftragnehmers): Stripe (Zahlung des Auftraggebers), Google Places API
(Betriebsdaten aus dem Google-Unternehmensprofil), Unsplash API
(Bildsuche), HeyMail (Postkarten-Versand an Betriebe), Google Analytics,
Microsoft Clarity und Meta-Pixel (nur auf pageblitz.de und im Studio, nicht
auf Kundenwebsites).

**Hinweis:** Kundenwebsites binden Stockfotos direkt von
`images.unsplash.com` ein; dabei erhält Unsplash die IP-Adresse der
Besucher. Google-Maps-Verweise sind reine Links (kein eingebettetes
Kartenmaterial), Schriften werden nicht von Google Fonts geladen.
