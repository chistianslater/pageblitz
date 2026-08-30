import { FONT_PAIRS, getConstitution } from "../../shared/stylePacks";
import {
  activeColorWorldId,
  getColorWorlds,
} from "../../shared/stylePacks/colorWorlds";
import { getV2VariantCandidates } from "../../shared/stylePacks/variantCandidates";
import { PACK_IDS } from "../../shared/siteContract/schema";
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

  return [
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
    `- Sektionstypen und ihre Reihenfolge NIE verändern — keine Sektion hinzufügen oder entfernen.`,
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
    `Antworte mit GENAU EINEM der vier folgenden JSON-Formate:`,
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
    `Diese Änderungen werden SOFORT angewandt — wähle sie, wenn der Wunsch mit der aktuellen Designrichtung erfüllbar ist.`,
    ``,
    `3) Grundlegend anderer Look (die aktuelle Richtung passt überhaupt nicht — z. B. "komplett anderer Stil", "wie eine Anwaltskanzlei statt Werkstatt"):`,
    `{"kind":"style","content":null,"theme":null,"packId":"<eine ID aus der Liste unten>","reason":"<ein Satz, warum dieses Pack passt>"}`,
    `Verfügbare Packs:`,
    ...candidateLines,
    ``,
    `4) Faktenwunsch (Telefon, Adresse, Preise, Öffnungszeiten oder rechtliche Angaben ändern):`,
    `{"kind":"reject","content":null,"theme":null,"packId":null,"reason":"<kurzer Hinweis, welches Panel dafür zuständig ist>"}`,
  ].join("\n");
}
