import React, { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { SectionHead } from "./primitives";

/**
 * Ablauf-Sektion (Spec §4.5): vier Schritte als 2×2-Grid, jeder mit einem
 * gezeichneten Mini-Visual im Nachtschicht-Stil — gezeigt statt versprochen.
 * Schritt 3 trägt das frühere StudioProof-Motiv (Checkliste links, live
 * rechts); StudioProof als eigene Sektion ist damit aufgelöst.
 */

/** Schritt 1: Suchfeld mit G-Punkt und getipptem Namen. */
function VisualSearch() {
  return (
    <div className="flex h-full items-center px-6">
      <div className="flex w-full items-center gap-2.5 rounded-xl border border-lp-line bg-lp-panel-2 px-4 py-3">
        <span className="font-[family-name:var(--lp-mono)] text-[0.8rem] font-medium text-lp-volt">
          G
        </span>
        <span className="lph-line h-2 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

/** Schritt 2: drei Richtungs-Karten, die mittlere gewählt. */
function VisualStyles() {
  return (
    <div className="flex h-full items-center justify-center gap-3 px-6">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`h-14 w-12 rounded-lg border ${
            i === 1
              ? "lph-select border-lp-volt bg-lp-panel-2"
              : "border-lp-line bg-lp-panel"
          }`}
        >
          <span
            className={`mt-2.5 ml-2 block h-1.5 w-6 rounded-full ${
              i === 1 ? "bg-[var(--lp-volt)]" : "bg-[rgba(255,255,255,0.18)]"
            }`}
          />
          <span className="mt-1.5 ml-2 block h-1 w-4 rounded-full bg-[rgba(255,255,255,0.12)]" />
        </span>
      ))}
    </div>
  );
}

/** Schritt 3: Checkliste links, Mini-Browser rechts (StudioProof-Motiv). */
function VisualStudio() {
  return (
    <div className="flex h-full items-center justify-center gap-4 px-6">
      <div className="flex flex-col gap-2">
        {[true, true, false].map((done, i) => (
          <span key={i} className="flex items-center gap-2">
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full ${
                done
                  ? "bg-[var(--lp-volt)] text-lp-volt-ink"
                  : "lph-check border border-lp-line"
              }`}
            >
              {done ? (
                <Check className="h-2.5 w-2.5" aria-hidden="true" />
              ) : null}
            </span>
            <span className="h-1.5 w-14 rounded-full bg-[rgba(255,255,255,0.16)]" />
          </span>
        ))}
      </div>
      <span className="block h-16 w-20 overflow-hidden rounded-lg border border-lp-line bg-lp-panel-2">
        <span className="block h-3 border-b border-lp-line" />
        <span className="mt-2 ml-2 block h-1.5 w-10 rounded-full bg-[rgba(255,255,255,0.18)]" />
        <span className="mt-1.5 ml-2 block h-4 w-14 rounded bg-[rgba(255,255,255,0.08)]" />
      </span>
    </div>
  );
}

/** Schritt 4: Freischalt-Toggle + Live-Punkt. */
function VisualLive() {
  return (
    <div className="flex h-full items-center justify-center gap-4 px-6">
      <span className="flex h-7 w-12 items-center rounded-full bg-[var(--lp-volt)] px-1">
        <span className="lph-knob ml-auto block h-5 w-5 rounded-full bg-lp-volt-ink" />
      </span>
      <span className="inline-flex items-center gap-2 font-[family-name:var(--lp-mono)] text-[0.72rem] font-medium tracking-[0.06em] text-lp-ink">
        <span
          className="lph-pulse h-2 w-2 rounded-full bg-lp-live"
          aria-hidden="true"
        />
        LIVE
      </span>
    </div>
  );
}

const STEPS = [
  {
    title: "Firmenname eingeben – oder Google-Profil übernehmen",
    text: "Name, Adresse, Öffnungszeiten, Fotos und Bewertungen werden automatisch übernommen.",
    visual: <VisualSearch />,
  },
  {
    title: "Designrichtung bestimmen",
    text: "Pageblitz startet mit einer kuratierten Richtung; Farben, Schriften und Bildwirkung passt du an.",
    visual: <VisualStyles />,
  },
  {
    title: "Texte und Bilder prüfen",
    text: "Links die Checkliste, rechts deine Website — live. Die KI hilft beim Formulieren.",
    visual: <VisualStudio />,
  },
  {
    title: "Freischalten – und live",
    text: "Gefällt dir die Vorschau, schaltest du sie mit einem Klick unter deiner Domain frei.",
    visual: <VisualLive />,
  },
] as const;

const INCLUDED = [
  [
    "Sofort fertige Texte",
    "Leistungen, Über uns und Seitentitel – passend zur Branche.",
  ],
  [
    "Auf jedem Handy gut",
    "Die Website passt sich automatisch an – ohne dein Zutun.",
  ],
  [
    "Eigene Domain",
    "Bestehende Domain verbinden oder .pageblitz.de-Subdomain nutzen.",
  ],
] as const;

export function HowItWorks() {
  const listRef = useRef<HTMLOListElement>(null);

  // GSAP-Choreografie (User-Wunsch 2026-08-29): Die vier Karten bouncen
  // nacheinander herein; jede neue Karte „stößt" die vorherige kurz an
  // (Nudge + elastisches Zurückfedern). GSAP wird erst beim Annähern der
  // Sektion dynamisch geladen (nicht im LCP-Pfad, Performance-Budget).
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const cards = Array.from(list.children) as HTMLElement[];
    cards.forEach(c => {
      c.style.opacity = "0";
    });
    let cancelled = false;
    const io = new IntersectionObserver(
      entries => {
        if (!entries.some(e => e.isIntersecting)) return;
        io.disconnect();
        import("gsap").then(({ gsap }) => {
          if (cancelled) return;
          const tl = gsap.timeline();
          cards.forEach((card, i) => {
            tl.fromTo(
              card,
              { y: 90, opacity: 0, rotate: i % 2 ? 3.5 : -3.5 },
              {
                y: 0,
                opacity: 1,
                rotate: 0,
                duration: 0.7,
                ease: "back.out(1.6)",
              },
              i * 0.24
            );
            if (i > 0) {
              // Der Neuankömmling schubst den Nachbarn an …
              tl.to(
                cards[i - 1],
                { x: -14, rotate: -1.6, duration: 0.14, ease: "power2.out" },
                i * 0.24 + 0.3
              );
              // … der elastisch zurückfedert.
              tl.to(
                cards[i - 1],
                {
                  x: 0,
                  rotate: 0,
                  duration: 0.6,
                  ease: "elastic.out(1, 0.35)",
                },
                i * 0.24 + 0.44
              );
            }
          });
        });
      },
      { threshold: 0.25 }
    );
    io.observe(list);
    return () => {
      cancelled = true;
      io.disconnect();
      cards.forEach(c => {
        c.style.opacity = "";
      });
    };
  }, []);

  return (
    <section
      id="ablauf"
      aria-labelledby="lp-how-heading"
      className="lp-section lp-band border-t border-lp-line"
    >
      <div className="lp-container">
        <SectionHead
          id="lp-how-heading"
          kicker="So funktioniert's"
          title="Vier Schritte. Keine Technik."
          text="Das Studio führt dich in der Reihenfolge, in der auch eine Agentur arbeiten würde – nur in Minuten statt Wochen."
        />

        <ol
          ref={listRef}
          data-gsap-steps
          className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="overflow-hidden rounded-2xl border border-lp-line"
            >
              <div aria-hidden="true" className="h-[7.5rem] bg-lp-panel">
                {step.visual}
              </div>
              <div className="p-6">
                <p className="lp-kicker" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-[1.12rem] font-bold leading-[1.25] tracking-[-0.015em] text-lp-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[0.93rem] leading-[1.5] text-lp-muted">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-6 border-t border-lp-line pt-8 md:grid-cols-3">
          {INCLUDED.map(([title, text]) => (
            <div key={title}>
              <h3 className="text-[1rem] font-bold text-lp-ink">{title}</h3>
              <p className="mt-1.5 text-[0.9rem] leading-[1.5] text-lp-muted">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
