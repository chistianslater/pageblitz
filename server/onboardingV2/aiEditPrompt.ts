import { getConstitution } from "../../shared/stylePacks";
import { getV2VariantCandidates } from "../../shared/stylePacks/variantCandidates";
import { PACK_IDS } from "../../shared/siteContract/schema";
import type { PackId, WebsiteDataV2 } from "../../shared/siteContract/types";

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
}): string {
  const constitution = getConstitution(args.doc.stylePackId);
  const candidateIds = buildStyleCandidateIds(args.category);
  const candidateLines = candidateIds.map(id => {
    const c = getConstitution(id);
    return `- ${id}: ${c.name} — ${c.essence}`;
  });

  return [
    `Der Kunde äußert folgenden Wunsch für seine Website: "${args.message}"`,
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
    `## Aktueller Inhalt (SEO + Sektionen, als JSON)`,
    JSON.stringify({ seo: args.doc.seo, sections: args.doc.sections }),
    ``,
    `## Wie antworten`,
    `Antworte mit GENAU EINEM der drei folgenden JSON-Formate:`,
    ``,
    `1) Inhaltlicher Wunsch (Texte ändern):`,
    `{"kind":"content","content":{"seo":{"title":"...","description":"..."},"sections":[...]},"packId":null,"reason":null}`,
    `- "sections" enthält ALLE Sektionen aus dem aktuellen Inhalt, in derselben Reihenfolge und mit denselben Typen — nur die vom Wunsch betroffenen Textfelder ändern sich.`,
    `- Fakten (imageUrl, ctaHref, Telefon, E-Mail, Adresse, Öffnungszeiten) unverändert aus dem aktuellen Inhalt übernehmen.`,
    ``,
    `2) Design-/Stil-Wunsch (z. B. "dunkler", "eleganter", "moderner", "auffälliger"):`,
    `{"kind":"style","content":null,"packId":"<eine ID aus der Liste unten>","reason":"<ein Satz, warum dieses Pack passt>"}`,
    `Verfügbare Packs:`,
    ...candidateLines,
    ``,
    `3) Faktenwunsch (Telefon, Adresse, Preise, Öffnungszeiten oder rechtliche Angaben ändern):`,
    `{"kind":"reject","content":null,"packId":null,"reason":"<kurzer Hinweis, welches Panel dafür zuständig ist>"}`,
  ].join("\n");
}
