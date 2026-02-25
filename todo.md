# Pageblitz MVP - TODO

## Datenbank & Backend
- [x] Datenbank-Schema (businesses, websites, outreach_emails, payments)
- [x] DB-Migrations ausführen
- [x] DB-Helper-Funktionen (CRUD für alle Tabellen)
- [x] tRPC-Router: Admin-Prozeduren (GMB-Suche, Business-CRUD, Website-Generierung)
- [x] tRPC-Router: Public-Prozeduren (Preview, Checkout)
- [x] Google Maps Places API Integration für GMB-Suche
- [x] OpenAI/LLM Integration für Website-Generierung (strukturiertes JSON)
- [x] E-Mail-Outreach-System (Gmail MCP oder Notification)

## Admin-Dashboard
- [x] Dark Theme Design für Admin-Bereich
- [x] Dashboard-Startseite mit Statistiken (Generierte Websites, E-Mails, Verkäufe)
- [x] GMB-Suche Panel (Nische + Region Eingabe, Ergebnisse-Liste)
- [x] Business-Detail-Ansicht (Name, Adresse, Telefon, Öffnungszeiten, Bewertungen, Branche)
- [x] Button "Website generieren" mit KI-Generierung
- [x] Websites-Übersicht mit Status (Preview, Verkauft, Aktiv)
- [x] Outreach-Management (E-Mail senden mit Preview-Link)
- [x] Admin-Auth (nur Admin-Rolle hat Zugang)

## KI-Website-Generierung
- [x] OpenAI Prompt-Engineering für strukturierte JSON-Ausgabe
- [x] Website-Sections: Hero, About, Services, Testimonials, Contact
- [x] Branchenspezifische Farbschemata
- [x] Hochwertige, branchenspezifische Texte
- [x] Website-Renderer (React-Komponenten für jede Section)

## Kunden-Preview & Checkout
- [x] Preview-Seite unter /preview/:token
- [x] Dynamische Subdomain-Route /site/:slug
- [x] Responsive, moderne Website-Darstellung
- [x] "Jetzt aktivieren" Button auf Preview
- [x] Checkout-Flow (490€ Setup + 99€/Monat) – MVP simuliert
- [x] Nach Zahlung: Status auf "Aktiv" setzen

## Add-on System (UI vorbereitet)
- [x] Add-on UI: Kontaktformular
- [x] Add-on UI: KI-Chat
- [x] Add-on UI: Terminbuchung
- [x] Add-on UI: Eigene Domain

## Design & Styling
- [x] Dunkles Admin-Dashboard Design
- [x] Helles, professionelles Design für generierte Websites
- [x] Pageblitz Branding (Logo, Farben, Typografie)
- [x] Responsive Design für alle Ansichten

## Tests
- [x] Vitest: Auth-Tests
- [x] Vitest: Admin-Zugriffskontrolle
- [x] Vitest: Business & Website CRUD
- [x] Vitest: Outreach & Checkout

## Bugfixes
- [x] Fix "JSON Parse error: Unexpected identifier undefined" beim Dashboard-Laden

## Bugfixes Runde 2
- [x] Alle JSON.parse-Stellen im Code absichern
- [x] localStorage beim App-Start auf ungültige Werte prüfen und bereinigen (sanitizeLocalStorage in main.tsx)
- [x] Server-Neustart und vollständige Verifikation (17/17 Tests bestanden)

## Template-Library (uicore.pro)
- [x] uicore.pro Templates scrapen und Vorschaubilder extrahieren (150 Templates)
- [x] Template-Library als strukturierte Daten aufbauen (templates.json mit CDN-URLs)
- [x] KI-Prompt mit Template-Referenzen anreichern (multimodal image input)

## Feature-Verbesserungen (Runde 2)
- [x] KI-Prompt massiv verbessern: einzigartige Texte, branchenspezifische Layouts, mehr Varianz
- [x] Bildmaterial-Integration: KI-generierte Hero-Bilder via Image Generation API
- [x] Unsplash-Integration für branchenspezifische Stockfotos als Fallback
- [x] WebsiteRenderer: mehr Layout-Varianten (mindestens 5 verschiedene Stile), echte Bilder, bessere Typografie
- [x] Website-Alter-Erkennung: bestehende Websites auf Alter und Qualität prüfen (Wayback Machine + HTML-Analyse)
- [x] GMB-Suche: Filter für "veraltete Website" (>3 Jahre) und Qualitäts-Score
- [x] Lead-Kategorien: "Keine Website", "Veraltete Website", "Schlechte Website"

## Regenerate-Feature
- [x] Backend: Vollständige Regenerate-Prozedur (neue KI-Texte, neues Layout, neuer Preview-Token)
- [x] Frontend: Regenerate-Button in Websites-Übersicht
- [x] Frontend: Confirmation-Dialog mit Warnung und KI-Bild-Option
- [x] Loading-State während Regenerierung
- [x] Erfolgsmeldung mit direktem Preview-Link nach Regenerierung

## WebsiteRenderer Fix (Visuelle Varianz)
- [x] Analyse: Props layoutStyle/heroImageUrl wurden nicht an WebsiteRenderer übergeben
- [x] PreviewPage und SitePage: layoutStyle + heroImageUrl Props korrekt weitergegeben
- [x] WebsiteRenderer: Client-seitige Fallback-Bilder für alte Websites (ohne heroImageUrl in DB)
- [x] WebsiteRenderer: Client-seitiger Layout-Fallback für alte Websites (ohne layoutStyle in DB)
- [x] getLayoutStyle: Englische GMB-Kategorienamen (hair care, roofing contractor etc.) korrekt erkannt
- [x] Alle 17 Tests bestanden, TypeScript-Check sauber

## Layout-Persönlichkeiten (Runde 3)
- [x] ElegantLayout.tsx: Playfair Display, Gold-Akzente, Split-Hero, Serif-Typografie (Beauty/Friseur)
- [x] BoldLayout.tsx: Oswald, dunkler Hintergrund, Diagonal-Cuts, Power-Typografie (Handwerk/Bau)
- [x] WarmLayout.tsx: Lora, warme Farben, Foodfoto-Atmosphäre, Karten-Stil (Restaurant/Café)
- [x] CleanLayout.tsx: Inter, Blau-Akzente, Trust-Badges, viel Weissraum (Arzt/Beratung)
- [x] DynamicLayout.tsx: Bebas Neue, Diagonale, Energie-Farben, Große Zahlen (Fitness/Sport)
- [x] WebsiteRenderer.tsx: Dispatcher auf 5 neue Layouts, Fallback-Bilder, Layout-Inferenz
- [x] getLayoutStyle: Nur noch 5 valide Layouts (elegant/bold/warm/clean/dynamic)
- [x] buildIndustryContext: Layout-spezifische Schreibstil-Anweisungen mit VERBOTEN-Liste
- [x] Google Fonts in index.html: Playfair Display, Lora, Oswald, Bebas Neue, Rajdhani
- [x] 17/17 Tests bestanden, TypeScript-Check sauber

## Bugfixes & Features (Runde 4)
- [x] FAQ-Bug gefixt: Feld-Name-Mismatch question/answer vs title/description in allen 5 Layouts
- [x] Varianz-System: 5-6 Farbvarianten pro Branche, verbesserter Hash-Algorithmus
- [x] Farb-Picker auf Preview-Seite: 12 Farb-Presets + eigener Hex-Input + Live-Vorschau
- [x] 17/17 Tests bestanden, TypeScript-Check sauber

## Template-Matching-System (Runde 5)
- [ ] Template-Library visuell analysieren und Design-DNA extrahieren
- [ ] Branchen-Template-Pools aufbauen (Beauty, Handwerk, Restaurant, Medizin, Fitness etc.)
- [ ] Template-Selector: zufälliges Template aus Branchen-Pool wählen
- [ ] Design-DNA als strukturierte Prompt-Anweisungen einbauen
- [ ] templateId in DB speichern für Konsistenz bei Regenerierung
- [ ] WebsiteRenderer: strukturell unterschiedliche Layouts pro Template-Typ

## Branchenspezifische Layout-Pools (Runde 6)
- [x] 7 neue Layout-Komponenten: LuxuryLayout, CraftLayout, FreshLayout, TrustLayout, ModernLayout, VibrantLayout, NaturalLayout
- [x] WebsiteRenderer: 12 Layouts (elegant, bold, warm, clean, dynamic, luxury, craft, fresh, trust, modern, vibrant, natural)
- [x] Industry-Pool-System: Jede Branche hat 2-4 verschiedene Layouts im Pool
- [x] Deterministischer Hash: Gleicher Firmenname → immer gleicher Layout; verschiedene Firmen → verschiedene Layouts
- [x] getLayoutStyle: Pool-basiertes System mit 12 Branchen-Kategorien
- [x] buildIndustryContext: Alle 12 Branchen-Pools mit spezifischen Schreibstil-Anweisungen
- [x] Verifiziert: Friseur → elegant/fresh/luxury je nach Firmenname; Restaurant → warm/fresh/modern; Fitness → vibrant/dynamic

## Google Bewertungen & Testimonials (Runde 7)
- [x] Echte Google-Bewertungsdaten (Sterne + Anzahl) prominent in allen 12 Layouts anzeigen
- [x] KI-Testimonials mit Hinweis "Beispiel-Bewertungen" kennzeichnen (oder entfernen wenn echte Daten vorhanden)
- [x] AI-Prompt: Echte Rating-Daten als Basis für Testimonial-Ton und -Anzahl nutzen
- [x] Alle 12 Layout-Komponenten: Google-Rating-Badge im Hero oder Stats-Bereich

## Admin Template-Upload-System (Runde 7)
- [x] DB-Schema: template_uploads Tabelle (id, industry, layoutPool, imageUrl, fileKey, name, createdAt)
- [x] DB-Migration ausführen
- [x] S3: Template-Bilder hochladen und speichern (storagePut)
- [x] tRPC: uploadTemplate Mutation (Admin), listTemplates Query, deleteTemplate Mutation
- [x] Admin-UI: Neue Seite "Templates" im Sidebar
- [x] Admin-UI: Upload-Formular (Branche wählen, Layout-Pool wählen, Bild hochladen)
- [x] Admin-UI: Template-Galerie mit Vorschau und Löschen-Button
- [x] KI-Generierung: Hochgeladene Templates als visuelle Referenz für multimodalen Prompt nutzen

## Batch-Upload & KI-Klassifizierung (Runde 8)
- [x] DB-Schema: template_uploads erweitern (status: pending/approved, industries als JSON-Array statt einzelner String)
- [x] DB-Migration ausführen
- [x] tRPC: classifyTemplate Mutation – KI analysiert Bild und schlägt Branchen + Layout-Pool vor
- [x] tRPC: updateTemplate Mutation – Korrekturen speichern (Branchen, Pool, Name, Notes)
- [x] tRPC: approveTemplate / bulkApprove Mutations
- [x] TemplatesPage: Batch-Upload (mehrere Dateien gleichzeitig, Drag&Drop-Zone)
- [x] TemplatesPage: Upload-Queue mit Fortschrittsanzeige pro Bild
- [x] TemplatesPage: Review-Queue – KI-Vorschläge anzeigen, editierbar, bestätigen/ablehnen
- [x] TemplatesPage: Multi-Branchen-Auswahl pro Template (Checkboxen)
- [x] KI-Generierung: Mehrfach-Zuordnung berücksichtigen (Template taucht in mehreren Branchen-Pools auf)
