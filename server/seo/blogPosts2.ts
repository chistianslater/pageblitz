/**
 * Blog-Artikel Batch 2 (2026-09-01) — eigene Datei, damit blogPosts.ts
 * unter der 800-Zeilen-Grenze bleibt. Gleiche Regeln: Autoren-HTML aus
 * diesem Repo, NIEMALS Fremdinhalte. Eingereiht über BLOG_POSTS in
 * blogPosts.ts.
 */
import type { BlogPost } from "./blogPosts";

const GBP_POST: BlogPost = {
  slug: "google-unternehmensprofil-einrichten",
  title: "Google-Unternehmensprofil einrichten: Die Anleitung für Betriebe",
  metaTitle: "Google-Unternehmensprofil einrichten (Anleitung) | Pageblitz",
  metaDescription:
    "Schritt für Schritt zum gepflegten Google-Unternehmensprofil: beanspruchen, Kategorie wählen, Fotos, Bewertungen – und die Fehler, die Sichtbarkeit kosten.",
  category: "Sichtbarkeit",
  publishedAt: "2026-09-01",
  updatedAt: "2026-09-01",
  readingMinutes: 8,
  teaser:
    "Der Karteneintrag bei Google ist für lokale Betriebe oft der erste Kontakt mit neuer Kundschaft – und er ist kostenlos. So richtest du ihn richtig ein.",
  bodyHtml: `
<p>Wenn jemand deinen Betrieb googelt, entscheidet meist nicht deine Website über den ersten Eindruck, sondern der Kasten rechts daneben: das <strong>Google-Unternehmensprofil</strong> (früher „Google My Business“) mit Karte, Öffnungszeiten, Fotos und Bewertungen. Es ist kostenlos, in einer Stunde eingerichtet – und trotzdem bei vielen Betrieben verwaist. Hier ist der Weg zum gepflegten Profil, Schritt für Schritt.</p>

<h2>Schritt 1: Profil finden oder anlegen</h2>
<p>Google legt für viele Betriebe automatisch Einträge an. Suche zuerst nach deinem Betriebsnamen plus Ort: Existiert ein Eintrag, klickst du auf „Inhaber dieses Unternehmens?“ und beanspruchst ihn. Existiert keiner, legst du unter <em>google.com/business</em> einen neuen an. Die Bestätigung läuft je nach Betrieb per Postkarte an die Geschäftsadresse, per Telefon oder Video – plane dafür ein paar Tage ein.</p>

<h2>Schritt 2: Die Kategorie – wichtiger als jeder Text</h2>
<p>Die Hauptkategorie ist das stärkste Signal für Google, wann dein Profil erscheinen soll. Wähle die präziseste, die es gibt: „Malerbetrieb“ statt „Handwerker“, „Friseursalon“ statt „Schönheitssalon“, wenn das dein Kerngeschäft ist. Zusatzkategorien ergänzen Nebenleistungen. Ein häufiger Fehler ist die zu allgemeine Kategorie – sie verwässert, wofür Google dich anzeigen soll.</p>

<h2>Schritt 3: Stammdaten komplett und identisch</h2>
<ul>
<li><strong>Name</strong> – exakt der echte Betriebsname. Keywords hineinzuschummeln („Malerbetrieb Schmidt – bester Maler Dortmund günstig“) verstößt gegen die Richtlinien und riskiert die Sperrung.</li>
<li><strong>Adresse und Einzugsgebiet</strong> – Ladengeschäfte zeigen die Adresse; wer nur beim Kunden arbeitet, kann die Adresse verbergen und ein Einzugsgebiet angeben.</li>
<li><strong>Öffnungszeiten</strong> – inklusive Feiertagsregelungen. Nichts frustriert mehr als „geöffnet“ laut Google und verschlossene Tür vor Ort.</li>
<li><strong>Telefon und Website</strong> – dieselbe Nummer und Schreibweise wie auf deiner Website (Stichwort NAP-Konsistenz).</li>
</ul>

<h2>Schritt 4: Fotos, die den Betrieb zeigen</h2>
<p>Profile mit eigenen Fotos bekommen deutlich mehr Anfragen als solche mit grauem Platzhalter. Es braucht kein Fotostudio: Außenansicht (damit man dich findet), Innenraum, Team bei der Arbeit, fertige Ergebnisse. Lade sie selbst hoch, bevor die Streetview-Aufnahme von 2019 dein Aushängeschild bleibt – und ergänze alle paar Monate ein paar neue.</p>

<h2>Schritt 5: Bewertungen als Dauerroutine</h2>
<p>Bewertungen entscheiden über Klick oder Weiterscrollen. Zwei Gewohnheiten genügen: Bitte zufriedene Kundschaft aktiv um eine Bewertung – am einfachsten mit deinem Bewertungslink oder einem QR-Code auf der Rechnung. Und beantworte jede Bewertung, auch die schlechten, sachlich und lösungsorientiert. Niemals Bewertungen kaufen: Das riskiert die Sperrung des Profils und wirkt auf Leser ohnehin durchschaubar.</p>

<h2>Schritt 6: Profil und Website verzahnen</h2>
<p>Profil und Website stärken sich gegenseitig: Das Profil verlinkt auf die Website, die Website nennt dieselben Kontaktdaten und vertieft, was das Profil anteasert – Leistungen, Preise, Referenzen. Wer aus dem Karten-Kasten auf eine Seite klickt, die es nicht gibt oder die 2015 stehen geblieben ist, ist wieder weg. Eine <a href="/">Pageblitz</a>-Website übernimmt Öffnungszeiten, Kontaktdaten und Google-Bewertungen automatisch an die richtigen Stellen — mehr dazu im Artikel <a href="/blog/bei-google-gefunden-werden-lokale-betriebe">Bei Google gefunden werden</a>.</p>

<h2>Die drei häufigsten Fehler</h2>
<ul>
<li><strong>Einrichten und vergessen</strong> – veraltete Öffnungszeiten und unbeantwortete Fragen signalisieren Google und Kundschaft dasselbe: hier kümmert sich niemand.</li>
<li><strong>Doppelte Einträge</strong> – alte Adressen oder Duplikate verwirren das Ranking; über die Profilverwaltung zusammenführen lassen.</li>
<li><strong>Richtlinien-Tricks</strong> – Keywords im Namen, gekaufte Bewertungen, falsche Kategorien. Kurzfristig verlockend, langfristig der schnellste Weg zur Sperrung.</li>
</ul>
`,
  faq: [
    {
      question: "Kostet das Google-Unternehmensprofil etwas?",
      answer:
        "Nein, das Profil ist vollständig kostenlos. Anrufe von Agenturen, die Gebühren für die 'Verwaltung' oder 'Bestätigung' deines Eintrags verlangen, sind ein bekanntes Abzock-Muster.",
    },
    {
      question: "Wie lange dauert die Bestätigung?",
      answer:
        "Je nach Verfahren zwischen wenigen Minuten (Telefon/Video) und ein bis zwei Wochen (Postkarte an die Geschäftsadresse). Ohne Bestätigung kannst du das Profil nicht bearbeiten.",
    },
    {
      question:
        "Ich arbeite nur beim Kunden – muss meine Adresse öffentlich sein?",
      answer:
        "Nein. Dienstleister ohne Ladengeschäft können die Adresse verbergen und stattdessen ein Einzugsgebiet angeben – das Profil erscheint dann für Suchen in diesem Gebiet.",
    },
    {
      question: "Ersetzt das Profil eine eigene Website?",
      answer:
        "Nein – es ist der Türöffner, die Website macht den Abschluss: Leistungen, Preise, Referenzen und Kontaktformular. Beide verlinken aufeinander und stärken sich gegenseitig im Ranking.",
    },
  ],
};

const FRISEUR_KOSTEN_POST: BlogPost = {
  slug: "was-kostet-eine-website-fuer-friseure",
  title: "Was kostet eine Website für Friseure? Ehrliche Zahlen für Salons",
  metaTitle: "Website-Kosten für Friseursalons 2026 | Pageblitz",
  metaDescription:
    "Von 20 € im Monat bis 5.000 € Agenturprojekt: Was eine Friseur-Website wirklich kostet, welche Funktionen ein Salon braucht und wo sich Sparen rächt.",
  category: "Kosten & Vergleich",
  publishedAt: "2026-09-01",
  updatedAt: "2026-09-01",
  readingMinutes: 6,
  teaser:
    "Terminanfragen, Preisliste, Galerie – eine Salon-Website hat klare Aufgaben. Was die Wege dorthin kosten und welcher zu deinem Salon passt.",
  bodyHtml: `
<p>Kaum eine Branche lebt so sehr von Optik und Vertrauen wie das Friseurhandwerk – und kaum eine Kundschaft prüft so selbstverständlich online, bevor sie einen neuen Salon betritt. Die gute Nachricht: Eine Salon-Website hat klar umrissene Aufgaben, und das macht die Kostenfrage übersichtlich. Die allgemeinen Zahlen für alle Branchen findest du im <a href="/blog/was-kostet-eine-website-fuer-kleinunternehmen">großen Kosten-Überblick</a> – hier geht es um das, was für Salons speziell gilt.</p>

<h2>Was eine Friseur-Website können muss</h2>
<ul>
<li><strong>Preisliste</strong> – die meistbesuchte Unterseite jedes Salons. Wer Preise versteckt, verliert genau die Neukundschaft, die vergleicht.</li>
<li><strong>Galerie</strong> – deine Arbeiten sind dein Portfolio: Schnitte, Farben, Hochsteckfrisuren. Echte Fotos schlagen Stockbilder um Längen.</li>
<li><strong>Terminanfrage</strong> – muss kein volles Buchungssystem sein; ein Formular „Wunschtermin anfragen“ fängt die Abend- und Wochenend-Anfragen auf, die das Telefon verpasst.</li>
<li><strong>Öffnungszeiten & Anfahrt</strong> – prominent, aktuell, mobiltauglich.</li>
<li><strong>Team</strong> – zu wem gehe ich? Gesichter bauen die Hemmschwelle ab, die ein Salonwechsel immer hat.</li>
</ul>

<h2>Die drei Wege im Salon-Kontext</h2>
<p><strong>Agentur (2.000–5.000 €):</strong> lohnt sich für Ketten und Premium-Salons mit starker Marke. Für den einzelnen Salon ist die Rechnung schwer: Bei einem durchschnittlichen Damenhaarschnitt musst du viele Termine schneiden, bevor 4.000 € Projektkosten wieder drin sind – und jede Preisänderung läuft über die Agentur.</p>
<p><strong>Klassischer Baukasten (10–40 €/Monat):</strong> günstig, aber du baust selbst – und Salon-Websites brauchen viele Inhalte (Preisliste mit Dutzenden Positionen, Galerie, Team). Realistisch sind mehrere Abende Arbeit, und das Ergebnis sieht so professionell aus wie deine Design-Erfahrung es hergibt.</p>
<p><strong>KI-Baukasten:</strong> Bei <a href="/website-erstellen/friseur">Pageblitz</a> gibst du den Salonnamen ein und bekommst eine fertige Friseur-Website zur Vorschau – mit branchentypischer Struktur, Galerie und Terminanfrage-Formular als Option, die Preisliste als buchbares Extra. 19,90 €/Monat (jährlich), inklusive Rechtstexten und Hosting in Deutschland; 7 Tage kostenlos testen.</p>

<h2>Womit Salons wirklich Geld verlieren</h2>
<p>Nicht mit dem Monatsbeitrag – sondern mit dem, was fehlt: Ein Salon ohne sichtbare Preise verliert Vergleicher, einer ohne Galerie verliert Farb-Kundschaft (die teuersten Termine!), einer ohne Online-Anfrage verliert alle, die um 21 Uhr nach „Balayage in der Nähe“ suchen. Die Website-Kosten sind gegen einen einzigen verlorenen Stammkunden pro Monat fast immer die kleinere Zahl.</p>

<h2>Rechenbeispiel</h2>
<p>Pageblitz kostet im Jahresabo rund 239 € pro Jahr. Bringt die Website nur eine einzige neue Stammkundin pro Quartal (bei üblichen Salonpreisen und 6–8 Besuchen im Jahr schnell 300–500 € Jahresumsatz), hat sie sich mehrfach bezahlt gemacht — noch ohne die Termin-Anfragen von Bestandskundschaft, die sonst beim Anrufbeantworter gelandet wären.</p>
`,
  faq: [
    {
      question: "Braucht ein Friseursalon ein Online-Buchungssystem?",
      answer:
        "Nicht zwingend. Ein Terminanfrage-Formular deckt den wichtigsten Fall ab: Anfragen außerhalb der Öffnungszeiten. Ein vollautomatisches Buchungssystem lohnt sich vor allem für größere Teams mit hohem Terminvolumen.",
    },
    {
      question: "Sollten Preise auf die Website?",
      answer:
        "Ja. Die Preisliste ist die meistgesuchte Information über einen Salon – wer sie versteckt, verliert Vergleicher an Salons, die transparent sind. Mindestens Preisspannen je Leistung gehören online.",
    },
    {
      question: "Reicht Instagram nicht als Salon-Auftritt?",
      answer:
        "Instagram ist ein starkes Schaufenster, ersetzt aber weder Preisliste noch Impressum noch die Auffindbarkeit bei Google-Suchen wie 'Friseur + Stadtteil'. Ideal ist beides: Instagram für Reichweite, Website als Basis mit allen Infos.",
    },
    {
      question: "Was kostet eine Friseur-Website bei Pageblitz?",
      answer:
        "19,90 € im Monat bei jährlicher Zahlung (24,90 € monatlich), inklusive Hosting in Deutschland, Impressum und Datenschutzerklärung. Die Vorschau ist kostenlos, danach 7 Tage gratis testen.",
    },
  ],
};

const COOKIE_POST: BlogPost = {
  slug: "cookie-banner-wann-noetig",
  title:
    "Cookie-Banner: Wann deine Website wirklich eins braucht – und wann nicht",
  metaTitle: "Cookie-Banner Pflicht? Wann nötig, wann nicht | Pageblitz",
  metaDescription:
    "Nicht jede Website braucht ein Cookie-Banner. Was § 25 TDDDG wirklich verlangt, wann ein Banner Pflicht ist und wie ein rechtskonformes aussieht.",
  category: "Recht & Pflichten",
  publishedAt: "2026-09-01",
  updatedAt: "2026-09-01",
  readingMinutes: 7,
  teaser:
    "Das Cookie-Banner ist das meistgehasste Element des Internets – und oft völlig unnötig. Wann du wirklich eins brauchst und wie es richtig aussieht.",
  bodyHtml: `
<p>Viele Betriebe bauen ein Cookie-Banner ein, „weil man das halt muss“. Die Wahrheit ist erfreulicher: <strong>Die Pflicht hängt nicht an der Website, sondern an dem, was sie tut.</strong> Eine schlanke Betriebs-Website kommt oft komplett ohne Banner aus – und ist damit schneller, angenehmer und trotzdem rechtskonform. Hier ist die Abgrenzung, verständlich erklärt. (Die Grundlagen zur Datenschutzerklärung stehen im <a href="/blog/datenschutzerklaerung-firmen-website">eigenen Artikel</a>.)</p>

<h2>Was das Gesetz wirklich sagt</h2>
<p>Maßgeblich ist § 25 TDDDG (bis Mai 2024 als TTDSG bekannt): Wer auf dem Gerät eines Besuchers Informationen <em>speichert oder ausliest</em>, braucht dessen Einwilligung – <strong>außer</strong>, das ist für den vom Nutzer gewünschten Dienst <em>unbedingt erforderlich</em>. Es geht also nicht um „Cookies“ als Technik, sondern um den Zweck. Dasselbe gilt für Local Storage, Fingerprinting und Tracking-Pixel.</p>

<h2>Kein Banner nötig: die erlaubte Basis</h2>
<ul>
<li><strong>Technisch notwendige Cookies</strong> – Session-Cookie für ein Login, Warenkorb, Sprachwahl, Einwilligungs-Speicher selbst.</li>
<li><strong>Selbst gehostete Schriften und Bilder</strong> – laden ohne Drittserver, kein Einwilligungsfall.</li>
<li><strong>Server-Logs</strong> – die übliche technische Protokollierung ist kein „Auslesen des Endgeräts“; sie gehört in die Datenschutzerklärung, nicht ins Banner.</li>
<li><strong>Cookielose Statistik</strong> – Reichweitenmessung, die ohne Endgerätezugriff und ohne Profile auskommt (etwa selbst gehostete, cookielose Tools), lässt sich einwilligungsfrei betreiben.</li>
</ul>

<h2>Banner Pflicht: sobald das dazukommt</h2>
<ul>
<li><strong>Google Analytics & Co.</strong> – klassische Analyse-Tools mit Cookies und Profilbildung.</li>
<li><strong>Marketing-Pixel</strong> – Meta-Pixel, Google-Ads-Conversion-Tracking, Retargeting.</li>
<li><strong>Eingebettete Dritt-Inhalte mit Tracking</strong> – YouTube-Videos in der Standard-Einbettung, Karten-Widgets, Social-Media-Feeds.</li>
</ul>
<p>Für diese Dienste gilt: Sie dürfen <em>erst nach</em> der Einwilligung laden. Ein Banner, das nur informiert, während der Pixel längst feuert, ist rechtlich wertlos – das ist der häufigste Fehler überhaupt.</p>

<h2>Wie ein korrektes Banner aussieht</h2>
<ul>
<li>„<strong>Ablehnen</strong>“ ist genauso leicht erreichbar wie „Akzeptieren“ – gleiche Ebene, keine versteckten Zweitklicks, keine Farbtricks, die nur eine Option lesbar machen.</li>
<li>Vor der Entscheidung lädt <strong>nichts</strong> Einwilligungspflichtiges.</li>
<li>Die Einwilligung ist <strong>widerrufbar</strong> – üblich ist ein kleiner „Cookie-Einstellungen“-Link im Footer.</li>
<li>Das Banner benennt <strong>konkret</strong>, wofür eingewilligt wird, statt in Juristenprosa zu nebeln.</li>
</ul>

<h2>Die kluge Strategie für kleine Betriebe</h2>
<p>Der eleganteste Weg ist, das Banner überflüssig zu machen: Schriften lokal einbinden, auf Tracking-Pixel verzichten, Videos mit Klick-Aktivierung einbetten, cookielose Statistik nutzen. Deine Website lädt schneller, nervt niemanden – und du sparst dir eine ganze Fehlerquelle. <a href="/">Pageblitz</a>-Websites sind genau so gebaut: cookieloses Tracking, lokale Assets, und ein Einwilligungs-Banner erscheint nur, wenn du tatsächlich Funktionen aktivierst, die eines brauchen.</p>

<p class="blog-disclaimer">Dieser Artikel ist eine sorgfältig recherchierte Orientierung, aber keine Rechtsberatung. Bei komplexen Setups – Shops, Werbenetzwerke, internationale Zielgruppen – lohnt der Blick einer spezialisierten Kanzlei.</p>
`,
  faq: [
    {
      question: "Ist ein Cookie-Banner für jede Website Pflicht?",
      answer:
        "Nein. Pflicht ist es nur, wenn die Website nicht technisch notwendige Cookies oder ähnliche Technologien einsetzt – etwa Analyse-Tools mit Profilbildung oder Marketing-Pixel. Eine Website ohne solche Dienste braucht kein Banner.",
    },
    {
      question: "Reicht ein Hinweis-Banner ohne Ablehnen-Button?",
      answer:
        "Nein. Wenn Einwilligung nötig ist, muss sie freiwillig und informiert sein – 'Ablehnen' muss so einfach sein wie 'Akzeptieren', und vor der Entscheidung darf das jeweilige Tool nicht laden.",
    },
    {
      question: "Zählt Google Maps als einwilligungspflichtig?",
      answer:
        "Die Standard-Einbettung lädt Inhalte von Google-Servern und setzt in der Regel Endgerätezugriffe voraus – der sichere Weg ist eine Zwei-Klick-Lösung (Kartenvorschau, die erst nach Klick lädt) oder ein einfacher Anfahrts-Link.",
    },
    {
      question: "Was passiert bei einem fehlerhaften Cookie-Banner?",
      answer:
        "Abmahnungen und aufsichtsbehördliche Maßnahmen sind möglich; Datenschutzbehörden haben Banner-Gestaltung wiederholt beanstandet. Der sicherste Weg für kleine Betriebe ist, einwilligungspflichtige Dienste gar nicht erst einzusetzen.",
    },
  ],
};

const TEXTE_POST: BlogPost = {
  slug: "website-texte-schreiben-betriebe",
  title: "Website-Texte schreiben: Die Anleitung für Betriebe ohne Werbetexter",
  metaTitle: "Website-Texte schreiben: Anleitung für Betriebe | Pageblitz",
  metaDescription:
    "Überschrift, Leistungen, Über-uns: Wie du Website-Texte schreibst, die Kunden überzeugen – mit Formeln, Beispielen und den Floskeln, die du streichen solltest.",
  category: "Praxis",
  publishedAt: "2026-09-01",
  updatedAt: "2026-09-01",
  readingMinutes: 8,
  teaser:
    "„Herzlich willkommen auf unserer Homepage“ – der Satz, der niemanden überzeugt. Wie Betriebe Texte schreiben, die klingen wie sie selbst und trotzdem verkaufen.",
  bodyHtml: `
<p>Die meisten Betriebs-Websites scheitern nicht am Design, sondern an den Worten: zu allgemein, zu förmlich, zu sehr aus der Innensicht. Dabei folgt guter Website-Text ein paar handfesten Regeln, die jeder anwenden kann – ganz ohne Werbetexter-Ausbildung. Hier sind sie, Abschnitt für Abschnitt.</p>

<h2>Die Überschrift: sag, was du tust – konkret</h2>
<p>Deine Startseiten-Überschrift hat eine Aufgabe: In zwei Sekunden klären, ob der Besucher richtig ist. „Herzlich willkommen“ klärt nichts. Die einfache Formel: <strong>Was + für wen + wo.</strong> Aus „Willkommen bei Elektro Krause“ wird „Elektroinstallation für Alt- und Neubau in Bochum“. Nicht poetisch – aber jeder weiß sofort Bescheid. Die Poesie darf in die Unterzeile.</p>

<h2>Leistungen: Ergebnisse statt Tätigkeiten</h2>
<p>Kundschaft kauft keine Tätigkeit, sondern ein Ergebnis. Statt „Wir führen Malerarbeiten aller Art aus“ lieber: „Frisch gestrichene Wohnung in zwei Tagen – Möbel decken wir ab, den Staub nehmen wir mit.“ Der Trick: Beschreibe jede Leistung so, wie du sie einem Nachbarn am Gartenzaun erklären würdest – inklusive der Sorgen, die du ihm abnimmst (Dreck, Dauer, Preis-Überraschungen).</p>

<h2>Über uns: Menschen, nicht Meilensteine</h2>
<p>Der Über-uns-Text ist der meistgelesene der ganzen Website – und der am häufigsten verschenkte. Niemand will die Chronik seit 1987 in Behördendeutsch. Was funktioniert: <strong>Wer seid ihr, warum macht ihr das, wie arbeitet ihr?</strong> Ein Satz zur Geschichte, ein Satz zur Haltung („Wir sagen auch mal: Das lohnt sich für Sie nicht“), ein Satz zum Team. Mit Namen und Gesichtern – Vertrauen entsteht bei Menschen, nicht bei Rechtsformen.</p>

<h2>Die Floskel-Streichliste</h2>
<p>Diese Formulierungen stehen auf zehntausenden Websites und sagen nichts – streiche sie und ersetze sie durch etwas Beweisbares:</p>
<ul>
<li>„Qualität und Kundenzufriedenheit stehen bei uns an erster Stelle“ → zeig eine echte Bewertung.</li>
<li>„Ihr kompetenter Partner für …“ → sag konkret, was du kannst.</li>
<li>„Wir bieten ein breites Leistungsspektrum“ → liste die drei wichtigsten Leistungen.</li>
<li>„Individuelle Lösungen für Ihre Bedürfnisse“ → nenn ein Beispiel-Projekt.</li>
<li>„Herzlich willkommen auf unserer Homepage“ → ersatzlos streichen.</li>
</ul>

<h2>Schreib, wie du sprichst (fast)</h2>
<p>Lies deinen Text laut vor. Würdest du das am Telefon so sagen? Falls nein, umformulieren. Kurze Sätze, aktive Verben, „wir“ und „Sie/du“ statt „man“. Fachbegriffe nur, wenn die Kundschaft sie selbst benutzt — ein Privatkunde sucht keine „Retrofit-Photovoltaik-Unterkonstruktion“, sondern „Solar aufs Dach“.</p>

<h2>Der Aufruf zum Handeln: eine klare Tür</h2>
<p>Jede Seite endet mit genau <strong>einer</strong> Handlungsaufforderung: „Jetzt Termin anfragen“, „Kostenloses Angebot einholen“, „Rückruf vereinbaren“. Drei gleichwertige Buttons nebeneinander sind wie drei Türen ohne Beschriftung – im Zweifel geht niemand durch irgendeine.</p>

<h2>Und wenn die Zeit fehlt?</h2>
<p>Genau dafür gibt es inzwischen gute Abkürzungen: <a href="/">Pageblitz</a> schreibt aus Firmenname und Branche einen kompletten Erstentwurf – Überschriften, Leistungen, Über-uns – den du dann mit deinen Details und deinem Ton anpasst. Der KI-Entwurf löst das Problem des leeren Blatts; deine Änderungen machen ihn zu deinem Text. Das Prinzip aus diesem Artikel gilt dabei genauso: konkret schlägt allgemein, immer.</p>
`,
  faq: [
    {
      question: "Wie lang sollten Website-Texte sein?",
      answer:
        "So lang wie nötig, so kurz wie möglich: Startseiten-Abschnitte je 2–4 Sätze, der Über-uns-Text 100–200 Wörter, Leistungsbeschreibungen 1–3 Sätze pro Leistung. Für Google zählt nicht Länge, sondern ob die Seite die Suchintention beantwortet.",
    },
    {
      question: "Soll ich Keywords in die Texte einbauen?",
      answer:
        "Ja, aber natürlich: Deine Leistung und dein Ort gehören in Überschrift und erste Absätze, weil genau danach gesucht wird ('Maler Bochum'). Erzwungene Wiederholungen schaden mehr, als sie nützen.",
    },
    {
      question: "Duzen oder Siezen auf der Betriebs-Website?",
      answer:
        "Wie im echten Kundengespräch: Ein Handwerksbetrieb mit gemischter Kundschaft fährt mit 'Sie' meist sicherer, ein junges Studio oder Café darf duzen. Wichtig ist nur Konsistenz über die ganze Website.",
    },
    {
      question: "Darf ich Texte von anderen Websites übernehmen?",
      answer:
        "Nein – fremde Texte sind urheberrechtlich geschützt, und Google erkennt Duplikate. Lass dich inspirieren, aber formuliere selbst (oder lass dir einen eigenen Erstentwurf generieren).",
    },
  ],
};

const BAUKASTEN_AGENTUR_POST: BlogPost = {
  slug: "homepage-baukasten-oder-agentur",
  title: "Homepage-Baukasten oder Agentur? Der ehrliche Entscheidungs-Guide",
  metaTitle: "Baukasten oder Agentur? Entscheidungs-Guide | Pageblitz",
  metaDescription:
    "Baukasten, KI-Baukasten oder Webagentur: Welcher Weg passt zu deinem Betrieb? Der Entscheidungs-Guide mit Kosten, Zeitaufwand und den ehrlichen Grenzen.",
  category: "Kosten & Vergleich",
  publishedAt: "2026-09-01",
  updatedAt: "2026-09-01",
  readingMinutes: 7,
  teaser:
    "Die eine Antwort gibt es nicht – aber vier Fragen, die die Entscheidung fast von allein treffen. Ein Guide ohne Verkaufs-Brille.",
  bodyHtml: `
<p>„Soll ich das selbst machen oder machen lassen?“ ist bei der Website dieselbe Frage wie beim Steuerberater oder der Autoreparatur – und die ehrliche Antwort hängt selten vom Produkt ab, sondern von dir: deiner Zeit, deinen Ansprüchen, deinem Budget. Vier Fragen bringen Klarheit. (Die konkreten Zahlen zu allen Wegen stehen im <a href="/blog/was-kostet-eine-website-fuer-kleinunternehmen">Kosten-Überblick</a>.)</p>

<h2>Frage 1: Ist deine Website Standard oder Sonderfall?</h2>
<p>Sei ehrlich: Die allermeisten Betriebs-Websites brauchen dasselbe – Startseite, Leistungen, Über uns, Galerie, Kontakt, Rechtsseiten. Das ist <em>Standard</em>, und Standard können Baukästen heute exzellent. Ein <em>Sonderfall</em> bist du bei Online-Shops mit vielen Artikeln, Kundenportalen, Buchungslogik über mehrere Standorte oder wenn die Website selbst dein Produkt ist. Sonderfälle gehören zur Agentur; für Standard zahlst du dort vor allem für etwas, das es günstiger gibt.</p>

<h2>Frage 2: Was ist deine Stunde wert?</h2>
<p>Der klassische Baukasten kostet wenig Geld und viel Zeit: Vorlage wählen, Layout bauen, Texte schreiben, Bilder suchen – realistisch 15–30 Stunden bis zu einem vorzeigbaren Ergebnis. Rechne das mit deinem Stundensatz gegen: Bei einem Handwerker-Stundensatz ist der „günstige“ Baukasten schnell teurer als jede Alternative. KI-Baukästen verschieben genau diese Rechnung: Bei <a href="/">Pageblitz</a> steht der Erstentwurf nach Minuten, du investierst nur noch die Stunde fürs Anpassen.</p>

<h2>Frage 3: Wer pflegt die Seite in zwei Jahren?</h2>
<p>Die Website ist kein Projekt, sondern ein Dauerzustand: neue Preise, neue Fotos, geänderte Öffnungszeiten. Bei der Agentur heißt jede Änderung E-Mail, Warten, Stundensatz. Beim Baukasten änderst du selbst – vorausgesetzt, du traust dich in den Editor. Frag dich ehrlich, welches Modell zu deinem Alltag passt: Wer schon den Anrufbeantworter ungern bespricht, wird auch keine Agentur-Tickets schreiben.</p>

<h2>Frage 4: Wie wichtig ist dir Einzigartigkeit wirklich?</h2>
<p>Das stärkste Agentur-Argument ist individuelles Design. Aber prüfe den Maßstab: Deine Kundschaft vergleicht dich nicht mit Apple, sondern mit den drei anderen Betrieben im Ort – und gegen deren veraltete oder fehlende Websites gewinnt jede gepflegte, schnelle, mobiltaugliche Seite. Einzigartigkeit entsteht bei kleinen Betrieben ohnehin weniger durch Layout als durch echte Fotos, echte Bewertungen und einen Ton, der nach dir klingt.</p>

<h2>Die Kurzformel</h2>
<ul>
<li><strong>Agentur</strong> – wenn dein Fall ein echter Sonderfall ist oder Website/Marke dein Kerngeschäft berühren. Budget ab 2.000 €, plus laufende Pflege.</li>
<li><strong>Klassischer Baukasten</strong> – wenn du Freude am Selberbauen hast und die Abende dafür übrig sind. 10–40 €/Monat plus deine Zeit.</li>
<li><strong>KI-Baukasten</strong> – wenn du das Standard-Ergebnis in professionell willst, ohne die Abende: fertiger Entwurf zum Anpassen, ab 19,90 €/Monat, Rechtstexte und Pflege inklusive. Bei Pageblitz siehst du die <a href="/start">fertige Vorschau</a>, bevor du dich entscheidest.</li>
</ul>
`,
  faq: [
    {
      question: "Kann ich später vom Baukasten zur Agentur wechseln?",
      answer:
        "Ja – wichtig ist nur, dass die Domain auf dich registriert ist und du an deine Inhalte (Texte, Bilder) kommst. Dann nimmst du beides mit, und die neue Website erscheint unter derselben Adresse.",
    },
    {
      question: "Sind Baukasten-Websites schlechter für Google?",
      answer:
        "Nein – Google bewertet Inhalte, Struktur, Ladezeit und Mobiltauglichkeit, nicht das Werkzeug dahinter. Eine gepflegte Baukasten-Seite schlägt eine veraltete Agentur-Seite regelmäßig.",
    },
    {
      question: "Was ist der Unterschied zwischen Baukasten und KI-Baukasten?",
      answer:
        "Der Startpunkt: Beim klassischen Baukasten beginnst du mit einer leeren Vorlage und baust selbst. Ein KI-Baukasten wie Pageblitz erstellt aus Firmenname und Branche eine fertige Website mit Texten, Bildern und Rechtsseiten – du passt nur noch an.",
    },
    {
      question: "Lohnt sich eine Agentur für einen kleinen Handwerksbetrieb?",
      answer:
        "Meist erst bei besonderen Anforderungen (Marke, Sonderfunktionen, viele Standorte). Für die klassische Betriebs-Website mit Leistungen, Referenzen und Kontakt liefern moderne Baukästen das gleiche Kundenergebnis für einen Bruchteil der Kosten.",
    },
  ],
};

/** Batch 2 — wird in blogPosts.ts in BLOG_POSTS eingereiht. */
export const BLOG_POSTS_BATCH2: BlogPost[] = [
  GBP_POST,
  FRISEUR_KOSTEN_POST,
  COOKIE_POST,
  TEXTE_POST,
  BAUKASTEN_AGENTUR_POST,
];
