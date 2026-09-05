/**
 * Erstes vollständiges JSON-Objekt aus einer LLM-Antwort schneiden
 * (Befund 2026-09-05, Zehnerstapel Bocholt): Trotz `response_format:
 * json_object` hängte das Modell bei „Eleganz Friseursalon" Text hinter das
 * Objekt — `JSON.parse` scheiterte mit „Unexpected non-whitespace character
 * after JSON", und auch der Wiederholungsversuch tat es wieder. Die Seite
 * blieb ohne Inhalt, der Vorschau-Link lief auf 404.
 *
 * Bewusst ohne Reparaturversuche am JSON selbst: Wir schneiden nur, was
 * sicher außerhalb des Objekts liegt. Ist das Objekt unvollständig, bleibt
 * es ein Fehler — lieber ein sichtbarer Fehlschlag als geratener Inhalt.
 */
export function jsonFromLlm(raw: string): string | null {
  const text = raw.trim();
  if (text.length === 0) return null;

  const start = text.indexOf("{");
  if (start < 0) return null;

  let tiefe = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (inString) {
      if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === "{") tiefe++;
    else if (c === "}") {
      tiefe--;
      if (tiefe === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}
