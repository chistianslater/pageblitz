/**
 * Deterministisch ermittelt einen Index für Varianten basierend auf einem Seed (z.B. Website-ID)
 * und einem Sektions-Key. Stellt sicher, dass dieselbe Website immer dieselben Varianten sieht.
 */
export function getVariantIndex(seed: number | string | undefined, sectionKey: string, totalVariants: number): number {
  if (totalVariants <= 1) return 0;
  
  // Wenn kein Seed vorhanden ist (z.B. neue Website vor dem Speichern), nutzen wir einen Fallback
  const stableSeed = seed?.toString() || "default-seed";
  const hashString = `${stableSeed}-${sectionKey}`;
  
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    hash = (hash << 5) - hash + hashString.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  return Math.abs(hash) % totalVariants;
}
