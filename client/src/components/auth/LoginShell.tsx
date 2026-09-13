import React, { type ReactNode } from "react";
import { Wordmark } from "@/components/landing/primitives";

interface LoginShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Gemeinsame Auth-Chrome für Kunden- und Mitarbeiterzugang.
 *
 * `lp lp-light`: `.lp` allein ist die dunkle Nachtschicht-Fassung. Seit dem
 * Klarstart-Relaunch ist die Landing hell — der Login kam aus einer weissen
 * Seite und schlug dunkel auf. `.lp-light` (client/src/index.css) schiebt die
 * Klarstart-Palette unter dieselben Token-Namen.
 */
export function LoginShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: LoginShellProps) {
  return (
    <main className="lp lp-light flex min-h-screen items-center justify-center bg-lp-canvas p-4 text-lp-ink sm:p-6">
      <div className="w-full max-w-md">
        <a
          href="/"
          aria-label="Pageblitz Startseite"
          className="mx-auto mb-8 flex w-fit rounded-md"
        >
          <Wordmark />
        </a>

        <section className="rounded-[16px] border border-lp-line bg-lp-surface p-6 shadow-[0_30px_70px_-40px_rgba(36,36,36,0.45)] sm:p-8">
          <p className="lp-kicker mb-3">{eyebrow}</p>
          <h1 className="text-[1.75rem] font-medium leading-tight tracking-[-0.02em]">
            {title}
          </h1>
          <p className="mt-3 text-[0.95rem] leading-[1.6] text-lp-muted">
            {description}
          </p>
          <div className="mt-7">{children}</div>
        </section>

        {footer && (
          <div className="mt-6 text-center text-[0.85rem] text-lp-muted">
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}
