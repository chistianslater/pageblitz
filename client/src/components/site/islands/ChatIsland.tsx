import React from "react";

/**
 * Platzhalter für das KI-Chat-Widget (Verhalten folgt in Task 8). Rendert
 * einen schwebenden Button unten rechts, der aktuell noch nichts tut.
 */
export const ChatIsland: React.FC<{ slug: string }> = () => {
  return (
    <button type="button" className="pb-island-fab-button" data-hydrate="chat">
      Chat
    </button>
  );
};
