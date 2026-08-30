import { FONT_PAIRS, getConstitution } from "../../shared/stylePacks";
import {
  activeColorWorldId,
  getColorWorlds,
} from "../../shared/stylePacks/colorWorlds";
import { getV2VariantCandidates } from "../../shared/stylePacks/variantCandidates";
import { PACK_IDS } from "../../shared/siteContract/schema";
import type { AiChatHistoryEntry } from "../../shared/onboardingV2/aiEdit";
import type {
  PackId,
  Page,
  WebsiteDataV2,
} from "../../shared/siteContract/types";

export const AI_EDIT_SYSTEM_PROMPT =
  "Du bist ein KI-Assistent, der Kundenwünsche zu einer bestehenden Kleinunternehmer-Website interpretiert und ausschließlich als valides JSON beantwortest, ohne Markdown, ohne Erklärung.";

const FORBIDDEN_CONTENT_RULE =
  "Erfinde oder ändere niemals URLs, Telefonnummern, E-Mail-Adressen, Postadressen oder Öffnungszeiten.";

/**
 * Kandidaten-Packs für Stil-Vorschläge: die branchenpassenden Kandidaten
 * zuerst (Runde 0 und 1 von getV2VariantCandidates), danach alle übrigen
 * registrierten Packs — dedupliziert, stabile Reihenfolge. So bekommt die KI
 * eine Auswahl, ist aber nicht auf Branchenmatches beschränkt.
 */
function buildStyleCandidateIds(category: string): PackId[] {
  const primary = getV2VariantCandidates(category, 0);
  const secondary = getV2VariantCandidates(category, 1);
  const all = PACK_IDS as unknown as PackId[];
  const seen = new Set<PackId>();
  const ordered: PackId[] = [];
  for (const id of [...primary, ...secondary, ...all]) {
    if (!seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  }
  return ordered;
}

/**
 * Baut den User-Prompt für den KI-Chat: Verfassung (essence + llmHints) des
 * aktuell gewählten Packs, aktueller Inhalt (seo + sections) als JSON, harte
 * Regeln (nur Inhalte, keine Fakten/Rechtstexte, Struktur beibehalten) und
 * die drei möglichen Antwortformen (content/style/reject) mit Beispiel-JSON.
 */
export function buildAiEditPrompt(args: {
  doc: WebsiteDataV2;
  message: string;
  category: string;
  /** Unterseiten-Scope (Plan B6 Task 5): Inhalt = Page.seo + Page.sections statt der Startseite. */
  page?: Page;
  /** Kurzer Dialog-Kontext (Rückfragen): vorherige Wortwechsel dieses Wunschs. */
  history?: AiChatHistoryEntry[];
}): string {
  const constitution = getConstitution(args.doc.stylePackId);
  const candidateIds = buildStyleCandidateIds(args.category);
  const candidateLines = candidateIds.map(id => {
    const c = getConstitution(id);
    return `- ${id}: ${c.name} — ${c.essence}`;
  });
  const worlds = getColorWorlds(args.doc.stylePackId);
  const activeWorld = activeColorWorldId(
    args.doc.stylePackId,
    args.doc.colorOverrides ?? undefined
  );
  const profile = args.doc.designProfile;
  const designStatus = [
    `Designrichtung: ${constitution.name} (${args.doc.stylePackId})`,
    `Aktive Farbwelt: ${activeWorld}`,
    `Akzentfarbe: ${args.doc.colorOverrides?.accent ?? "Richtungsfarbe"}`,
    `Schriftpaar: ${args.doc.fontPairId ?? "Richtungsschriften"}`,
    profile
      ? `Layout: hero=${profile.heroLayout}, leistungen=${profile.servicesLayout}, ueber-uns=${profile.aboutLayout}, galerie=${profile.galleryLayout}, abstaende=${profile.density}, bildwirkung=${profile.imageTreatment}`
      : `Layout: Richtungs-Standard`,
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
    `## Tonalität (aktuelles Style Pack: ${constitution.name})`,
    constitution.essence,
    ``,
    `## Regeln`,
    ...constitution.llmHints.do.map(rule => `- ${rule}`),
    ``,
    `## Verbote`,
    ...constitution.llmHints.dont.map(rule => `- ${rule}`),
    `- ${FORBIDDEN_CONTENT_RULE}`,
    `- Erfinde oder ändere niemals Rechtstexte (Impressum/Datenschutz).`,
    args.page
      ? `- Sektionstypen und ihre Reihenfolge NIE verändern — keine Sektion hinzufügen oder entfernen.`
      : `- Sektionstypen und ihre Reihenfolge NIE verändern — keine Sektion hinzufügen oder entfernen. EINZIGE Ausnahme: die Erzähl-Sektion {"type":"story","headline":"...","body":"..."} darfst du hinzufügen (wenn der Kunde mehr erzählen will: Geschichte, Historie, Philosophie, Werte — am besten direkt nach "about" einsortiert) oder entfernen (wenn er sie loswerden will). Absätze im body durch Leerzeile trennen.`,
    `- Die Bildplätze sind fest: der Hero hat genau EIN Bild, Über-uns genau eines; nur die Galerie trägt mehrere. Anzahl oder Anordnung der Bilder kannst du NICHT ändern.`,
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
    `{"kind":"content","content":{"seo":{"title":"...","description":"..."},"sections":[...]},"theme":null,"packId":null,"reason":null}`,
    `- "sections" enthält ALLE Sektionen aus dem aktuellen Inhalt, in derselben Reihenfolge und mit denselben Typen — nur die vom Wunsch betroffenen Textfelder ändern sich.`,
    `- Fakten (imageUrl, ctaHref, Telefon, E-Mail, Adresse, Öffnungszeiten) unverändert aus dem aktuellen Inhalt übernehmen.`,
    ``,
    `2) Design-Feinjustierung (Farben, Schrift, Abstände, Layout — z. B. "dunkler", "andere Akzentfarbe", "mehr Luft", "Bild im Hero nach oben"):`,
    `{"kind":"theme","content":null,"theme":{...nur die gewünschten Felder...},"packId":null,"reason":"<ein Satz, was du geändert hast>"}`,
    `Mögliche Felder in "theme" (nur setzen, was der Wunsch verlangt; null = Richtungs-Standard):`,
    `- "colorWorldId": eine von ${worlds.map(w => `"${w.id}"`).join(", ")} — Grundstimmung der Farben ("abend" = dunkel, "heller" = licht, "waermer"/"kuehler"/"getoent" = Tönung, "original" = zurücksetzen).`,
    `- "colorWorldBase": "#rrggbb" — eigene Grundfarbe (Hintergrund), wenn der Kunde eine KONKRETE Farbe für den Hintergrund nennt; Text-/Linienfarben werden automatisch lesbar nachgeführt.`,
    `- "accent": "#rrggbb" oder null — Akzentfarbe (Buttons, Hervorhebungen).`,
    `- "fontPairId": eine von ${FONT_PAIRS.map(f => `"${f.id}"`).join(", ")} oder null. (${FONT_PAIRS.map(f => `${f.id} = ${f.label}, ${f.vibe}`).join("; ")})`,
    `- "density": "airy" (großzügig) oder "compact".`,
    `- "imageTreatment": "natural", "framed" (gerahmt) oder "bleed" (flächig).`,
    `- "heroLayout": "split" (Bild neben Text), "centered", "image-first" (Bild oben).`,
    `- "servicesLayout": "list", "grid", "featured". "aboutLayout": "image-left", "image-right". "galleryLayout": "grid", "mosaic", "filmstrip".`,
    `- "decorations": "off" blendet Schmuck-Illustrationen aus (Zweige, Farbkleckse, Ornamente — z. B. wenn dem Kunden eine Illustration nicht gefällt), "on" zeigt sie wieder.`,
    `Diese Änderungen werden SOFORT angewandt — wähle sie, wenn der Wunsch mit der aktuellen Designrichtung erfüllbar ist.`,
    ``,
    `3) Grundlegend anderer Look (die aktuelle Richtung passt überhaupt nicht — z. B. "komplett anderer Stil", "wie eine Anwaltskanzlei statt Werkstatt"):`,
    `{"kind":"style","content":null,"theme":null,"packId":"<eine ID aus der Liste unten>","reason":"<ein Satz, warum dieses Pack passt>"}`,
    `Verfügbare Packs:`,
    ...candidateLines,
    ``,
    `4) Nicht machbarer Wunsch — zwei Fälle:`,
    `   a) Fakten (Telefon, Adresse, Preise, Öffnungszeiten, Rechtliches): die ändert der Kunde selbst in den Panels.`,
    `   b) Struktur/Funktionen, die es nicht gibt (Sektion hinzufügen/entfernen/umsortieren, mehr oder andere Bildplätze wie "3 Fotos im Hero", Buchung/Shop/neue Features).`,
    `{"kind":"reject","content":null,"theme":null,"packId":null,"reason":"<sag EHRLICH und konkret, was nicht geht und warum — und nenne die nächstbeste Alternative, die du kannst (z. B. statt 3 Hero-Fotos: Galerie-Layout auf Mosaik stellen oder ein anderes Hero-Layout). NIE einen generischen Fehler, immer eine hilfreiche Erklärung.>"}`,
    ``,
    `5) Rückfrage — NUR wenn der Wunsch so mehrdeutig ist, dass du ihn ohne Zusatzinfo falsch umsetzen könntest (z. B. "mach das schöner" ohne Bezug, oder zwei mögliche Lesarten mit sehr unterschiedlichem Ergebnis):`,
    `{"kind":"question","content":null,"theme":null,"packId":null,"reason":null,"question":"<genau EINE kurze, konkrete Rückfrage auf Deutsch, gern mit 2–3 Optionen>"}`,
    `- Höchstens EINE Rückfrage pro Wunsch: steht im bisherigen Dialog bereits eine Rückfrage von dir, dann NIE erneut fragen — setze stattdessen die plausibelste Interpretation um.`,
    `- Bei nur leichter Unschärfe nicht fragen, sondern die naheliegendste Interpretation direkt umsetzen.`,
  ].join("\n");
}
