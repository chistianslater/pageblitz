import { describe, expect, test } from "vitest";
import {
  emailFooter,
  emailInfoPanel,
  emailPrimaryButton,
  wrapPageblitzEmail,
} from "./emailDesign";
import { renderLifecycleEmail } from "./lifecycleEmails";

describe("Pageblitz E-Mail-Design", () => {
  test("gemeinsame Chrome nutzt Papier, Ink, Grün und Hairlines", () => {
    const html = wrapPageblitzEmail({
      eyebrow: "Test",
      content:
        emailInfoPanel("Hinweis", "Inhalt") +
        emailPrimaryButton("Weiter", "https://pageblitz.de"),
      footer: emailFooter({ unsubscribeLink: "https://example.com/aus" }),
    });
    expect(html).toContain("#f7f5f1");
    expect(html).toContain("#fdfcfa");
    expect(html).toContain("#1d1a17");
    expect(html).toContain("#1f5f4b");
    expect(html).toContain("#ddd6c9");
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
      expect(html).toContain("#1f5f4b");
      expect(html).not.toContain("#4f46e5");
      expect(html).not.toContain("#818cf8");
      expect(html).not.toContain("#f4f4f5");
    }
  });
});
