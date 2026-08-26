import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Wordmark, pillInk, startHref } from "./primitives";

const NAV_LINKS = [
  { label: "Design", href: "#showcase" },
  { label: "Ablauf", href: "#ablauf" },
  { label: "Preise", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

/**
 * Sticky Navigation: transparent auf dem Canvas, nach dem ersten Scrollen
 * Surface mit Hairline. Mobile: Vollflächen-Menü (aria-expanded/-controls,
 * Escape schließt, Fokus geht zurück auf den Auslöser, Body scrollt nicht).
 */
export function LandingNav({ billingYearly }: { billingYearly: boolean }) {
  const [, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);
  const goStart = () => {
    close();
    navigate(startHref(billingYearly));
  };

  const mobileMenu = isOpen ? (
    <div
      id="lp-mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
      className="fixed inset-x-0 bottom-0 top-[4.25rem] z-[45] overflow-y-auto overscroll-contain bg-lp-canvas md:hidden"
    >
      <div className="lp-container flex min-h-full flex-col pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        {NAV_LINKS.map((link, index) => (
          <a
            key={link.href}
            ref={index === 0 ? firstLinkRef : undefined}
            href={link.href}
            onClick={close}
            className="border-b border-lp-line py-5 text-[1.6rem] font-medium tracking-[-0.01em] text-lp-ink"
          >
            {link.label}
          </a>
        ))}
        <a
          href="/login"
          onClick={event => {
            event.preventDefault();
            close();
            navigate("/login");
          }}
          className="border-b border-lp-line py-5 text-[1.1rem] text-lp-muted"
        >
          Anmelden
        </a>
        <button
          type="button"
          onClick={goStart}
          className={`${pillInk} mt-8 h-14 w-full text-[1.05rem]`}
        >
          Website kostenlos erstellen
        </button>
      </div>
    </div>
  ) : null;

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color] duration-300 ${
        isScrolled || isOpen
          ? "border-b border-lp-line bg-lp-surface/95 backdrop-blur-[2px]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Hauptnavigation"
        className="lp-container flex h-[4.25rem] items-center justify-between gap-6"
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
          <Wordmark />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-3.5 py-2 text-[0.95rem] text-lp-muted transition-colors hover:text-lp-ink"
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
            className="rounded-full px-3.5 py-2 text-[0.95rem] text-lp-muted transition-colors hover:text-lp-ink"
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
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-lp-ink md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileMenu && createPortal(mobileMenu, document.body)}
    </header>
  );
}
