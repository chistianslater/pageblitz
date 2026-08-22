import React from "react";

/**
 * CSR-Fallback für Websites, deren websiteData noch im alten v1-Format liegt
 * (kein v2-Vertrag). Seit dem Cutover gibt es keinen v1-Renderer mehr; solche
 * Previews werden beim Öffnen des Studios neu erzeugt (ensureGeneration/force).
 */
export function LegacySitePlaceholder({
  businessName,
}: {
  businessName?: string | null;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {businessName ? `${businessName} — ` : ""}Diese Website wird gerade
          aktualisiert.
        </h1>
        <p className="mt-3 text-neutral-600">
          Bitte in wenigen Minuten erneut laden.
        </p>
      </div>
    </main>
  );
}
