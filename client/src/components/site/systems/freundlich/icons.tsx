import React from "react";

/**
 * Symbole für Freundlich — Inline-SVG (kein CDN, kein Font), runde Linie in
 * `currentColor` (Phosphor-Regular-Anmutung des Systemblatts), immer
 * `aria-hidden`: Die Bedeutung trägt der Text daneben.
 */
export type IconName =
  | "phone"
  | "calendar"
  | "mail"
  | "route"
  | "pin"
  | "arrow"
  | "external"
  | "clock"
  | "star"
  | "access"
  | "bag"
  | "leaf"
  | "cup"
  | "truck"
  | "sun"
  | "list";

const PATHS: Record<IconName, React.ReactNode> = {
  phone: (
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M4 10h16M12 13v5M9.5 15.5h5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  route: <path d="M4 11l16-7-7 16-2-7z" />,
  pin: (
    <>
      <path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  external: <path d="M7 17L17 7M9 7h8v8" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  star: (
    <path d="M12 3.6l2.55 5.17 5.7.83-4.13 4.02.98 5.68L12 16.62l-5.1 2.68.98-5.68-4.13-4.02 5.7-.83z" />
  ),
  access: (
    <>
      <circle cx="12" cy="4.5" r="1.5" />
      <path d="M12 7.5v6h4.5l2 5M12 10.5h4M9.5 11a5 5 0 1 0 6 7" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  leaf: <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7" />,
  cup: (
    <path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M11 3v3" />
  ),
  truck: (
    <>
      <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  list: <path d="M4 7h16M4 12h16M4 17h16" />,
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="fr-ic"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
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
  if (href.startsWith("https://www.google.com/maps/")) return "route";
  if (/^https?:\/\//i.test(href)) return "external";
  return "calendar";
}
