import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function generateChallenger(context: {
  baselineContent: string;
  resourcesContent: string;
  resultsContent: string;
  focus: "open_rate" | "reply_rate";
}): Promise<{ hypothesis: string; subject: string; body: string; variantName: string }> {
  const prompt = `Du bist ein Conversion-Copywriter für B2B-Kaltakquise auf Deutsch.

KONTEXT:
- Produkt: Pageblitz — automatische Website-Erstellung für lokale Unternehmen in Deutschland
- Zielgruppe: Kleine lokale Betriebe (Handwerk, Dienstleister, Gastronomie) ohne Website oder mit veralteter Website
- Kanal: Kalt-E-Mail (kein vorheriger Kontakt)
- Absender: Christian Slater, Gründer Pageblitz

BISHERIGE ERGEBNISSE:
${context.resultsContent}

AKTUELLE BASELINE:
${context.baselineContent}

LEARNINGS:
${context.resourcesContent}

AUFGABE:
Erstelle eine neue E-Mail-Variante.
- Ändere NUR eine Variable (Betreff ODER Opening ODER CTA — nicht alles)
- Schreibe professionell aber menschlich, kein Marketing-Sprech
- Maximal 120 Wörter Body
- Nutze {businessName} als Platzhalter für den Firmennamen
- Fokus: ${context.focus === "open_rate" ? "Höhere Open Rate (besserer Betreff)" : "Höhere Reply Rate (überzeugenderer Body/CTA)"}

Antworte NUR in diesem Format:

## Hypothese
[Was du testest und warum du glaubst, es funktioniert besser]

## Betreff
[Betreff-Zeile]

## Body
[E-Mail-Text, maximal 120 Wörter]`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Parse the response
  const hypothesisMatch = text.match(/## Hypothese\n([\s\S]*?)(?=## Betreff)/);
  const subjectMatch = text.match(/## Betreff\n([\s\S]*?)(?=## Body)/);
  const bodyMatch = text.match(/## Body\n([\s\S]*?)$/);

  const hypothesis = hypothesisMatch?.[1]?.trim() ?? "";
  const subject = subjectMatch?.[1]?.trim() ?? "";
  const body = bodyMatch?.[1]?.trim() ?? "";
  const variantName = `challenger-${new Date().toISOString().split("T")[0]}`;

  return { hypothesis, subject, body, variantName };
}
