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
  | "list"
  | "drop"
  | "scissors"
  | "paw"
  | "heart"
  | "check"
  | "plus"
  | "minus"
  | "music"
  | "book"
  | "sparkle"
  | "home"
  | "cone"
  | "people"
  | "smile";

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
  drop: <path d="M12 3.5s-6 6.6-6 11a6 6 0 0 0 12 0c0-4.4-6-11-6-11z" />,
  scissors: (
    <>
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <path d="M8.6 8l11.4 9M8.6 16L20 7" />
    </>
  ),
  paw: (
    <>
      <circle cx="7" cy="10" r="1.8" />
      <circle cx="10.5" cy="6.5" r="1.8" />
      <circle cx="14.5" cy="6.5" r="1.8" />
      <circle cx="18" cy="10" r="1.8" />
      <path d="M12 12c-2.8 0-5 3.6-5 5.6 0 1.6 1.4 2.4 2.8 2l2.2-.6 2.2.6c1.4.4 2.8-.4 2.8-2 0-2-2.2-5.6-5-5.6z" />
    </>
  ),
  heart: (
    <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  music: (
    <>
      <path d="M9 17.5V5l10-2v12" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="15" r="2.5" />
    </>
  ),
  book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />,
  sparkle: (
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
  ),
  home: <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" />,
  cone: (
    <>
      <circle cx="12" cy="8" r="4.5" />
      <path d="M7.8 10.5L12 21l4.2-10.5" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="16.5" cy="9" r="2.3" />
      <path d="M3.5 19c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5M14.5 14.3c2.6-.4 4.9 1 5.5 4.2" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 14c1.8 2 5.2 2 7 0M9 9.5h.01M15 9.5h.01" />
    </>
  ),
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
