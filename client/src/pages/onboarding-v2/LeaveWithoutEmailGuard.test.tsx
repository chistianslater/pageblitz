import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  LEAVE_WITHOUT_EMAIL,
  LeaveWithoutEmailDialog,
  LeaveWithoutEmailGuard,
  isStudioStayHref,
  shouldInterceptLeaveClick,
  type LeaveClickSnapshot,
} from "./LeaveWithoutEmailGuard";
import { shouldWarnOnLeave } from "./studioLogic";

const outboundClick = (
  overrides: Partial<LeaveClickSnapshot> = {}
): LeaveClickSnapshot => ({
  defaultPrevented: false,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  targetBlank: false,
  download: false,
  href: "/",
  ...overrides,
});

describe("LeaveWithoutEmailGuard", () => {
  test("armed=false rendert nichts (keine Warnung mit E-Mail / nach Kauf)", () => {
    expect(shouldWarnOnLeave("preview", "kunde@x.de")).toBe(false);
    const html = renderToStaticMarkup(
      <LeaveWithoutEmailGuard armed={false} onStay={() => {}} />
    );
    expect(html).toBe("");
  });

  test("armed=true zeigt keinen dauerhaften Banner, solange niemand verlässt", () => {
    expect(shouldWarnOnLeave("preview", null)).toBe(true);
    const html = renderToStaticMarkup(
      <LeaveWithoutEmailGuard armed onStay={() => {}} />
    );
    expect(html).toBe("");
    expect(html).not.toContain("pb-studio-leave-banner");
    expect(html).not.toContain('role="status"');
    expect(html).not.toContain(LEAVE_WITHOUT_EMAIL.modalTitle);
  });

  test("beim Verlassen erscheint das Alert-Modal, kein Banner", () => {
    const html = renderToStaticMarkup(
      <LeaveWithoutEmailGuard
        armed
        initialPendingHref="https://example.com/"
        onStay={() => {}}
      />
    );
    expect(html).toContain('role="alertdialog"');
    expect(html).toContain(LEAVE_WITHOUT_EMAIL.modalTitle);
    expect(html).toContain(LEAVE_WITHOUT_EMAIL.modalBody);
    expect(html).toContain(LEAVE_WITHOUT_EMAIL.stay);
    expect(html).toContain(LEAVE_WITHOUT_EMAIL.leave);
    expect(html).toContain("24 Stunden");
    expect(html).toContain("sieben Tage");
    expect(html).not.toContain("pb-studio-leave-banner");
    expect(html).not.toContain('role="status"');
  });
});

describe("LeaveWithoutEmailDialog", () => {
  test("geschlossen rendert nichts, offen ist ein Alert mit zwei Aktionen", () => {
    expect(
      renderToStaticMarkup(
        <LeaveWithoutEmailDialog
          open={false}
          onStay={() => {}}
          onLeave={() => {}}
        />
      )
    ).toBe("");
    const html = renderToStaticMarkup(
      <LeaveWithoutEmailDialog open onStay={() => {}} onLeave={() => {}} />
    );
    expect(html).toContain('role="alertdialog"');
    expect(html).toContain("E-Mail hinterlassen");
    expect(html).toContain("Trotzdem verlassen");
    expect(html).not.toContain("pb-studio-leave-banner");
  });
});

describe("shouldInterceptLeaveClick / isStudioStayHref", () => {
  test("Outbound-Navigation (Startseite, Dashboard) wird abgefangen", () => {
    expect(shouldInterceptLeaveClick(outboundClick({ href: "/" }))).toBe(true);
    expect(
      shouldInterceptLeaveClick(outboundClick({ href: "/my-website" }))
    ).toBe(true);
    expect(
      shouldInterceptLeaveClick(
        outboundClick({ href: "https://pageblitz.de/" })
      )
    ).toBe(true);
    expect(isStudioStayHref("/")).toBe(false);
  });

  test("Studio-interne Ziele, neuer Tab und Modifier bleiben unbehelligt", () => {
    expect(
      shouldInterceptLeaveClick(
        outboundClick({ href: "/onboarding/tok123" })
      )
    ).toBe(false);
    expect(
      shouldInterceptLeaveClick(
        outboundClick({ href: "/preview-ssr/tok123" })
      )
    ).toBe(false);
    expect(
      shouldInterceptLeaveClick(outboundClick({ href: "#abschnitt" }))
    ).toBe(false);
    expect(
      shouldInterceptLeaveClick(outboundClick({ href: "/", targetBlank: true }))
    ).toBe(false);
    expect(
      shouldInterceptLeaveClick(outboundClick({ href: "/", metaKey: true }))
    ).toBe(false);
    expect(
      shouldInterceptLeaveClick(outboundClick({ href: "/", defaultPrevented: true }))
    ).toBe(false);
    expect(isStudioStayHref("mailto:kunde@x.de")).toBe(true);
  });
});
