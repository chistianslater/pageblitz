import crypto from "crypto";
import { sql } from "drizzle-orm";
import {
  studioFunnelEvents,
  type InsertStudioFunnelEvent,
} from "../../drizzle/schema";
import {
  aggregateStudioFunnel,
  isStudioFunnelStep,
  type StudioFunnelAggregate,
  type StudioFunnelStep,
} from "../../shared/onboardingV2/funnel";
import { getDb, getWebsiteByToken } from "../db";

const SESSION_KEY_RE = /^[a-f0-9]{64}$/;

export function hashFunnelValue(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function sessionKeyFromToken(token: string): string {
  return hashFunnelValue(`tok:${token}`);
}

export function sessionKeyFromWebsiteId(websiteId: number): string {
  return hashFunnelValue(`wid:${websiteId}`);
}

export function isFunnelSessionKey(value: string): boolean {
  return SESSION_KEY_RE.test(value);
}

export function resolveFunnelSessionKey(opts: {
  token?: string | null;
  websiteId?: number | null;
  sessionKey?: string | null;
}): string | null {
  if (opts.token) return sessionKeyFromToken(opts.token);
  if (opts.sessionKey && isFunnelSessionKey(opts.sessionKey)) {
    return opts.sessionKey;
  }
  if (typeof opts.websiteId === "number") {
    return sessionKeyFromWebsiteId(opts.websiteId);
  }
  return null;
}

export interface RecordStudioFunnelInput {
  step: StudioFunnelStep;
  token?: string | null;
  websiteId?: number | null;
  sessionKey?: string | null;
}

/**
 * Schreibt einen Funnel-Step idempotent (UNIQUE sessionKey+step).
 * Fehler werden geschluckt — Tracking darf den Hauptfluss nie kippen.
 */
export async function recordStudioFunnelEvent(
  input: RecordStudioFunnelInput
): Promise<boolean> {
  try {
    if (!isStudioFunnelStep(input.step)) return false;
    const sessionKey = resolveFunnelSessionKey(input);
    if (!sessionKey) return false;

    const db = await getDb();
    if (!db) return false;

    const row: InsertStudioFunnelEvent = {
      sessionKey,
      step: input.step,
      websiteId: input.websiteId ?? null,
    };
    await db
      .insert(studioFunnelEvents)
      .values(row)
      .onDuplicateKeyUpdate({
        // No-op: ersten Write (createdAt) behalten, keine Duplikate.
        set: { createdAt: sql`createdAt` },
      });
    return true;
  } catch (err) {
    console.warn("[studio-funnel] record failed:", err);
    return false;
  }
}

/** Bequeme Variante für Studio-Mutationen, die Token + websiteId schon haben. */
export async function recordStudioFunnelByToken(
  token: string,
  websiteId: number,
  step: StudioFunnelStep
): Promise<void> {
  await recordStudioFunnelEvent({ token, websiteId, step });
}

/**
 * Public trackFunnel: Token → Website auflösen (ungültig = no-op),
 * sonst nur der anonyme sessionKey (Landing vor der Website).
 */
export async function trackStudioFunnelFromClient(input: {
  step: StudioFunnelStep;
  token?: string;
  sessionKey?: string;
}): Promise<{ ok: boolean }> {
  if (input.token) {
    const website = await getWebsiteByToken(input.token);
    if (!website) return { ok: false };
    const ok = await recordStudioFunnelEvent({
      step: input.step,
      token: input.token,
      websiteId: website.id,
    });
    return { ok };
  }
  const ok = await recordStudioFunnelEvent({
    step: input.step,
    sessionKey: input.sessionKey,
  });
  return { ok };
}

export async function getStudioFunnelStats(): Promise<StudioFunnelAggregate> {
  const db = await getDb();
  if (!db) return aggregateStudioFunnel({});
  const rows = await db
    .select({
      step: studioFunnelEvents.step,
      count: sql<number>`count(DISTINCT ${studioFunnelEvents.sessionKey})`,
    })
    .from(studioFunnelEvents)
    .groupBy(studioFunnelEvents.step);
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.step] = Number(row.count);
  }
  return aggregateStudioFunnel(counts);
}
