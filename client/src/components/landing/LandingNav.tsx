import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { trapTabKey } from "@/components/site/islands/focusTrap";
import { Wordmark, pillInk, startHref } from "./primitives";

const NAV_LINKS = [
  { label: "Design", href: "#showcase" },
  { label: "Ablauf", href: "#ablauf" },
  { label: "Preise", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

/**
 * Sticky Navigation: transluzente Pill (backdrop-filter), Inhalt scrollt
 * darunter. Gewicht nimmt beim Scrollen leicht zu.
 *
 * Mobile: Vollflächen-Dialog per Portal auf document.body. Der Close-Button
 * sitzt IM Overlay (nicht im sticky Header). `overflow:hidden` am Body
 * hebt position:sticky auf — nach dem Scrollen lag das Header-X damit
 * außerhalb des Viewports und das Menü ließ sich nicht mehr schließen.
 * Escape, Link-Tap, Overlay-X und Body-Scroll-Lock (iOS: position:fixed).
 * Horizontales Padding über `.lp-mobile-menu-gutter` (nicht `.lp-container`):
 * das Portal liegt außerhalb von `.lp`, wo `--lp-gutter` früher nicht galt.
 */
export function LandingNav({ billingYearly }: { billingYearly: boolean }) {
  const [, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const afterCloseRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setIsOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyCss = body.style.cssText;
    const pageRoot = document.querySelector(".lp");
    const prevInert =
      pageRoot instanceof HTMLElement ? pageRoot.inert : false;

    html.classList.add("lp-nav-open");
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    // iOS scrollt trotz overflow:hidden weiter; position:fixed friert die
    // Seite ein, ohne dass der sticky Header aus dem Viewport rutscht
    // (Close liegt ohnehin im Overlay).
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = `-${scrollX}px`;
    body.style.right = "0";
    body.style.width = "100%";
    if (pageRoot instanceof HTMLElement) pageRoot.inert = true;

    closeRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }
      const dialog = dialogRef.current;
      if (dialog) trapTabKey(event, dialog);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      html.classList.remove("lp-nav-open");
      html.style.overflow = prevHtmlOverflow;
      body.style.cssText = prevBodyCss;
      if (pageRoot instanceof HTMLElement) pageRoot.inert = prevInert;
      window.scrollTo(scrollX, scrollY);
      const after = afterCloseRef.current;
      afterCloseRef.current = null;
      after?.();
      if (!after) {
        toggleRef.current?.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  const close = useCallback(
    (after?: () => void) => {
      if (!isOpen) {
        after?.();
        return;
      }
      afterCloseRef.current = after ?? null;
      setIsOpen(false);
    },
    [isOpen]
  );

  const goStart = () => {
    close(() => navigate(startHref(billingYearly)));
  };

  const goHash =
    (href: (typeof NAV_LINKS)[number]["href"]) =>
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const id = href.slice(1);
      close(() => {
        document.getElementById(id)?.scrollIntoView();
        history.replaceState(null, "", href);
      });
    };

  const mobileMenu =
    // Eigenes Gutter statt `.lp-container`: Portal hängt an document.body,
    // außerhalb von `.lp` — dort war `--lp-gutter` undefined und Padding 0.
    isOpen && typeof document !== "undefined" ? (
      <div
        ref={dialogRef}
        id="lp-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="fixed inset-0 z-[100] flex flex-col bg-lp-canvas md:hidden lp"
      >
        <div className="lp-mobile-menu-gutter flex h-[4.25rem] shrink-0 items-center justify-between border-b border-lp-line">
          <a
            href="/"
            className="rounded-md"
            aria-label="Pageblitz – Startseite"
            onClick={event => {
              event.preventDefault();
              close(() => window.scrollTo({ top: 0 }));
            }}
          >
            <Wordmark markClassName="text-lp-volt" />
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={() => close()}
            aria-label="Menü schließen"
            className="lp-press inline-flex h-11 w-11 items-center justify-center rounded-full text-lp-ink"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div
          className="lp-mobile-menu-gutter flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]"
          onClick={event => {
            if (event.target === event.currentTarget) close();
          }}
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={goHash(link.href)}
              className="border-b border-lp-line py-5 text-[1.6rem] font-medium tracking-[-0.01em] text-lp-ink"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/login"
            onClick={event => {
              event.preventDefault();
              close(() => navigate("/login"));
            }}
            className="border-b border-lp-line py-5 text-[1.1rem] text-lp-muted"
          >
            Anmelden
          </a>
          <button
            type="button"
            onClick={goStart}
            className={`${pillInk} mt-10 h-14 w-full text-[1.05rem]`}
          >
            Website kostenlos erstellen
          </button>
        </div>
      </div>
    ) : null;

  return (
    <header
      className={`sticky top-0 z-50 px-[var(--lp-gutter,1.5rem)] pt-3 pb-2 ${
        isOpen ? "invisible" : ""
      }`}
    >
      <nav
        aria-label="Hauptnavigation"
        className="lp-nav-pill mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 rounded-2xl px-4 sm:px-5"
        data-scrolled={isScrolled || undefined}
      >
        <a
          href="/"
          className="rounded-md"
          aria-label="Pageblitz – Startseite"
          onClick={event => {
            event.preventDefault();
            close();
            window.scrollTo({ top: 0 });
          }}
        >
          <Wordmark markClassName="text-lp-volt" />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                className="lp-nav-link rounded-full px-3.5 py-2 text-[0.9rem] font-medium text-lp-muted"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="/login"
            onClick={event => {
              event.preventDefault();
              navigate("/login");
            }}
            className="lp-nav-link rounded-full px-3.5 py-2 text-[0.9rem] font-medium text-lp-muted"
          >
            Anmelden
          </a>
          <button
            type="button"
            onClick={goStart}
            className={`${pillInk} !h-10 px-5 text-[0.9rem]`}
          >
            Kostenlos erstellen
          </button>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setIsOpen(v => !v)}
          aria-label={isOpen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={isOpen}
          aria-controls="lp-mobile-menu"
            className="lp-press -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-lp-ink md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </header>
  );
}
