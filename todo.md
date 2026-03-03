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

## Template-Detail-Modal (Runde 9)
- [x] Template-Galerie: Klick auf Karte öffnet Detail-Modal
- [x] Modal: Große Bildvorschau + editierbare Felder (Name, Branchen, Layout-Pool, Notizen, Status)
- [x] Modal: Speichern-Button mit Erfolgsmeldung
- [x] Modal: Freigeben/Zurückziehen-Button je nach aktuellem Status
- [x] Modal: Löschen-Button mit Bestätigung
## Prompt-Optimierung aus Referenz-Repo (Runde 9)
- [x] 12 Design-Archetypen definiert (DESIGN_ARCHETYPES Konstante)
- [x] buildEnhancedPrompt() Helper mit StoryBrand-Framework
- [x] 60-30-10 Farbregel explizit im Prompt
- [x] Archetyp-Persönlichkeit (Name, Ästhetik, Typografie, Patterns, Micro-Interactions) im Prompt
- [x] Individualisierungswarnung für Template-Referenzen ("DARF NICHT wie Screenshots aussehen!")
- [x] Hero-Headline-Formel mit Beispielen (gute vs. verbotene Headlines)
- [x] generate + regenerate Prozeduren auf buildEnhancedPrompt() umgestellt
- [x] System-Prompts auf Awwwards-Level Standard angehoben

## Premium-Qualität Verbesserungen (Runde 10)
- [x] Scroll-Reveal Animationen via Intersection Observer (staggered delays)
- [x] Page-Load Sequenz (Navbar → Headline → Subtext → CTA mit Delays)
- [x] Navbar Scroll-Effekt (backdrop-blur + shadow)
- [x] Button/Card Hover-States (translateY(-2px) + glow)
- [x] Letter-spacing auf Headlines (-0.02em)
- [x] line-height 1.8 auf Hero-Subtext
- [x] animations.css globales CSS-System
- [x] useAnimations.ts Hook (useScrollReveal, useNavbarScroll, useCounterAnimation)
- [x] Alle 12 Layouts gepatcht (data-reveal auf h2, btn-premium, card-premium, hero-animate-*)

## Design-Token-System für visuelle Individualität (Runde 11)
- [x] WebsiteData: designTokens Feld hinzufügen (fonts, spacing, borderRadius, shadowStyle, sectionBg)
- [x] AI-Prompt: Archetyp-spezifische Token-Generierung (konkrete Werte, nicht generisch)
- [x] WebsiteRenderer: CSS Custom Properties aus designTokens injizieren
- [x] Alle Layouts: CSS Custom Properties statt hardcoded Werte verwenden (HEADING/BODY/SERIF/SANS)
- [x] Google Fonts: Dynamisch aus designTokens.fonts laden (useEffect in WebsiteRenderer)
- [x] Section-Hintergründe: Abwechslungsreich aus designTokens.sectionBg
- [x] designTokens Sanitization: Enum-Werte validieren, Platzhalter-Strings bereinigen

## Font-Mixing Bug Fix (Runde 12)
- [ ] Diagnose: designTokens aus DB für betroffene Website prüfen
- [ ] AI-Prompt: Strikte Font-Pairing-Regeln pro Archetyp (kein Serif als Body für Handwerk/Bau)
- [ ] Sanitization: bodyFont auf Sans-Serif beschränken für bestimmte Archetypen
- [ ] Sanitization: Serif-Fonts nur als headlineFont erlauben, nie als bodyFont für Handwerk/Bau/Fitness

## Pool-Diversifizierung (Runde 13)
- [x] INDUSTRY_POOLS in WebsiteRenderer: Jeder Pool hat jetzt 1 dunkel + 1 hell + 1 strukturell anders
- [x] Server-seitige POOLS in industryImages.ts: identisch aktualisiert
- [x] Bau-Pool: bold (dunkel) + trust (hell/professionell) + modern (minimal)
- [x] Auto-Pool: luxury (dunkel) + craft (dunkel/roh) + clean (hell)
- [x] Beauty-Pool: luxury (dunkel) + elegant (hell/serif) + fresh (luftig)
- [x] Legal/Finance-Pool: trust (hell) + luxury (dunkel) + modern (minimal)
- [x] Fitness-Pool: vibrant (dunkel) + dynamic (dunkel) + fresh (hell/luftig)
- [x] Debug Website 3: nicht in DB (Sandbox-Reset) – kein Code-Bug, muss neu generiert werden

## Round-Robin Layout-Zuweisung (Runde 14)
- [ ] DB-Schema: layout_counters Tabelle (industryKey, counter) für Round-Robin
- [ ] DB-Migration ausführen
- [ ] Server: getNextLayout(industryKey) Funktion – atomarer Counter-Increment
- [ ] generate + regenerate: Hash durch Round-Robin ersetzen
- [ ] Strukturell radikaler: BoldLayout (dunkel/diagonal), TrustLayout (hell/zentriert), ModernLayout (minimal/asymmetrisch)

## Design-DNA Upgrade aus vite-deploy-studio Analyse (Runde 15)
- [x] DESIGN_ARCHETYPES: Konkrete CSS-Regeln als promptInstruction pro Archetyp (wie in vite-deploy-studio)
- [x] DESIGN_ARCHETYPES: designTwin-Referenz pro Archetyp (z.B. "Aesop meets Acne Studios")
- [x] buildEnhancedPrompt: Design-Twin in Prompt-Header eingebaut
- [x] buildEnhancedPrompt: Separate Animation-Strategy-Section mit konkreten CSS-Werten
- [x] buildEnhancedPrompt: System-Prompt auf Awwwards-Level angehoben ("Site of the Day")
- [x] buildEnhancedPrompt: archetype.promptInstruction direkt in Prompt eingebettet
- [ ] React-Layouts: Mehr visuelle Differenzierung durch konkrete CSS-Klassen statt generischer Patterns
- [ ] Layouts: Jedes Layout bekommt eine einzigartige strukturelle Signatur (z.B. BoldLayout: Sticky-Sidebar-CTA, TrustLayout: Diagonal-Split, ModernLayout: Bento-Grid-Hero)

## Monetarisierung & Onboarding-System (Runde 16)

### Stripe & Pricing
- [x] Stripe-Integration einrichten (webdev_add_feature stripe)
- [x] Pricing-Modell: 79 €/Monat Basis, +9,90 €/Monat pro Unterseite, +4,90 €/Monat Bildergalerie, Kontaktformular als Add-on
- [x] Stripe Checkout Session erstellen (tRPC procedure: createCheckoutSession)
- [x] Stripe Webhook: subscription.created → Onboarding starten, subscription.deleted → Website deaktivieren
- [x] Checkout-Button auf der Website-Detailseite im Admin

### Datenbank
- [x] Tabelle: subscriptions (websiteId, stripeSubscriptionId, status, plan, addOns JSON, currentPeriodEnd)
- [x] Tabelle: onboarding_responses (websiteId, step, data JSON, completedAt)
- [x] Spalte in generated_websites: onboardingStatus (pending | in_progress | completed), hasLegalPages
- [x] DB-Helpers in db.ts: createSubscription, getSubscription, updateSubscription
- [x] DB-Helpers in db.ts: createOnboarding, getOnboarding, updateOnboarding

### Onboarding-Wizard (Frontend)
- [x] Schritt 1: Begrüßung + Erklärung was passiert
- [x] Schritt 2: Unternehmensinfos verfeinern (Name, Slogan, Kurzbeschreibung, Gründungsjahr, Team-Größe)
- [x] Schritt 3: Alleinstellungsmerkmal + Top-3-Leistungen (konkret, nicht generisch)
- [x] Schritt 4: Zielgruppe + häufige Kundenfragen
- [x] Schritt 5: Logo-Upload (PNG/SVG, max 2MB, komprimiert)
- [x] Schritt 6: Fotos hochladen (max 5 Fotos, komprimiert, ersetzen Unsplash-Bilder)
- [x] Schritt 7: Rechtliche Daten (Inhaber, Straße, PLZ, Ort, USt-IdNr., Handelsregister, Verantwortlicher)
- [x] Schritt 8: Add-ons wählen (Unterseiten, Bildergalerie, Kontaktformular)
- [x] Schritt 9: Zusammenfassung + Bestätigung → Website aktualisieren

### Server-Logik
- [x] tRPC procedure: patchWebsiteWithOnboarding – aktualisiert nur Texte/Bilder, kein Re-Design
- [x] Foto-Upload: S3 storagePut, komprimiert via sharp, ersetzt Unsplash-URLs in website_data JSON
- [x] Logo-Upload: S3 storagePut, in Navbar und Footer eingebunden
- [x] Rechtliche Seiten: Impressum + Datenschutz als eigenständige Subpages (kostenlos, Pflicht)
- [ ] Bildergalerie-Section: neue Section-Type "gallery" in Layout-Komponenten (Add-on)

### Legal Pages
- [x] Impressum-Generator: Template mit echten Firmendaten befüllen
- [x] Datenschutz-Generator: DSGVO-konformes Template mit echten Daten
- [x] Cookie-Banner: einfaches Opt-in Banner für alle generierten Websites
- [x] Routing: /site/{slug}/impressum und /site/{slug}/datenschutz

## Funnel-Umbau & Cookie-Banner (Runde 17)

### Funnel-Reihenfolge: Onboarding VOR Checkout
- [x] PreviewPage: "Jetzt aktivieren"-Button → führt zu Onboarding (nicht direkt zu Stripe)
- [x] OnboardingWizard: Letzter Schritt zeigt "Jetzt für 79 €/Monat freischalten" → Stripe Checkout
- [x] OnboardingWizard: Kann auch ohne Login gestartet werden (Token-basiert via previewToken)
- [x] OnboardingWizard: Fortschritt in localStorage speichern (falls Nutzer abbricht und zurückkommt)
- [x] Checkout: Nach Zahlung → Website wird mit Onboarding-Daten gepatcht + aktiviert

### Pricing im Header
- [x] PreviewPage: Preis im Header/CTA auf 79 €/Monat aktualisieren (war 490 € Setup + 99 €/Monat)
- [x] PreviewPage: Pricing-Sektion mit Add-on-Übersicht (Unterseiten +9,90 €, Galerie +4,90 €)
- [ ] WebsitesPage (Admin): Checkout-Dialog Preis auf 79 €/Monat aktualisieren

### Cookie-Banner (DSGVO)
- [x] CookieBanner-Komponente: Opt-in Banner für alle generierten Websites
- [x] Cookie-Kategorien: Notwendig (immer), Statistiken (optional), Marketing (optional)
- [x] Consent in localStorage speichern (cookieConsent: { necessary: true, stats: bool, marketing: bool })
- [x] Banner erscheint beim ersten Besuch, verschwindet nach Bestätigung
- [ ] "Einstellungen" Link im Footer öffnet Banner erneut
- [x] SitePage: CookieBanner einbinden
- [ ] Alle 12 Layouts: "Cookie-Einstellungen" Link im Footer

## Chatbot-Onboarding v2 (Runde 18)

### Chatbot-Interface
- [x] OnboardingChat.tsx: Geführter Chatbot-Stil (eine Frage nach der anderen)
- [x] Bot-Nachrichten: Charmante, persönliche Sprache ("Hey, schön dass du dabei bist! 👋")
- [x] Nutzer-Antworten: Text-Input + Quick-Reply-Buttons für häufige Antworten
- [x] Vorausgefüllte Felder: GMB-Daten (Name, Adresse, Telefon, E-Mail) als Standardwerte
- [x] KI-Hilfe-Button: "Mit KI generieren" (✨) für Tagline, USP, Beschreibung, Zielgruppe
- [x] tRPC procedure: onboarding.generateText (LLM-basiert)
- [ ] Pflichtfelder-Validierung: Name, E-Mail, Leistungen, Rechtliche Daten (noch ausstehend)
- [x] Fortschrittsanzeige: Punkte-Verlauf oben rechts

### Add-on Pricing (korrigiert)
- [x] Kontaktformular: +4,90 €/Monat
- [x] Unterseiten: Repeater mit +/- Buttons (+9,90 €/Monat pro Seite)
- [x] Bildergalerie: +4,90 €/Monat

### Live-Preview vor Checkout
- [x] Vorletzter Schritt: Website mit echten Onboarding-Daten live rendern (kein Re-Design)
- [x] "Das ist deine Website" – Vorschau rechts neben dem Chat
- [x] Erst nach Bestätigung der Preview → Checkout-Schritt

### FOMO-Mechanismus
- [x] Countdown-Timer: "Diese Website ist noch XX:XX:XX für dich reserviert"
- [x] Timer startet beim ersten Aufruf des Onboardings (localStorage)
- [ ] Bei Ablauf: Reminder-E-Mail an die im Onboarding eingegebene E-Mail (noch ausstehend)
- [ ] FOMO-Badge auf der Preview-Seite: "⚡ Nur noch X Stunden reserviert" (noch ausstehend)

## Onboarding UX Verbesserungen (Runde 19)
- [x] MacBook/Browser-Mockup: Website-Preview in einem Laptop-Framing anzeigen (horizontal, Freigestellt)
- [x] Quick-Reply-Buttons: Klickbare Vorschläge für häufige Antworten (z.B. Firmenname bestätigen, Tagline-Vorschläge, USP-Vorschläge, Zielgruppe-Vorschläge)
- [x] Preview-Panel: MacBook-Framing mit Browser-Chrome (Traffic Lights, URL-Bar, Reload-Icon)

## Onboarding UX Fixes (Runde 20)
- [x] Quick-Reply-Buttons: Click-Handler korrekt – Wert direkt an handleSubmit übergeben (Bug: setInputValue allein reicht nicht)
- [x] MacBook-Preview: Volle Breite nutzen, kein blauer Streifen rechts
- [x] MacBook-Preview: Proportionale Skalierung via ResizeObserver (Desktop-Ansicht, kein responsives Umbrechen)
- [x] Chat-Panel: Schmaler (360px statt 480px)
- [x] Chat-Panel: Hide/Show-Toggle-Button (ChevronLeft/Right-Icon)
- [x] Preview: Wenn Chat versteckt, volle Breite für MacBook-Mockup

## MacBook Preview Fixes (Runde 21)
- [x] Blauer Streifen rechts neben MacBook entfernen (max-w-7xl entfernt, volle Breite)
- [x] Chat-Panel: items-center für horizontale Zentrierung
- [x] MacBook-Viewport: Scrollen via onWheel-Handler mit scrollTop-State
- [x] MacBook-Padding: px-8 py-10 (größer als vorher)

## Chat-Stagnation Bug (Runde 22)
- [x] Bug: Nach Auswahl eines Quick-Reply-Chips bei Schritt 2 (tagline) geht der Chat nicht weiter
- [x] Fix: trySaveStep-Helper wraps saveStepMutation in try/catch – Chat läuft immer weiter, auch wenn Server-Save fehlschlägt
- [x] Fix: advanceToStep wird jetzt außerhalb des try/catch aufgerufen (garantiert immer ausgeführt)

## Echtzeit-Preview im Onboarding (Runde 23)
- [x] websiteData an WebsiteRenderer wird live aus dem chat data-State abgeleitet (useMemo: liveWebsiteData)
- [x] Jede Chat-Eingabe (tagline, description) aktualisiert sofort die Vorschau rechts
- [x] Hero-Section: tagline → headline, description → subheadline
- [x] About-Section: description → content, businessName → headline
- [x] Services-Section: topServices → items (wenn ausgefüllt)

## Onboarding Visual Branding (Runde 15)
- [ ] Onboarding-Schritt: Hauptfarbe auswählen (Farbpalette mit 12 Presets + Custom Hex)
- [ ] Onboarding-Schritt: Logo hochladen ODER Font-Logo-Builder (3 Schriftart-Optionen)
- [ ] Font-Logo-Builder: Firmenname in 3 verschiedenen Schriften rendern (z.B. Playfair, Oswald, Montserrat)
- [ ] Logo/Farbe in liveWebsiteData einfließen lassen (Echtzeit-Preview)

## Kontaktformular als Upsell im Preview (Runde 15)
- [ ] Kontaktformular-Section in allen Layouts: ausgegraut/gesperrt anzeigen wenn addOnContactForm=false
- [ ] Upsell-Badge "+4,90 €/Monat" auf gesperrter Kontaktformular-Section
- [ ] Section verschwindet wenn addOnContactForm im Onboarding nicht aktiviert wird

## Rechtliche Einwilligung beim Checkout (Runde 15)
- [ ] Checkbox: "Ich bestätige, dass alle Angaben korrekt sind und übernehme die Verantwortung für Impressum & Datenschutz"
- [ ] Checkout-Button erst aktiv wenn Checkbox angehakt
- [ ] Einwilligungstext mit Link zu AGB/Haftungsausschluss

## Visueller Sektions-Editor (Runde 15)
- [ ] Klickbare Sektionen in der Website-Preview (Hover-Highlight + Edit-Overlay)
- [ ] Klick auf Sektion öffnet Chat-Eingabe mit Kontext ("Was soll in dieser Sektion geändert werden?")
- [ ] X-Button pro Sektion zum Entfernen
- [ ] "+ Sektion hinzufügen" Button zwischen Sektionen
- [ ] Chat-Antwort patcht die entsprechende Sektion in liveWebsiteData

## Branding & Legal Features (Feb 27 2026)
- [x] Branding-Schritt: Hauptfarbe (12 Presets + Hex-Eingabe)
- [x] Branding-Schritt: Logo-Builder (3 Schriftarten als Font-Logo)
- [x] Kontaktformular-Upsell: ausgegraut in Preview mit +4,90 € Badge wenn nicht aktiviert
- [x] Haftungs-Checkbox beim Checkout (Nutzer bestätigt Verantwortung für Impressum-Daten)
- [ ] Visueller Sektions-Editor (post-purchase, im Kunden-Dashboard)

## Onboarding UX-Verbesserungen (Feb 27 2026)
- [x] GMB-Vorausfüllung: Rechtliche Felder (Straße, PLZ/Stadt, Telefon, E-Mail) mit GMB-Daten als Quick-Reply anbieten
- [x] Textarea statt Input für lange Textfelder (Tagline, Beschreibung, USP, Zielgruppe) mit Auto-Resize
- [x] KI-Button hervorheben: Glow-Animation + Tooltip "✨ Automatisch von KI generieren lassen"
- [x] Themen-Gruppen-Ankündigungen: Bot kündigt Abschnitte an (Grunddaten / Rechtliches / Visuelles)

## Services-Schritt Verbesserungen (Feb 27 2026)
- [x] KI-Vorschlag-Button für Leistungen (Branchenbasiert, füllt 2-4 Felder vor)
- [x] "Keine Leistungen anzeigen"-Option mit Warn-Dialog

## Branding-First Onboarding (Feb 27 2026)
- [x] Branding-Schritte (Farbe + Logo) an den Anfang des Onboardings verschieben (nach Welcome)
- [x] Live-Vorschau: Farbauswahl ändert Preview sofort in Echtzeit (kein Weiter-Klick nötig)
- [x] Live-Vorschau: Font-Logo-Auswahl ändert Navbar/Hero-Logo sofort in Echtzeit

## Chat & Onboarding Verbesserungen (Feb 27 2026 – Runde 2)
- [x] Wort-für-Wort-Tipp-Animation für Bot-Nachrichten (menschlicherer Effekt)
- [x] Sektionen-Ausblenden-Schritt vor Checkout (Kunde klickt Bereiche an zum Deaktivieren)
- [x] Echte Google-Rezensionen aus GMB API statt Fake-Testimonials
- [x] MacBook-Mockup Scroll-Clipping fix (Footer/Impressum vollständig sichtbar)

## Bugfixes (Feb 27 2026 – Runde 3)
- [x] Kontaktformular-Upsell-Overlay: korrekte Position direkt über der Kontakt-Sektion
- [x] Testimonials-Sektion: komplett entfernen wenn keine echten Google-Rezensionen vorhanden

## Bugfixes & Features (Feb 27 2026 – Runde 4)
- [x] Fix: Google-Bewertungen erscheinen nicht in der Preview (isRealReviews-Flag prüfen)
- [x] Fix: Kontaktformular-Overlay erscheint immer noch nicht (contactFormLocked-Pfad prüfen)
- [x] Feature: Fortschrittsbalken im Onboarding-Chat (Schritt X von Y)
- [x] Feature: Telefonnummer-Schritt mit GMB-Vorausfüllung
- [x] Feature: „Alles aus GMB übernehmen“-Button bei rechtlichen Angaben

## UI-Fixes (Feb 27 2026 – Runde 5)
- [x] Fortschrittsbalken über Preview-Panel verschieben (mehr Platz)
- [x] Chat-Toggle-Button außerhalb der Seitenleiste platzieren
- [x] GMB-Bulk-Prefill: nach Übernahme Chat-Schritte mit vorausgefüllten Daten durchlaufen

## UX & Email-Enrichment (Feb 27 2026 – Runde 6)
- [x] Chat-Panel: Smooth Slide-Animation beim Ein-/Ausblenden
- [x] GMB-Prefill: Stift-Icon zum nachträglichen Bearbeiten einzelner Felder
- [ ] E-Mail-Enrichment: Automatische E-Mail-Suche für Unternehmen ohne GMB-E-Mail

## OnboardingChat Fixes (Feb 27 2026 – Runde 5)
- [x] Chat-Seitenleiste sticky: Eingabefeld bleibt unten fixiert, kein Hochscrollen
- [x] Farbe + Logo Echtzeit-Preview: Auswahl ändert Preview sofort
- [x] Farbe + Logo als allererster Schritt (vor Welcome)
- [x] Kein Chat-Neustart nach Farbe/Logo-Bestätigung
- [x] Flackern bei Themenüberschriften beheben
- [x] KI-Intent-Erkennung: "mach mir einen Vorschlag" → KI generiert automatisch
- [x] Kontaktformular-Overlay: nur wenn wirklich Formularfelder vorhanden

## Fixes (Feb 27 2026 – Runde 7)
- [ ] Branding (Farbe + Logo) wirklich als allererster Schritt im STEP_ORDER
- [ ] Chat-Input sticky: Eingabefeld unten fixiert, Nachrichten-Bereich scrollbar
- [ ] Branchenspezifische Bilder: fein-granulares Kategorie-Mapping (Restaurant, Bar, Bau, etc.)

## Bugfixes & UX-Verbesserungen (Runde N)
- [x] Branding-First Flow: businessCategory → brandColor → brandLogo VOR businessName im OnboardingChat
- [x] businessCategory Feld in DB-Schema (onboarding_responses) und Migration ausgeführt
- [x] Sticky Chat-Input: h-screen + overflow-hidden auf äußerem Container, Input-Bereich bleibt am unteren Rand
- [x] Branchenspezifische Bilder: Bar/Tapas, Café/Bistro, Hotel, Bauunternehmen als eigene Kategorien in industryImages.ts
- [x] buildIndustryContext: Bar/Tapas und Bauunternehmen als eigene Layout-Pools mit spezifischen Schreibstil-Anweisungen
- [x] mapCategoryToIndustryKey: Bar, Café, Bauunternehmen korrekt zugeordnet

## Qualitätsverbesserungen (Runde N+1)
- [x] Testimonials immer auf Deutsch generieren (KI-Prompt anpassen)
- [x] GMB-Fotos aus Google My Business als Hero/Gallery-Bilder nutzen
- [x] Branchentypische initiale Farbpaletten (Bar → dunkel/warm, Gastronomie → erdige Töne, Bauunternehmen → anthrazit/orange)
- [x] Inhaltliche Konsistenz: branchenspezifische Stats/Metriken (keine "abgeschlossene Projekte" bei Gastronomie)

## OnboardingChat Fixes (Feb 27 2026 – Runde 8)
- [ ] Logo/Schriftart Live-Preview: Auswahl ändert Preview sofort (kein Neustart)
- [ ] Chat-Neustart-Bug: Nach Farb/Logo-Bestätigung kein Neustart des Chats
- [ ] businessCategory vorausgefüllt: GMB-Kategorie automatisch erkennen und vorauswählen
- [ ] Sektionen-Ausblenden-Schritt: Vor Checkout klickbare Sektionen zum Deaktivieren

## Bugfixes Runde (aktuell)
- [ ] Fix opening hours: convert AM/PM to German 24h format (e.g. "9:00 AM" → "09:00 Uhr")
- [ ] Fix logo not displaying correctly in onboarding preview
- [ ] Add logo upload functionality in onboarding brandLogo step
- [ ] Improve hideSections prompt text ("Wir sind fast fertig...")
- [ ] Fix DB error in checkout step: websiteId type mismatch (string vs number)

## share.google Kurzlink-Unterstützung
- [x] Server: resolveShareGoogleLink() Funktion – löst share.google/... Links auf, extrahiert Firmennamen
- [x] Server: selfService.start Mutation – wenn gmbUrl ein share.google Link ist, Firmennamen extrahieren und als Suchbegriff verwenden
- [x] Frontend: StartPage – Placeholder-Text und Hinweis auf share.google Links aktualisieren
- [x] Frontend: StartPage – Validierung akzeptiert share.google Links als gültige Eingabe

## Chat UX-Verbesserungen (Runde N+2)
- [x] Fix Edit-Modus: Bearbeitete Nachricht erscheint nicht nochmal unten; Quick-Replies und andere Logik bleiben erhalten
- [x] Schriftart Echtzeit-Vorschau: headlineFont-Änderung sofort in der Preview sichtbar; aktuell gewählte Schrift vorausgewählt
- [x] Quick-Replies prägnanter: Größere, auffälligere Buttons mit mehr Kontrast
- [x] Abschnitts-Trenner: Neue Abschnitte (Abschnitt 2, 3) als visueller Divider zwischen Chat-Bubbles, nicht als Chat-Nachricht
- [x] USt-ID leeres Feld: Leeres Absenden = "Nein" (Kleinunternehmer) – Weiter-Button funktioniert auch ohne Eingabe
- [x] Unterseiten-Button: Sichtbarer "Unterseite hinzufügen"-Button im subpages-Schritt
- [x] Preis-Badge: Persistentes "Ab 39 €/Monat"-Badge im Chat sichtbar (z.B. oben rechts oder im Footer)

## Bugfix: selfService.start Error (Feb 28 2026)
- [x] Fix: selfService.start wirft 500er – onboarding_responses Spaltennamen waren snake_case statt camelCase (DB-Migration fehlte); Migration ausgeführt, alle 17 Tests bestanden

## Kleinfix (Feb 28 2026)
- [x] Doppelten Pfeil-Button (Chat ausblenden) im Chat-Header neben Preis-Badge entfernen

## Fixes (Feb 28 2026 – Runde N+3)
- [x] Preview-Seite: "Jetzt aktivieren ab 79 €" → auf 39 €/Monat korrigieren
- [x] Chat: Quick-Reply-Buttons über das Eingabefeld verschieben (immer ganz unten)

## Chat-Verbesserungen (Feb 28 2026 – Runde N+4)
- [x] Bug: Leistungen überspringen → Services-Section aus liveWebsiteData entfernen (nicht mehr in Preview anzeigen)
- [x] Quick-Replies nach Auswahl ausblenden (selectedQuickReply State)
- [x] Dynamische Placeholders je nach Schritt (Tagline, Beschreibung, USP, Zielgruppe etc.)
- [x] Preiszusammenfassung im Checkout-Schritt (Basis + Add-ons übersichtlich)

## Chat-Verbesserungen (Feb 28 2026 – Runde N+4)
- [x] Bug: Leistungen überspringen → Services-Section aus liveWebsiteData entfernen (nicht mehr in Preview anzeigen)
- [x] Quick-Replies nach Auswahl ausblenden (selectedQuickReply State)
- [x] Dynamische Placeholders je nach Schritt (Tagline, Beschreibung, USP, Zielgruppe etc.)
- [x] Preiszusammenfassung im Checkout-Schritt (Basis + Add-ons übersichtlich)

## Bug: Preview-Ladezustand (Feb 28 2026)
- [x] Bug: Preview im OnboardingChat zeigt dauerhaft "Vorschau wird erstellt" – Fix: selfService.generateWebsite wird beim Laden automatisch aufgerufen wenn websiteData fehlt, mit Fortschrittsanzeige (Phasen + Balken)

## In-Place-Edit für Chat-Bubbles (Feb 28 2026)
- [x] Stift-Klick macht die Nutzer-Sprechblase direkt editierbar (Textarea in-place)
- [x] Speichern-Button aktualisiert nur das betroffene Feld in data-State und liveWebsiteData
- [x] Abbrechen-Button verwirft Änderungen
- [x] Kein Einfügen ins Chat-Eingabefeld mehr, kein Durcheinander mit aktuellem Schritt

## Website löschen im Dashboard (Feb 28 2026)
- [x] Backend: adminProcedure website.delete – löscht Website + onboarding_responses aus DB
- [x] Frontend: Löschen-Button (Trash-Icon) in der Websites-Liste mit Bestätigungsdialog
- [x] Optimistic Update: Website verschwindet sofort aus der Liste nach Bestätigung

## Bugfix: deleteWebsite subscriptions-Fehler (Feb 28 2026)
- [x] Fix: deleteWebsite schlägt fehl – subscriptions hatte snake_case Spalten (website_id); Migration auf camelCase ausgeführt; generated_websites hatte Duplikat-Spalten – bereinigt

## Unternehmen löschen im Dashboard (Feb 28 2026)
- [x] Backend: deleteBusiness in db.ts (löscht auch zugehörige Websites + Onboarding-Daten)
- [x] Backend: adminProcedure business.delete im Router
- [x] Frontend: Löschen-Button in der Unternehmensliste (WebsitesPage) mit Bestätigungsdialog

## Lead-Einstufung sichtbar machen (Feb 28 2026)
- [x] SearchPage: leadType-Badge in der Suchergebnistabelle anzeigen (keine Website / alte Website / schlechte Website / unbekannt)
- [x] WebsitesPage: leadType-Badge in der Unternehmensliste anzeigen

## Automatische Website-Analyse beim Speichern (Feb 28 2026)
- [x] saveResults: Für jedes Unternehmen mit Website wird analyzeWebsite() im Hintergrund aufgerufen und leadType/websiteScore automatisch gesetzt

## Website-Link in Tabellen (Feb 28 2026)
- [x] SearchPage: Website-URL als klickbarer Link neben dem Lead-Typ-Badge anzeigen
- [x] WebsitesPage: Website-URL als klickbarer Link in der Unternehmensliste anzeigen

## Bugfix: Ladeanimation Website-Generieren (Feb 28 2026)
- [x] WebsitesPage: Ladeanimation nur beim geklickten Button anzeigen (generatingId State statt globalem isPending)

## Sekundärfarbe im Onboarding (Feb 28 2026)
- [x] colorScheme-Struktur prüfen: wo wird Sekundärfarbe gespeichert und wie wird sie im WebsiteRenderer verwendet
- [x] Neuer Chat-Schritt "brandSecondaryColor" nach brandColor hinzufügen
- [x] Echtzeit-Vorschau: Sekundärfarbe wird sofort in liveWebsiteData übernommen
- [x] Speicherung: Sekundärfarbe wird in colorScheme.secondary gespeichert

## 4 neue Features (Feb 28 2026 – Runde N+6)
- [x] Sekundärfarbe persistieren: beim Abschluss in colorScheme.secondary in DB speichern (trySaveStep)
- [x] Farbharmonie-Vorschläge: nach Hauptfarb-Auswahl automatisch 3 harmonische Sekundärfarben vorschlagen
- [x] Foto-Austausch im Onboarding: neuer Schritt heroImage (Upload eigener Fotos oder Unsplash-Auswahl)
- [x] Kunden-Dashboard: Admin kann eine Website auf "aktiv" setzen + Link zur Kunden-Edit-Ansicht generieren
- [x] Kunden-Edit-Ansicht: Kunde kann Texte, Farben, Fotos bearbeiten (ähnlich Onboarding-Chat aber vereinfacht)

## Foto & Farb-Fixes im Onboarding (Feb 28 2026)
- [x] Sekundärfarbe: Echtzeit-Vorschau in liveWebsiteData (colorScheme.secondary patchen)
- [x] heroPhoto: Label "Bestehendes behalten" statt "Kein Foto"
- [x] heroPhoto: Echtzeit-Vorschau wenn neues Foto gewählt wird
- [x] aboutPhoto: Neuer Onboarding-Schritt nach heroPhoto für das zweite Bild
- [x] aboutImageUrl: DB-Spalte, Migration, WebsiteRenderer und alle Layouts
- [x] aboutImageUrl: Echtzeit-Vorschau im Onboarding und im Kunden-Dashboard bearbeitbar

## Kategorie-Mapping Fix (Feb 28 2026)
- [x] onboarding.businessCategory in complete-Prozedur nutzen (überschreibt business.category)
- [x] Branchenspezifische Service-Vorlagen für alle 16 Kategorien (shared/industryServices.ts)
- [x] buildIndustryContext: konkrete Leistungsbeispiele als Seed im Prompt
- [x] patchWebsiteData: Services mit Branchen-Defaults befüllen wenn keine eigenen angegeben
- [x] Onboarding complete: Kategorie-Update auch in business-Tabelle schreiben

## Sekundärfarbe Fix (Feb 28 2026)
- [x] Analyse: Wie wird cs.secondary in Layouts aktuell verwendet?
- [x] Secondary color als Section-Hintergrund in allen Layouts einbauen (about, features, cta sections)
- [x] WebsiteRenderer: secondary color korrekt in CSS-Variable --color-secondary mappen
- [x] Echtzeit-Vorschau: secondary color live patchen wenn Nutzer sie im Onboarding wählt

## Foto & Farb-Chat-Fixes (Feb 28 2026)
- [x] Unsplash-Foto-Vorschläge nach Branche filtern (businessCategory → passende Suchbegriffe)
- [x] Farb-Bearbeitung via Stift-Icon: Color Picker öffnen statt Hex-Input

## Kontrast-Fix (Feb 28 2026)
- [x] Utility: getContrastColor(bg) → "#fff" oder "#000" (WCAG-Luminanz-Formel)
- [x] Utility: isLightColor(hex) → boolean
- [x] Alle Layouts: Headline-Farbe dynamisch (primary auf hellem Hintergrund → dunkel)
- [x] Alle Layouts: Logo/Navbar-Textfarbe dynamisch je nach Hintergrundfarbe
- [x] WebsiteRenderer: --site-heading-color und --site-nav-text als CSS-Variablen injizieren

## Farb-Quellen-Fix (Feb 28 2026)
- [x] Diagnose: Preview-Route vs. Onboarding-Chat laden colorScheme aus unterschiedlichen Quellen
- [x] Fix: saveStep aktualisiert colorScheme in generated_websites sofort wenn brandColor/brandSecondaryColor gespeichert wird

## Onboarding-Chat Farb-Init-Fix (Mar 01 2026)
- [ ] liveWebsiteData: colorScheme aus DB als Initialwert statt blauem Default
- [ ] Sekundärfarben-Schritt: nur 3 Harmonievorschläge + Color Picker, keine Extra-Farbpaletten-Leiste

## Bulk-Delete für generierte Websites (Runde 19)
- [x] Backend: bulkDeleteWebsites tRPC-Prozedur (Array von IDs, Admin-only)
- [x] Frontend: Checkboxen in der Websites-Tabelle im Admin-Dashboard
- [x] Frontend: "Alle auswählen"-Checkbox im Tabellenkopf
- [x] Frontend: Floating Toolbar mit Anzahl ausgewählter Einträge + Löschen-Button
- [x] Frontend: Bestätigungs-Dialog vor dem Bulk-Delete

## Lead-Funnel im Admin-Dashboard (Runde 20)
- [x] Backend: getLeadFunnel tRPC-Prozedur (Counts pro captureStatus + Conversion-Rate)
- [x] Backend: listLeads tRPC-Prozedur (externe Leads mit Filter nach Status)
- [x] Backend: updateLeadStatus tRPC-Prozedur (manuell Status ändern)
- [x] Frontend: LeadsPage mit Funnel-Metriken (Kanban-Karten: email_captured → onboarding_started → completed → converted)
- [x] Frontend: Leads-Tabelle mit E-Mail, Unternehmensname, Status, Datum, Aktionen
- [x] Frontend: Status-Filter und Suche über der Tabelle
- [x] Navigation: "Leads" im Admin-Sidebar ergänzen

## Websites-Tab Umstrukturierung in 3 Tabs (Runde 21)
- [x] Tab 1 "GMB-Backlog": Unternehmen ohne generierte Website (gescrapt, nicht generiert) – mit Badge "Kein Lead-Typ" / Lead-Typ-Anzeige und "Website generieren"-Button
- [x] Tab 2 "Admin-generiert": Websites mit source=admin – Tabelle mit Status-Badge, Aktionen (Preview, Live, Kaufen, Aktivieren, Regenerieren, E-Mail, Löschen)
- [x] Tab 3 "Extern-generiert": Websites mit source=external – Tabelle mit captureStatus-Badge, E-Mail des Leads, Aktionen (Preview, Status ändern, Löschen)
- [x] Zähler-Badges auf jedem Tab-Header (Anzahl Einträge)
- [x] Bulk-Delete bleibt in Tab 2 und Tab 3 erhalten

## Bulk-Delete in allen Website-Ansichten (Runde 22)
- [x] GMB-Backlog-Tab: Checkboxen, "Alle auswählen" und Bulk-Delete für Unternehmen

## E-Mail-Abfrage vor Onboarding-Start (Runde 23)
- [ ] E-Mail-Eingabe-Modal als erster Schritt im externen Onboarding-Flow (vor GMB-URL-Eingabe)
- [ ] E-Mail im Backend beim Website-Erstellen als customerEmail speichern (captureStatus = email_captured)
- [ ] Validierung: gültige E-Mail-Adresse erforderlich, Weiter-Button erst aktiv wenn valide

## E-Mail sofort beim Weiter-Klick im Funnel speichern (Runde 24)
- [x] Backend: selfService.captureEmail Prozedur (erstellt Lead-Eintrag mit captureStatus=email_captured)
- [x] Frontend: captureEmail beim Weiter-Klick aufrufen, leadId für spätere Verknüpfung merken
- [x] Beim späteren start() die leadId übergeben, damit der Eintrag aktualisiert statt neu erstellt wird

## E-Mail-Abfrage als erster Schritt im Onboarding-Chat (nur bei Admin-generierten Websites)
- [x] Onboarding-Chat: E-Mail-Frage als allererste Frage wenn source=admin und customerEmail leer
- [x] E-Mail im Backend speichern (updateWebsite + captureStatus=email_captured) nach Eingabe
- [x] Wenn source=external und customerEmail bereits vorhanden: E-Mail-Frage überspringen
