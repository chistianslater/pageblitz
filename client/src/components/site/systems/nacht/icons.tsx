import React from "react";

/**
 * Symbole für Nacht — lokal als Inline-SVG (kein CDN, kein Font), dünne
 * Linie in `currentColor` (Phosphor-Light-Anmutung des Systemblatts),
 * immer `aria-hidden`: Die Bedeutung trägt der Text daneben.
 */
export type IconName =
  | "phone"
  | "calendar"
  | "mail"
  | "pin"
  | "arrow"
  | "external";

const PATHS: Record<IconName, React.ReactNode> = {
  phone: (
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="1" />
      <path d="M16 3v4M8 3v4M4 11h16M9.5 16l2 2 3.5-3.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  pin: <path d="M4 11l16-7-7 16-2-7z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  external: <path d="M7 17L17 7M9 7h8v8" />,
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="nc-ic"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

/** Symbol zu einem Weg (Anruf, Karte, E-Mail, Buchungslink, sonst Termin). */
export function wayIcon(href: string): IconName {
  if (href.startsWith("tel:")) return "phone";
  if (href.startsWith("mailto:")) return "mail";
  if (href.startsWith("https://www.google.com/maps/")) return "pin";
  if (/^https?:\/\//i.test(href)) return "external";
  return "calendar";
}
