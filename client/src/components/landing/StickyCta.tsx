import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { pillPrimary, startHref } from "./primitives";

/**
 * Sticky Bottom-CTA (nur Mobilgeräte, Conversion-Pass 2026-08-25): Sobald
 * der Hero weggescrollt ist, verschwindet jeder Handlungsaufruf aus dem
 * Blick — mobil ist das der Großteil des Traffics. Die Leiste blendet
 * nach Verlassen des Heros ein und versteckt sich wieder, sobald der
 * Schluss-CTA („Deine Website wartet") im Viewport ist (dort wäre sie
 * doppelt).
 *
 * Desktop bleibt freiwillig frei davon (md:hidden) — dort ist der nächste
 * CTA nie weit. Kein Einblenden bei prefers-reduced-motion: die Leiste
 * ist dann einfach statisch da (Sichtbarkeitslogik unverändert).
 */
export function StickyCta({ billingYearly }: { billingYearly: boolean }) {
  const [, navigate] = useLocation();
  const [visible, setVisible] = useState(false);
  const [atFinalCta, setAtFinalCta] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".lp-h1--hero");
    const finalCta = document.getElementById("lp-final-heading");
    if (!("IntersectionObserver" in window)) return;

    const heroIo = new IntersectionObserver(
      entries => setVisible(!entries[0]?.isIntersecting),
      { threshold: 0 }
    );
    if (hero) heroIo.observe(hero.closest("section") ?? hero);

    let finalIo: IntersectionObserver | undefined;
    if (finalCta) {
      finalIo = new IntersectionObserver(
        entries => setAtFinalCta(Boolean(entries[0]?.isIntersecting)),
        { threshold: 0 }
      );
      finalIo.observe(finalCta.closest("section") ?? finalCta);
    }
    return () => {
      heroIo.disconnect();
      finalIo?.disconnect();
    };
  }, []);

  const show = visible && !atFinalCta;
  return (
    <div
      ref={barRef}
      aria-hidden={!show}
      className={`lp-sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-lp-line bg-lp-surface/95 backdrop-blur-[2px] md:hidden ${
        show ? "lp-sticky-cta--on" : ""
      }`}
    >
      <div className="flex items-center gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.85rem] font-medium">
            Website in 3 Minuten
          </p>
          <p className="text-[0.75rem] text-lp-muted">
            7 Tage gratis · keine Kreditkarte
          </p>
        </div>
        <button
          type="button"
          tabIndex={show ? 0 : -1}
          onClick={() => navigate(startHref(billingYearly))}
          className={`${pillPrimary} !h-11 shrink-0 px-5 text-[0.9rem]`}
        >
          Kostenlos erstellen
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
