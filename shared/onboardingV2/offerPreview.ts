import {
  OfferPatchSchema,
  TeamPatchSchema,
  type OfferPatch,
  type TeamPatch,
} from "./patches";
import { SafeUrlSchema } from "../siteContract/schema";
import { buttonLinkErrors, type ButtonLink } from "./buttonLink";

/** Sichtbarer Platzhalter für noch leere Pflichtfelder in der Live-Vorschau. */
const PLATZHALTER = "…";

type Draft = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function list(value: unknown): Draft[] {
  return Array.isArray(value)
    ? value.filter((v): v is Draft => !!v && typeof v === "object")
    : [];
}

function link(value: unknown): { link?: ButtonLink } {
  if (!value || typeof value !== "object") return {};
  const candidate = {
    text: text((value as Draft).text),
    href: text((value as Draft).href),
  };
  return buttonLinkErrors(candidate).length === 0 ? { link: candidate } : {};
}

/**
 * Live-Vorschau des Angebots-Editors (2026-09-26): Während des Tippens ist
 * der Entwurf selten speicherbar (leere Zeilen, fehlende Preise). Für die
 * Vorschau werden leere Zeilen weggelassen und fehlende Pflichtwerte durch
 * „…" ersetzt. null = nichts Zeigbares. Gespeichert wird weiterhin nur über
 * updateOffer mit dem strengen Schema.
 */
export function offerForPreview(draft: unknown): OfferPatch | null {
  if (!draft || typeof draft !== "object") return null;
  const d = draft as Draft;
  let candidate: unknown;
  if (d.mode === "services") {
    const items = list(d.items)
      .map(item => ({
        title: text(item.title),
        ...(text(item.description)
          ? { description: text(item.description) }
          : {}),
      }))
      .filter(item => item.title);
    if (items.length === 0) return null;
    candidate = {
      mode: "services",
      headline: text(d.headline) || "Leistungen",
      ...(text(d.intro) ? { intro: text(d.intro) } : {}),
      items,
      ...link(d.link),
    };
  } else if (d.mode === "menu" || d.mode === "pricelist") {
    const categories = list(d.categories)
      .map(category => ({
        name: text(category.name) || PLATZHALTER,
        items: list(category.items)
          .map(item => ({
            name: text(item.name),
            ...(text(item.description)
              ? { description: text(item.description) }
              : {}),
            price: text(item.price) || PLATZHALTER,
          }))
          .filter(item => item.name),
      }))
      .filter(category => category.items.length > 0);
    if (categories.length === 0) return null;
    candidate = {
      mode: d.mode,
      ...(text(d.headline) ? { headline: text(d.headline) } : {}),
      categories,
      ...link(d.link),
    };
  } else {
    return null;
  }
  const parsed = OfferPatchSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

/**
 * Live-Vorschau des Team-Editors: Mitglieder ohne Namen weglassen, unsichere
 * Foto-Adressen verwerfen. Leere Liste = Sektion verschwindet (wie beim
 * Speichern). null = kein Team-Entwurf.
 */
export function teamForPreview(draft: unknown): TeamPatch | null {
  if (!draft || typeof draft !== "object") return null;
  const d = draft as Draft;
  if (!Array.isArray(d.members)) return null;
  const members = list(d.members)
    .map(member => {
      const imageUrl = text(member.imageUrl);
      return {
        name: text(member.name),
        ...(text(member.role) ? { role: text(member.role) } : {}),
        ...(imageUrl && SafeUrlSchema.safeParse(imageUrl).success
          ? { imageUrl }
          : {}),
      };
    })
    .filter(member => member.name);
  const parsed = TeamPatchSchema.safeParse({
    ...(text(d.headline) ? { headline: text(d.headline) } : {}),
    members,
  });
  return parsed.success ? parsed.data : null;
}
