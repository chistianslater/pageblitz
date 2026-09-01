import { BLOG_POSTS_BATCH2 } from "./blogPosts2";
import { BLOG_POSTS_BATCH3 } from "./blogPosts3";
import { BLOG_POSTS_BATCH4 } from "./blogPosts4";

/**
 * Blog-Artikel als Daten (ausgelagert aus blog.ts, 2026-08-31, damit
 * beide Dateien unter der 800-Zeilen-Grenze bleiben). `bodyHtml` ist
 * Autoren-HTML aus diesem Repo (kein User-Input) — NIEMALS Fremdinhalte
 * hier einfügen. Neuer Artikel = neues Objekt + Eintrag in BLOG_POSTS.
 */

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  /** Themen-Rubrik fürs Index-Tag (kurz, z. B. "Recht & Pflichten"). */
  category: string;
  /** ISO-Datum (YYYY-MM-DD) für sichtbares Datum + Schema. */
  publishedAt: string;
  updatedAt: string;
  teaser: string;
  readingMinutes: number;
  bodyHtml: string;
  faq: { question: string; answer: string }[];
}

const IMPRESSUM_POST: BlogPost = {
  slug: "impressum-fuer-kleinunternehmer",
  category: "Recht & Pflichten",
  title:
    "Impressum für Kleinunternehmer: Pflichtangaben, Muster und häufige Fehler",
  metaTitle: "Impressum für Kleinunternehmer erstellen | Pageblitz",
  metaDescription:
    "Welche Angaben ins Impressum gehören, was für Kleinunternehmer gilt und welche Fehler abgemahnt werden – mit Muster und Checkliste (Stand 2026).",
  publishedAt: "2026-08-31",
  updatedAt: "2026-08-31",
  readingMinutes: 7,
  teaser:
    "Fast jede geschäftliche Website braucht ein Impressum – auch die von Kleinunternehmern. Welche Angaben Pflicht sind, was du weglassen darfst und welche Fehler wirklich teuer werden.",
  bodyHtml: `
<p>Wer in Deutschland eine geschäftliche Website betreibt, braucht ein Impressum – das gilt für die GmbH genauso wie für den Ein-Personen-Betrieb mit Kleinunternehmerregelung. Die Rechtsgrundlage ist seit Mai 2024 <strong>§ 5 des Digitale-Dienste-Gesetzes (DDG)</strong>; vorher stand die Pflicht fast wortgleich in § 5 TMG. Für dich ändert das inhaltlich wenig – aber wenn dein Impressum noch „gemäß § 5 TMG“ zitiert, ist das ein Zeichen, dass es länger nicht aktualisiert wurde.</p>

<h2>Wer braucht überhaupt ein Impressum?</h2>
<p>Kurz gesagt: jeder, der seine Website nicht rein privat betreibt. Sobald du Leistungen anbietest, für deinen Betrieb wirbst oder auch nur deine Öffnungszeiten für Kundschaft zeigst, ist die Seite „geschäftsmäßig“ – und damit impressumspflichtig. Auf die Größe kommt es nicht an: Auch als Kleinunternehmer nach § 19 UStG, als Freiberufler oder im Nebengewerbe brauchst du die Anbieterkennzeichnung. Eine Ausnahme gilt nur für rein persönliche oder familiäre Seiten ohne jeden geschäftlichen Bezug.</p>

<h2>Diese Angaben sind Pflicht</h2>
<p>Für Einzelunternehmer und Kleinunternehmer sieht die Pflichtliste überschaubar aus:</p>
<ul>
<li><strong>Vollständiger Name</strong> – Vor- und Nachname, kein Künstler- oder reiner Firmenname. Führst du eine Geschäftsbezeichnung („Salon Anna“), steht sie zusätzlich dabei, ersetzt den Namen aber nicht.</li>
<li><strong>Ladungsfähige Anschrift</strong> – Straße, Hausnummer, PLZ, Ort. Ein Postfach genügt nicht; unter der Adresse muss dir Post förmlich zugestellt werden können.</li>
<li><strong>Schnelle Kontaktmöglichkeit</strong> – eine E-Mail-Adresse ist Pflicht. Dazu ein zweiter schneller Weg, in der Praxis die Telefonnummer.</li>
<li><strong>Umsatzsteuer-Identifikationsnummer</strong> – aber nur, wenn du eine hast. Als Kleinunternehmer ohne USt-IdNr. lässt du die Angabe einfach weg. Wichtig: Deine <em>Steuernummer</em> gehört nicht ins Impressum – sie ist keine Pflichtangabe, und du gibst ohne Not ein Datum preis, das für Identitätsmissbrauch taugt.</li>
<li><strong>Registereinträge</strong> – nur relevant, wenn dein Betrieb im Handels-, Vereins- oder Genossenschaftsregister steht. Der typische Kleinunternehmer ist das nicht.</li>
<li><strong>Aufsichtsbehörde</strong> – nur bei erlaubnispflichtigen Tätigkeiten (etwa Gastronomie mit Ausschank, Makler, Bewachungsgewerbe): Behörde mit Anschrift nennen.</li>
<li><strong>Kammer und Berufsbezeichnung</strong> – bei reglementierten Berufen (z. B. Meisterbetriebe im zulassungspflichtigen Handwerk, Heilberufe): zuständige Kammer, gesetzliche Berufsbezeichnung und der Staat, der sie verliehen hat.</li>
</ul>

<h2>Was gilt speziell für Kleinunternehmer?</h2>
<p>Die Kleinunternehmerregelung nach § 19 UStG ist eine reine Umsatzsteuer-Frage – ins Impressum gehört dazu <strong>kein</strong> Hinweis. Der Satz „Als Kleinunternehmer wird keine Umsatzsteuer ausgewiesen“ gehört auf deine <em>Rechnungen</em>, nicht auf die Website. Fürs Impressum bedeutet die Regelung nur: Du hast meist keine USt-IdNr. und lässt das Feld weg. Alles andere – Name, Anschrift, Kontakt – gilt für dich in vollem Umfang.</p>

<h2>Wohin mit dem Impressum?</h2>
<p>Das Gesetz verlangt, dass die Angaben „leicht erkennbar, unmittelbar erreichbar und ständig verfügbar“ sind. Bewährt hat sich der Link „Impressum“ im Footer, sichtbar auf jeder Seite – maximal zwei Klicks von jeder Unterseite entfernt. Verstecke ihn nicht hinter kreativen Namen wie „Über diese Seite“: Gerichte erwarten die üblichen Bezeichnungen „Impressum“ oder „Anbieterkennzeichnung“. Das gilt übrigens auch für deine geschäftlichen Social-Media-Profile – dort genügt ein gut erreichbarer Link auf das Impressum deiner Website.</p>

<h2>Diese Fehler werden wirklich abgemahnt</h2>
<ul>
<li><strong>Gar kein Impressum</strong> – der Klassiker bei „ist ja nur eine kleine Seite“. Ein fehlendes Impressum ist ein Wettbewerbsverstoß und kann von Konkurrenten kostenpflichtig abgemahnt werden; zusätzlich drohen Bußgelder.</li>
<li><strong>Postfach statt Adresse</strong> – die Anschrift muss ladungsfähig sein.</li>
<li><strong>Kontaktformular statt E-Mail-Adresse</strong> – ein Formular allein reicht nicht, die E-Mail-Adresse muss genannt sein.</li>
<li><strong>Veralteter Streitschlichtungs-Link</strong> – der jahrelang übliche Link zur EU-Streitbeilegungsplattform (ec.europa.eu/consumers/odr) ist überholt: Die Plattform wurde im Juli 2025 abgeschaltet. Der tote Link macht dein Impressum angreifbar – raus damit. Was bleibt: Betriebe mit mehr als zehn Beschäftigten müssen nach § 36 VSBG angeben, ob sie an Verbraucherschlichtung teilnehmen; kleinere Betriebe trifft diese Pflicht nicht.</li>
<li><strong>Copy-Paste von der Konkurrenz</strong> – fremde Impressen enthalten fremde Registerangaben und Formulierungen, die auf dich nicht zutreffen. Falsche Pflichtangaben sind schlimmer als schlicht formulierte richtige.</li>
</ul>

<h2>Muster: Impressum für einen Kleinunternehmer</h2>
<pre class="blog-muster">Impressum

Angaben gemäß § 5 DDG

Max Mustermann
Malerbetrieb Mustermann
Musterstraße 12
12345 Musterstadt

Telefon: 01234 567890
E-Mail: kontakt@musterbetrieb.de

Zuständige Handwerkskammer: HWK Musterstadt
Berufsbezeichnung: Maler- und Lackierermeister
(verliehen in Deutschland)</pre>
<p>Die letzten drei Zeilen brauchst du nur bei Kammerberufen; die USt-IdNr. ergänzt du, sobald du eine hast. Prüfe jede Zeile gegen deine echten Daten – ein Muster ersetzt keine Kontrolle.</p>

<h2>Der schnellste Weg zum fertigen Impressum</h2>
<p>Wenn du deine Website mit <a href="/">Pageblitz</a> erstellst, fragt das Studio die nötigen Angaben einmal ab und erzeugt Impressum und Datenschutzerklärung automatisch als eigene Seiten – korrekt verlinkt im Footer, auf jeder Unterseite erreichbar. Änderungen an Adresse oder Kontakt pflegst du an einer Stelle, die Rechtsseiten ziehen nach.</p>

<p class="blog-disclaimer">Dieser Artikel ist eine sorgfältig recherchierte Orientierung, aber keine Rechtsberatung. Bei Sonderfällen – etwa reglementierten Berufen oder Auslandsbezug – hilft eine kurze Prüfung durch eine Kanzlei oder deine Kammer.</p>
`,
  faq: [
    {
      question: "Brauche ich als Kleinunternehmer wirklich ein Impressum?",
      answer:
        "Ja. Die Impressumspflicht nach § 5 DDG hängt nicht von der Unternehmensgröße oder der Kleinunternehmerregelung ab, sondern davon, dass die Website geschäftsmäßig betrieben wird – und das ist bei jeder Betriebs-Website der Fall.",
    },
    {
      question: "Muss meine Steuernummer ins Impressum?",
      answer:
        "Nein. Die Steuernummer ist keine Pflichtangabe und sollte aus Datenschutzgründen nicht veröffentlicht werden. Pflicht ist nur die Umsatzsteuer-Identifikationsnummer – und auch die nur, wenn du eine besitzt.",
    },
    {
      question: "Muss ich auf die Kleinunternehmerregelung hinweisen?",
      answer:
        "Nicht im Impressum. Der Hinweis nach § 19 UStG, dass keine Umsatzsteuer ausgewiesen wird, gehört auf deine Rechnungen – auf der Website ist er nicht vorgeschrieben.",
    },
    {
      question: "Reicht ein Kontaktformular statt einer E-Mail-Adresse?",
      answer:
        "Nein. Das Impressum muss eine E-Mail-Adresse nennen. Ein Kontaktformular darfst du zusätzlich anbieten, es ersetzt die Pflichtangabe aber nicht.",
    },
    {
      question: "Was ist mit dem Link zur EU-Streitschlichtungsplattform?",
      answer:
        "Die EU-Plattform zur Online-Streitbeilegung wurde im Juli 2025 eingestellt – der früher übliche Link gehört nicht mehr ins Impressum. Betriebe mit mehr als zehn Beschäftigten geben weiterhin nach § 36 VSBG an, ob sie an Verbraucherschlichtungsverfahren teilnehmen.",
    },
  ],
};

const KOSTEN_POST: BlogPost = {
  slug: "was-kostet-eine-website-fuer-kleinunternehmen",
  category: "Kosten & Vergleich",
  title: "Was kostet eine Website für Kleinunternehmen? Alle Preise im Überblick",
  metaTitle: "Website-Kosten für Kleinunternehmen 2026 | Pageblitz",
  metaDescription:
    "Agentur, Freelancer oder Baukasten? Was eine Firmen-Website wirklich kostet – einmalige und laufende Kosten, versteckte Posten und ein ehrlicher Vergleich.",
  publishedAt: "2026-08-31",
  updatedAt: "2026-08-31",
  readingMinutes: 8,
  teaser:
    "Zwischen 0 € und 10.000 € ist alles möglich – je nachdem, wen du fragst. Was die drei Wege wirklich kosten, welche laufenden Posten dazukommen und wo sich Sparen rächt.",
  bodyHtml: `
<p>„Was kostet eine Website?“ ist die Frage mit der größten Preisspanne im ganzen Handwerk der Selbstständigkeit: Die ehrliche Antwort reicht von einem zweistelligen Monatsbetrag bis zu fünfstelligen Agenturprojekten. Der Grund: Du bezahlst nicht „eine Website“, sondern eine von drei sehr unterschiedlichen Arbeitsweisen. Hier ist der Überblick – mit Zahlen, wie sie 2026 in Deutschland üblich sind.</p>

<h2>Weg 1: Die Agentur (2.000 – 10.000 € und mehr)</h2>
<p>Eine Webagentur baut individuell: Konzept, Design, Texte, Technik. Für eine überschaubare Betriebs-Website mit fünf bis acht Seiten liegen seriöse Angebote meist zwischen 2.000 und 6.000 €; mit Fotografie, individuellen Funktionen oder Markenentwicklung geht es schnell darüber hinaus. Dazu kommen laufende Pflegeverträge, oft 50 bis 150 € im Monat.</p>
<p>Das Ergebnis kann hervorragend sein – wenn Briefing und Budget stimmen. Für einen kleinen Betrieb ist die Rechnung trotzdem hart: Bei 4.000 € Projektkosten muss die Website sehr viele Aufträge bringen, bevor sie sich trägt. Und jede spätere Änderung („neue Öffnungszeiten, neues Foto“) läuft über die Agentur.</p>

<h2>Weg 2: Freelancer (800 – 3.000 €)</h2>
<p>Ein einzelner Webdesigner ist günstiger als eine Agentur und oft persönlicher. Übliche Spannen für eine kleine Firmen-Website: 800 bis 3.000 €, je nach Erfahrung und Umfang. Die Risiken liegen weniger im Preis als in der Verfügbarkeit: Wenn dein Freelancer in zwei Jahren keine Websites mehr baut, sucht jemand anderes sich in deinen Code ein. Kläre vorab, wem Domain und Hosting gehören (immer: dir!) und was eine Änderungsstunde später kostet.</p>

<h2>Weg 3: Baukasten – klassisch oder mit KI (10 – 40 €/Monat)</h2>
<p>Baukästen drehen die Rechnung um: keine Projektkosten, dafür ein Monatsbetrag, in dem Hosting, Domain-Anbindung und Technik-Pflege stecken. Üblich sind 10 bis 40 € im Monat. Der klassische Baukasten hat aber einen versteckten Preis: <strong>deine Zeit</strong>. Leere Vorlage, hundert Entscheidungen, eigene Texte – viele Betriebs-Websites bleiben deshalb monatelang „in Arbeit“.</p>
<p>KI-Baukästen wie <a href="/">Pageblitz</a> setzen genau da an: Statt einer leeren Vorlage bekommst du aus Firmenname und Branche eine fertige Website zur Vorschau – Texte, Bilder, Impressum und Datenschutz inklusive – und passt dann nur noch an. Bei Pageblitz kostet das 19,90 € im Monat (jährlich) bzw. 24,90 € monatlich, mit 7 Tagen Gratis-Test. Auf drei Jahre gerechnet: rund 720 € – gegenüber 4.000 € Agenturprojekt plus Pflege.</p>

<h2>Die laufenden Kosten, die jeder Weg hat</h2>
<ul>
<li><strong>Domain</strong> – die eigene Adresse (deinbetrieb.de) kostet einzeln meist 10 bis 20 € im Jahr; bei Baukästen oft im Paket enthalten.</li>
<li><strong>Hosting</strong> – der Server, auf dem die Seite liegt: einzeln 5 bis 20 € im Monat, bei Baukästen im Preis drin.</li>
<li><strong>SSL-Zertifikat</strong> – Pflicht für jede seriöse Seite; heute fast überall kostenlos enthalten. Wenn jemand dafür extra Geld will: Finger weg.</li>
<li><strong>Pflege und Updates</strong> – der unterschätzte Posten. Selbstgehostete Systeme wie WordPress brauchen regelmäßige Sicherheits-Updates; ungepflegte Installationen sind das häufigste Einfallstor für gehackte Firmen-Websites.</li>
</ul>

<h2>Versteckte Kosten, auf die du achten solltest</h2>
<ul>
<li><strong>Rechtstexte</strong> – Impressum und Datenschutzerklärung müssen stimmen. Anwaltlich erstellt kostet das dreistellig; gute Systeme erzeugen sie automatisch aus deinen Angaben.</li>
<li><strong>Änderungen nach Launch</strong> – bei Agentur und Freelancer kostet jede Anpassung Stunden­sätze von 60 bis 120 €. Rechne über drei Jahre realistisch mit mehreren Änderungsrunden.</li>
<li><strong>„Kostenlos“-Angebote</strong> – Gratis-Baukästen finanzieren sich über Fremdwerbung auf deiner Seite und eine Subdomain wie deinbetrieb.gratisanbieter.xyz. Für einen echten Betrieb ist das teurer als jeder Monatsbeitrag: Es kostet Vertrauen.</li>
</ul>

<h2>Welcher Weg passt zu wem?</h2>
<p>Die Agentur lohnt sich, wenn deine Website selbst das Produkt ist – aufwändige Portale, Online-Shops mit vielen Artikeln, starke Markeninszenierung. Der Freelancer ist ein guter Mittelweg, wenn du individuelle Wünsche hast und einen verlässlichen Partner kennst. Für den typischen lokalen Betrieb – Handwerk, Salon, Praxis, Gastronomie – liefert ein moderner Baukasten heute in Stunden, wofür früher Wochen und Tausende Euro nötig waren: eine professionelle, rechtlich saubere Website, die du selbst aktuell halten kannst.</p>
`,
  faq: [
    {
      question: "Was kostet eine einfache Firmen-Website im Monat?",
      answer:
        "Bei Baukasten-Anbietern liegen die Gesamtkosten inklusive Hosting und Domain-Anbindung meist zwischen 10 und 40 € im Monat. Pageblitz kostet 19,90 € im Monat bei jährlicher Zahlung (24,90 € monatlich) – inklusive Hosting in Deutschland, Rechtstexten und Anpassungen per KI.",
    },
    {
      question: "Warum sind Agentur-Websites so teuer?",
      answer:
        "Du bezahlst Arbeitszeit: Konzeption, individuelles Design, Texterstellung, Entwicklung und Projektmanagement summieren sich schnell auf 40 bis 80 Arbeitsstunden. Bei üblichen Stundensätzen von 60 bis 120 € ergibt das die typischen Projektpreise ab 2.000 €.",
    },
    {
      question: "Ist eine kostenlose Website eine Option für Betriebe?",
      answer:
        "Für einen geschäftlichen Auftritt in der Regel nicht: Gratis-Angebote bedeuten fast immer Fremdwerbung, eine unseriös wirkende Subdomain und eingeschränkte Funktionen. Die Ersparnis kostet Vertrauen – und damit Aufträge.",
    },
    {
      question: "Welche laufenden Kosten fallen bei jeder Website an?",
      answer:
        "Mindestens Domain (ca. 10–20 €/Jahr) und Hosting (ca. 5–20 €/Monat, bei Baukästen im Paketpreis enthalten). Dazu kommt Pflegeaufwand: Updates, Textänderungen und aktuelle Rechtstexte.",
    },
  ],
};

const WIX_ALTERNATIVE_POST: BlogPost = {
  slug: "wix-alternative",
  category: "Kosten & Vergleich",
  title: "Wix-Alternative gesucht? Worauf deutsche Kleinunternehmen achten sollten",
  metaTitle: "Wix-Alternative für deutsche Kleinunternehmen | Pageblitz",
  metaDescription:
    "Baukasten ist nicht gleich Baukasten: DSGVO, deutsche Rechtstexte, Zeitaufwand und Preis im Vergleich – und wann eine KI-Alternative die bessere Wahl ist.",
  publishedAt: "2026-08-31",
  updatedAt: "2026-08-31",
  readingMinutes: 7,
  teaser:
    "Wix ist der bekannteste Website-Baukasten der Welt – aber nicht automatisch die beste Wahl für einen deutschen Betrieb. Die vier Kriterien, die wirklich zählen.",
  bodyHtml: `
<p>Wer „Website erstellen“ googelt, landet früher oder später bei Wix – einem der größten Baukasten-Anbieter weltweit, mit riesigem Funktionsumfang und Hunderten Vorlagen. Trotzdem suchen viele deutsche Kleinunternehmer nach einer Alternative. Meist nicht, weil Wix schlecht wäre, sondern weil ein internationaler Alleskönner andere Prioritäten hat als ein Malerbetrieb in Dortmund. Hier sind die vier Kriterien, an denen du jede Alternative messen solltest – und ein ehrlicher Blick darauf, wo welche Lösung passt.</p>

<h2>Kriterium 1: DSGVO und Datenstandort</h2>
<p>Als Betreiber bist du für den Datenschutz deiner Website verantwortlich – egal, welchen Baukasten du nutzt. Mit einem Anbieter, der Daten in Deutschland oder der EU hostet und seine Werkzeuge auf deutsches Recht ausrichtet, ist dieser Teil deutlich einfacher: kurze Wege, passende Auftragsverarbeitungsverträge, keine Debatten um Drittlands-Transfers. Bei internationalen Plattformen musst du genauer hinsehen, welche Dienste eingebunden sind und wo Daten verarbeitet werden. Machbar ist es – es ist nur mehr Arbeit, die an dir hängen bleibt.</p>

<h2>Kriterium 2: Deutsche Rechtstexte</h2>
<p>Impressumspflicht nach § 5 DDG, Datenschutzerklärung nach DSGVO, Cookie-Einwilligung nach § 25 TDDDG – das deutsche Pflichtenpaket ist speziell. Internationale Baukästen liefern dafür generische Bausteine oder verweisen auf externe Generatoren; die Verantwortung, dass alles vollständig und aktuell ist, liegt bei dir. Anbieter, die für den deutschen Markt gebaut sind, erzeugen diese Seiten aus deinen Angaben und halten die Struktur aktuell. Für einen Betrieb ohne Rechtsabteilung ist das der vielleicht unterschätzteste Unterschied.</p>

<h2>Kriterium 3: Dein Zeitaufwand</h2>
<p>Der klassische Baukasten – ob Wix, Jimdo oder Squarespace – gibt dir eine Vorlage und volle Freiheit. Das ist Stärke und Falle zugleich: Zwischen leerer Vorlage und fertiger Website liegen viele Abende mit Layout-Entscheidungen, Textschreiben und Bildersuche. Genau hier setzen KI-basierte Alternativen an: <a href="/">Pageblitz</a> erstellt aus Firmenname und Branche eine komplette Website zur Vorschau – Texte, passende Bilder, Struktur, Rechtsseiten – und du änderst anschließend nur, was dir nicht gefällt. Der Unterschied ist nicht „mehr Features“, sondern: Du startest bei 90 % statt bei 0 %.</p>

<h2>Kriterium 4: Der ehrliche Preisvergleich</h2>
<p>Vergleiche nie nur den Einstiegspreis, sondern das, was du wirklich brauchst: eigene Domain, keine Fremdwerbung, ausreichender Speicher und die Funktionen deines Betriebs (Kontaktformular, Galerie, Terminanfrage). Bei den meisten Anbietern landest du damit in Tarifen zwischen 15 und 40 € im Monat – die beworbenen Gratis- oder Mini-Tarife sind für geschäftliche Auftritte selten geeignet. Pageblitz liegt mit 19,90 €/Monat (jährlich) mitten in diesem Feld, inklusive Hosting in Deutschland und automatischen Rechtstexten.</p>

<h2>Wann Wix trotzdem die richtige Wahl ist</h2>
<p>Fairerweise: Wenn du gern selbst gestaltest, sehr spezielle Design-Vorstellungen hast oder Funktionen aus einem großen App-Markt brauchst, bist du bei einem großen internationalen Baukasten gut aufgehoben – die Gestaltungsfreiheit ist dort enorm. Die Alternative lohnt sich für alle, die das Gegenteil wollen: möglichst wenig Zeit an der Website verbringen, deutsches Recht ohne Eigenrecherche abgedeckt wissen und ein Ergebnis, das ohne Design-Kenntnisse professionell aussieht.</p>

<h2>Checkliste für deine Entscheidung</h2>
<ul>
<li>Wo werden die Daten gehostet – und gibt es einen AV-Vertrag nach DSGVO?</li>
<li>Erzeugt der Anbieter Impressum und Datenschutzerklärung nach deutschem Recht automatisch?</li>
<li>Wie viele Stunden kostet dich der Weg von der Anmeldung bis zur fertigen Seite?</li>
<li>Was kostet der Tarif, den du <em>wirklich</em> brauchst (Domain, werbefrei, deine Funktionen)?</li>
<li>Kommst du an deine Inhalte, wenn du später wechseln willst?</li>
</ul>
`,
  faq: [
    {
      question: "Ist Wix DSGVO-konform nutzbar?",
      answer:
        "Grundsätzlich ja – die Verantwortung liegt aber wie bei jedem Baukasten beim Website-Betreiber. Bei internationalen Anbietern musst du selbst prüfen, welche Dienste eingebunden sind, wo Daten verarbeitet werden und ob deine Datenschutzerklärung das korrekt abbildet.",
    },
    {
      question: "Was ist der größte Unterschied zwischen Wix und Pageblitz?",
      answer:
        "Der Startpunkt: Wix gibt dir Vorlagen und volle Gestaltungsfreiheit, du baust selbst. Pageblitz erstellt aus Firmenname und Branche eine fertige Website zur Vorschau – inklusive Texten, Bildern und deutschen Rechtsseiten – und du passt nur noch an.",
    },
    {
      question: "Kann ich mit einem Gratis-Tarif geschäftlich starten?",
      answer:
        "Davon ist abzuraten: Gratis-Tarife bedeuten in der Regel Fremdwerbung, keine eigene Domain und fehlende Geschäftsfunktionen. Für einen seriösen Betriebsauftritt brauchst du bei praktisch jedem Anbieter einen Bezahl-Tarif.",
    },
    {
      question: "Worauf sollte ich beim Anbieterwechsel achten?",
      answer:
        "Sichere dir vor dem Wechsel deine Inhalte (Texte, Bilder) und stelle sicher, dass die Domain auf dich registriert ist. Dann kannst du sie zum neuen Anbieter mitnehmen und bleibst unter derselben Adresse erreichbar.",
    },
  ],
};

const DATENSCHUTZ_POST: BlogPost = {
  slug: "datenschutzerklaerung-firmen-website",
  category: "Recht & Pflichten",
  title: "Datenschutzerklärung für die Firmen-Website: Was wirklich rein muss",
  metaTitle: "Datenschutzerklärung für die Website erstellen | Pageblitz",
  metaDescription:
    "DSGVO-Pflichten für kleine Betriebe verständlich erklärt: Pflichtinhalte der Datenschutzerklärung, Cookie-Banner nach § 25 TDDDG und die häufigsten Fehler.",
  publishedAt: "2026-08-31",
  updatedAt: "2026-08-31",
  readingMinutes: 8,
  teaser:
    "Neben dem Impressum ist sie die zweite Pflichtseite jeder Betriebs-Website: die Datenschutzerklärung. Was hinein muss, wann du ein Cookie-Banner brauchst – und wann nicht.",
  bodyHtml: `
<p>Jede Website verarbeitet personenbezogene Daten – spätestens, wenn der Server die IP-Adresse eines Besuchers entgegennimmt. Deshalb braucht praktisch jede geschäftliche Website eine <strong>Datenschutzerklärung</strong> nach Art. 13 DSGVO. Anders als beim Impressum reicht hier kein Dreizeiler: Die Erklärung muss beschreiben, was deine konkrete Website tatsächlich tut. Die gute Nachricht: Bei einer typischen Betriebs-Website ist das überschaubar – wenn man weiß, worauf es ankommt.</p>

<h2>Diese Inhalte gehören in jede Datenschutzerklärung</h2>
<ul>
<li><strong>Verantwortlicher</strong> – wer die Website betreibt, mit Name und Kontaktdaten (deckt sich meist mit dem Impressum).</li>
<li><strong>Hosting</strong> – wo die Seite liegt und dass der Hoster dabei technisch notwendige Daten (etwa IP-Adressen in Server-Logs) verarbeitet, inklusive Rechtsgrundlage.</li>
<li><strong>Kontaktaufnahme</strong> – was mit Daten aus Kontaktformular, E-Mail oder Telefonanfrage passiert und wie lange sie gespeichert werden.</li>
<li><strong>Eingebundene Dienste</strong> – jeder externe Dienst einzeln: Karten (Google Maps), Analyse-Tools, eingebettete Videos, Web-Fonts von fremden Servern, Buchungs-Widgets. Für jeden: Zweck, Anbieter, Rechtsgrundlage.</li>
<li><strong>Betroffenenrechte</strong> – Auskunft, Berichtigung, Löschung, Widerspruch, Beschwerderecht bei der Aufsichtsbehörde.</li>
</ul>
<p>Die Faustregel: Die Erklärung muss zu deiner Website passen wie der Beipackzettel zum Medikament. Eine kopierte Erklärung, die Dienste beschreibt, die du gar nicht nutzt – oder deine echten Dienste verschweigt – ist keine Formalie, sondern ein Mangel.</p>

<h2>Cookie-Banner: wann Pflicht, wann überflüssig</h2>
<p>Das ewige Missverständnis zuerst: <strong>Nicht jede Website braucht ein Cookie-Banner.</strong> Nach § 25 TDDDG brauchst du eine Einwilligung, bevor du auf dem Gerät des Besuchers Informationen speicherst oder ausliest, die nicht technisch notwendig sind – klassisch: Tracking- und Marketing-Cookies, Analyse-Tools, Werbe-Pixel. Was <em>technisch notwendig</em> ist (etwa ein Session-Cookie für ein Login oder den Warenkorb), braucht keine Einwilligung.</p>
<p>Das heißt praktisch: Eine schlanke Betriebs-Website ohne Tracking kommt ohne Banner aus – und ist damit auch für Besucher angenehmer. Sobald du Statistik-Tools, eingebettete Inhalte mit Tracking oder Werbe-Pixel einsetzt, brauchst du ein echtes Einwilligungs-Banner: „Ablehnen“ muss so einfach sein wie „Akzeptieren“, und vor der Einwilligung darf das jeweilige Tool nicht laden.</p>

<h2>Die häufigsten Fehler auf Betriebs-Websites</h2>
<ul>
<li><strong>Kopierte Erklärung</strong> – von der Konkurrenz oder aus einem alten Projekt übernommen; beschreibt Dienste, die es auf deiner Seite gar nicht gibt, und vergisst die echten.</li>
<li><strong>Google-Fonts vom Google-Server</strong> – Schriften, die beim Seitenaufruf von fremden Servern laden, übertragen die IP-Adresse des Besuchers dorthin. Der sichere Weg: Schriften lokal einbinden (deutsche Gerichte haben das bereits beanstandet).</li>
<li><strong>Banner ohne Wirkung</strong> – ein Cookie-Hinweis, der nur informiert, während die Tracking-Skripte längst laufen, ist rechtlich wertlos.</li>
<li><strong>Kein SSL</strong> – eine Website mit Kontaktformular ohne HTTPS-Verschlüsselung ist ein Datenschutzproblem und schreckt zusätzlich Besucher ab.</li>
<li><strong>Veralteter Stand</strong> – neue Dienste eingebaut (Chat-Widget, Buchungstool), Erklärung nie nachgezogen.</li>
</ul>

<h2>Generator, Anwalt oder automatisch?</h2>
<p>Für Standard-Websites leisten seriöse Datenschutz-Generatoren gute Arbeit – solange du ehrlich ankreuzt, was deine Seite wirklich tut, und die Erklärung bei jeder Änderung aktualisierst. Der Anwalt lohnt sich bei Besonderheiten: Gesundheitsdaten, Newsletter-Marketing, Shops, Kundenkonten. Der dritte Weg: Systeme, die die Erklärung direkt aus der tatsächlichen Website-Konfiguration erzeugen. Bei <a href="/">Pageblitz</a> entstehen Datenschutzerklärung und Impressum automatisch aus deinen Angaben und den tatsächlich aktiven Funktionen deiner Website – und ändern sich mit, wenn du etwa das Kontaktformular aktivierst.</p>

<p class="blog-disclaimer">Dieser Artikel ist eine sorgfältig recherchierte Orientierung, aber keine Rechtsberatung. Bei besonderen Datenverarbeitungen – Gesundheitsdaten, Newsletter, Online-Shop – lohnt die Prüfung durch eine spezialisierte Kanzlei.</p>
`,
  faq: [
    {
      question: "Braucht wirklich jede Website eine Datenschutzerklärung?",
      answer:
        "Praktisch ja: Sobald personenbezogene Daten verarbeitet werden – und das passiert schon durch Server-Logs mit IP-Adressen – verlangt Art. 13 DSGVO eine Information der Besucher. Bei geschäftlichen Websites gibt es faktisch keine Ausnahme.",
    },
    {
      question: "Brauche ich immer ein Cookie-Banner?",
      answer:
        "Nein. Ein Einwilligungs-Banner ist nur nötig, wenn du nicht technisch notwendige Cookies oder ähnliche Technologien einsetzt – etwa Tracking, Analyse-Tools oder Marketing-Pixel. Eine Website ohne solche Dienste kommt ohne Banner aus.",
    },
    {
      question: "Darf ich Google Fonts verwenden?",
      answer:
        "Ja – aber sicher ist die lokale Einbindung: Die Schriftdateien liegen dann auf deinem eigenen Server, und beim Seitenaufruf fließt keine Besucher-IP an Google. Das dynamische Laden vom Google-Server wurde von deutschen Gerichten bereits beanstandet.",
    },
    {
      question: "Was passiert bei einer fehlerhaften Datenschutzerklärung?",
      answer:
        "Es drohen Abmahnungen von Wettbewerbern sowie Maßnahmen der Datenschutz-Aufsichtsbehörden bis hin zu Bußgeldern. In der Praxis am wichtigsten: Fehler sind vermeidbar, weil die Anforderungen für einfache Betriebs-Websites gut dokumentiert sind.",
    },
    {
      question: "Muss die Datenschutzerklärung von jeder Seite erreichbar sein?",
      answer:
        "Ja – wie das Impressum sollte sie von jeder Unterseite mit einem Klick erreichbar sein, üblich ist der Link im Footer neben dem Impressum.",
    },
  ],
};

const LOKAL_SEO_POST: BlogPost = {
  slug: "bei-google-gefunden-werden-lokale-betriebe",
  category: "Sichtbarkeit",
  title: "Bei Google gefunden werden: Lokales SEO für kleine Betriebe",
  metaTitle: "Lokales SEO: Bei Google gefunden werden | Pageblitz",
  metaDescription:
    "Wie kleine Betriebe bei Google sichtbar werden: Unternehmensprofil, Bewertungen, Website-Grundlagen und die Fehler, die lokale Rankings kosten.",
  publishedAt: "2026-08-31",
  updatedAt: "2026-08-31",
  readingMinutes: 8,
  teaser:
    "„Friseur in der Nähe“, „Elektriker Dortmund“ – lokale Suchen entscheiden, welcher Betrieb den Auftrag bekommt. Die fünf Hebel, mit denen kleine Betriebe dort auftauchen.",
  bodyHtml: `
<p>Wenn jemand „Klempner + Stadtname“ googelt, ist das kein Zeitvertreib – da ist ein Rohr undicht. Lokale Suchanfragen sind die kaufbereitesten Besucher, die ein kleiner Betrieb bekommen kann. Umso ärgerlicher, dass viele Betriebe dort unsichtbar sind, obwohl die wichtigsten Hebel weder Geld noch Agentur brauchen. Hier sind sie, sortiert nach Wirkung.</p>

<h2>Hebel 1: Das Google-Unternehmensprofil</h2>
<p>Der Kasten mit Karte, Öffnungszeiten und Bewertungen, der bei lokalen Suchen oben erscheint, speist sich aus dem <strong>Google-Unternehmensprofil</strong> (früher „Google My Business“). Es ist kostenlos – und der größte einzelne Hebel für lokale Sichtbarkeit. Die Pflichtaufgaben: Profil beanspruchen, Kategorie exakt wählen (lieber „Malerbetrieb“ als „Dienstleister“), Öffnungszeiten und Telefonnummer aktuell halten, eigene Fotos hochladen. Betriebe mit gepflegtem Profil und Fotos bekommen messbar mehr Anfragen als karge Einträge.</p>

<h2>Hebel 2: Bewertungen – sammeln und beantworten</h2>
<p>Bewertungen sind das lokale Ranking- und Vertrauens-Signal Nummer eins. Zwei Gewohnheiten reichen: <strong>Aktiv fragen</strong> – zufriedene Kundschaft direkt nach dem Auftrag um eine Google-Bewertung bitten, gern mit Link oder QR-Code auf der Rechnung. Und <strong>immer antworten</strong> – auf gute Bewertungen kurz und ehrlich, auf schlechte sachlich und lösungsorientiert. Die Antwort liest nicht nur der Bewertende, sondern jeder künftige Kunde.</p>

<h2>Hebel 3: Eine Website, die Google versteht</h2>
<p>Das Unternehmensprofil bringt dich auf die Karte – die Website macht daraus Aufträge und trägt gleichzeitig zum Ranking bei. Die Grundlagen:</p>
<ul>
<li><strong>Leistung + Ort im Seitentitel</strong> – „Malerbetrieb Schmidt – Maler in Dortmund-Hörde“ statt nur „Startseite“.</li>
<li><strong>Stadt und Stadtteile im Text</strong> – benenne dein echtes Einzugsgebiet; genau danach wird gesucht.</li>
<li><strong>Adresse, Telefon, Öffnungszeiten</strong> – gut sichtbar und überall identisch geschrieben (siehe Hebel 4).</li>
<li><strong>Mobil schnell</strong> – lokale Suchen passieren fast immer am Handy, oft unterwegs.</li>
<li><strong>Eine Seite pro Kernleistung</strong> – wer „Badsanierung“ sucht, soll auf einer Badsanierungs-Seite landen, nicht auf einer Sammelseite.</li>
</ul>

<h2>Hebel 4: Einheitliche Daten überall (NAP)</h2>
<p>Google gleicht Name, Adresse und Telefonnummer (englisch „NAP“) über alle Quellen ab: Website, Unternehmensprofil, Branchenverzeichnisse, Social-Media-Profile. Widersprüche – alte Adresse im Gelbe-Seiten-Eintrag, andere Schreibweise bei Facebook – kosten Vertrauen und Ranking. Einmal aufräumen, dann bei jeder Änderung alle Orte nachziehen.</p>

<h2>Hebel 5: Geduld und Regelmäßigkeit statt Tricks</h2>
<p>Lokales SEO ist kein Sprint und kein Geheimwissen: Wer Profil und Website pflegt, stetig Bewertungen sammelt und gelegentlich neue Fotos oder Beiträge einstellt, überholt mit der Zeit fast jeden Betrieb, der einmalig „optimiert“ hat und dann nichts mehr tut. Finger weg dagegen von gekauften Bewertungen und Keyword-Spam im Firmennamen – beides kann zur Sperrung des Profils führen.</p>

<h2>Der Zusammenhang mit deiner Website</h2>
<p>Alle fünf Hebel wirken zusammen: Das Profil bringt Sichtbarkeit, Bewertungen bringen Vertrauen, die Website macht den Abschluss. Eine <a href="/">Pageblitz</a>-Website bringt die technischen Grundlagen von Haus aus mit – Titel und Überschriften mit Leistung und Ort, schnelle mobile Ladezeiten, eingebundene Google-Bewertungen und eine saubere Struktur, die Google auslesen kann.</p>
`,
  faq: [
    {
      question: "Was ist das Wichtigste für lokale Google-Sichtbarkeit?",
      answer:
        "Das gepflegte Google-Unternehmensprofil: richtige Kategorie, aktuelle Öffnungszeiten, eigene Fotos und kontinuierlich gesammelte, beantwortete Bewertungen. Danach kommt eine Website, die Leistung und Ort klar benennt.",
    },
    {
      question: "Wie bekomme ich mehr Google-Bewertungen?",
      answer:
        "Einfach fragen – direkt nach einem gelungenen Auftrag, persönlich oder mit einem Bewertungslink bzw. QR-Code auf Rechnung oder Visitenkarte. Wichtig: niemals Bewertungen kaufen, das riskiert die Sperrung des Profils.",
    },
    {
      question: "Brauche ich trotz Google-Unternehmensprofil eine eigene Website?",
      answer:
        "Ja. Das Profil bringt dich auf die Karte, aber die Website überzeugt: Leistungen, Preise, Referenzfotos, Kontaktformular. Zudem verlinken Profil und Website aufeinander und stärken sich gegenseitig im Ranking.",
    },
    {
      question: "Wie lange dauert es, bis lokales SEO wirkt?",
      answer:
        "Erste Effekte am Profil (mehr Aufrufe, Anrufe) zeigen sich oft binnen Wochen; stabile Website-Rankings brauchen je nach Konkurrenz einige Monate. Regelmäßigkeit schlägt dabei jede einmalige Hauruck-Aktion.",
    },
  ],
};

const HANDWERK_POST: BlogPost = {
  slug: "braucht-mein-handwerksbetrieb-eine-website",
  category: "Praxis",
  title: "Braucht mein Handwerksbetrieb eine Website? 7 ehrliche Gründe",
  metaTitle: "Website für Handwerker: 7 Gründe | Pageblitz",
  metaDescription:
    "Volle Auftragsbücher, alles läuft über Empfehlungen – wozu eine Website? 7 ehrliche Gründe, warum sich der eigene Auftritt für Handwerksbetriebe trotzdem rechnet.",
  publishedAt: "2026-08-31",
  updatedAt: "2026-08-31",
  readingMinutes: 7,
  teaser:
    "„Meine Auftragsbücher sind voll, ich brauche keine Website.“ Verständlich – und trotzdem meist ein Irrtum. Sieben Gründe, die auch für gut gebuchte Betriebe gelten.",
  bodyHtml: `
<p>Kaum eine Branche hat so volle Auftragsbücher wie das Handwerk – und kaum eine ist online so dünn vertreten. Die Logik dahinter klingt vernünftig: Wer über Empfehlungen mehr Anfragen bekommt, als er abarbeiten kann, braucht keine Werbung. Aber eine Website ist keine Werbung. Sie ist Infrastruktur – und zwar für Situationen, die auch den bestgebuchten Betrieb betreffen. Sieben davon:</p>

<h2>1. Empfehlungen werden heute nachgeschlagen</h2>
<p>Die klassische Empfehlung stirbt nicht – sie bekommt einen Zwischenschritt. Wer deinen Namen vom Nachbarn hört, googelt ihn, bevor er anruft. Findet er nichts oder nur einen leeren Verzeichniseintrag, wandert ein Teil dieser warmen Empfehlungen zum nächsten Betrieb, der greifbarer wirkt. Die Website verliert keine Empfehlung – sie fängt sie auf.</p>

<h2>2. Die guten Aufträge aussuchen können</h2>
<p>Volle Bücher heißen nicht: die richtigen Aufträge. Eine Website, die deine Spezialität zeigt – Badsanierung statt Tropfhahn, Denkmalpflege statt Rigips – zieht genau solche Anfragen an. Wer nur über Mundpropaganda läuft, bekommt den Querschnitt; wer online sein Profil schärft, kann wählen.</p>

<h2>3. Anfragen kommen an, wenn du auf dem Gerüst stehst</h2>
<p>Tagsüber bist du auf der Baustelle, abends ruft niemand mehr an. Ein Kontaktformular arbeitet durch: Der Kunde beschreibt sein Anliegen um 21 Uhr, du antwortest, wenn es passt. Ohne Website bleibt nur der Anrufbeantworter – und der Wettbewerber, der schneller zurückruft.</p>

<h2>4. Referenzfotos verkaufen besser als jedes Gespräch</h2>
<p>Handwerk ist sichtbar. Zehn gute Vorher-nachher-Fotos beantworten die Frage „Können die das?“ besser als jedes Telefonat. Auf Instagram versinken sie im Feed – auf deiner Website stehen sie dauerhaft dort, wo Interessenten sie suchen.</p>

<h2>5. Nachwuchs sucht Arbeitgeber online</h2>
<p>Der Fachkräftemangel ist im Handwerk härter als der Auftragsmangel je war. Gesellen und Azubis, die einen Betrieb prüfen, tun das online – Team-Fotos, Betriebskultur, eine ehrliche „Jobs“-Zeile wirken mehr als jede Anzeige im Wochenblatt. Ohne Auftritt existierst du für diese Generation schlicht nicht.</p>

<h2>6. Unabhängig von Portalen bleiben</h2>
<p>Vermittlungsportale liefern Anfragen – gegen Provision, im Preisvergleich mit fünf Konkurrenten und zu deren Regeln. Die eigene Website ist der einzige Online-Kanal, der komplett dir gehört: keine Provision, kein erzwungener Preiskampf, keine Änderung der Spielregeln über Nacht.</p>

<h2>7. Der Aufwand ist heute lächerlich klein</h2>
<p>Das stärkste Gegenargument war immer echt: keine Zeit. Eine Agentur beauftragen, Texte liefern, Wochen warten – das passt nicht neben ein volles Auftragsbuch. Genau dieses Argument ist gefallen: Bei <a href="/website-erstellen/handwerk">Pageblitz</a> gibst du Firmennamen und Gewerk ein und siehst in etwa drei Minuten eine fertige Website zur Vorschau – mit Texten, Bildern, Impressum und Datenschutz. Anpassen, freischalten, fertig. Ab 19,90 € im Monat, ohne Technikwissen, mit Hosting in Deutschland.</p>

<h2>Fazit</h2>
<p>Eine Website ersetzt nicht die Empfehlung, den Ruf oder die Arbeit auf der Baustelle. Sie sorgt dafür, dass all das auch dort ankommt, wo heute jede Entscheidung beginnt: bei Google. Und sie kostet inzwischen weniger Zeit und Geld als ein einziger verlorener Auftrag.</p>
`,
  faq: [
    {
      question: "Reicht nicht ein Google-Unternehmensprofil oder Facebook?",
      answer:
        "Als Ergänzung sind beide wertvoll, als Ersatz nicht: Das Profil zeigt nur Basisdaten, Social-Media-Beiträge versinken im Feed, und beide Plattformen können ihre Regeln jederzeit ändern. Die eigene Website ist der einzige Kanal unter deiner Kontrolle – mit Referenzen, Leistungen und rechtssicherem Auftritt.",
    },
    {
      question: "Was kostet eine Handwerker-Website?",
      answer:
        "Agentur-Projekte beginnen meist bei 2.000 €. Mit einem KI-Baukasten wie Pageblitz kostet die komplette Website ab 19,90 € im Monat – inklusive Hosting, Rechtstexten und Anpassungen, ohne einmalige Projektkosten.",
    },
    {
      question: "Ich habe keine Zeit für eine Website – wie viel Aufwand ist es wirklich?",
      answer:
        "Mit einem KI-Baukasten: Firmenname und Gewerk eingeben, die automatisch erstellte Vorschau ansehen, Fotos und Details anpassen – realistisch ein Feierabend statt mehrerer Wochen Agenturprojekt.",
    },
    {
      question: "Hilft eine Website auch bei der Mitarbeitersuche?",
      answer:
        "Deutlich: Bewerber prüfen Betriebe online, bevor sie sich melden. Team-Fotos, Einblicke in die Arbeit und eine kurze Karriere-Sektion machen einen Betrieb für Gesellen und Azubis greifbar – ohne Website findet diese Prüfung beim Wettbewerber statt.",
    },
  ],
};

export const BLOG_POSTS: BlogPost[] = [
  ...BLOG_POSTS_BATCH3,
  ...BLOG_POSTS_BATCH4,
  ...BLOG_POSTS_BATCH2,
  IMPRESSUM_POST,
  KOSTEN_POST,
  WIX_ALTERNATIVE_POST,
  DATENSCHUTZ_POST,
  LOKAL_SEO_POST,
  HANDWERK_POST,
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(post => post.slug === slug);
}
