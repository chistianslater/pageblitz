import React from "react";

/**
 * Platzhalter für das Terminbuchungs-Widget (Verhalten folgt in Task 9).
 * Rendert einen schwebenden Button unten rechts, der aktuell noch nichts tut.
 */
export const BookingIsland: React.FC<{ slug: string }> = () => {
  return (
    <button
      type="button"
      className="pb-island-fab-button"
      data-hydrate="booking"
    >
      Termin
    </button>
  );
};
