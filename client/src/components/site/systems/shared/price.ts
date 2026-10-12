/** „45" → „45 €"; Angaben mit Währung oder ohne Ziffer bleiben, wie sie sind. */
export function formatPrice(price: string): string {
  const trimmed = price.trim();
  if (/€|eur/i.test(trimmed) || !/\d/.test(trimmed)) return trimmed;
  return `${trimmed} €`;
}

/**
 * Deutsche Zahl: „1.200" / „1.200,50" (Tausenderpunkt), „7,50", „12.50",
 * „45". Tausender zuerst, damit „1.200" nicht als 1,2 gelesen wird.
 */
const NUM = "(\\d{1,3}(?:\\.\\d{3})+(?:,\\d{1,2})?|\\d{1,5}(?:[.,]\\d{1,2})?)";
const EURO = "(?:€|eur\\b|euro\\b)";
/** Spanne „25–35 €" / „25 € – 35 €" → untere Grenze. */
const RANGE_EURO = new RegExp(`${NUM}\\s*${EURO}?\\s*[–-]\\s*${NUM}\\s*${EURO}`, "i");
/** Zahl direkt vor „€" (z. B. „1 Std. 50 €" → 50, nicht 1). */
const WITH_EURO = new RegExp(`${NUM}\\s*${EURO}`, "i");
/** Nur eine Zahl oder Spanne ohne Währung („45", „ab 7,50", „25–35"). */
const BARE = new RegExp(`^\\s*(?:ab\\s+)?${NUM}(?:\\s*[–-]\\s*${NUM})?\\s*$`, "i");
const FREE = /\b(gratis|kostenlos|umsonst)\b/i;

/** „1.200,50" → 1200.5; „12.50" → 12.5. */
function germanNumber(text: string): number {
  const thousands = /\.\d{3}(?:,|$)/.test(text);
  const plain = thousands ? text.replace(/\./g, "").replace(",", ".") : text.replace(",", ".");
  return Number(plain);
}

/**
 * „7,50 €" → 7.5; Spanne → untere Grenze; „gratis" → 0; sonst (unklar)
 * → undefined. Nur so kann „Ab X" der kleinste echte Preis sein.
 */
export function priceValue(price: string): number | undefined {
  if (FREE.test(price)) return 0;
  const m = price.match(RANGE_EURO) ?? price.match(WITH_EURO) ?? price.match(BARE);
  if (!m) return undefined;
  const value = germanNumber(m[1]);
  return Number.isFinite(value) ? value : undefined;
}

/** Betrag wie „7,50", „1.200", „25–35"; optional „ab" davor, „€" dahinter. */
const AMOUNT = String.raw`\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?`;
const SHORT_PRICE = new RegExp(
  String.raw`^(?:ab\s+)?(?:${AMOUNT})(?:\s*[–-]\s*(?:${AMOUNT}))?\s*(?:€|eur|euro)?$`,
  "i"
);
/** Länger passt der große Preis bei 320 px nicht neben den Namen. */
const BIG_MAX = 12;

/**
 * Preis einer Zeile: kurzer, lesbarer Betrag (priceValue; „ab", Spanne,
 * höchstens 12 Zeichen) → groß, so geschrieben wie in den Daten
 * (formatPrice ergänzt nur „€"); alles andere („auf Anfrage", „ab 1.200 €
 * zzgl. Anfahrt") klein und umbrechend; leer → nichts.
 */
export function rowPrice(
  price: string | undefined
): { big: string } | { note: string } | undefined {
  const t = price?.trim();
  if (!t) return undefined;
  const big = formatPrice(t);
  return priceValue(t) !== undefined &&
    SHORT_PRICE.test(t) &&
    big.length <= BIG_MAX
    ? { big }
    : { note: t };
}
