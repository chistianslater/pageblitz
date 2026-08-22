import { invokeLLM } from "./_core/llm";

/**
 * Classifies a business into one of our predefined industry keys using AI.
 * This ensures better image/color matching than simple keyword string matching.
 */
export async function classifyIndustry(
  category: string,
  businessName: string
): Promise<string> {
  const prompt = `Classify this business into exactly ONE of the following industry keys.
Keys: friseur, restaurant, pizza, bar, cafe, hotel, bauunternehmen, handwerk, fitness, beauty, medizin, immobilien, baeckerei, beratung, reinigung, auto, fotografie, garten, tech.
If you are uncertain or the business doesn't fit any specifically, return "default".

Business Category: ${category}
Business Name: ${businessName}

Return ONLY the key (one word, lowercase).`;

  try {
    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
    });

    const rawContent = response.choices[0]?.message?.content;
    const contentStr = typeof rawContent === "string" ? rawContent : "";
    const key =
      contentStr
        .trim()
        .toLowerCase()
        .replace(/[^a-z]/g, "") || "default";
    const validKeys = [
      "friseur",
      "restaurant",
      "pizza",
      "bar",
      "cafe",
      "hotel",
      "bauunternehmen",
      "handwerk",
      "fitness",
      "beauty",
      "medizin",
      "immobilien",
      "baeckerei",
      "beratung",
      "reinigung",
      "auto",
      "fotografie",
      "garten",
      "tech",
      "default",
    ];
    return validKeys.includes(key) ? key : "default";
  } catch (error) {
    console.error("Industry classification failed:", error);
    return "default";
  }
}
