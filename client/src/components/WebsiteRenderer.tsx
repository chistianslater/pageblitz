import React from "react";
import type { PackId } from "@shared/siteContract/types";
import { parseV2 } from "./site/isV2";
import { SiteRenderer } from "./site/SiteRenderer";
import { LegacySitePlaceholder } from "./site/LegacySitePlaceholder";
import "./site/packs/index";

interface WebsiteRendererProps {
  websiteData: unknown;
  slug?: string;
  packOverride?: PackId;
  islandsMode?: "live" | "preview";
  /** Website-Zeilenfelder außerhalb des Dokuments (z. B. `chatWelcomeMessage` für die KI-Chat-Insel). */
  site?: { chatWelcomeMessage?: string | null };
  /**
   * Aktueller Pfad relativ zur Kundenseite ("/" oder "/<page-slug>") — Plan
   * B6, Task 3. Reicht 1:1 an `SiteRenderer` durch (siehe dort für die
   * Page-Auflösung); `undefined` verhält sich wie "/" (Startseite).
   */
  pathname?: string;
}

/**
 * Dünner Wrapper: seit dem Cutover (Plan B4b) gibt es nur noch den v2-Pfad.
 * Ungültige/alte Dokumente rendern einen Platzhalter statt eines v1-Layouts.
 */
export default function WebsiteRenderer({
  websiteData,
  slug,
  packOverride,
  islandsMode,
  site,
  pathname,
}: WebsiteRendererProps) {
  const v2 = parseV2(websiteData);
  if (!v2) {
    const name =
      (websiteData as { businessName?: string } | null)?.businessName ?? null;
    return <LegacySitePlaceholder businessName={name} />;
  }
  return (
    <SiteRenderer
      data={v2}
      packOverride={packOverride}
      slug={slug}
      islandsMode={islandsMode}
      site={site}
      pathname={pathname}
    />
  );
}
