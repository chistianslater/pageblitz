import { describe, expect, test } from "vitest";
import {
  emailFooter,
  emailInfoPanel,
  emailPrimaryButton,
  wrapPageblitzEmail,
} from "./emailDesign";
import { renderLifecycleEmail } from "./lifecycleEmails";

describe("Pageblitz E-Mail-Design", () => {
  test("gemeinsame Chrome nutzt die Nachtschicht-Markensprache (heller Brief, dunkler Kopf, Volt)", () => {
    const html = wrapPageblitzEmail({
      eyebrow: "Test",
      content:
        emailInfoPanel("Hinweis", "Inhalt") +
        emailPrimaryButton("Weiter", "https://pageblitz.de"),
      footer: emailFooter({ unsubscribeLink: "https://example.com/aus" }),
    });
    expect(html).toContain("#f2f2ef");
    expect(html).toContain("#ffffff");
    expect(html).toContain("#131316");
    // Dunkler Kopf + Volt (Buttons/Eyebrow) statt des alten Grüns.
    expect(html).toContain("#0b0b0d");
    expect(html).toContain("#ccff00");
    expect(html).toContain("#e4e3de");
    expect(html).not.toContain("#1f5f4b");
    expect(html).not.toContain("#4f46e5");
    expect(html).not.toContain("#818cf8");
    expect(html).not.toContain("#f4f4f5");
  });

  test("alle Lifecycle-Typen verwenden dieselbe neue Chrome", () => {
    const types = [
      "reminder_2h",
      "reminder_24h",
      "reminder_final",
      "fresh_start_7d",
    ] as const;
    for (const type of types) {
      const { html } = renderLifecycleEmail(type, {
        firstName: "Anna",
        businessName: "Café Beispiel",
        resumeLink: "https://pageblitz.de/weiter",
        extendLink: "https://pageblitz.de/laenger",
        unsubscribeLink: "https://pageblitz.de/abmelden",
      });
      expect(html).toContain("Pageblitz");
      expect(html).toContain("#ccff00");
      expect(html).not.toContain("#4f46e5");
      expect(html).not.toContain("#818cf8");
      expect(html).not.toContain("#f4f4f5");
    }
  });
});
