import type { ReactNode } from "react";
import { Wordmark } from "@/components/landing/primitives";

interface LoginShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Gemeinsame Auth-Chrome für Kunden- und Mitarbeiterzugang. */
export function LoginShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: LoginShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-lp-canvas p-4 text-lp-ink sm:p-6">
      <div className="w-full max-w-md">
        <a
          href="/"
          aria-label="Pageblitz Startseite"
          className="mb-8 inline-flex rounded-md"
        >
          <Wordmark />
        </a>

        <section className="rounded-[16px] border border-lp-line bg-lp-surface p-6 shadow-[0_28px_60px_-42px_rgba(29,26,23,0.55)] sm:p-8">
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
