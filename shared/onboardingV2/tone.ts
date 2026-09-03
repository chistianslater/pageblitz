/**
 * Tonalität (2026-09-03, Übernahme aus vite-deploy-studio „VoiceToneSlider"):
 * fünf Stufen, jede mit Beispielsatz statt Adjektiv — der Kunde liest die
 * Stimmung, statt sie zu deuten. Die Anrede folgt der Stufe: die ersten zwei
 * duzen, ab „ausgewogen" wird gesiezt. Eine gesetzte Tonalität hat in allen
 * Text-Prompts Vorrang vor Anrede-Hinweisen der Pack-Verfassung (patina/
 * morgenlicht nennen „Sie-Form" in ihren llmHints).
 */

export const TONE_LEVELS = [
  "locker",
  "freundlich",
  "ausgewogen",
  "professionell",
  "formell",
] as const;
export type ToneLevel = (typeof TONE_LEVELS)[number];
export type ToneAddress = "du" | "sie";

export interface ToneSpec {
  label: string;
  address: ToneAddress;
  /** Willkommenssatz in genau dieser Tonalität — Anzeige unter dem Regler. */
  example: string;
  /** Stilbeschreibung für den Prompt. */
  style: string;
}

export const TONES: Record<ToneLevel, ToneSpec> = {
  locker: {
    label: "Locker",
    address: "du",
    example: "Hey! Schön, dass du da bist. Lass uns loslegen.",
    style:
      "locker und direkt, kurze Sätze, Alltagssprache, gern ein Augenzwinkern — keine Floskeln, kein Amtsdeutsch",
  },
  freundlich: {
    label: "Freundlich",
    address: "du",
    example: "Willkommen! Wir freuen uns, dich kennenzulernen.",
    style:
      "warm und nahbar, einladend, persönlich — Sprache wie im Gespräch an der Ladentheke",
  },
  ausgewogen: {
    label: "Ausgewogen",
    address: "sie",
    example: "Herzlich willkommen. Entdecken Sie unsere Leistungen.",
    style:
      "höflich und klar, weder steif noch salopp — verständliche Sätze, sachlich mit freundlichem Unterton",
  },
  professionell: {
    label: "Professionell",
    address: "sie",
    example: "Willkommen bei uns. Wir bieten Ihnen erstklassige Lösungen.",
    style:
      "kompetent und verbindlich, präzise Formulierungen, Nutzen und Qualität im Vordergrund — ohne Übertreibung",
  },
  formell: {
    label: "Formell",
    address: "sie",
    example: "Herzlich willkommen. Wir beraten Sie gerne kompetent.",
    style:
      "seriös und zurückhaltend, vollständige Sätze, keine Umgangssprache, keine Ausrufezeichen — Ton einer Kanzlei oder Praxis",
  },
};

export function toneIndex(level: ToneLevel): number {
  return TONE_LEVELS.indexOf(level);
}

export function toneFromIndex(index: number): ToneLevel {
  const clamped = Math.min(
    TONE_LEVELS.length - 1,
    Math.max(0, Math.round(index))
  );
  return TONE_LEVELS[clamped];
}

/**
 * Prompt-Block für Content-Generierung, KI-Chat und KI-Vorschläge. Leer,
 * wenn keine Tonalität gesetzt ist — dann entscheidet wie bisher die
 * Pack-Verfassung allein.
 */
export function tonePromptLines(level: ToneLevel | undefined): string[] {
  if (!level) return [];
  const tone = TONES[level];
  const address =
    tone.address === "du"
      ? "Leser konsequent duzen (du, dich, dein) — keine Sie-Form."
      : "Leser konsequent siezen (Sie, Ihnen, Ihr) — keine Du-Form.";
  return [
    `## Anrede und Ton (Vorgabe des Kunden — hat Vorrang vor Anrede-Regeln der Richtung oben)`,
    `- Anrede: ${address}`,
    `- Ton „${tone.label}“: ${tone.style}.`,
    `- Stimmung wie in diesem Satz: „${tone.example}“`,
  ];
}

/** Fester Wunsch für den Vorschlags-Pfad des KI-Chats („Texte anpassen"). */
export function toneRewriteMessage(level: ToneLevel): string {
  const tone = TONES[level];
  const address = tone.address === "du" ? "duzen" : "siezen";
  return `Schreibe alle Texte der Startseite in der Tonalität „${tone.label}“ um: ${tone.style}; Leser ${address}. Inhalt, Aussagen und Fakten (Telefon, Adresse, Öffnungszeiten, Leistungen) bleiben unverändert, Kundenbewertungen bleiben wortgleich — nur Wortwahl und Ansprache ändern sich.`;
}
