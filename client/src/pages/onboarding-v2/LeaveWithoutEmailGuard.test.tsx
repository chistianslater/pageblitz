import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  LEAVE_WITHOUT_EMAIL,
  LeaveWithoutEmailGuard,
} from "./LeaveWithoutEmailGuard";
import { shouldWarnOnLeave } from "./studioLogic";

describe("LeaveWithoutEmailGuard", () => {
  test("armed=false rendert nichts (keine Warnung mit E-Mail / nach Kauf)", () => {
    expect(shouldWarnOnLeave("preview", "kunde@x.de")).toBe(false);
    const html = renderToStaticMarkup(
      <LeaveWithoutEmailGuard armed={false} onStay={() => {}} />
    );
    expect(html).toBe("");
  });

  test("armed=true zeigt den deutschen Hinweis, dass die Vorschau gelöscht wird", () => {
    expect(shouldWarnOnLeave("preview", null)).toBe(true);
    const html = renderToStaticMarkup(
      <LeaveWithoutEmailGuard armed onStay={() => {}} />
    );
    expect(html).toContain(LEAVE_WITHOUT_EMAIL.banner);
    expect(html).toContain("gelöscht");
    expect(html).toContain(LEAVE_WITHOUT_EMAIL.stay);
    expect(html).toContain('role="status"');
  });
});
