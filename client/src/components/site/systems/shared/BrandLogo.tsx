import React from "react";
import type { WebsiteDataV2 } from "../../../../../../shared/siteContract/types";

interface BrandLogoProps {
  data: WebsiteDataV2;
  fallback?: React.ReactNode;
  footer?: boolean;
  decorative?: boolean;
}

/** Firmenlogo mit denselben sicheren Größen in allen sieben Systemen. */
export function BrandLogo({
  data,
  fallback = null,
  footer = false,
  decorative = false,
}: BrandLogoProps) {
  if (data.logo?.kind !== "image") return <>{fallback}</>;
  return (
    <img
      className={footer ? "pb-site-logo pb-site-logo--foot" : "pb-site-logo"}
      src={data.logo.url}
      alt={decorative ? "" : `${data.businessName} Logo`}
      style={{
        display: "block",
        width: "auto",
        maxWidth: footer ? "min(15rem, 70vw)" : "min(11rem, 40vw)",
        maxHeight: footer ? "4rem" : "2.25rem",
        objectFit: "contain",
      }}
    />
  );
}
