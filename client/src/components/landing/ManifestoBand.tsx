/**
 * Dayos-Manifesto-Bühne: ein Satz, groß, mit Echo-Zeile. Kein neues
 * Produktversprechen — verdichtet den Übergang von Problem zu Ablauf.
 */
export function ManifestoBand() {
  return (
    <section
      aria-labelledby="lp-manifesto-heading"
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container">
        <p className="lp-kicker mb-6">Das Prinzip</p>
        <h2
          id="lp-manifesto-heading"
          className="lp-h2 lp-h2--billboard max-w-[16ch]"
        >
          <span className="block">
            Wir ersetzen die Agentur nicht durch ein Tool.
          </span>
          <span className="lp-echo" aria-hidden="true">
            Wir ersetzen die Agentur nicht durch ein Tool.
          </span>
        </h2>
        <p className="mt-8 max-w-[34rem] text-[1.15rem] leading-[1.45] text-lp-muted">
          Sondern durch eine fertige Website — in Minuten, nicht in Wochen.
        </p>
      </div>
    </section>
  );
}
