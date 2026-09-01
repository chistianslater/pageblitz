/**
 * Blog-Artikel Batch 3 (2026-09-01) — Regeln wie blogPosts2.ts:
 * Autoren-HTML aus diesem Repo, NIEMALS Fremdinhalte.
 */
import type { BlogPost } from "./blogPosts";

const RESTAURANT_KOSTEN_POST: BlogPost = {
  slug: "was-kostet-eine-website-fuer-restaurants",
  title: "Was kostet eine Website für Restaurants? Zahlen, die stimmen",
  metaTitle: "Restaurant-Website: Kosten 2026 | Pageblitz",
  metaDescription:
    "Speisekarte, Reservierung, Fotos: Was eine Restaurant-Website kostet, welche Funktionen Gastronomie wirklich braucht und wo Gäste verloren gehen.",
  category: "Kosten & Vergleich",
  publishedAt: "2026-09-01",
  updatedAt: "2026-09-01",
  readingMinutes: 6,
  teaser:
    "Kein Betrieb wird so oft vorab gegoogelt wie ein Restaurant – und nirgendwo entscheidet die Website so direkt über den Umsatz des Abends.",
  bodyHtml: `
<p>„Wo gehen wir essen?“ wird heute mit dem Handy entschieden: Speisekarte checken, Fotos ansehen, Öffnungszeiten prüfen, reservieren. Ein Restaurant ohne brauchbare Website verliert Gäste an den Betrieb zwei Straßen weiter – jeden Abend. Die allgemeinen Zahlen aller Wege stehen im <a href="/blog/was-kostet-eine-website-fuer-kleinunternehmen">Kosten-Überblick</a>; hier geht es um die Gastronomie-Spezifika.</p>

<h2>Was eine Restaurant-Website leisten muss</h2>
<ul>
<li><strong>Speisekarte als Text, nicht als Foto-PDF</strong> – abfotografierte Karten sind auf dem Handy unlesbar und für Google unsichtbar. Eine echte Karte mit Gerichten und Preisen ist die wichtigste Seite überhaupt.</li>
<li><strong>Reservierungsmöglichkeit</strong> – mindestens eine Tisch-Anfrage per Formular; das Telefon ist im Service-Stress selten besetzt.</li>
<li><strong>Öffnungszeiten inkl. Küchenschluss</strong> – und Ruhetage, prominent statt versteckt.</li>
<li><strong>Echte Fotos</strong> – vom Raum und von Tellern. Stockfotos erkennt jeder Gast, und nichts baut mehr Vertrauen ab.</li>
<li><strong>Anfahrt und Parken</strong> – besonders außerhalb der Innenstadt entscheidend.</li>
</ul>

<h2>Die Wege und ihre Gastro-Rechnung</h2>
<p><strong>Agentur (2.500–6.000 €):</strong> Für gehobene Häuser mit Marken-Anspruch berechtigt. Der Haken im Alltag: Die Speisekarte ändert sich ständig – Saisonkarte, neue Preise, Mittagsangebot. Wenn jede Änderung über die Agentur läuft, veraltet die Karte oder das Budget wächst.</p>
<p><strong>Klassischer Baukasten (10–40 €/Monat):</strong> Funktioniert, wenn jemand im Team die Abende für Aufbau und Pflege übrig hat – in der Gastronomie eine mutige Annahme.</p>
<p><strong>KI-Baukasten:</strong> <a href="/website-erstellen/restaurant">Pageblitz</a> erstellt aus dem Restaurantnamen eine fertige Website zur Vorschau; die Speisekarte pflegst du selbst in einem einfachen Editor, Änderungen sind in Minuten online. 19,90 €/Monat (jährlich), Rechtstexte und Hosting in Deutschland inklusive.</p>

<h2>Wo Restaurants online Gäste verlieren</h2>
<p>Die Klassiker: eine Speisekarte von vor zwei Jahren („gibt es das Gericht noch?“), tote Reservierungs-Telefonnummern im Google-Profil, keine Preise („zu teuer für uns?“), keine Info zum Ruhetag (Anfahrt umsonst — der Gast kommt nicht wieder). All das kostet mehr Umsatz als jede Website-Gebühr: Ein einziger Vierertisch pro Woche, der woanders bucht, sind aufs Jahr gerechnet mehrere tausend Euro.</p>

<h2>Rechenbeispiel</h2>
<p>Bei rund 239 € Jahreskosten (Pageblitz im Jahresabo) refinanziert schon <em>ein</em> zusätzlicher Vierertisch pro Monat die Website um ein Mehrfaches. Realistischer Effekt einer guten Gastro-Website ist deutlich mehr — vor allem über die lesbare Speisekarte und die Reservierungsanfragen nach Feierabend.</p>
`,
  faq: [
    {
      question: "Warum keine PDF-Speisekarte?",
      answer:
        "PDF-Karten sind auf dem Handy schwer lesbar, laden langsam und werden von Google kaum indexiert – wer nach einem Gericht sucht, findet dich nicht. Eine als Text gepflegte Karte ist mobilfreundlich und suchmaschinenlesbar.",
    },
    {
      question: "Braucht ein Restaurant ein Online-Reservierungssystem?",
      answer:
        "Ein einfaches Anfrage-Formular reicht für die meisten Häuser: Es fängt Anfragen außerhalb der Servicezeiten auf. Vollautomatische Systeme mit Tischplan lohnen sich bei hohem Reservierungsaufkommen.",
    },
    {
      question: "Wie halte ich die Speisekarte aktuell?",
      answer:
        "Entscheidend ist, dass du sie selbst ändern kannst – ohne Agentur-Ticket. In einem Baukasten-Editor sind Preisänderungen oder Saisongerichte in wenigen Minuten online.",
    },
    {
      question: "Was kostet eine Restaurant-Website bei Pageblitz?",
      answer:
        "19,90 € im Monat bei jährlicher Zahlung (24,90 € monatlich); die Speisekarten-Funktion ist als Extra zubuchbar. Vorschau kostenlos, 7 Tage gratis testen.",
    },
  ],
};

const BILDRECHTE_POST: BlogPost = {
  slug: "bildrechte-firmen-website",
  title: "Bildrechte auf der Firmen-Website: Was du verwenden darfst",
  metaTitle: "Bildrechte auf der Website: Der Praxis-Guide | Pageblitz",
  metaDescription:
    "Eigene Fotos, Stockbilder, KI-Bilder, Kundenfotos: Welche Bilder du auf deiner Betriebs-Website nutzen darfst – und welche Fehler teuer abgemahnt werden.",
  category: "Recht & Pflichten",
  publishedAt: "2026-09-01",
  updatedAt: "2026-09-01",
  readingMinutes: 7,
  teaser:
    "Ein aus Google kopiertes Bild kann vierstellig kosten. Die Regeln für Fotos auf der Betriebs-Website – verständlich und ohne Panikmache.",
  bodyHtml: `
<p>Bilder-Abmahnungen gehören zu den häufigsten und teuersten Rechtsfehlern kleiner Websites – dabei sind die Regeln überschaubar. Der Kern in einem Satz: <strong>Jedes Bild hat einen Urheber, und du brauchst dessen Erlaubnis.</strong> Was das praktisch bedeutet, nach Bildquelle sortiert:</p>

<h2>Eigene Fotos: die sicherste Quelle</h2>
<p>Was du selbst fotografierst, gehört dir – nutze es frei. Zwei Ausnahmen: <strong>Erkennbare Personen</strong> brauchen grundsätzlich eine Einwilligung (beim eigenen Team am besten schriftlich, inklusive dem Fall des späteren Ausscheidens). Und bei <strong>fremden Werken im Bild</strong> (Kunst, Markenlogos prominent im Fokus) ist Vorsicht geboten. Gebäude von öffentlichen Wegen aus sind dank Panoramafreiheit in Deutschland unproblematisch.</p>

<h2>Stockbilder: erlaubt, aber Lizenz lesen</h2>
<p>Bezahl- und Gratis-Stockbörsen sind legitim – entscheidend sind die Lizenzbedingungen: Ist gewerbliche Nutzung erlaubt? Ist eine Urhebernennung Pflicht (häufige Abmahnfalle bei Gratis-Bildern!)? Dokumentiere Download und Lizenz (Screenshot mit Datum), damit du im Streitfall belegen kannst, woher das Bild stammt. Und bedenke jenseits des Rechts: Das lachende Stock-Team aus dem Callcenter erkennt deine Kundschaft sofort — echte Fotos konvertieren besser.</p>

<h2>Google-Bilder & Social Media: die Tabuzone</h2>
<p>Die Bildersuche ist ein Katalog, kein Selbstbedienungsladen: Praktisch jedes Bild dort ist geschützt. Auch Fotos aus Instagram oder von anderen Websites zu übernehmen – selbst „mit Quellenangabe“ – ist eine Urheberrechtsverletzung. Genau hier entstehen die klassischen Abmahnungen mit Schadensersatz plus Anwaltskosten, gern im vierstelligen Bereich.</p>

<h2>KI-generierte Bilder: erlaubt, mit Fußnoten</h2>
<p>Bilder aus KI-Generatoren darfst du geschäftlich nutzen, sofern die Nutzungsbedingungen des Anbieters das erlauben (bei den gängigen Bezahl-Tools der Fall). Grenzen: keine erkennbaren echten Personen oder fremden Marken generieren lassen, und bei Motiven, die ein reales Werk imitieren, Vorsicht. Für Stimmungsbilder sind KI-Bilder eine saubere Stock-Alternative; dein echtes Team und deine echten Arbeiten können sie nicht ersetzen.</p>

<h2>Kunden- und Referenzfotos</h2>
<p>Fotos vom fertigen Projekt beim Kunden: fotografieren ja, veröffentlichen nur mit Zustimmung – bei Innenräumen und allem, was Rückschlüsse auf Personen zulässt, am besten schriftlich (eine kurze Zeile im Auftrag genügt). Vorher-nachher-Bilder sind Gold für Handwerker-Websites; hol dir die Freigabe direkt bei Abnahme.</p>

<h2>Die Kurz-Checkliste</h2>
<ul>
<li>Selbst fotografiert + Personen einverstanden → nutzen.</li>
<li>Stockbild → Lizenz für Gewerbe prüfen, Namensnennung beachten, Nachweis sichern.</li>
<li>Aus Google/Instagram/fremder Website kopiert → niemals.</li>
<li>KI-generiert → Anbieter-Bedingungen prüfen, keine echten Personen/Marken.</li>
<li>Beim Kunden fotografiert → Freigabe einholen, idealerweise schriftlich.</li>
</ul>

<p class="blog-disclaimer">Dieser Artikel ist eine sorgfältig recherchierte Orientierung, aber keine Rechtsberatung. Im Abmahnfall oder bei besonderen Konstellationen hilft eine auf Urheberrecht spezialisierte Kanzlei.</p>
`,
  faq: [
    {
      question: "Darf ich Bilder aus der Google-Bildersuche verwenden?",
      answer:
        "Nein. Die Bildersuche zeigt fremde, urheberrechtlich geschützte Werke – ihre Nutzung ohne Lizenz ist die häufigste Ursache für Bilder-Abmahnungen, auch mit Quellenangabe.",
    },
    {
      question: "Sind kostenlose Stockbilder wirklich sicher?",
      answer:
        "Meist ja, aber lies die Lizenz: Manche verlangen Urhebernennung, manche schließen bestimmte Nutzungen aus. Sichere dir einen Nachweis von Download und Lizenztext – seriöse Plattformen machen das einfach.",
    },
    {
      question: "Brauche ich vom eigenen Team eine Foto-Einwilligung?",
      answer:
        "Ja – am besten schriftlich und mit Regelung für die Zeit nach dem Ausscheiden. Ohne Einwilligung kann ein Ex-Mitarbeiter die Entfernung seiner Fotos verlangen.",
    },
    {
      question: "Darf ich KI-Bilder gewerblich nutzen?",
      answer:
        "In der Regel ja, wenn die Nutzungsbedingungen des Generators das vorsehen. Vermeide erkennbare reale Personen, fremde Logos und Motive, die ein konkretes geschütztes Werk nachahmen.",
    },
  ],
};

const DOMAIN_POST: BlogPost = {
  slug: "domain-finden-registrieren",
  title: "Die richtige Domain für deinen Betrieb: finden, prüfen, registrieren",
  metaTitle: "Domain finden & registrieren: Guide für Betriebe | Pageblitz",
  metaDescription:
    "Wie du eine gute Domain für deinen Betrieb findest: Namensregeln, .de oder .com, Kosten, Rechtsfallen – und warum die Domain immer dir gehören muss.",
  category: "Praxis",
  publishedAt: "2026-09-01",
  updatedAt: "2026-09-01",
  readingMinutes: 6,
  teaser:
    "Die Domain ist deine Adresse im Netz – einmal klug gewählt, begleitet sie deinen Betrieb Jahrzehnte. Die Regeln für eine gute Wahl.",
  bodyHtml: `
<p>Visitenkarte, Auto-Beschriftung, Google-Profil, E-Mail: Deine Domain steht am Ende überall. Umso erstaunlicher, wie oft sie nebenbei entschieden wird. Dabei sind die Regeln für eine gute Betriebs-Domain einfach – und die Fehler langlebig.</p>

<h2>Die Namensregeln</h2>
<ul>
<li><strong>Kurz und diktierfähig</strong> – der Test: Kannst du sie am Telefon durchgeben, ohne zu buchstabieren? „malerbetrieb-schmidt.de“ besteht, „mb-schmidt-farben-und-mehr24.de“ fällt durch.</li>
<li><strong>Betriebsname zuerst</strong> – die Domain sollte deinem echten Namen folgen, nicht einem Keyword-Konstrukt. „schreinerei-brandt.de“ schlägt „moebel-guenstig-dortmund.de“: Sie ist merkbar, seriös und wächst mit dem Betrieb mit.</li>
<li><strong>Umlaute meiden</strong> – „müller.de“ ist technisch möglich, macht aber bei E-Mail-Adressen bis heute Ärger. Nimm „mueller“.</li>
<li><strong>Bindestriche sparsam</strong> – einer ist okay und oft gut lesbar; zwei und mehr wirken unruhig.</li>
</ul>

<h2>.de, .com oder etwas Modernes?</h2>
<p>Für deutsche Betriebe mit deutscher Kundschaft ist <strong>.de</strong> die erste Wahl: vertraut, seriös, günstig. .com lohnt sich zusätzlich, wenn du sie günstig mitsichern kannst. Moderne Endungen (.berlin, .shop, .bayern) funktionieren technisch genauso — sie sind Geschmackssache und teils teurer; als Zweitdomain unbedenklich, als Hauptdomain für konservative Zielgruppen eher ungewohnt.</p>

<h2>Kosten und der wichtigste Grundsatz</h2>
<p>Eine .de-Domain kostet einzeln meist 5–20 € im Jahr; bei Website-Baukästen ist sie oft im Paket enthalten oder anbindbar. Wichtiger als der Preis ist die Eigentumsfrage: <strong>Die Domain muss auf DICH registriert sein</strong> – nicht auf die Agentur, nicht auf den Neffen, der „das mal eingerichtet hat“. Wer als Inhaber eingetragen ist, kontrolliert die Adresse. Bei jedem Dienstleister-Wechsel nimmst du eine eigene Domain einfach mit (Stichwort Auth-Code/Transfer).</p>

<h2>Rechtsfallen bei der Namenswahl</h2>
<p>Prüfe vor der Registrierung zweierlei: <strong>Fremde Marken</strong> – ein bekannter Markenname in deiner Domain (auch als Bestandteil) kann Abmahnungen provozieren. Und <strong>Namensrechte</strong> – der Name eines gleichnamigen, etablierten Wettbewerbers deiner Branche ist riskant, selbst wenn die Domain frei ist. Der eigene Betriebs- oder Familienname ist fast immer die sichere Wahl.</p>

<h2>Domain und E-Mail zusammen denken</h2>
<p>Der unterschätzte Bonus der eigenen Domain: <strong>info@deinbetrieb.de</strong> statt einer Freemail-Adresse. Eine gewerbliche Anfrage von „malerschmidt1972@web.de“ wirkt eine Klasse unseriöser als dieselbe Anfrage von der eigenen Domain — mehr dazu, warum sich das lohnt, im Zusammenspiel mit deiner <a href="/blog/was-kostet-eine-website-fuer-kleinunternehmen">Website-Kostenplanung</a>.</p>

<p>Bei <a href="/">Pageblitz</a> startest du mit einer freien Subdomain (deinbetrieb.pageblitz.de) und verbindest deine eigene Domain, sobald du sie hast — die Website zieht ohne Umbau mit um.</p>
`,
  faq: [
    {
      question: "Was kostet eine .de-Domain?",
      answer:
        "Bei den meisten Registraren zwischen 5 und 20 € pro Jahr. Vorsicht bei Lockangeboten fürs erste Jahr – entscheidend ist der Verlängerungspreis ab Jahr zwei.",
    },
    {
      question: "Meine Wunschdomain ist vergeben – was nun?",
      answer:
        "Varianten prüfen: Ort anhängen (schreinerei-brandt-dortmund.de), Rechtsform oder Vorname ergänzen, oder eine andere seriöse Endung wählen. Vom Kauf teurer 'Premium-Domains' über Broker ist für kleine Betriebe meist abzuraten.",
    },
    {
      question: "Wie stelle ich sicher, dass die Domain mir gehört?",
      answer:
        "Registriere sie selbst (eigener Account beim Registrar) oder lass dich explizit als Domaininhaber eintragen. Prüfen kannst du das über eine Whois-Abfrage – steht dort die Agentur, lass es korrigieren.",
    },
    {
      question:
        "Kann ich meine Domain später zu einem anderen Anbieter mitnehmen?",
      answer:
        "Ja – als Inhaber bekommst du einen Auth-Code und transferierst die Domain zum neuen Anbieter. Website und E-Mail ziehen dann mit um; genau deshalb ist die Inhaberschaft so wichtig.",
    },
  ],
};

const BFSG_POST: BlogPost = {
  slug: "barrierefreie-website-bfsg-kleinunternehmen",
  title: "Barrierefreie Website: Was das BFSG für Kleinunternehmen bedeutet",
  metaTitle: "BFSG & barrierefreie Website für Betriebe | Pageblitz",
  metaDescription:
    "Seit Juni 2025 gilt das Barrierefreiheitsstärkungsgesetz. Wer betroffen ist, welche Ausnahme für Kleinstunternehmen gilt und warum Barrierefreiheit trotzdem lohnt.",
  category: "Recht & Pflichten",
  publishedAt: "2026-09-01",
  updatedAt: "2026-09-01",
  readingMinutes: 7,
  teaser:
    "Seit dem 28. Juni 2025 gilt das BFSG – und mit ihm viel Verunsicherung. Wer wirklich betroffen ist, wo die Kleinstunternehmer-Ausnahme greift und was sich trotzdem lohnt.",
  bodyHtml: `
<p>Kaum ein Gesetz hat bei kleinen Betrieben zuletzt so viel Unsicherheit ausgelöst wie das <strong>Barrierefreiheitsstärkungsgesetz (BFSG)</strong>, das seit dem 28. Juni 2025 gilt. Verkäufer von „BFSG-Notfall-Paketen“ tun ihr Übriges. Zeit für eine nüchterne Einordnung: Wer muss, wer ist ausgenommen – und warum Barrierefreiheit auch ohne Pflicht eine gute Idee ist.</p>

<h2>Worum es geht</h2>
<p>Das BFSG setzt den European Accessibility Act um und verpflichtet bestimmte Produkte und <strong>Dienstleistungen für Verbraucher</strong> zur Barrierefreiheit. Im Web-Kontext betrifft das vor allem den „elektronischen Geschäftsverkehr“: Online-Shops und Websites, über die Verbraucher Verträge abschließen oder buchen und bezahlen können. Eine reine Info-Website – Leistungen, Fotos, Kontakt – ist keine solche Dienstleistung.</p>

<h2>Die Kleinstunternehmer-Ausnahme</h2>
<p>Die für die meisten Leser wichtigste Regel: <strong>Kleinstunternehmen sind bei Dienstleistungen ausgenommen.</strong> Kleinstunternehmen heißt: weniger als 10 Beschäftigte UND höchstens 2 Millionen Euro Jahresumsatz oder Bilanzsumme. Der typische Salon, Handwerksbetrieb oder das einzelne Restaurant fällt darunter – selbst mit Online-Terminbuchung greift die Ausnahme für die Dienstleistung. (Für <em>Produkte</em> gilt die Ausnahme nicht, das betrifft aber Hersteller, nicht Website-Betreiber.)</p>

<h2>Wer aufpassen muss</h2>
<ul>
<li><strong>Online-Shops</strong> ab Kleinunternehmen-Größe (10+ Beschäftigte oder über 2 Mio. € Umsatz) – der Checkout muss barrierefrei bedienbar sein.</li>
<li><strong>Buchungs- und Bezahlstrecken</strong> größerer Anbieter – Hotels, Ticketverkauf, Kursbuchung mit Online-Zahlung.</li>
<li>Wer knapp über den Schwellen liegt oder wächst: rechtzeitig planen statt nachrüsten.</li>
</ul>

<h2>Warum Barrierefreiheit trotzdem lohnt</h2>
<p>Unabhängig von jeder Pflicht: Barrierefreie Websites sind bessere Websites. Ausreichende Kontraste, lesbare Schriftgrößen, beschriftete Formulare, Alt-Texte auf Bildern und Bedienbarkeit per Tastatur helfen nicht nur Menschen mit Behinderung, sondern jedem Gast mit Sonnenlicht auf dem Display, jeder Kundin über 60 – und nebenbei Google, das viele dieser Signale mitbewertet. Rund ein Zehntel der Bevölkerung lebt mit einer Schwerbehinderung; das ist schlicht Kundschaft.</p>

<h2>Die Pragmatiker-Checkliste</h2>
<ul>
<li>Kontrast von Text zu Hintergrund ausreichend? (Faustregel: auch bei Sonne lesbar)</li>
<li>Alle Bilder mit Alt-Text, alle Formularfelder mit Beschriftung?</li>
<li>Website komplett per Tastatur bedienbar, Fokus sichtbar?</li>
<li>Schrift skalierbar, keine Info nur über Farbe transportiert?</li>
<li>Überschriften-Hierarchie sauber (eine H1, logisch geschachtelt)?</li>
</ul>
<p><a href="/">Pageblitz</a>-Websites bringen diese Grundlagen von Haus aus mit — semantisches HTML, geprüfte Kontraste in den Design-Paketen, beschriftete Formulare und Tastatur-Bedienbarkeit gehören zum Standard, nicht zum Aufpreis.</p>

<p class="blog-disclaimer">Dieser Artikel ist eine sorgfältig recherchierte Orientierung, aber keine Rechtsberatung. Ob dein konkretes Angebot unter das BFSG fällt, klärt im Zweifel eine spezialisierte Beratung – besonders an den Schwellen zu Shop- und Buchungsfunktionen.</p>
`,
  faq: [
    {
      question: "Gilt das BFSG für meine normale Betriebs-Website?",
      answer:
        "Eine reine Informations-Website ohne Online-Vertragsabschluss fällt nicht unter die BFSG-Pflichten für Dienstleistungen. Relevant wird es bei Shops und Buchungsstrecken mit Bezahlung – und auch dort sind Kleinstunternehmen ausgenommen.",
    },
    {
      question: "Was ist ein Kleinstunternehmen im Sinne des BFSG?",
      answer:
        "Weniger als 10 Beschäftigte und höchstens 2 Millionen Euro Jahresumsatz oder Bilanzsumme. Solche Unternehmen sind bei Dienstleistungen von den BFSG-Pflichten ausgenommen.",
    },
    {
      question: "Seit wann gilt das BFSG?",
      answer:
        "Seit dem 28. Juni 2025. Für bestimmte Bestandsfälle gibt es Übergangsfristen; neue Angebote müssen seither die Anforderungen erfüllen, sofern sie in den Anwendungsbereich fallen.",
    },
    {
      question: "Lohnt sich Barrierefreiheit auch ohne Pflicht?",
      answer:
        "Ja: bessere Bedienbarkeit für alle Besucher, größere erreichbare Kundschaft und positive Signale für Google. Die Grundlagen – Kontraste, Alt-Texte, Tastaturbedienung – kosten bei modernen Baukästen keinen Aufpreis.",
    },
  ],
};

const FOTOS_POST: BlogPost = {
  slug: "betriebsfotos-mit-dem-handy",
  title: "Gute Betriebsfotos mit dem Handy: Der Praxis-Guide",
  metaTitle: "Betriebsfotos mit dem Handy: So geht's | Pageblitz",
  metaDescription:
    "Kein Fotograf nötig: Wie du mit dem Smartphone Fotos machst, die deine Website und dein Google-Profil verkaufen – Licht, Motive, typische Fehler.",
  category: "Praxis",
  publishedAt: "2026-09-01",
  updatedAt: "2026-09-01",
  readingMinutes: 6,
  teaser:
    "Echte Fotos schlagen jedes Stockbild – und dein Handy reicht dafür völlig. Die Regeln, die aus Schnappschüssen Website-Fotos machen.",
  bodyHtml: `
<p>Nichts verkauft einen Betrieb online so gut wie echte Bilder: dein Laden, dein Team, deine Arbeit. Und nichts ist so austauschbar wie das hundertfach gesehene Stockfoto. Die gute Nachricht: Moderne Smartphones fotografieren besser, als die meisten Betriebs-Websites es je brauchen. Was fehlt, ist selten die Kamera – es sind ein paar Handgriffe.</p>

<h2>Regel 1: Licht schlägt alles</h2>
<p>Der Unterschied zwischen Schnappschuss und brauchbarem Foto ist fast immer das Licht. Fotografiere <strong>bei Tageslicht</strong>, idealerweise am Vormittag oder Nachmittag, nicht in der grellen Mittagssonne. Drinnen: nah ans Fenster, Deckenlampen aus (Mischlicht macht Farbstiche). Nie mit dem Fenster im Rücken des Motivs – dann wird alles zur Silhouette. Der Blitz bleibt aus; er macht harte Schatten und tote Farben.</p>

<h2>Regel 2: Die fünf Pflicht-Motive</h2>
<ul>
<li><strong>Außenansicht</strong> – so, wie Kundschaft dich findet: Fassade mit Schild, gerade Linien, freier Eingang.</li>
<li><strong>Innenraum</strong> – aufgeräumt, aus der Ecke fotografiert (wirkt größer), gern mit Tiefenblick.</li>
<li><strong>Menschen bei der Arbeit</strong> – die stärksten Bilder überhaupt: Hände am Werkstück, Beratung am Tresen. Nicht posieren, machen lassen.</li>
<li><strong>Ergebnisse</strong> – fertige Frisur, gestrichene Wand, angerichteter Teller. Bei Handwerk: konsequent Vorher-nachher-Paare vom gleichen Standpunkt.</li>
<li><strong>Team-Porträts</strong> – vor ruhigem Hintergrund, auf Augenhöhe, ehrliches Lächeln schlägt steifes Aufstellen.</li>
</ul>

<h2>Regel 3: Technik-Basics in 30 Sekunden</h2>
<ul>
<li><strong>Linse putzen</strong> – klingt banal, ist der häufigste Grund für flaue Bilder.</li>
<li><strong>Gerade halten</strong> – Gitternetz in der Kamera-App aktivieren; stürzende Linien wirken unprofessionell.</li>
<li><strong>Nicht zoomen, hingehen</strong> – Digitalzoom kostet Qualität, Füße sind gratis.</li>
<li><strong>Mehrfach auslösen</strong> – von jedem Motiv fünf Varianten, die beste gewinnt.</li>
<li><strong>Querformat für die Website</strong> – Hero- und Galeriebilder brauchen Breite; Hochformat fürs Handy-Publikum auf Social Media.</li>
</ul>

<h2>Regel 4: Was NICHT aufs Bild gehört</h2>
<p>Chaos im Hintergrund, Müllsäcke, private Gegenstände, Bildschirme mit Kundendaten – einmal kurz durchs Motiv schauen, bevor du auslöst. Und bei Personen gilt: erkennbare Kundschaft nur mit Einwilligung, das eigene Team am besten mit schriftlichem Okay (die Details stehen im <a href="/blog/bildrechte-firmen-website">Bildrechte-Guide</a>).</p>

<h2>Bearbeitung: weniger ist mehr</h2>
<p>Die Automatik-Verbesserung der Foto-App reicht meist völlig; allenfalls Helligkeit leicht anheben und den Horizont geradeziehen. Finger weg von starken Filtern – dein Laden soll auf dem Foto so aussehen, wie er beim Besuch aussieht, sonst ist die Enttäuschung vorprogrammiert.</p>

<p>Einmal im Quartal eine halbe Stunde fotografieren hält Website und <a href="/blog/google-unternehmensprofil-einrichten">Google-Profil</a> lebendig — und bei <a href="/">Pageblitz</a> lädst du die Bilder direkt ins Fotos-Panel und ordnest sie Hero, Galerie und Team zu.</p>
`,
  faq: [
    {
      question: "Reicht ein Smartphone wirklich für Website-Fotos?",
      answer:
        "Für Betriebs-Websites: ja. Aktuelle Smartphones liefern bei gutem Licht mehr Qualität, als Web-Auflösungen brauchen. Ein Profi-Fotograf lohnt sich zusätzlich für Team-Porträts oder wenn Bildsprache dein Verkaufsargument ist.",
    },
    {
      question: "Welches Format brauchen Website-Fotos?",
      answer:
        "Querformat für Hero- und Galeriebilder; die Website skaliert sie passend. Wichtiger als Megapixel sind Licht, gerader Horizont und aufgeräumte Motive.",
    },
    {
      question: "Wie viele Fotos braucht meine Website?",
      answer:
        "Ein starkes Hero-Bild, 6–12 Galerie-Bilder und je ein Porträt pro Teammitglied sind ein solides Set. Lieber zwölf gute als vierzig mittelmäßige.",
    },
    {
      question: "Darf ich Kundschaft mitfotografieren?",
      answer:
        "Erkennbare Personen brauchen eine Einwilligung. Der einfache Weg: so fotografieren, dass Kundschaft nicht erkennbar ist (von hinten, angeschnitten) – oder kurz fragen und sich das Okay geben lassen.",
    },
  ],
};

/** Batch 3 — wird in blogPosts.ts in BLOG_POSTS eingereiht. */
export const BLOG_POSTS_BATCH3: BlogPost[] = [
  RESTAURANT_KOSTEN_POST,
  BILDRECHTE_POST,
  DOMAIN_POST,
  BFSG_POST,
  FOTOS_POST,
];
