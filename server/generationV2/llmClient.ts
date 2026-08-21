import { invokeLLM } from "../_core/llm";

/**
 * Dünner Wrapper um die vorhandene LLM-Infrastruktur (server/_core/llm.ts,
 * invokeLLM) für die v2-Content-Generierung: nimmt einen fertigen Prompt
 * entgegen und liefert den rohen Text-Content der Antwort zurück. JSON-Parsing
 * und Validierung passieren bewusst NICHT hier, sondern in
 * generateSiteContent.ts (dort sitzt auch die Retry-Logik).
 */
export async function llmComplete(prompt: string): Promise<string> {
  const response = await invokeLLM({
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
