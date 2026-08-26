import { invokeLLM } from "../_core/llm";

/**
 * Dünner Wrapper um die vorhandene LLM-Infrastruktur (server/_core/llm.ts,
 * invokeLLM) für die v2-Content-Generierung: nimmt einen fertigen Prompt
 * entgegen und liefert den rohen Text-Content der Antwort zurück. JSON-Parsing
 * und Validierung passieren bewusst NICHT hier, sondern in
 * generateSiteContent.ts (dort sitzt auch die Retry-Logik).
 */
/**
 * v2-Generierung ist latenzkritisch (Studio-Ziel ≤ 90 s): Standard ist das
 * schnelle Backup-Modell mit 45 s Timeout und Rückfall auf Kimi K3.
 * WICHTIG: Backup- und Primärpfad brauchen getrennte Budgets. Vorher wurde
 * derselbe 45-s-Wert an den Kimi-Fallback durchgereicht — exakt der gemeldete
 * Produktionsfehler „LLM timeout after 45000ms (kimi-k2.5)".
 * `PB_GENERATION_LLM=primary` erzwingt Primär.
 */
const PREFER_FAST_MODEL = process.env.PB_GENERATION_LLM !== "primary";
const BACKUP_TIMEOUT_MS =
  Number(process.env.PB_GENERATION_BACKUP_TIMEOUT_MS) || 45_000;
export function resolvePrimaryGenerationTimeout(raw: unknown): number {
  const configured = Number(raw);
  return Math.max(
    Number.isFinite(configured) && configured > 0 ? configured : 180_000,
    120_000
  );
}
// Alt-Deployments könnten PB_GENERATION_LLM_TIMEOUT_MS=45000 gesetzt haben.
// Für ein Reasoning-Modell ist das kein sinnvoller Primärwert; hart auf
// mindestens 120 s klemmen, Default K3 = 180 s.
const PRIMARY_TIMEOUT_MS = resolvePrimaryGenerationTimeout(
  process.env.PB_GENERATION_PRIMARY_TIMEOUT_MS ??
    process.env.PB_GENERATION_LLM_TIMEOUT_MS
);

export async function llmComplete(prompt: string): Promise<string> {
  const response = await invokeLLM({
    preferBackup: PREFER_FAST_MODEL,
    backupTimeoutMs: BACKUP_TIMEOUT_MS,
    primaryTimeoutMs: PRIMARY_TIMEOUT_MS,
    // K3 denkt immer. Für strukturierten Website-Text reicht „low" und hält
    // die Antwortzeit deutlich unter dem Default „max".
    reasoningEffort: "low",
    messages: [
      {
        role: "system",
        content:
          "Du schreibst Website-Inhalte für deutsche Kleinunternehmen. Antworte AUSSCHLIESSLICH mit validem JSON.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new Error("LLM-Antwort enthält keinen Text-Content");
  }
  return content;
}
