# Packs entfernen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Das alte Style-Pack-System (20 Pack-Renderer, Bühne/Farbfläche, Fassungen a/b/c, `alternativeLooks`, `PACK_FONT_PAIRS`, Schriftpaare, Farbwelten, Pack-Wahl im Studio, Pack-Demos) restlos entfernen. Danach rendert jede Kundenseite ausschließlich über eines der sechs Designsysteme (rev 3). Gemeinsame Infrastruktur, die die Systeme nutzen, bleibt — verschoben an einen Ort, dessen Name stimmt. Die sechs Systeme bleiben **byte-gleich**.

**Architecture:** Fünf Code-Schritte auf `chore/packs-entfernen` (ab `f65d848d` = Prod), jeweils einzeln grün: (1) Messbasis + gemeinsame Bausteine aus den Pack-Ordnern lösen (reine Verschiebung), (2) rev-3-Invariante (jeder gelesene Stand wird System-Dokument, jeder Schreibvorgang ist rev 3), (3) Studio/KI ohne Packs, (4) Renderer/SSR/Routen/Demos/Landing ohne Packs, (5) Generierung mit „Textstimmen“ statt Pack-Verfassungen, `shared/stylePacks/` gelöscht. Dann Doku/Abschluss (6) und der Produktionsschritt (7, Controller).

**Spec:** `docs/superpowers/specs/2026-10-10-designsysteme-design.md` §3 („Fällt weg“), §8 Schritte 3–4 · Betrieb: `docs/BETRIEB-V2.md` · Muster für Format/Regeln: `docs/superpowers/plans/2026-10-12-designsystem-nacht.md`

## Global Constraints

- **Byte-Gleichheit:** Das SSR-HTML aller sechs Systeme ist vor/nach jedem Task identisch (Fingerabdruck-Werkzeug aus Task 1, Vergleich nach jedem Task). Einzige erlaubte Abweichung: die **Standard-Palette** von Beispiel- und Neu-Seiten ohne `?palette` in Task 5, falls der Betreiber die Palettenregel ändert (Entscheidung E3) — dann je Abweichung gelistet. Alles, was als String ins rev-3-HTML inlined wird, ist eingefroren: `SITE_ENHANCER_JS`, `RICH_TEXT_CSS`, `NOTICE_CSS`, `BRANDING_CSS`, `ALBUM_CSS`, `AGE_GATE_CSS`, `PHOTO_CREDITS_CSS`, `SECTION_REVEAL_STYLE`, `legacyPackVars`-Reihenfolge, Kopfzeilen (`systemFontHead`, `systemSchemeHead`, JSON-LD). Verschieben ja, Inhalt/Reihenfolge nein.
- **Rollback-sicher:** Prod-Code `f65d848d` muss jedes Dokument lesen können, das der neue Code schreibt. Deshalb: Schema **nicht erweitern**, keine neuen Felder, keine Feld-Umbenennung (`stylePackId` bleibt). Rückweg = alter Commit deployen, ohne Datenänderung.
- **Schema liest tolerant, schreibt streng:** `WebsiteDataV2Schema` akzeptiert weiter `designRevision` 1|2|3 (alte Verlaufsstände bleiben parsebar), aber jeder v2-Schreibvorgang muss rev 3 + `system` sein (`assertV2SafeWrite`), und jede Lesegrenze (Render, Wiederherstellen, Stand-Vorschau, Studio-Laden) wandelt rev 1/2 per `asSystemDoc` in rev 3.
- **Gemeinsames bleibt:** `SiteRenderer` (nur rev-3-Zweig), `engine.ts`, `richText.tsx`, `PhotoCredits.tsx`, `noticeBanner.tsx`, `ageGateSsr.tsx`, `galleryAlbums.ts`, `galleryInteractions.ts`, `siteEnhancer.ts`, `islands/**`, `LegacySitePlaceholder.tsx` (v1), `systems/legacyVars.ts` (`--pb-*` für Inseln), `shared/siteContract/fixtures.ts` (Beispielbetriebe der Systeme), `client/public/demo/*.webp` (Fixture-/Landing-Fotos), Baupläne, `colorMath`, `heroFacts`.
- **Texterzeugung unverändert** (Spec §3): Die 20 Verfassungen leben als **Textstimmen** weiter (`id`, `name`, `essence`, `industries`, `prefersMenu`, `llmHints`) — ohne Farben, Schriften, Formen, Signatur. Stimmen-Wahl (`getPackPool`, `rankArtDirections`-Signale, Rotation über `layout_counters`) bleibt gleich.
- Keine Produktänderung ohne Entscheidung: Punkte mit **[E…]** sind Betreiber-Entscheidungen (Abschnitt „Entscheidungen“); bis zur Antwort gilt der dort genannte Vorschlag.
- `npm run check`, `npm run test`, `npm run build` nach jedem Task grün. Commits deutsch, Conventional, Abschluss `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Branch `chore/packs-entfernen`.

## Review Focus

1. **Verlauf:** „Rückgängig“/„Stand wiederherstellen“ auf einen rev-2-Stand (u. a. „Stand vor Designsystem“ aller 35 umgestellten Seiten) stürzt nicht ab, sondern bringt Inhalte zurück und behält das aktuelle System + Palette. `?version=`-Vorschau zeigt genau das.
2. **Nirgends rendert rev 1/2** — weder SSR (`renderSiteHtml`, Kopf + Körper), noch CSR (`SiteRenderer`/`WebsiteRenderer`/`parseV2`), noch Studio-iframe, noch Generierungs-Zwischenstand, Dev-Seeds, Admin-Demo.
3. **`parseV2` prüft System-Module statt `PACK_MODULES`** — sonst landet jede Seite im SPA-Pfad auf dem Legacy-Platzhalter.
4. **`withPrimarySystem` ist total:** jede Familie/Unterart (inkl. `standard`, Gastro ohne Art, Barbier) ergibt rev 3.
5. Byte-Gleichheit (alle Beispielbetriebe × 6 Systeme × Paletten, Fixtures inkl. Unter-/Rechtsseiten, exportierte Live-Dokumente).
6. Keine toten Studio-Schalter mehr (Layout-Wähler, Collage, Schriftpaar, Farbwelt), aber „Bild ausblenden“ und Abschnitt-Einfügen funktionieren weiter.

---

## Abhängigkeitskarte (Stand `f65d848d`)

**Löschen (nur Packs nutzen es):**

| Bereich | Dateien |
|---|---|
| Pack-Renderer | `client/src/components/site/packs/**` (62 Dateien, ~13 800 Zeilen), `packRegistry.ts` (`PACK_MODULES`; Typ wandert, s. u.) |
| Einstiege/Fassungen | `client/src/components/site/artDirection/{ArtDirectedHero,artDirectionCss,entryGastro,entryLayouts,entrySections,siteEntrance}.ts(x)` + `artDirection.test.tsx` (`heroFacts.ts` wandert) |
| Pack-Bausteine | `designProfileCss.ts`, `designProfileLayout.test.tsx`, `packLayoutCss.ts`, `layoutPolishCss.ts`, `layoutSlots.ts`, `mobileNavCss.ts`(+test), `MobileNav.tsx`, `motionCss.ts`(+test), `reviewChromeCss.ts`, `storySection.tsx`, `sectionLink.tsx`(+test), `uspSection.tsx`, `extraSections.tsx`, `partnersSection.tsx`, `heroCollage.tsx`(+test), `googleReview.tsx`(+test), `MapsAdresse.tsx`, `mapsLink.ts`(+test), `packCopy.ts`(+test) — alle unter `client/src/components/site/` |
| Pack-Daten | `shared/stylePacks/{artDirection,artThemes,colorWorlds,packVariants,variantCandidates,summary,toCssVars,fontPairs,imbiss}.ts` + Tests (`artDirection,artThemes,colorWorlds,packVariants,variantCandidates,summary,toCssVars,imbiss,moduleParity,registry`.test) ; Palette/Typo/Form/Signatur aus den 20 Verfassungen |
| Studio | `DesignQuickControls.tsx`(+2 Tests), `panels/ThemeEditor.tsx`, `panels/BrandImportCard.tsx`(+test), `panels/CollagePicker.tsx`(+test), `themeChoices.ts`; Server `routerBrand.ts`(+test), `shared/onboardingV2/brandImport.ts`(+test) **[E6]** |
| Client-Libs | `client/src/lib/packAccent.ts`, `packFonts.ts` (+Tests) |
| Seiten/Demos | `client/src/pages/design-lab/**` (DesignLab, SystemDesignReview, ReferenceSite, references, 3 CSS), `client/src/components/landing/PackShowcase.tsx`(+test, schon tot), `client/public/pack-previews/` (516 KB), `client/public/landing/forwhom-*.webp` (unbenutzt) |
| Skripte | `scripts/build-pack-previews.mjs` (+ `build:previews` in `package.json`), `scripts/design-neu-ableiten.ts`, `scripts/systeme-zuruecksetzen.ts`, `scripts/systeme-umstellen.ts` + `server/systemeUmstellen.ts`(+test) **[E7]** |
| Playwright | `tests/visual/packs.spec.ts` + `packs.spec.ts-snapshots/` (98 Bilder, 61 MB), `tests/visual/site-entrance.spec.ts` |

**Bleibt, wird verschoben/umbenannt (Systeme hängen daran):**

| Heute | Neu | Nutzer |
|---|---|---|
| `shared/stylePacks/blueprints.ts`, `blueprintFamilies.ts`, `categoryAliases.ts` (+`blueprints`, `branchenerkennung`, `industryCoverage`.test) | `shared/blueprints/` | ~40 Importe: alle Systeme, `assignment.ts`, Generierung, `SystemContext`, Skripte |
| `shared/stylePacks/blueprintShowcase.ts`, `blueprintShowcaseList.ts` (+test) | `shared/showcases/` | 6 System-`testkit.tsx`, `routes.ts`, `DesignReviewPage`, Tests |
| `shared/stylePacks/colorMath.ts` | `shared/designSystems/colorMath.ts` | `palette.ts`, `legacyVars.ts`, Kontrast-Tests |
| `client/src/components/site/artDirection/heroFacts.ts` (+test) + `formatHeroRating` (aus `ArtDirectedHero.tsx`) + `menuVisible` (aus `entryGastro.tsx`) | `client/src/components/site/systems/shared/heroFacts.ts` | ~35 System-Dateien, `generateSiteContent.ts` (`streetLine`) |
| `packRegistry.ts` → Typ `PackModule` | `client/src/components/site/siteModule.ts` → `SiteModule` | 6 System-`index.tsx`, `systems/registry.ts`, `SiteRenderer` |
| `shared/stylePacks/index.ts` (Verfassungen, Pool/Matching), 20 Verfassungsdateien, `types.ts` | `shared/textVoices/` (`getVoice`, `getVoicePool`, `hasDirectVoiceMatch`, `normalizeCategoryKey`, `rankVoices`) | `contentPrompt`, `generateSiteContent`, `selectPack`→`selectVoice`, `aiEditPrompt`, `insertSectionAi`, `suggest`, `OfferPanel` (`prefersMenu`), `db.ts` |
| `STAGE_MIN_WIDTH/RATIO`, `EntryPhotos`, `withEntryComposition` (nur `composition`) | `shared/designSystems/entry.ts` | `heroPhoto.ts`, `runJob.ts`, Showcases; Systeme lesen nur `designProfile.composition === "stage"` und `hiddenElements` |

**Bleibt unverändert in Name und Ort:** siehe Global Constraints „Gemeinsames bleibt“; außerdem `shared/siteContract/designProfile.ts` (Schema-Enums; tote Ableitungen `deriveDesignProfile`, `designFingerprint`, `deriveDistinctDesignProfile` fallen in Task 5, `DEFAULT_DESIGN_PROFILE`/`designSeed` bleiben), `fixtures.ts` (Schlüssel bleiben Stimmen-IDs).

## Entscheidungen

| # | Frage | Vorschlag (gilt bis zur Antwort) |
|---|---|---|
| E1 | Verlauf: rev-2-Stand wiederherstellen | Inhalte des alten Stands + **aktuelles** System/Palette (`asSystemDoc(old, current)`); kein Sperren. |
| E2 | „Andere Richtungen“ im Studio (Runde ≥ 1) zeigte bisher nur Packs | Runde 0 = Tripel ohne aktuelles; Runde 1 = übrige freigeschaltete Systeme; danach wieder von vorn. |
| E3 | Palette neuer Seiten (bisher indirekt über Pack-Akzent `pickArtTheme`) | Deterministisch je Betrieb: `palettes[designSeed(name\|kategorie) % 3]`, Beispielbetriebe behalten ihre heutige Palette über eine feste Tabelle in `SHOWCASES` (dann byte-gleich). Alternative: immer Palette 1. |
| E4 | Landing (`Klarstart`): Showroom zeigt Pack-Bilder `/landing/{salon-noir,gusto,raster}.webp`, Links `/demo/<pack>`, Copy „Farben und Schriften selbst wählen“ / „Deine Farben, deine Schriften“ | Bilder aus den System-Beispielen neu (Journal-Friseur, Nacht-Restaurant, Raster-Steuerberater), Links auf `/demo/system/…`, Copy → „Drei Farbstimmungen je Design, deine Inhalte“. **Bilder und Copy erst nach Freigabe.** Bis dahin nur die Links (301 greift ohnehin). |
| E5 | KI-Chat „Designrichtung“-Vorschlag (`kind: "style"` mit Pack) | Wird Vorschlag eines Systems aus dem Tripel; Karte öffnet Design-Panel mit Vorauswahl. |
| E6 | Marken-Übernahme (Logo/Farbe/Schrift von alter Website) — heute für rev 3 ausgeblendet, also für alle Seiten unsichtbar | Komplett entfernen; „Logo übernehmen + Palette nach Logofarbe“ als Backlog-Punkt. |
| E7 | `systeme-umstellen.ts` nach der 593-Umstellung | Mit entfernen (kein rev 2 mehr; Lesegrenzen wandeln ohnehin). |
| E8 | Feld `stylePackId` / Typ `PackId` | Bleiben (Rollback-Sicherheit, Verlauf); Bedeutung „Textstimme“, dokumentiert. Umbenennung samt Migration = eigener späterer Schritt. |
| E9 | `/demo/<pack>` (Landing, SEO-Startseite, alte Links) | 301 auf `/demo/system/<Hauptsystem>/<Beispiel>` nach Tabelle (erstes `SHOWCASES`-Beispiel mit dieser Fixture; `raster` → `raster/steuerberater`); Unter-/Rechtsseiten → dieselbe Adresse. |

---

### Task 1: Messbasis, Fingerabdruck, gemeinsame Bausteine verschieben (kein Verhalten)

**Dateien:** neu `scripts/seiten-fingerabdruck.ts`; verschieben laut Abhängigkeitskarte (Baupläne, Showcases, `colorMath`, `heroFacts` + `formatHeroRating` + `menuVisible`, `SiteModule`); Importe in allen Nutzern (inkl. Packs, die in Task 4 fallen).

- [ ] **Basis messen** (vor jeder Änderung, Ergebnisse nach `.superpowers/sdd/packs-entfernen/`, gitignored): `npm run build` → `basis-build.txt` mit Rohgröße und gzip je `dist/public/assets/*.js` (Summe + 10 größte), `dist/index.js`, `dist/public/islands/*.js`; `git ls-files | wc -l`, `git ls-files -z | xargs -0 cat | wc -l`, `du -sh tests/visual/*-snapshots client/public`.
- [ ] **Fingerabdruck-Werkzeug** `scripts/seiten-fingerabdruck.ts` (nur lesen, deterministisch, `now = 2026-08-19T10:00:00`, `origin = https://pageblitz.de`): rendert per `renderSiteHtml` und schreibt `{schlüssel: sha256}` als JSON.
  - `--beispiele`: jedes `SHOWCASES`-Beispiel × 6 Systeme × (3 Paletten + ohne Palette) über `systemShowcaseDoc` (~744 Seiten).
  - `--fixtures`: `getFixture(key, full|minimal|features)` für die 6 Testkit-Schlüssel × 6 Systeme × 3 Paletten × (`/`, `/impressum`, `/datenschutz`, jede `pages[].slug`) mit `slug: "demo"`, `site.chatWelcomeMessage`, einmal `islandsMode: "preview"`.
  - `--datei <export.json>`: Live-Dokumente aus einem Export (Task 7 Schritt 1), je `id` Start-, Rechts- und Unterseiten.
  - Bundle-Pfade normalisieren (`/islands/site-(islands|motion)\.[^"]*\.js` → Platzhalter), sonst identische Bytes.
  - `--vergleich a.json b.json`: listet abweichende/fehlende Schlüssel, Exit 1 bei Abweichung.
- [ ] Basis-Fingerabdrücke `basis-beispiele.json`, `basis-fixtures.json` (und `basis-live.json`, sobald der Export aus Task 7/1 vorliegt) erzeugen.
- [ ] Verschiebungen per `git mv` + Importe (sed-artig, keine Inhaltsänderung): Baupläne → `shared/blueprints/`, Showcases → `shared/showcases/`, `colorMath` → `shared/designSystems/`, `heroFacts.ts`(+test) → `systems/shared/heroFacts.ts` und dorthin `formatHeroRating` + `menuVisible` (alte Stellen importieren von dort), `PackModule` → `siteModule.ts` als `SiteModule` (`packRegistry.ts` behält vorerst nur `PACK_MODULES`).
- [ ] Prüfen: `npm run check && npm run test`; `npx tsx scripts/seiten-fingerabdruck.ts --beispiele --fixtures --aus nach-t1` und `--vergleich` gegen Basis → 0 Abweichungen; `grep -rn "stylePacks/\(blueprint\|colorMath\|categoryAliases\)\|artDirection/heroFacts" client server shared scripts tests` → leer.
- [ ] Commit `refactor(systeme): gemeinsame Bausteine aus den Pack-Ordnern lösen`.

### Task 2: rev-3-Invariante (Lesen wandelt, Schreiben prüft)

**Dateien:** `shared/designSystems/apply.ts` (+test), `shared/designSystems/registry.ts`, `shared/designSystems/assignment.test.ts`, `server/v2WriteGuard.ts`(+test), `server/onboardingV2/versions.ts`, `routerVersions.ts`(+test), `server/onboardingV2/state.ts` (`requireDoc`), `server/ssr/renderSite.tsx`, `server/ssr/routes.ts` (`?version=`), `client/src/components/site/SiteRenderer.tsx`, `client/src/components/site/isV2.ts`(+test), `server/generationV2/runJob.ts` (`buildInterimV2Doc`, `withNewSiteDesign`), `server/onboardingV2/devSeed.ts`, `devDashboardSeed.ts`, `server/adminDemoWebsite.ts` (+ deren Tests).

- [ ] `withPrimarySystem` total: nimmt das erste **freigeschaltete** System des Tripels, wirft nur, wenn keins freigeschaltet ist; Test: alle `BLUEPRINT_IDS` × (Barbier ja/nein, Gastro-Arten, Familie leer/`standard`, unbekannte Kategorie) → `designRevision === 3`, System aus dem Tripel.
- [ ] Neu `asSystemDoc(doc, current?)`: rev 3 mit `system` → **dasselbe Objekt** (Byte-Gleichheit); sonst `withDesignSystem(doc, current.system, current.palette)`, wenn `current` rev 3 ist, sonst `withPrimarySystem(doc)`. Tests: Identität bei rev 3; rev 1/2/ohne Revision → rev 3; `fontPairId` entfällt; Inhalte, `stylePackId`, `designProfile` bleiben.
- [ ] Lesegrenzen: `renderSiteHtml` (ganz oben, damit Kopf + Körper dasselbe System sehen), `SiteRenderer` (vor allem anderen; ersetzt den `designRevision === undefined`-Zweig), `restoreDoc(current, old)` → `asSystemDoc(old ohne addOns, current)` **[E1]**, `?version=`-Vorschau rendert `restoreDoc(aktuell, stand)`, `requireDoc` im Studio. `parseV2`: Modul-Prüfung über `SYSTEM_MODULES[asSystemDoc(d).system]` statt `PACK_MODULES[stylePackId]`.
- [ ] Schreiben: `assertV2SafeWrite` lehnt jedes **nächste** v2-Dokument ohne `designRevision: 3` + `system` ab (auch wenn das gespeicherte kein v2 ist), Meldung deutsch; Tests für rev 2/ohne Revision/ohne System.
- [ ] Erzeuger auf rev 3: Zwischenstand `buildInterimV2Doc` bekommt `blueprintFamily` aus `resolveIndustryFamily(category, name, industryKey)` und läuft durch `withPrimarySystem` (Zeitmaschine zeigt schon das System); Dev-Seeds und Admin-Demo-Website (`getFixture(…)` ist rev 1!) durch `withPrimarySystem`.
- [ ] Tests (neu): Wiederherstellen eines rev-2-Stands behält System+Palette, bringt Texte zurück, Add-on-Flags wie bisher; Undo nach „Designsystem umgestellt“ landet auf rev 3; Stand-Vorschau eines rev-2-Stands = HTML der Wiederherstellung; `renderSiteHtml` mit rev-1-Fixture liefert `data-pb-system`; `parseV2` einer rev-3-Seite ≠ null.
- [ ] Prüfen: `npm run check && npm run test`; Fingerabdruck-Vergleich → 0 Abweichungen.
- [ ] Commit `feat(systeme): jede gelesene Seite ist ein System-Dokument, Schreiben nur rev 3`.

### Task 3: Studio und KI ohne Packs

**Dateien:** Server `server/onboardingV2/router.ts`(+test), `applyPatch.ts`(+test), `routerContent.ts`(+test), `routerAi.ts`(+test), `aiEdit.ts`(+test), `aiEditPrompt.ts`, `routerBrand.ts`, `state.ts`, `shared/onboardingV2/aiEdit.ts`(+test), `shared/onboardingV2/brandImport.ts`; Client `client/src/pages/onboarding-v2/{StudioPage,DesignSplash,designChoice,designSplashLogic,PreviewFrame,previewLayoutChrome,GenerationScreen,AiChat,aiChatParts}.tsx/ts`, `panels/{StylePanel,PhotosPanel,OfferPanel}.tsx` (+ Tests), Löschungen laut Karte (Studio).

- [ ] `getStyleCandidates` liefert nur `kind: "system"` (Runden laut **[E2]**), `StyleCandidate` ohne Pack-Zweig; `selectStylePack`, `applyStylePack`, `parsePackId`, `alternativeLooks`/`PACK_FONT_PAIRS`-Nutzung entfallen. `selectDesignSystem` unverändert.
- [ ] `updateTheme`: nur noch `designProfile` (Studio sendet es für „Bild ausblenden“); `accent`, `fontPairId`, `colorWorldId`, `colorWorldBase`, Collage-Prüfung entfallen. `applyTheme` entsprechend schlank (nur Profil). Bestehende Dokumentfelder `colorOverrides`/`fontPairId`/`heroCollageImages` bleiben im Schema (gespeicherte Seiten), werden aber nicht mehr gesetzt.
- [ ] KI-Chat: Prompt ohne Farbwelten/Schriftpaare/Layouts/Pack-Liste; Design-Status nennt System + Farbstimmung; `AiThemePatch` nur `hiddenSections`, `sectionOrder`, `hiddenElements` (heute schon die rev-3-Liste `SYSTEM_THEME_KEYS`); Farb-/Schriftwünsche → Ablehnung mit `SYSTEM_LOOK_MESSAGE`. `kind: "style"` laut **[E5]** (System-ID aus `systemsForDoc`, Server prüft Zugehörigkeit). Stil-Verfassung im Prompt = Textstimme.
- [ ] Client: `DesignSplash`/`StylePanel`/`designChoice` nur Systeme + `PaletteChooser`; `PreviewFrame` ohne `packOverride`/`look`/`?pack=&variant=&font=` (nur `?system=&palette=`); `previewLayoutChrome` behält Einfüge-Zonen, Skelett und „Bild ausblenden“, verliert Layout-Wähler, `applyProfileAttrs`/`applyLayoutOverlay` und das Einspielen von `DESIGN_PROFILE_CSS` (das färbte bisher auch rev-3-Vorschauen um); `PhotosPanel` ohne Collage; `OfferPanel` liest `prefersMenu` vorerst weiter aus der Verfassung (Task 5 stellt auf `getVoice` um); `GenerationScreen` färbt das Skelett aus der Palette des Systems (`state.doc.system`), vorher neutral; `AiChat` Stil-Karte mit System.
- [ ] Löschen: `DesignQuickControls*`, `ThemeEditor`, `BrandImportCard*`, `CollagePicker*`, `themeChoices.ts`, `routerBrand.ts`(+test) und Eintrag in `router.ts`, `shared/onboardingV2/brandImport.ts`(+test) **[E6]**; tote Hilfen in `gmb/siteCrawl.ts` (`crawlSiteBranding`) nur, wenn sonst unbenutzt.
- [ ] Tests anpassen/neu: Kandidaten je Familie (nie aktuelles System, Runden), KI-Stil nur Tripel-Systeme, `updateTheme` lehnt Farb-/Schriftfelder ab (zod strict), Layout-Chrome ohne Wähler; Studio-Playwright-Baselines (`studio.spec.ts`: Stil-Panel) nach Sichtprüfung neu.
- [ ] Prüfen: `npm run check && npm run test`; Fingerabdruck → 0 Abweichungen; `grep -rnE "selectStylePack|applyStylePack|alternativeLooks|PACK_FONT_PAIRS|packOverride|ThemeEditor|DesignQuickControls|BrandImport|CollagePicker|colorWorld|fontPairId" client/src/pages server/onboardingV2 shared/onboardingV2` → nur Schema-/Kommentar-Treffer, begründet.
- [ ] Commit `refactor(studio): Designwahl nur noch über Systeme und Farbstimmungen`.

### Task 4: Renderer, SSR, Routen, Demos, Landing-Links

**Dateien:** `client/src/components/site/SiteRenderer.tsx`(+test), `isV2.ts`, `client/src/components/WebsiteRenderer.tsx`(+test), `client/src/site-islands/mountMotion.ts`(+test), `server/ssr/renderSite.tsx`(+tests), `server/ssr/routes.ts`(+test), `client/src/App.tsx`, `client/src/pages/{SitePage,LegalPage,DesignReviewPage}.tsx`, `client/src/pages/admin/websitesPageLogic.ts`(+test) + `WebsitesPage.tsx`, `server/seo/homePage.ts`, `client/src/pages/landing-concepts/{Klarstart,Auftritt}.tsx`, `client/src/components/landing/LandingHero.tsx`, Tests/Playwright; Löschungen laut Karte (Renderer, Pack-Bausteine, Libs, Seiten/Demos, Playwright).

- [ ] `SiteRenderer`: nur Systemzweig; `packOverride`, `PACK_MODULES`, `toCssVars`/`getFontPair`/`artPalette`, rev-2-Variablen, `DECO_TOGGLE_CSS`, Pack-CSS-Kette, `EntryContext`/`EntryDock`, `data-pb-*`-Layout-Attribute, `siteEntrance`-Effekt fallen. Reihenfolge der verbleibenden Attribute, Variablen und Styles **unverändert** (Byte-Gleichheit). Fehlendes Modul wirft weiter.
- [ ] `renderSite.tsx`: `fontsForDoc`/`buildFontsUrl`/Google-Fonts-Kopf, `artPalette`/Verfassungs-Farben in `getRoleColor`, Pack-Rechtsseiten-Zweig, `usesMotionBundle`-rev-2-Fall, Side-Effect-Import `packs/index` entfallen; Kopfzeilen der Systeme unverändert.
- [ ] `routes.ts`: `?pack/variant/font` (Vorschau), `/demo/bauplan/…`, `handleDemoRoute`/`handleDemoLegalRoute`/`handleDemoPageRoute` → 301 laut **[E9]** (kein Reflektieren des Parameters, unbekannt → 404); Dev-Vorschau nur mit `?system=` (Fixture-Wahl über `?pack=` bleibt als Fixture-Schlüssel, `?variant=`/`?hero=` entfallen; ohne `system` → Hauptsystem der Fixture); `isKnownPackId` nur noch für Fixtures/Seeds.
- [ ] Client: `mountMotion.ts` ohne `mountSiteEntrance`/rev-2-Selektor (Motion-Bundle wird kleiner — Pfad ändert sich, HTML nur im normalisierten Teil); `WebsiteRenderer` ohne `packs/index`; `SitePage` lädt keine Pack-Schriften mehr (System-CSS bringt `@font-face`); `LegalPage` nimmt Akzent aus `getPalette(getSystem(system), palette)`; Admin-Websites-Liste zeigt System + Farbstimmung statt Pack; `DesignReviewPage` nur Systemübersicht (Bauplan-Pack-Kacheln weg); `/design-lab` + `/design-system` (Dev) samt Seiten entfernen.
- [ ] Links: `server/seo/homePage.ts`, `LandingHero.tsx`, `Klarstart.tsx`, `Auftritt.tsx` zeigen direkt auf die System-Beispiele **[E4]** (Bilder/Copy erst nach Freigabe, eigener Commit).
- [ ] Löschen: `packs/**`, `packRegistry.ts`, `artDirection/**` (Rest), Pack-Bausteine, `packAccent`/`packFonts`, `design-lab/**`, `PackShowcase*`, `client/public/pack-previews/`, `client/public/landing/forwhom-*.webp`, `scripts/build-pack-previews.mjs` + `build:previews`, `tests/visual/packs.spec.ts` + Snapshots, `tests/visual/site-entrance.spec.ts`.
- [ ] Playwright: `islands.spec.ts` auf `?system=raster&fixture=features` (neue Baselines nach Sichtprüfung, Snapshot-Namen `islands-raster-…`), `a11y.spec.ts` Demo-Blöcke auf `/demo/system/…` je System, `tests/prod/smoke.spec.ts` auf eine System-Demo + Prüfung des 301, `landing.spec.ts` ohne `#showcase`-Pack-Bilder. `systems.spec.ts` muss **ohne** Baseline-Update grün sein.
- [ ] Tests neu/angepasst: `renderSite` Rechtsseiten nur System-Rahmen; Routen-Tests 301-Ziele, Dev-Vorschau ohne System → Hauptsystem; `parseV2`; `mountMotion` ohne rev 2.
- [ ] Prüfen: `npm run check && npm run test && npm run build`; Fingerabdruck (`--beispiele --fixtures`, ggf. `--datei`) → 0 Abweichungen; `npx playwright test tests/visual/systems.spec.ts --project=dev` grün ohne Update; `grep -rnE "components/site/packs|PACK_MODULES|packRegistry|artDirection/|entryLayouts|entrySections|ArtDirectedHero|pack-previews|design-lab|packFonts|packAccent" client server shared scripts tests` → leer.
- [ ] Commit `refactor(seiten): Pack-Renderer, Einstiege und Pack-Demos entfernt`.

### Task 5: Generierung mit Textstimmen, `shared/stylePacks/` löschen

**Dateien:** neu `shared/textVoices/{index,types}.ts` + 20 Stimmen-Dateien (aus den Verfassungen, nur Text-Felder) + Tests (aus `packMatching`, `registry`), neu `shared/designSystems/entry.ts`(+test); `server/generationV2/{runJob,selectPack→selectVoice,contentPrompt,generateSiteContent,heroPhoto}.ts` (+Tests, `runJobSystems.test.ts`), `server/routers.ts` (Admin-Neuerzeugung), `server/onboardingV2/{aiEditPrompt,insertSectionAi,suggest}.ts`, `tonePrompts.test.ts`, `server/db.ts`, `client/src/pages/onboarding-v2/panels/OfferPanel.tsx`, `shared/showcases/blueprintShowcase.ts`, `shared/siteContract/designProfile.ts`(+test), `shared/designSystems/apply.ts`, `scripts/{build-category-families,seite-pruefen}.ts`; löschen `shared/stylePacks/` komplett, `scripts/design-neu-ableiten.ts`.

- [ ] Textstimmen: `getVoice(id)` (wirft bei Unbekannt, wie `getConstitution`), Pool/Matching/Signale 1:1 aus `index.ts` + `rankArtDirections` (Ergebnisse identisch: bestehende `packMatching`-/`selectPack`-Tests unverändert grün, nur Importe). Prompts (`contentPrompt`, Suggest, KI-Chat, Abschnitt-Einfügen, Ton) lesen `essence`/`llmHints` aus der Stimme — Prompt-Text byte-gleich (Snapshot-Test des Prompts vor/nach).
- [ ] `entry.ts`: `entryProfile(sections, photos)` = `DEFAULT_DESIGN_PROFILE` + `composition` (Querformat → `stage`, sonst ≥ 1 Zusatzfoto → `colorfield`, sonst Foto → `portrait`, sonst `statement`) + `seed`; Test: für jede Foto-Lage gleiche `composition`-Entscheidung wie das alte `withEntryComposition(deriveArtDirectedProfile(…))` (alter Code im Test als Fixture-Tabelle festgehalten).
- [ ] `runJob`: `pickArtTheme`, `deriveArtDirectedProfile`, `withEntryComposition`, `collectOccupiedCompositions`/`collectOccupiedDesignFingerprints` + Rezept-Rotation (`art2:`-Zähler), `CURRENT_DESIGN_REVISION` entfallen; Zwischen- und Endstand: `entryProfile` + `withPrimarySystem`; Palette laut **[E3]** in `withPrimarySystem`/`withDesignSystem` (Akzent nur noch aus echter Markenfarbe, sonst Regel E3). `withNewSiteDesign` analog (`withoutDesignSystem` entfällt).
- [ ] Showcases: `showcaseDoc` (Bühne/Farbfläche-Übersicht) entfällt; `systemShowcaseDoc` baut direkt (Fixture + Beispieltexte + Fotos + Bauplan + `entryProfile`), Standard-Palette aus der Tabelle **[E3]** → `--beispiele` bleibt byte-gleich.
- [ ] Löschen `shared/stylePacks/**` (inkl. `fontPairs`, `colorWorlds`, `packVariants`, `artThemes`, `artDirection`, `variantCandidates`, `summary`, `toCssVars`, `imbiss`, Verfassungs-Visuals), `designProfile.ts`-Ableitungen ohne Nutzer, `withoutDesignSystem`, `scripts/design-neu-ableiten.ts`; `PACK_IDS`-Kommentar in `packIds.ts` → „Textstimmen (historischer Feldname `stylePackId`)“ **[E8]**.
- [ ] Prüfen: `npm run check && npm run test && npm run build`; Fingerabdruck → 0 Abweichungen (bzw. nur gelistete E3-Paletten); Mock-Generierung (`PB_LLM_MOCK=1`, Dev-Seed ohne Kategorie → `ensureGeneration`) erzeugt rev 3 schon im Zwischenstand; `grep -rnE "stylePacks|getConstitution|toCssVars|pickArtTheme|deriveArtDirectedProfile|withEntryComposition|ENTRY_VARIANT|fontPair|colorWorld|withoutDesignSystem|rankArtDirections" client server shared scripts tests` → leer.
- [ ] Commit `refactor(generierung): Textstimmen statt Pack-Verfassungen, shared/stylePacks entfernt`.

### Task 6: Doku, Gesamtprüfung, Größenbericht

**Dateien:** `CLAUDE.md`, `docs/claude-handoff/{STAND,REGELN,LANDING}.md`, `docs/BETRIEB-V2.md`, `client/index.html` (Kommentar), Memory (`~/.claude/projects/-Users-christianniessing-cursor-projects-pageblitz-pageblitz/memory/MEMORY.md`, `designsysteme-2026-10.md`).

- [ ] `CLAUDE.md`: „20 Packs — kein 21.“ → „6 Systeme“ (`journal`, `raster`, `werkstoff`, `plakat`, `klar`, `nacht`; IDs `shared/designSystems/types.ts`, Zuordnung `assignment.ts`), Produktsatz („20 kuratierte Style-Packs“ → „6 Designsysteme mit je 3 Farbstimmungen“), Landing/Studio-Tabelle prüfen.
- [ ] Handoff: STAND (Packs weg, rev 3 einzig, Textstimmen), REGELN (keine Pack-Regeln mehr; Byte-Gleichheit/Fingerabdruck-Werkzeug als Regel), LANDING (`PackShowcase`/`pack-previews`/Pack-Tests raus; Showroom laut E4).
- [ ] `BETRIEB-V2.md`: Abschnitte „Rollback bei Designsystemen“ und „Designsysteme auf Bestand umstellen“ ersetzen durch: Rollback = vorherigen Commit (`f65d848d` oder jünger) deployen, **keine** Datenänderung nötig (alter Code rendert rev 3 und Packs); Verlauf rev 2 wird beim Wiederherstellen ins aktuelle System gewandelt; Prüf-SQL „keine v2-Seite ohne rev 3“; Fingerabdruck-Werkzeug (`--datei`) für Deploy-Vergleiche.
- [ ] Gesamtprüfung: `npm run check`, `npm run test`, `npm run build`, `npm run test:visual` (alle Specs; nur Task-3/4-Baselines neu), Fingerabdruck alle drei Quellen gegen Basis, Lighthouse einer System-Demo (CLS/LCP unverändert), Toter-Code-Check (Import-Graph: Dateien ohne Importeur außer Einstiegspunkten → Liste leer oder begründet).
- [ ] **Größenbericht** nach `.superpowers/sdd/packs-entfernen/bericht.md` und in den PR-Text: `git diff --shortstat f65d848d...HEAD`, gelöschte Dateien (`--diff-filter=D --name-only | wc -l`), Zeilen vorher/nachher, Snapshot-MB entfernt, Bundle vorher/nachher (gesamt JS roh/gzip, Studio-Chunk, SitePage-Chunk, `dist/index.js`, Motion-/Islands-Bundle), Anzahl Tests vorher/nachher.
- [ ] Commit `docs: Packs entfernt — 6 Systeme, Betrieb und Handoff aktualisiert`.

### Task 7: Produktion (Controller, beim Deploy)

Nur der Controller, nach Merge-Freigabe durch den Betreiber; Reihenfolge zwingend.

- [ ] **Vorab (nur lesen, jederzeit vor dem Deploy):** Export der Live-Dokumente für den Fingerabdruck: `mysql … -e "SELECT id, websiteData FROM generated_websites WHERE JSON_EXTRACT(websiteData,'$.version')=2"` → JSON lokal unter `.superpowers/sdd/packs-entfernen/live.json` (gitignored, nicht weitergeben); `basis-live.json` mit `f65d848d` erzeugen, Branch-Stand vergleichen → 0 Abweichungen (593 ist hier noch rev 2 und wird vom neuen Code gewandelt — erwartete Abweichung, nur diese ID).
- [ ] **Sicherung:** `mysqldump … pageblitz generated_websites website_versions > /root/backups/vor-packs-entfernen-$(date +%F).sql`.
- [ ] **593 umstellen (noch mit dem laufenden Prod-Code `f65d848d`):** `npx tsx -r dotenv/config scripts/systeme-umstellen.ts --ids 593` (Trockenlauf prüfen: Familie, System, Palette, nur erlaubte Felder) → `… --ids 593 --schreiben` → `pm2 restart pageblitz` → Seite 593 und Studio-Verlauf ansehen.
- [ ] **Bestandsprüfung:** `SELECT id FROM generated_websites WHERE JSON_EXTRACT(websiteData,'$.version')=2 AND (JSON_EXTRACT(websiteData,'$.designRevision') IS NULL OR JSON_EXTRACT(websiteData,'$.designRevision')<>3 OR JSON_EXTRACT(websiteData,'$.system') IS NULL);` → **leer**, sonst STOP.
- [ ] Deploy `origin/main` laut `CLAUDE.md`/`BETRIEB-V2.md`; danach: alle Live-Seiten 200 (Liste aus Export), Fingerabdruck der Live-Dokumente mit neuem Code = `basis-live.json` (+593 jetzt identisch zur Umstellung), `/demo/gusto` → 301, Studio einer Postkarten-Seite: Design-Panel zeigt Systeme, „Rückgängig“ auf „Stand vor Designsystem“ bleibt im System, KI-Chat-Designwunsch, Neuerzeugung einer Testseite (Zwischenstand bereits System).
- [ ] Memory/Doku-Abschluss: Prod-Stand-Commit in `MEMORY.md`, `designsysteme-2026-10.md` („Packs entfernt, Rollback nur per Commit“).
