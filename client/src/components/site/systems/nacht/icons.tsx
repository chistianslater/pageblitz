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
  | "external"
  | "leaf"
  | "paw"
  | "access"
  | "car"
  | "card"
  | "clock"
  | "cup"
  | "info";

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
  leaf: (
    <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7" />
  ),
  paw: (
    <>
      <circle cx="6.5" cy="10" r="1.6" />
      <circle cx="10" cy="6.5" r="1.6" />
      <circle cx="14" cy="6.5" r="1.6" />
      <circle cx="17.5" cy="10" r="1.6" />
      <path d="M8 17.5c0-3 2-5.5 4-5.5s4 2.5 4 5.5c0 1.8-1.8 2.3-4 1.8s-4 .2-4-1.8z" />
    </>
  ),
  access: (
    <>
      <circle cx="12" cy="4.5" r="1.5" />
      <path d="M12 7.5v6h4.5l2 5M12 10.5h4M9.5 11a5 5 0 1 0 6 7" />
    </>
  ),
  car: (
    <>
      <path d="M4 16v-4l2-5h12l2 5v4zM4 12h16" />
      <path d="M7 16v2M17 16v2M7.5 14h.01M16.5 14h.01" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="1" />
      <path d="M3 10h18M7 15h4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  cup: (
    <path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M11 3v3" />
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 11v5M12 8v.01" />
    </>
  ),
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
