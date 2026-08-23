import { useState, type FormEvent } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { useLocation } from "wouter";
import LandingPageChatWidget from "@/components/LandingPageChatWidget";
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
 * `LazyMotion` bleibt, weil `LandingPageChatWidget` `m`-Komponenten nutzt;
 * die Seite selbst animiert nur die Hero-Checkliste (CSS, StudioFrame.tsx).
 */
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
    <LazyMotion features={domAnimation}>
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
        <LandingPageChatWidget />
      </div>
    </LazyMotion>
  );
}
