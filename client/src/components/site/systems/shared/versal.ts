/**
 * Versal-Display (Plakat: League Gothic, `text-transform: uppercase`) würde
 * „ß“ als „SS“ setzen. Vorher als Versal-Eszett „ẞ“ (U+1E9E) schreiben —
 * die Schrift führt das Zeichen, uppercase lässt es stehen.
 */
export function versalEszett(text: string): string {
  return text.replace(/ß/g, "ẞ");
}
