import React, { type ReactNode } from "react";
import { PRICING, formatEuro } from "@shared/pricing";

/**
 * Gemeinsame Bausteine der Landingpage (Studio-Look): Marke, Kicker, CTA-
 * Pillen, Preis-Formatierung. Tokens/Klassen siehe `.lp` in
 * client/src/index.css.
 */

/** Blitz-Marke: ein Pfad, Ink-Quadrat, keine Verläufe. */
export function BlitzMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-lp-ink text-white ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="currentColor">
        <path d="M13.6 2 4.8 13.4h6.1L9.6 22l9.6-12.2h-6.2z" />
      </svg>
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BlitzMark />
      <span className="text-[1.05rem] font-medium tracking-[-0.02em]">
        Pageblitz
      </span>
    </span>
  );
}

export function Kicker({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`lp-kicker ${className}`}>{children}</p>;
}

/** Sektionskopf: Kicker + H2 + optionaler Text, linksbündig, schmal. */
export function SectionHead({
  kicker,
  title,
  text,
  id,
  className = "",
}: {
  kicker?: string;
  title: ReactNode;
  text?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={`max-w-[44rem] ${className}`}>
      {kicker ? <Kicker className="mb-4">{kicker}</Kicker> : null}
      <h2 id={id} className="lp-h2">
        {title}
      </h2>
      {text ? (
        <p className="mt-5 max-w-[32rem] text-[1.05rem] leading-[1.6] text-lp-muted">
          {text}
        </p>
      ) : null}
    </div>
  );
}

const PILL =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-medium transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.98] disabled:opacity-50";

export const pillPrimary = `${PILL} bg-lp-ink text-lp-canvas hover:bg-[#2f2f2f]`;
export const pillInk = `${PILL} bg-lp-ink text-lp-canvas hover:bg-[#2f2f2f]`;
export const pillGhost = `${PILL} border border-lp-ink/20 bg-white text-lp-ink hover:border-lp-ink`;

/** Text-Link: Mint-Unterstreichung statt Studio-Grün. */
export const textLink =
  "inline-flex items-center gap-1 font-medium text-lp-ink underline decoration-[var(--lp-mint)] decoration-2 underline-offset-[0.22em] transition-colors hover:bg-[var(--lp-mint)]";

/** Preise nur aus shared/pricing.ts. */
export const PRICE_YEARLY = formatEuro(PRICING.base.yearly); // „19,90 €"
export const PRICE_MONTHLY = formatEuro(PRICING.base.monthly); // „24,90 €"

export function startHref(billingYearly: boolean): string {
  return `/start?billing=${billingYearly ? "yearly" : "monthly"}`;
}
