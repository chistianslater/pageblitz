import { lazy, Suspense, useEffect, useState } from "react";
import Klarstart from "./landing-concepts/Klarstart";
import "./landing-concepts/concepts.css";
import "./landing-concepts/clear-flow.css";
const LandingPageChatWidget = lazy(
  () => import("@/components/LandingPageChatWidget")
);

// requestIdleCallback fehlt in Safari — Fallback auf setTimeout.
const IDLE_FALLBACK_MS = 2500;

/**
 * Lädt den Chat-Widget-Chunk (inkl. framer-motion) erst, wenn der Browser
 * Luft hat oder die Besucherin interagiert — nicht im ersten Paint von "/"
 * (B6 Task 8). Die proaktive Sprechblase des Widgets erscheint ohnehin erst
 * nach 14 s; ein paar hundert Millisekunden später sichtbarer Chat-Button
 * ist unkritisch, ~40 kB gzip weniger im LCP-Pfad nicht.
 */
function DeferredChatWidget() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const arm = () => {
      if (!cancelled) setReady(true);
    };
    const events = ["pointerdown", "keydown", "scroll"] as const;
    events.forEach(e =>
      window.addEventListener(e, arm, { once: true, passive: true })
    );
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(arm, { timeout: IDLE_FALLBACK_MS });
    } else {
      timer = setTimeout(arm, IDLE_FALLBACK_MS);
    }
    return () => {
      cancelled = true;
      events.forEach(e => window.removeEventListener(e, arm));
      if (idleId !== undefined && typeof w.cancelIdleCallback === "function")
        w.cancelIdleCallback(idleId);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, []);
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <LandingPageChatWidget />
    </Suspense>
  );
}

export default function LandingPage() {
  return (
    <div className="klarstart-live">
      <Klarstart />
      <DeferredChatWidget />
    </div>
  );
}
