import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { HOME_FAQ_ITEMS } from "@shared/faq";
import { SectionHead } from "./primitives";

/**
 * FAQ aus shared/faq.ts (einzige Quelle, auch für das FAQPage-JSON-LD im
 * Server-Prerender). Ruhiges Accordion: Hairlines, `aria-expanded`/
 * `aria-controls`, Tastatur über native Buttons, Höhe per CSS-Grid-Transition.
 */
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section
      id="faq"
      aria-labelledby="lp-faq-heading"
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <SectionHead
            id="lp-faq-heading"
            kicker="FAQ"
            title="Häufige Fragen."
            text="Nicht dabei, was du wissen willst? Der Chat unten rechts antwortet sofort."
          />
        </div>
        <div className="lg:col-span-8">
          {HOME_FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;
            return (
              <div
                key={item.q}
                className="border-t border-lp-line last:border-b"
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left text-[1.1rem] font-medium tracking-[-0.01em] transition-colors hover:text-lp-accent sm:text-[1.2rem]"
                  >
                    {item.q}
                    <Plus
                      aria-hidden="true"
                      className={`h-5 w-5 shrink-0 text-lp-muted transition-transform duration-300 ${
                        isOpen ? "rotate-45 text-lp-accent" : ""
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  data-open={isOpen}
                  className="lp-acc-panel"
                >
                  <div>
                    <p className="max-w-[60ch] pb-6 text-[1rem] leading-[1.65] text-lp-muted">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
