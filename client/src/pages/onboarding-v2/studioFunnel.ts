/**
 * Kleiner Client-Hook für den Studio-Funnel. Additive, isolierte Datei —
 * StartPage/StudioPage rufen nur `useTrackFunnelStep` auf, damit der
 * Placeholder-PR möglichst konfliktfrei bleibt.
 */
import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import type { StudioFunnelPublicStep } from "@shared/onboardingV2/funnel";

export const FUNNEL_SESSION_STORAGE_KEY = "pb-funnel-sk";

type HexStorage = Pick<Storage, "getItem" | "setItem">;

function randomSessionKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export function isFunnelSessionKey(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

/** Anonymer 64-Hex-Key in sessionStorage — kein PII, überlebt den /start-Hop. */
export function getFunnelSessionKey(
  storage: HexStorage | null = typeof sessionStorage === "undefined"
    ? null
    : sessionStorage
): string | null {
  if (!storage) return null;
  const existing = storage.getItem(FUNNEL_SESSION_STORAGE_KEY);
  if (existing && isFunnelSessionKey(existing)) return existing;
  const next = randomSessionKey();
  storage.setItem(FUNNEL_SESSION_STORAGE_KEY, next);
  return next;
}

/**
 * Feuert einen Funnel-Step genau einmal pro Mount.
 * Mit Token: Website-Session (gehasht serverseitig).
 * Ohne Token: anonymer sessionKey (nur landing_start).
 */
export function useTrackFunnelStep(
  step: StudioFunnelPublicStep,
  token?: string
): void {
  const track = trpc.onboardingV2.trackFunnel.useMutation();
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    if (token) {
      fired.current = true;
      track.mutate({ step, token });
      return;
    }
    const sessionKey = getFunnelSessionKey();
    if (!sessionKey) return;
    fired.current = true;
    track.mutate({ step, sessionKey });
    // mutate ist stabil genug; wir wollen nicht bei Re-Renders erneut feuern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, token]);
}
