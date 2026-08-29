import { useEffect, useRef, useState } from "react";
import { SEO_INDUSTRY_LINKS } from "@shared/seoIndustryLinks";

/**
 * Proof-Leiste direkt unter dem Hero (Conversion-Pass 2026-08-25): Die
 * Seite hatte bis hierhin keinerlei Belege — für die skeptische
 * Zielgruppe (lokale Betriebe) ist das der Conversion-Killer schlechthin.
 *
 * Bewusst NUR verifizierbare Produkt-Fakten (3 Minuten, Design-Flexibilität,
 * Branchenabdeckung aus SEO_INDUSTRY_LINKS, 0 € Einrichtung) — keine
 * erfundenen Kundenzahlen oder Testimonials (wettbewerbsrechtlich
 * angreifbar). Echte Bewertungen können später nachgereicht werden.
 *
 * Die Zahlen zählen beim Hereinscrollen hoch (ease-out); bei
 * `prefers-reduced-motion: reduce` steht sofort der Endwert.
 */
const EASE_DURATION_MS = 1200;

/** easeOutCubic: schneller Start, weiches Auslaufen — liest sich „lebendig" ohne Hektik. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Reiner Zähler-Schritt: aus Fortschritt (0..1) den Anzeigewert runden. */
export function counterValue(target: number, progress: number): number {
  return Math.round(target * easeOutCubic(Math.min(1, Math.max(0, progress))));
}

function CountUp({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    if (!("IntersectionObserver" in window)) {
      setValue(target);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const step = (now: number) => {
          const progress = (now - t0) / EASE_DURATION_MS;
          setValue(counterValue(target, progress));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

interface ProofItem {
  target?: number;
  value?: string;
  suffix: string;
  label: string;
}

export function ProofBar() {
  const items: ProofItem[] = [
    { target: 3, suffix: " Min.", label: "bis zur fertigen Vorschau" },
    {
      value: "Flexibel",
      suffix: "",
      label: "Farben, Schriften und Aufbau",
    },
    {
      target: SEO_INDUSTRY_LINKS.length,
      suffix: "",
      label: "Branchenwissen integriert",
    },
    {
      value: "Keine",
      suffix: "",
      label: "Kreditkarte für die Vorschau",
    },
  ];
  return (
    <section
      aria-label="Pageblitz in Zahlen"
      className="lp-section border-t border-lp-line !py-10"
    >
      <dl className="lp-container grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {items.map(item => (
          <div key={item.label}>
            <dt className="order-2 mt-1 text-[0.9rem] leading-snug text-lp-muted">
              {item.label}
            </dt>
            <dd className="lp-display order-1 text-[clamp(2.6rem,1.7rem+2.8vw,4rem)] leading-none">
              {item.target !== undefined ? (
                <CountUp target={item.target} />
              ) : (
                item.value
              )}
              {item.suffix}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
