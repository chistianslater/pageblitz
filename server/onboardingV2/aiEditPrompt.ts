import { getVoice } from "../../shared/textVoices";
import {
  asSystemDoc,
  getPalette,
  getSystem,
  isReleased,
  systemsForDoc,
  type DesignSystemId,
} from "../../shared/designSystems";
import {
  SYSTEM_LOOK_MESSAGE,
  type AiChatHistoryEntry,
} from "../../shared/onboardingV2/aiEdit";
import { tonePromptLines } from "../../shared/onboardingV2/tone";
import { GOALS } from "../../shared/onboardingV2/goal";
import type { Page, WebsiteDataV2 } from "../../shared/siteContract/types";

export const AI_EDIT_SYSTEM_PROMPT =
  "Du bist ein KI-Assistent, der Kundenwünsche zu einer bestehenden Kleinunternehmer-Website interpretiert und ausschließlich als valides JSON beantwortest, ohne Markdown, ohne Erklärung.";

const FORBIDDEN_CONTENT_RULE =
  "Erfinde oder ändere niemals Telefonnummern, E-Mail-Adressen, Postadressen oder Öffnungszeiten. URLs nur aus der Liste „Erlaubte Link-Ziele“ — nie erfinden.";

/**
 * Systeme, die die KI als „anderen Look“ vorschlagen darf: das Branchen-
 * Tripel ohne das aktuelle System, nur freigeschaltete (E5 — der Server
 * prüft dieselbe Zugehörigkeit in routerAi).
 */
export function styleSuggestionSystems(
  doc: WebsiteDataV2,
  category?: string
): DesignSystemId[] {
  const current = asSystemDoc(doc).system;
  return systemsForDoc({
    ...doc,
    businessCategory: doc.businessCategory || category,
  }).filter(id => id !== current && isReleased(id));
}

/**
 * Buttons & Links (2026-09-26): wo Buttons sitzen, welche Ziele erlaubt
 * sind. Unbelegte Ziele setzt aiEditFacts ohnehin zurück — die Regel hier
 * sorgt dafür, dass die KI nach der Adresse fragt statt zu raten.
 */
function linkRuleLines(allowed: string[], isPage: boolean): string[] {
  const external = allowed.filter(href => /^https?:/.test(href));
  return [
    `- Buttons & Links: Hero-Button = Feld "ctaHref" der hero-Sektion (Text "ctaText"). Button UNTER Leistungen/Speisekarte/Preisliste = Feld "link":{"text":"<max. 40 Zeichen>","href":"..."} an der services-/menu-/pricelist-Sektion.${isPage ? "" : ` Eigener Button-Block = Zusatz-Sektion {"type":"cta","headline":"...","ctaText":"...","ctaHref":"..."} (z. B. „Hunger? Jetzt online bestellen" nach der Speisekarte).`}`,
    `- Erlaubte Link-Ziele (NUR diese als "href"/"ctaHref" verwenden): ${allowed.length > 0 ? allowed.join(", ") : "keine"}. Anker (#…) springen auf der Seite, tel: ruft an.`,
    external.length > 0
      ? `- Webadressen daraus: ${external.join(", ")} — z. B. die Bestellplattform.`
      : `- Es ist KEINE Webadresse belegt: wünscht der Kunde einen Button zu einer externen Seite (Bestellplattform, Buchung, Shop), frag nach der genauen Adresse (Format 5) statt eine zu erfinden.`,
  ];
}

/**
 * Baut den User-Prompt für den KI-Chat: Textstimme (essence + llmHints),
 * aktuelles Design (System + Farbstimmung), aktueller Inhalt (seo +
 * sections) als JSON, harte Regeln (nur Inhalte, keine Fakten/Rechtstexte,
 * Struktur beibehalten) und die fünf Antwortformen mit Beispiel-JSON.
 */
export function buildAiEditPrompt(args: {
  doc: WebsiteDataV2;
  message: string;
  category: string;
  /** Unterseiten-Scope (Plan B6 Task 5): Inhalt = Page.seo + Page.sections statt der Startseite. */
  page?: Page;
  /** Kurzer Dialog-Kontext (Rückfragen): vorherige Wortwechsel dieses Wunschs. */
  history?: AiChatHistoryEntry[];
  /** Belegte Link-Ziele (aiEditLinks) — die KI darf nur diese setzen. */
  allowedLinks?: string[];
}): string {
  // Textstimme (historisch „Verfassung“) — nur Ton und Regeln, kein Look.
  const voice = getVoice(args.doc.stylePackId);
  const systemDoc = asSystemDoc(args.doc);
  const system = systemDoc.system ? getSystem(systemDoc.system) : undefined;
  const candidateLines = styleSuggestionSystems(
    args.doc,
    args.category
  ).flatMap(id => {
    const def = getSystem(id);
    return def ? [`- ${id}: ${def.name} — ${def.essence}`] : [];
  });
  const designStatus = [
    ...(system
      ? [
          `Design: ${system.name}`,
          `Farbstimmung: ${getPalette(system, systemDoc.palette).name}`,
        ]
      : []),
    // Ziel (2026-09-03): damit Button-Wünsche zum gewählten Ziel passen.
    ...(args.doc.goal
      ? [
          `Ziel der Website: ${GOALS[args.doc.goal].label} — der Hero-Button führt dorthin, Text und Ziel des Buttons nur auf ausdrücklichen Wunsch ändern.`,
        ]
      : []),
    // Bestand/Sichtbarkeit/Reihenfolge betreffen die STARTSEITE — im
    // Unterseiten-Scope weggelassen (dort gilt die Sektions-Whitelist der
    // Page, und der Test belegt: kein "hero" im Unterseiten-Prompt).
    ...(args.page
      ? []
      : [
          `Sektionstypen im Dokument: ${args.doc.sections.map(s => s.type).join(", ")}`,
          `Ausgeblendete Sektionen: ${(args.doc.hiddenSections ?? []).join(", ") || "keine"}`,
          `Ausgeblendete Einzel-Elemente: ${(args.doc.designProfile?.hiddenElements ?? []).join(", ") || "keine"}`,
          args.doc.sectionOrder
            ? `Eigene Reihenfolge: ${args.doc.sectionOrder.join(", ")}`
            : `Reihenfolge: Dokument-Standard (hero immer zuerst)`,
        ]),
  ];
  const scope = args.page
    ? `die Unterseite „${args.page.title}“ (Pfad /${args.page.slug}) seiner Website`
    : `seine Website`;
  const content = args.page
    ? { seo: args.page.seo, sections: args.page.sections }
    : { seo: args.doc.seo, sections: args.doc.sections };
  // Rückfragen-Dialog (2026-08-30): vorherige Wortwechsel VOR dem aktuellen
  // Wunsch, damit eine Antwort auf eine Rückfrage zuzuordnen ist.
  const dialogLines =
    args.history && args.history.length > 0
      ? [
          `## Bisheriger Dialog zu diesem Wunsch`,
          ...args.history.map(
            entry =>
              `${entry.role === "user" ? "Kunde" : "Du (Rückfrage)"}: "${entry.text}"`
          ),
          ``,
        ]
      : [];

  return [
    ...dialogLines,
    `Der Kunde äußert folgenden Wunsch für ${scope}: "${args.message}"`,
    ``,
    `## Tonalität (Textstimme: ${voice.name})`,
    voice.essence,
    ``,
    `## Regeln`,
    ...voice.llmHints.do.map(rule => `- ${rule}`),
    ``,
    `## Verbote`,
    ...voice.llmHints.dont.map(rule => `- ${rule}`),
    `- ${FORBIDDEN_CONTENT_RULE}`,
    `- Erfinde oder ändere niemals Rechtstexte (Impressum/Datenschutz).`,
    args.page
      ? `- Sektionstypen und ihre Reihenfolge NIE verändern — keine Sektion hinzufügen oder entfernen.`
      : `- Sektionstypen und ihre Reihenfolge NIE verändern — keine Sektion hinzufügen oder entfernen. EINZIGE Ausnahmen (faktenfreie Zusatz-Sektionen, hinzufügen UND entfernen erlaubt): {"type":"story","headline":"...","body":"..."} (mehr erzählen: Geschichte/Historie/Philosophie — nach "about" einsortieren, Absätze durch Leerzeile), {"type":"usp","headline":"...","items":[{"title":"...","text":"..."}]} (2–6 Vorteile/Argumente — früh platzieren, z. B. nach "hero" oder "services"), {"type":"notice","text":"..."} (Saison-/Aktionshinweis wie Urlaub oder Rabatt — wird als Banner GANZ OBEN über der Navigation gezeigt, egal wo er in der Liste steht; genau EIN Satz), {"type":"stats","headline":"...","items":[{"value":"25+","label":"Jahre Erfahrung"}]} (2–4 Kennzahlen — NUR Zahlen verwenden, die der Kunde selbst nennt oder die aus dem Inhalt belegt sind, NIE erfinden), {"type":"process","headline":"...","steps":[{"title":"...","text":"..."}]} (Ablauf in 2–5 nummerierten Schritten, z. B. Anfrage → Termin → Umsetzung), {"type":"quote","text":"...","author":"..."} (großes Zitat/Motto des Betriebs).`,
    ...linkRuleLines(args.allowedLinks ?? [], Boolean(args.page)),
    `- Die Bildplätze sind fest: der Hero hat genau EIN Bild-Feld, Über-uns genau eines; nur die Galerie trägt mehrere. Du darfst keine Bild-URLs erfinden oder verschieben.`,
    // Tonalität (2026-09-03): Vorgabe des Kunden schlägt Anrede-Hinweise
    // der Textstimme — gilt für jeden Text, den der Chat umschreibt.
    ...(args.doc.tone ? [``, ...tonePromptLines(args.doc.tone)] : []),
    ``,
    args.page
      ? `## Aktueller Inhalt der Unterseite (SEO + Sektionen, als JSON)`
      : `## Aktueller Inhalt (SEO + Sektionen, als JSON)`,
    JSON.stringify(content),
    ``,
    `## Aktuelles Design`,
    ...designStatus,
    ``,
    `## Wie antworten`,
    `Antworte mit GENAU EINEM der fünf folgenden JSON-Formate:`,
    ``,
    `1) Inhaltlicher Wunsch (Texte ändern):`,
    `{"kind":"content","content":{"seo":{"title":"...","description":"..."},"sections":[...]},"theme":null,"system":null,"reason":null}`,
    `- "sections" enthält ALLE Sektionen aus dem aktuellen Inhalt, in derselben Reihenfolge und mit denselben Typen — nur die vom Wunsch betroffenen Textfelder ändern sich.`,
    `- Fakten (imageUrl, Telefon, E-Mail, Adresse, Öffnungszeiten) unverändert aus dem aktuellen Inhalt übernehmen. Bestehende "ctaHref"/"link" unverändert mitgeben, außer der Wunsch betrifft genau diesen Button.`,
    ``,
    `2) Sektionen ein-/ausblenden oder umsortieren, Bild im Hero/Über-uns ausblenden:`,
    `{"kind":"theme","content":null,"theme":{...nur die gewünschten Felder...},"system":null,"reason":"<ein Satz, was du geändert hast>"}`,
    `Mögliche Felder in "theme" (nur setzen, was der Wunsch verlangt):`,
    ...(args.page
      ? [
          `- Auf einer Unterseite gibt es hier nichts einzustellen — Ein-/Ausblenden und Reihenfolge gelten für die Startseite.`,
        ]
      : [
          `- "hiddenSections": VOLLSTÄNDIGE Liste der auszublendenden Sektionstypen (ersetzt die bisherige Liste; [] blendet alles wieder ein). Erlaubt sind nur Typen aus dem Dokument, NIE "hero" oder "contact". Beispiel: Kunde will keine Bewertungen zeigen → ["testimonials"] (plus alles, was schon ausgeblendet war und bleiben soll).`,
          `- "sectionOrder": VOLLSTÄNDIGE neue Reihenfolge der Sektionstypen (alle Typen aus dem Dokument aufzählen; "hero" bleibt immer zuerst, "contact" gehört ans Ende).`,
          `- "hiddenElements": VOLLSTÄNDIGE Liste einzeln ausgeblendeter Elemente (ersetzt die bisherige; [] zeigt alles wieder). Möglich: "hero-media" (Bild im Hero weg — Text nutzt die volle Breite), "about-media" (Über-uns-Bild weg). Nicht-destruktiv, die Bilder bleiben gespeichert.`,
        ]),
    `- Leistungen (services) tragen KEINE Preise — bei Preis-Wünschen freundlich auf die Extras Preisliste bzw. Speisekarte verweisen (buchbar im Extras-Panel).`,
    `Diese Änderungen werden SOFORT angewandt.`,
    `- Farben, Schriften, Abstände und Layouts bringt das Design selbst mit. Einzelne Farb-, Schrift- oder Layoutwünsche („dunkler", „andere Schrift", „blauer") setzt du NICHT um — antworte dann mit Format 4 und dem Hinweis: "${SYSTEM_LOOK_MESSAGE}" Passt das ganze Design nicht, schlage ein anderes vor (Format 3).`,
    ``,
    `3) Grundlegend anderer Look (das aktuelle Design passt überhaupt nicht — z. B. "komplett anderer Stil", "viel moderner", "edler und dunkler"):`,
    `{"kind":"style","content":null,"theme":null,"system":"<eine ID aus der Liste unten>","reason":"<ein Satz, warum dieses Design passt>"}`,
    ...(candidateLines.length > 0
      ? [`Verfügbare Designs:`, ...candidateLines]
      : [`Es gibt gerade kein anderes Design für diese Branche — nutze Format 4.`]),
    ``,
    `4) Nicht machbarer Wunsch — drei Fälle:`,
    `   a) Fakten (Telefon, Adresse, Preise, Öffnungszeiten, Rechtliches): die ändert der Kunde selbst in den Panels.`,
    `   b) Struktur/Funktionen, die es nicht gibt (andere als die erlaubten Zusatz-Sektionen hinzufügen/entfernen, Buchung/Shop/neue Features). Buttons/Links zu einer Bestell- oder Buchungsseite SIND machbar (siehe Buttons & Links) — fehlt nur die Adresse, frag danach (Format 5). Hinweis: "mehr erzählen" IST machbar — story-Sektion (Format 1).`,
    `   c) Einzelne Farb-, Schrift- oder Layoutwünsche (siehe oben).`,
    `{"kind":"reject","content":null,"theme":null,"system":null,"reason":"<sag EHRLICH und konkret, was nicht geht und warum — und nenne die nächstbeste Alternative, die du kannst. NIE einen generischen Fehler, immer eine hilfreiche Erklärung.>"}`,
    ``,
    `5) Rückfrage — NUR wenn der Wunsch so mehrdeutig ist, dass du ihn ohne Zusatzinfo falsch umsetzen könntest (z. B. "mach das schöner" ohne Bezug, oder zwei mögliche Lesarten mit sehr unterschiedlichem Ergebnis):`,
    `{"kind":"question","content":null,"theme":null,"system":null,"reason":null,"question":"<genau EINE kurze, konkrete Rückfrage auf Deutsch, gern mit 2–3 Optionen>"}`,
    `- Höchstens EINE Rückfrage pro Wunsch: steht im bisherigen Dialog bereits eine Rückfrage von dir, dann NIE erneut fragen — setze stattdessen die plausibelste Interpretation um.`,
    `- Bei nur leichter Unschärfe nicht fragen, sondern die naheliegendste Interpretation direkt umsetzen.`,
  ].join("\n");
}
