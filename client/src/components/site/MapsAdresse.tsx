import React from "react";
import type { ReactNode } from "react";
import { googleMapsUrl } from "./mapsLink";

/**
 * Verlinkt die Adresse auf Google Maps — oder gibt sie unveraendert aus,
 * wenn Ort und PLZ fehlen. Der Text bleibt in jedem Fall identisch, damit
 * das Pack-Layout sich nicht verschiebt.
 */
export function MapsAdresse({
  street,
  zip,
  city,
  children,
}: {
  street?: string;
  zip?: string;
  city?: string;
  children: ReactNode;
}) {
  const url = googleMapsUrl(street, zip, city);
  if (!url) return <>{children}</>;
  return (
    <a
      className="pb-maps-link"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      // Ohne Beschriftung liest ein Screenreader nur die Adresszeilen vor,
      // ohne zu sagen, wohin der Link fuehrt.
      aria-label={`Adresse in Google Maps öffnen: ${[street, zip, city].filter(Boolean).join(", ")}`}
    >
      {children}
    </a>
  );
}
