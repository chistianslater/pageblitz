import { TRPCError } from "@trpc/server";
import { getWebsiteById, updateWebsite } from "./db";
import { invalidateSsrCache } from "./ssr/routes";
import { assertV2SafeWrite } from "./v2WriteGuard";
import {
  ChatConfigSchema,
  ContactFormConfigSchema,
  WebsiteDataV2Schema,
} from "../shared/siteContract/schema";
import type {
  ChatConfig,
  ContactFormConfig,
  WebsiteDataV2,
} from "../shared/siteContract/types";

function trimOrUndef(
  value: string | undefined,
  max: number
): string | undefined {
  const next = value?.trim();
  if (!next) return undefined;
  return next.slice(0, max);
}

function blankToUndef<T extends Record<string, unknown>>(input: T): T {
  const next = { ...input };
  for (const [key, value] of Object.entries(next)) {
    if (typeof value === "string" && value.trim() === "") {
      delete next[key];
    }
  }
  return next;
}

/**
 * Normalisiert Kunden-Eingaben: leere Labels fallen auf Pack-Defaults
 * zurück, Pflicht-Telefon ohne sichtbares Feld wird verworfen, Custom-
 * Felder auf max. 3 begrenzt. `undefined` bedeutet "keine Overrides" —
 * das Formular rendert dann die eingebauten Defaults.
 */
export function sanitizeContactFormConfig(
  input: ContactFormConfig
): ContactFormConfig | undefined {
  const parsed = ContactFormConfigSchema.safeParse(blankToUndef(input));
  if (!parsed.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Kontaktformular-Einstellungen sind ungültig.",
    });
  }
  const raw = parsed.data;
  const next: ContactFormConfig = {};
  const nameLabel = trimOrUndef(raw.nameLabel, 80);
  const emailLabel = trimOrUndef(raw.emailLabel, 80);
  const phoneLabel = trimOrUndef(raw.phoneLabel, 80);
  const messageLabel = trimOrUndef(raw.messageLabel, 80);
  const submitLabel = trimOrUndef(raw.submitLabel, 80);
  const successMessage = trimOrUndef(raw.successMessage, 240);
  if (nameLabel) next.nameLabel = nameLabel;
  if (emailLabel) next.emailLabel = emailLabel;
  if (phoneLabel) next.phoneLabel = phoneLabel;
  if (messageLabel) next.messageLabel = messageLabel;
  if (submitLabel) next.submitLabel = submitLabel;
  if (successMessage) next.successMessage = successMessage;
  if (raw.phoneEnabled === false) next.phoneEnabled = false;
  if (raw.phoneEnabled === true) next.phoneEnabled = true;
  if (raw.phoneRequired === true && next.phoneEnabled !== false) {
    next.phoneRequired = true;
    if (next.phoneEnabled === undefined) next.phoneEnabled = true;
  }
  const customFields = (raw.customFields ?? [])
    .map(field => ({
      id: field.id,
      label: field.label.trim(),
      ...(field.required ? { required: true as const } : {}),
    }))
    .filter(field => field.label.length > 0)
    .slice(0, 3);
  if (customFields.length > 0) next.customFields = customFields;
  return Object.keys(next).length > 0 ? next : undefined;
}

export function sanitizeChatConfig(input: ChatConfig): ChatConfig | undefined {
  const parsed = ChatConfigSchema.safeParse(blankToUndef(input));
  if (!parsed.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "KI-Chat-Einstellungen sind ungültig.",
    });
  }
  const next: ChatConfig = {};
  const extraKnowledge = trimOrUndef(parsed.data.extraKnowledge, 2000);
  if (extraKnowledge) next.extraKnowledge = extraKnowledge;
  if (parsed.data.notificationEmail) {
    next.notificationEmail = parsed.data.notificationEmail.toLowerCase();
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

function requireV2Doc(websiteData: unknown): WebsiteDataV2 {
  const parsed = WebsiteDataV2Schema.safeParse(websiteData);
  if (!parsed.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Diese Einstellungen sind nur für das neue Website-Format verfügbar.",
    });
  }
  return parsed.data;
}

async function persistDocPatch(
  websiteId: number,
  mutate: (doc: WebsiteDataV2) => WebsiteDataV2
): Promise<WebsiteDataV2> {
  const website = await getWebsiteById(websiteId);
  if (!website) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Website nicht gefunden.",
    });
  }
  const next = mutate(requireV2Doc(website.websiteData));
  assertV2SafeWrite(website.websiteData, next);
  await updateWebsite(websiteId, { websiteData: next as any });
  invalidateSsrCache(website.slug);
  return next;
}

/** Schreibt `websiteData.contactFormConfig` (oder entfernt Overrides). */
export async function applyContactFormConfig(
  websiteId: number,
  input: ContactFormConfig
): Promise<ContactFormConfig | undefined> {
  const config = sanitizeContactFormConfig(input);
  const next = await persistDocPatch(websiteId, doc => {
    const { contactFormConfig: _removed, ...rest } = doc;
    return config ? { ...rest, contactFormConfig: config } : rest;
  });
  return next.contactFormConfig;
}

/** Schreibt `websiteData.chatConfig` (oder entfernt Overrides). */
export async function applyChatConfig(
  websiteId: number,
  input: ChatConfig
): Promise<ChatConfig | undefined> {
  const config = sanitizeChatConfig(input);
  const next = await persistDocPatch(websiteId, doc => {
    const { chatConfig: _removed, ...rest } = doc;
    return config ? { ...rest, chatConfig: config } : rest;
  });
  return next.chatConfig;
}
