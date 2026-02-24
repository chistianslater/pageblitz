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
