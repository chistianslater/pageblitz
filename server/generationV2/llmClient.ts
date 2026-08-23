import { invokeLLM } from "../_core/llm";
import { ENV } from "../_core/env";

/**
 * Dünner Wrapper um die vorhandene LLM-Infrastruktur (server/_core/llm.ts,
 * invokeLLM) für die v2-Content-Generierung: nimmt einen fertigen Prompt
 * entgegen und liefert den rohen Text-Content der Antwort zurück. JSON-Parsing
 * und Validierung passieren bewusst NICHT hier, sondern in
 * generateSiteContent.ts (dort sitzt auch die Retry-Logik).
 */
/**
 * v2-Generierung ist latenzkritisch (Studio-Ziel ≤ 90 s): Standard ist das
 * schnelle Backup-Modell (BACKUP_LLM_MODEL, ~5–10 s) mit 45 s Timeout und
 * Rückfall auf das Primärmodell (Kimi, gemessen ~20 s je 1k Tokens, bei
 * ganzen Websites 2–3 min). `PB_GENERATION_LLM=primary` erzwingt Primär.
 */
const PREFER_FAST_MODEL = process.env.PB_GENERATION_LLM !== "primary";
const HAS_BACKUP = !!(ENV.backupApiUrl && ENV.backupApiKey);
// Mit Backup: kurzer Timeout (Rückfall ist schnell); ohne Backup darf das
// Primärmodell länger brauchen, sonst schlüge jede Generierung fehl.
const GENERATION_TIMEOUT_MS =
  Number(process.env.PB_GENERATION_LLM_TIMEOUT_MS) ||
  (HAS_BACKUP ? 45_000 : 150_000);

export async function llmComplete(prompt: string): Promise<string> {
  const response = await invokeLLM({
    preferBackup: PREFER_FAST_MODEL,
    timeoutMs: GENERATION_TIMEOUT_MS,
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
