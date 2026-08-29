import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { ProofBar } from "@/components/landing/ProofBar";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PackShowcase } from "@/components/landing/PackShowcase";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { Pricing } from "@/components/landing/Pricing";
import { TrustSection } from "@/components/landing/TrustSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { Faq } from "@/components/landing/Faq";
import { StickyCta } from "@/components/landing/StickyCta";
import {
  FinalCta,
  IndustryLinks,
  LandingFooter,
} from "@/components/landing/LandingFooter";

/**
 * Landingpage „/" — „Nachtschicht" (Relaunch 2026-08-29): Kohle-Bühne,
 * ein Volt-Akzent, Space Grotesk + JetBrains Mono. Tokens `.lp`/`--lp-*`
 * in client/src/index.css; Spec:
 * docs/superpowers/specs/2026-08-29-landing-relaunch-dark-volt-design.md.
 * Studio bleibt Papier/Grün.
 *
 * Meta/JSON-LD (Title, Description, OG, SoftwareApplication, Organization)
 * stehen in client/index.html; das FAQPage-Schema und der Crawler-Prerender
 * kommen serverseitig aus server/seo/homePage.ts (Quelle: shared/faq.ts).
 *
 * Die Hero-Bühne ist HeroBuildLive (CSS-Phasen + Timer, kein Remotion,
 * kein Bild im LCP-Pfad). Chat-Widget lädt lazy.
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

  // Scroll-Scrub statt One-Shot-Reveal (User-Wunsch 2026-08-29): Sektionen
  // und Karten hängen direkt an der Scrollposition — runter = vorwärts,
  // hoch = rückwärts. GSAP + ScrollTrigger laden dynamisch (nicht im
  // LCP-Pfad); ohne JS oder bei prefers-reduced-motion bleibt alles
  // sichtbar-statisch (kein `lp-reveal-on` mehr → CSS versteckt nichts).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          document
            .querySelectorAll<HTMLElement>(".lp-section")
            .forEach(section => {
              gsap.fromTo(
                section,
                { y: 44, opacity: 0.3 },
                {
                  y: 0,
                  opacity: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: section,
                    start: "top 94%",
                    end: "top 58%",
                    scrub: 0.4,
                  },
                }
              );
              section
                .querySelectorAll<HTMLElement>("li, article")
                .forEach((el, i) => {
                  // Die Vier-Schritte-Reihe choreografiert ihre eigene
                  // GSAP-Bounce-Timeline (HowItWorks) — nicht doppeln.
                  if (el.closest("[data-gsap-steps]")) return;
                  gsap.fromTo(
                    el,
                    { y: 32, opacity: 0 },
                    {
                      y: 0,
                      opacity: 1,
                      ease: "none",
                      scrollTrigger: {
                        trigger: el,
                        start: `top ${96 - Math.min(i, 5) * 2}%`,
                        end: "top 64%",
                        scrub: 0.4,
                      },
                    }
                  );
                });
            });
        });
      }
    );
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

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
      {/* Mobiler Sticky-CTA braucht unten Freiraum, sonst überdeckt er die
          letzten Footer-/SEO-Links (Audit 2026-08-25). */}
      <main className="pb-24 md:pb-0">
        <LandingHero
          value={heroBusinessName}
          onChange={setHeroBusinessName}
          onSubmit={handleHeroStart}
        />
        {/* Dramaturgie (Spec §4): Anker direkt unterm Hero, dann Problem
            (Verlustaversion), Ablauf, Selbstidentifikation über die
            Designrichtungen, Extras als Wertaufbau — erst danach der Preis. */}
        <ProofBar />
        <ProblemSection billingYearly={billingYearly} />
        <HowItWorks />
        <PackShowcase />
        <FeatureShowcase />
        <Pricing
          billingYearly={billingYearly}
          onBillingChange={setBillingYearly}
        />
        {/* Vertrauens-Bühne nach dem Preis, vor der FAQ (Referenz:
            snaplove.de) — wer den Preis gesehen hat, braucht als Nächstes
            Sicherheit, nicht noch mehr Features. */}
        <TrustSection />
        {/* Rendert nichts, solange keine echten Stimmen eingetragen sind
            (Testimonials.tsx) — Struktur bereit für P3. */}
        <Testimonials />
        {/* SEO-Branchenlinks vor FAQ/Schluss-CTA; der dunkle FinalCta bleibt
            damit der letzte inhaltliche Moment der Seite. */}
        <IndustryLinks />
        <Faq />
        <FinalCta
          value={heroBusinessName}
          onChange={setHeroBusinessName}
          onSubmit={handleHeroStart}
        />
      </main>
      <LandingFooter />
      <StickyCta billingYearly={billingYearly} />
      <DeferredChatWidget />
    </div>
  );
}
