import React from "react";
import type { NavItem } from "./engine";

/**
 * Geteiltes mobiles Navigationsmenü aller 14 Packs (Stilvorlagen-Audit
 * P1/P2): CSS-only über <details>/<summary>, weil die Pack-Bäume im
 * SSR-HTML der Kundenseiten nie hydriert werden (nur die Inseln tun das)
 * — das Menü muss komplett ohne JS funktionieren. <summary> bringt
 * Button-Rolle und Expanded-State nativ in den A11y-Tree, deshalb bewusst
 * KEIN aria-expanded: das läge ohne JS nach dem ersten Toggle falsch.
 *
 * Sichtbarkeit: Desktop bekommt die Pack-eigene Inline-Nav
 * (`.pb-XX-nav-links`), die jedes Pack unter 720px selbst auf
 * `display:none` setzt; dieses Menü ist umgekehrt nur ≤720px sichtbar
 * (MOBILE_NAV_CSS). Das Theming läuft über die Pack-CSS-Vars (--pb-ink,
 * --pb-canvas, --pb-line, --pb-accent, Fonts), damit wirkt das Menü in
 * jedem Pack nativ, ohne Pack-eigene Menü-Styles.
 *
 * Touch-Targets: Toggle 44×44px, Panel-Links min-height 44px bei 17px
 * Schrift (vorher 10–13px Inline-Links mit 17–23px Targets).
 */
export const MobileNav: React.FC<{
  items: NavItem[];
  /**
   * Optionaler Nav-CTA (kanzlei/klarwerk/morgenlicht haben einen) — wandert
   * mobil als Accent-Button ans Panel-Ende, damit die Handlungsaufforderung
   * nicht mit den Inline-Links verschwindet.
   */
  cta?: { label: string; href: string };
}> = ({ items, cta }) => (
  <details className="pb-mnav">
    <summary className="pb-mnav-toggle" aria-label="Menü">
      <span className="pb-mnav-icon" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </summary>
    <div className="pb-mnav-panel">
      {items.map(item => (
        <a
          key={item.key}
          href={item.href}
          aria-current={item.current ? "page" : undefined}
        >
          {item.label}
        </a>
      ))}
      {cta && (
        <a className="pb-mnav-cta" href={cta.href}>
          {cta.label}
        </a>
      )}
    </div>
  </details>
);
