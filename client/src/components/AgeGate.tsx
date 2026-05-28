import { useEffect, useState } from "react";
import { AGE_GATE_MIN_AGE } from "@shared/ageGate";

/**
 * FSK-18 Age-Gate. Vollbild-Overlay vor dem Site-Content, wenn die Website
 * Adult-/Alkohol-/Glücksspiel-Content zeigt. Self-Declaration: ein Klick
 * "Ich bin 18+" oder "Verlassen". Bestätigung wird pro Slug in localStorage
 * gespeichert (30 Tage).
 */
interface AgeGateProps {
  slug: string;
  businessName?: string | null;
}

const STORAGE_PREFIX = "age-verified:";
const VALID_FOR_MS = 30 * 24 * 60 * 60 * 1000; // 30 Tage

function readVerified(slug: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + slug);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (!isFinite(ts)) return false;
    return Date.now() - ts < VALID_FOR_MS;
  } catch {
    return false;
  }
}

function writeVerified(slug: string) {
  try {
    localStorage.setItem(STORAGE_PREFIX + slug, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export default function AgeGate({ slug, businessName }: AgeGateProps) {
  // null = noch nicht entschieden, true = verified, false = nicht verified
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    setVerified(readVerified(slug));
    // Body-Scroll sperren während Gate aktiv ist
    const prevOverflow = document.body.style.overflow;
    return () => { document.body.style.overflow = prevOverflow; };
  }, [slug]);

  useEffect(() => {
    if (verified === false) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [verified]);

  if (verified === null || verified === true) return null;

  const handleConfirm = () => {
    writeVerified(slug);
    setVerified(true);
  };

  const handleDecline = () => {
    // Sanftes Verlassen: zurück zur vorherigen Seite, sonst Google
    if (window.history.length > 1) {
      window.history.back();
      // Falls history.back() nichts macht (z.B. fresh tab), fallback nach 200ms
      setTimeout(() => { window.location.href = "https://www.google.de"; }, 200);
    } else {
      window.location.href = "https://www.google.de";
    }
  };

  const bizPart = businessName ? ` von ${businessName}` : "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "rgba(0, 0, 0, 0.96)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          width: "100%",
          backgroundColor: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "40px 32px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "32px",
            fontWeight: 700,
            border: "2px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          {AGE_GATE_MIN_AGE}+
        </div>

        <h1
          id="age-gate-title"
          style={{
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: 700,
            margin: "0 0 12px 0",
            lineHeight: 1.2,
          }}
        >
          Altersbestätigung erforderlich
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "15px",
            lineHeight: 1.6,
            margin: "0 0 32px 0",
          }}
        >
          Die Inhalte dieser Website{bizPart} sind nur für Personen ab{" "}
          <strong style={{ color: "#ffffff" }}>{AGE_GATE_MIN_AGE} Jahren</strong>{" "}
          bestimmt. Bitte bestätige dein Alter, um fortzufahren.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={handleConfirm}
            style={{
              width: "100%",
              padding: "14px 24px",
              backgroundColor: "#ffffff",
              color: "#0a0a0a",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "transform 0.1s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Ja, ich bin {AGE_GATE_MIN_AGE} oder älter
          </button>

          <button
            onClick={handleDecline}
            style={{
              width: "100%",
              padding: "12px 24px",
              backgroundColor: "transparent",
              color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Nein, Seite verlassen
          </button>
        </div>

        <p
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "11px",
            lineHeight: 1.5,
            margin: "24px 0 0 0",
          }}
        >
          Mit der Bestätigung versicherst du, dass du das gesetzliche Mindestalter
          erreicht hast. Falschangaben können rechtliche Konsequenzen haben.
        </p>
      </div>
    </div>
  );
}
