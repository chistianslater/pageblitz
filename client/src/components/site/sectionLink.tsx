import React from "react";
import type { SectionLinkSchema } from "../../../../shared/siteContract/schema";
import type { z } from "zod";

type SectionLink = z.infer<typeof SectionLinkSchema>;

/**
 * Button unter einem Angebots-Block (2026-09-26): „Online bestellen" unter
 * der Speisekarte, „Termin buchen" unter der Preisliste. Zentral gerendert —
 * ein Markup + ein CSS-Block für alle 20 Packs, Look aus den Pack-Variablen.
 * Die Packs rufen ihr `renderSection` über `withSectionLinks` auf; der
 * Button hängt sich als letztes Kind in die gerenderte Sektion.
 */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function SectionLinkButton({ link }: { link: SectionLink }) {
  const external = isExternalHref(link.href);
  return (
    <div className="pb-section-link">
      <a
        className="pb-section-link-btn"
        href={link.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {link.text}
        <span aria-hidden="true">{external ? "↗" : "→"}</span>
      </a>
    </div>
  );
}

function linkOf(section: unknown): SectionLink | null {
  if (!section || typeof section !== "object") return null;
  const link = (section as { link?: SectionLink }).link;
  return link?.text && link.href ? link : null;
}

/** Hängt den Button als letztes Kind an das gerenderte Sektions-Element. */
export function withSectionLink(
  section: unknown,
  node: React.ReactNode
): React.ReactNode {
  const link = linkOf(section);
  if (!link || !React.isValidElement(node)) return node;
  const element = node as React.ReactElement<{ children?: React.ReactNode }>;
  return React.cloneElement(
    element,
    undefined,
    element.props.children,
    <SectionLinkButton link={link} key="pb-section-link" />
  );
}

/** Umhüllt das `renderSection` eines Packs — erstes Argument ist die Sektion. */
export function withSectionLinks<A extends [unknown, ...unknown[]]>(
  render: (...args: A) => React.ReactNode
): (...args: A) => React.ReactNode {
  return (...args: A) => withSectionLink(args[0], render(...args));
}

/** Wird von SiteRenderer an jedes Pack-CSS angehängt (wie STORY_CSS). */
export const SECTION_LINK_CSS = `
.pb-section-link{grid-column:1/-1;display:flex;justify-content:center;padding:clamp(24px,3.5vw,40px) 24px clamp(8px,1.5vw,16px);width:100%;box-sizing:border-box}
.pb-section-link-btn{display:inline-flex;align-items:center;gap:.7em;padding:15px 28px;background:var(--pb-accent);color:var(--pb-accent-contrast);font-family:var(--pb-font-body);font-weight:600;font-size:15px;line-height:1.3;letter-spacing:.01em;border:1px solid var(--pb-accent);border-radius:var(--pb-radius-button,0);text-decoration:none;transition:transform .2s ease,box-shadow .2s ease}
.pb-section-link-btn:hover{transform:translateY(-2px);box-shadow:0 10px 24px -14px color-mix(in srgb,var(--pb-accent) 80%,transparent)}
.pb-section-link-btn:focus-visible{outline:2px solid var(--pb-ink);outline-offset:3px}
@media (prefers-reduced-motion:reduce){.pb-section-link-btn{transition:none}.pb-section-link-btn:hover{transform:none}}
`;
