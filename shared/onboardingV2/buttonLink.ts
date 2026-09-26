import { SafeUrlSchema } from "../siteContract/schema";

/** Grenze wie SectionLinkSchema.text. */
export const BUTTON_TEXT_MAX = 40;

export interface ButtonLink {
  text: string;
  href: string;
}

/**
 * Macht aus einer Kundeneingabe eine erlaubte Button-Adresse (SafeUrlSchema)
 * oder null. Kunden tippen „dicle.nexorder.de" oder „02871 123456", nicht
 * „https://…" oder „tel:+49…" — beides wird ergänzt. Deutsche Nummern mit
 * führender 0 bekommen +49.
 */
export function normalizeButtonHref(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (/^(https?:\/\/|\/|#)/i.test(value)) {
    return SafeUrlSchema.safeParse(value).success ? value : null;
  }
  const phone = value.replace(/^tel:/i, "");
  if (/^\+?[0-9 ()/.-]{6,}$/.test(phone)) {
    const digits = phone.replace(/[^0-9+]/g, "");
    const international = digits.startsWith("+")
      ? digits
      : digits.startsWith("00")
        ? `+${digits.slice(2)}`
        : `+49${digits.replace(/^0/, "")}`;
    const href = `tel:${international}`;
    return SafeUrlSchema.safeParse(href).success ? href : null;
  }
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(value)) {
    return `https://${value}`;
  }
  return null;
}

/** Deutsche Fehlermeldungen für einen Button — leer heißt gültig. */
export function buttonLinkErrors(link: ButtonLink): string[] {
  const errors: string[] = [];
  const text = link.text.trim();
  if (!text) errors.push("Button-Text fehlt.");
  else if (text.length > BUTTON_TEXT_MAX) {
    errors.push(`Button-Text ist zu lang (max. ${BUTTON_TEXT_MAX} Zeichen).`);
  }
  if (!SafeUrlSchema.safeParse(link.href).success) {
    errors.push("Button-Adresse fehlt oder ist ungültig.");
  }
  return errors;
}

/**
 * Webadressen aus Freitext (KI-Chat, 2026-09-26): „mach einen Button zu
 * dicle.nexorder.de". Nur was der Kunde selbst schreibt, darf die KI als
 * neues Link-Ziel verwenden. E-Mail-Adressen zählen nicht.
 */
export function linksInText(text: string): string[] {
  const found: string[] = [];
  const pattern =
    /(?<![@\w.-])((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s"'<>]*)?)/gi;
  for (const match of text.matchAll(pattern)) {
    const cleaned = match[1].replace(/[.,;:!?)\]]+$/, "");
    const href = normalizeButtonHref(cleaned);
    if (href && /^https?:\/\//.test(href) && !found.includes(href)) {
      found.push(href);
    }
  }
  return found;
}
