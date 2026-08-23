import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { ForWhom } from "@/components/landing/ForWhom";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PackShowcase } from "@/components/landing/PackShowcase";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import {
  FinalCta,
  IndustryLinks,
  LandingFooter,
} from "@/components/landing/LandingFooter";

/**
 * Landingpage „/" im Look des Pageblitz-Studios (Brief:
 * docs/superpowers/specs/2026-08-23-landing-redesign-brief.md).
 *
 * Helles Papier, Hairlines, eine Schrift, ein Grün — Tokens `.lp`/`--lp-*` in
 * client/src/index.css, Sektionen unter client/src/components/landing/.
 * Kein Dark-Mode-Toggle mehr (kein `lp-theme` in localStorage).
 *
 * Meta/JSON-LD (Title, Description, OG, SoftwareApplication, Organization)
 * stehen in client/index.html; das FAQPage-Schema und der Crawler-Prerender
 * kommen serverseitig aus server/seo/homePage.ts (Quelle: shared/faq.ts).
 *
 * Die Seite selbst animiert nur die Hero-Checkliste (CSS, StudioFrame.tsx);
 * framer-motion braucht nur der Chat-Widget — der lädt lazy (s. u.) und
 * bringt sein eigenes `LazyMotion` mit Async-Feature-Loader mit.
 */

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
  const [, navigate] = useLocation();
  const [billingYearly, setBillingYearly] = useState(true);
  const [heroBusinessName, setHeroBusinessName] = useState("");

  // Einstieg direkt im Hero: Wer den Firmennamen eintippt, überspringt auf
  // /start den Auswahl-Screen ("Wie möchtest du starten?"). Leeres Feld ist
  // erlaubt und führt auf den bisherigen Weg.
  const handleHeroStart = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      billing: billingYearly ? "yearly" : "monthly",
    });
    const name = heroBusinessName.trim();
    if (name) params.set("name", name);
    navigate(`/start?${params.toString()}`);
  };

  return (
    <div className="lp min-h-screen">
      <LandingNav billingYearly={billingYearly} />
      <main>
        <LandingHero
          value={heroBusinessName}
          onChange={setHeroBusinessName}
          onSubmit={handleHeroStart}
        />
        <ForWhom />
        <HowItWorks billingYearly={billingYearly} />
        <PackShowcase />
        <Pricing
          billingYearly={billingYearly}
          onBillingChange={setBillingYearly}
        />
        <Faq />
        <FinalCta
          value={heroBusinessName}
          onChange={setHeroBusinessName}
          onSubmit={handleHeroStart}
        />
        <IndustryLinks />
      </main>
      <LandingFooter />
      <DeferredChatWidget />
    </div>
  );
}
