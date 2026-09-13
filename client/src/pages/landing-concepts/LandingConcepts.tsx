import React from "react";
import Klarstart from "./Klarstart";
import Auftritt from "./Auftritt";
import "./concepts.css";
export default function LandingConcepts() {
  const bold =
    new URLSearchParams(window.location.search).get("view") === "auftritt";
  return (
    <>
      <div
        className="concept-picker"
        aria-label="Landingpage-Entwürfe vergleichen"
      >
        <span>DESIGNVERGLEICH</span>
        <a
          href="/landing-concepts?view=klarstart"
          aria-current={!bold ? "page" : undefined}
        >
          01 · Klarstart
        </a>
        <a
          href="/landing-concepts?view=auftritt"
          aria-current={bold ? "page" : undefined}
        >
          02 · Großer Auftritt
        </a>
        <small>Entwürfe zur Auswahl</small>
      </div>
      {bold ? <Auftritt /> : <Klarstart />}
    </>
  );
}
