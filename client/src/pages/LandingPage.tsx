import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { ProofBar } from "@/components/landing/ProofBar";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ForWhom } from "@/components/landing/ForWhom";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StudioProof } from "@/components/landing/StudioProof";
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
 * Die Seite selbst animiert die Hero-Bühne (HeroBuild.tsx: Wireframe-
 * Aufbau → fertige Website, Timer + CSS-Transitions); framer-motion
 * braucht nur der Chat-Widget — der lädt lazy (s. u.) und bringt sein
 * eigenes `LazyMotion` mit Async-Feature-Loader mit.
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

  // Scroll-Reveal per IntersectionObserver (2026-08-25): Die CSS-only
  // Variante mit `animation-timeline: view()` lief in Safari < 26 und
  // älterem Firefox schlicht nicht — dort blieb die Seite komplett
  // statisch. Die versteckende Klasse `lp-reveal-on` wird nur per JS
  // gesetzt (kein JS = alles sichtbar); bei prefers-reduced-motion:
  // reduce bleibt die Seite statisch.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    if (!("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("lp-reveal-on");
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lp-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    document.querySelectorAll(".lp-section").forEach(el => io.observe(el));
    return () => {
      io.disconnect();
      document.documentElement.classList.remove("lp-reveal-on");
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
      <main>
        <LandingHero
          value={heroBusinessName}
          onChange={setHeroBusinessName}
          onSubmit={handleHeroStart}
        />
        {/* Conversion-Pass 2026-08-25: Belege (ProofBar) und Problem-
            Aktivierung stehen vor den Branchen-Kacheln — erst Vertrauen
            und Dringlichkeit aufbauen, dann das Produkt zeigen. */}
        <ProofBar />
        <ProblemSection billingYearly={billingYearly} />
        <ForWhom />
        <HowItWorks billingYearly={billingYearly} />
        {/* „Beweis statt Behauptung" (User-Entscheid 2026-08-25): Nach dem
            erklärten Ablauf das echte Werkzeug zeigen — echte Studio-
            Screenshots statt Illustrationen. */}
        <StudioProof billingYearly={billingYearly} />
        <PackShowcase />
        {/* Feature-Bühnen VOR dem Preis (Conversion-Pass 2): Die Extras
            verkaufen das Abo indirekt, bevor der Preis fällt. */}
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
        <Faq />
        <FinalCta
          value={heroBusinessName}
          onChange={setHeroBusinessName}
          onSubmit={handleHeroStart}
        />
        <IndustryLinks />
      </main>
      <LandingFooter />
      <StickyCta billingYearly={billingYearly} />
      <DeferredChatWidget />
    </div>
  );
}
