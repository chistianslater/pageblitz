import React from "react";

/**
 * Symbole für Klar — lokal als Inline-SVG (kein CDN, kein Font), Linie
 * in `currentColor`, immer `aria-hidden`: Die Bedeutung trägt der Text
 * daneben. Strichführung nach Art der Tabler-Symbole (MIT), vereinfacht.
 */
export type IconName =
  | "phone"
  | "calendar"
  | "clock"
  | "moon"
  | "card"
  | "car"
  | "wheelchair"
  | "check"
  | "menu"
  | "pin"
  | "mail";

const PATHS: Record<IconName, React.ReactNode> = {
  phone: (
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M4 11h16M9.5 16l2 2 3.5-3.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />,
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10.5" r="2" />
      <path d="M15 9h3M15 13h3M6 16c.6-1.4 1.7-2 3-2s2.4.6 3 2" />
    </>
  ),
  car: (
    <>
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2M15 17H9M3 11h15M12 11V6" />
    </>
  ),
  wheelchair: (
    <>
      <circle cx="11" cy="4.5" r="1.5" />
      <path d="M11 7.5V15h4.5l3 4M11 11h5M8 10.5a5 5 0 1 0 6.5 7" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  pin: (
    <>
      <circle cx="12" cy="10" r="2.5" />
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="kl-ic"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

/** Symbol zu einem Weg (Anruf, Karte, E-Mail, sonst Termin). */
export function wayIcon(href: string): IconName {
  if (href.startsWith("tel:")) return "phone";
  if (href.startsWith("mailto:")) return "mail";
  if (href.startsWith("https://www.google.com/maps/")) return "pin";
  return "calendar";
}

