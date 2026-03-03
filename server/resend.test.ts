import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Resend API Key Validation", () => {
  it("should have RESEND_API_KEY set in environment", () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeTruthy();
    expect(apiKey).toMatch(/^re_/);
  });

  it("should be able to initialize Resend client without error", () => {
    const apiKey = process.env.RESEND_API_KEY ?? "";
    expect(() => new Resend(apiKey)).not.toThrow();
  });
});
