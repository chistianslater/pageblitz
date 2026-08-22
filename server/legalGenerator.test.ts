import { describe, it, expect } from "vitest";
import { generateImpressum, generateDatenschutz } from "./legalGenerator";

describe("legalGenerator - XSS Prevention", () => {
  describe("generateImpressum", () => {
    it("escapes script tags in user values", () => {
      const result = generateImpressum({
        businessName: "B",
        legalOwner: "<script>alert(1)</script>",
        legalStreet: "Weg 1",
        legalZip: "44135",
        legalCity: "Dortmund",
        legalEmail: "m@b.de",
      });

      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    });

    it("escapes img onerror injection", () => {
      const result = generateImpressum({
        businessName: "Test",
        legalOwner: '"><img src=x onerror=alert(1)>',
        legalStreet: "Weg 1",
        legalZip: "44135",
        legalCity: "Dortmund",
        legalEmail: "m@b.de",
      });

      expect(result).not.toContain('<img src=x onerror=alert(1)>');
      expect(result).toContain("&quot;&gt;&lt;img src=x onerror=alert(1)&gt;");
    });

    it("escapes ampersand in normal text", () => {
      const result = generateImpressum({
        businessName: "Müller & Söhne GmbH",
        legalOwner: "Max Müller",
        legalStreet: "Hauptstr. 1",
        legalZip: "44135",
        legalCity: "Dortmund",
        legalEmail: "max@example.de",
      });

      expect(result).toContain("Müller &amp; Söhne GmbH");
      expect(result).toContain("Max Müller");
      // Umlauts should be untouched
      expect(result).toContain("Müller");
    });

    it("escapes special chars in email attribute", () => {
      const result = generateImpressum({
        businessName: "Test",
        legalOwner: "Owner",
        legalStreet: "Str",
        legalZip: "12345",
        legalCity: "City",
        legalEmail: 'test@example.de"><script>alert(1)</script>',
      });

      expect(result).not.toContain('<script>');
      expect(result).toContain("&quot;&gt;&lt;script&gt;");
    });

    it("escapes phone attribute - prevents attribute breakout", () => {
      const result = generateImpressum({
        businessName: "Test",
        legalOwner: "Owner",
        legalStreet: "Str",
        legalZip: "12345",
        legalCity: "City",
        legalEmail: "test@example.de",
        legalPhone: 'test" onclick="alert(1)"',
      });

      // Should escape the quotes to prevent onclick injection
      expect(result).toContain("test&quot; onclick=&quot;alert(1)&quot;");
      // Raw unescaped version should not appear
      expect(result).not.toContain('test" onclick="alert(1)"');
    });

    it("escapes websiteUrl", () => {
      const result = generateImpressum({
        businessName: "Test",
        legalOwner: "Owner",
        legalStreet: "Str",
        legalZip: "12345",
        legalCity: "City",
        legalEmail: "test@example.de",
        websiteUrl: 'javascript:alert(1)" onerror="alert(1)',
      });

      // Raw unescaped version should not appear
      expect(result).not.toContain('javascript:alert(1)" onerror="alert(1)');
      // Should have escaped version
      expect(result).toContain('&quot; onerror=&quot;');
    });

    it("escapes vatId, register, registerCourt", () => {
      const result = generateImpressum({
        businessName: "Test",
        legalOwner: "Owner",
        legalStreet: "Str",
        legalZip: "12345",
        legalCity: "City",
        legalEmail: "test@example.de",
        legalVatId: "<script>test</script>",
        legalRegister: "<iframe src=evil>",
        legalRegisterCourt: '"><img src=x>',
      });

      expect(result).not.toContain("<script>");
      expect(result).not.toContain("<iframe");
      expect(result).not.toContain("<img");
      expect(result).toContain("&lt;script&gt;");
      expect(result).toContain("&lt;iframe");
      expect(result).toContain("&lt;img");
    });

    it("escapes legalResponsible", () => {
      const result = generateImpressum({
        businessName: "Test",
        legalOwner: "Owner",
        legalStreet: "Str",
        legalZip: "12345",
        legalCity: "City",
        legalEmail: "test@example.de",
        legalResponsible: "<svg onload=alert(1)>",
      });

      expect(result).not.toContain("<svg");
      expect(result).toContain("&lt;svg");
    });

    it("escapes legalCountry", () => {
      const result = generateImpressum({
        businessName: "Test",
        legalOwner: "Owner",
        legalStreet: "Str",
        legalZip: "12345",
        legalCity: "City",
        legalEmail: "test@example.de",
        legalCountry: '"><script>alert(1)</script>',
      });

      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;script&gt;");
    });
  });

  describe("generateDatenschutz", () => {
    it("escapes script tags in legalOwner", () => {
      const result = generateDatenschutz({
        businessName: "Test",
        legalOwner: "<script>alert(1)</script>",
        legalStreet: "Str",
        legalZip: "12345",
        legalCity: "City",
        legalEmail: "test@example.de",
      });

      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;script&gt;");
    });

    it("escapes img onerror injection", () => {
      const result = generateDatenschutz({
        businessName: "Test",
        legalOwner: '"><img src=x onerror=alert(1)>',
        legalStreet: "Str",
        legalZip: "12345",
        legalCity: "City",
        legalEmail: "test@example.de",
      });

      expect(result).not.toContain("<img");
      expect(result).toContain("&lt;img");
    });

    it("escapes businessName - prevents tag injection", () => {
      const result = generateDatenschutz({
        businessName: "<b onmouseover=alert(1)>Test",
        legalOwner: "Owner",
        legalStreet: "Str",
        legalZip: "12345",
        legalCity: "City",
        legalEmail: "test@example.de",
      });

      expect(result).not.toContain("<b onmouseover=alert(1)>");
      expect(result).toContain("&lt;b onmouseover=alert(1)&gt;");
    });

    it("escapes email in contact section", () => {
      const result = generateDatenschutz({
        businessName: "Test",
        legalOwner: "Owner",
        legalStreet: "Str",
        legalZip: "12345",
        legalCity: "City",
        legalEmail: 'test@example.de"><script>alert(1)</script>',
      });

      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;script&gt;");
    });

    it("escapes phone number", () => {
      const result = generateDatenschutz({
        businessName: "Test",
        legalOwner: "Owner",
        legalStreet: "Str",
        legalZip: "12345",
        legalCity: "City",
        legalEmail: "test@example.de",
        legalPhone: 'test" onmouseover="alert(1)"',
      });

      // Raw unescaped version should not appear
      expect(result).not.toContain('test" onmouseover="alert(1)"');
      // Should have escaped version
      expect(result).toContain("test&quot; onmouseover=&quot;alert(1)&quot;");
    });

    it("escapes legalCountry", () => {
      const result = generateDatenschutz({
        businessName: "Test",
        legalOwner: "Owner",
        legalStreet: "Str",
        legalZip: "12345",
        legalCity: "City",
        legalEmail: "test@example.de",
        legalCountry: '"><script>alert(1)</script>',
      });

      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;script&gt;");
    });

    it("preserves normal text with ampersands", () => {
      const result = generateDatenschutz({
        businessName: "Müller & Söhne GmbH",
        legalOwner: "Max Müller",
        legalStreet: "Hauptstr. 1 & 2",
        legalZip: "44135",
        legalCity: "Dortmund",
        legalEmail: "max@example.de",
      });

      expect(result).toContain("Müller &amp; Söhne GmbH");
      expect(result).toContain("Hauptstr. 1 &amp; 2");
      // Umlauts should not be escaped
      expect(result).toContain("Müller");
    });
  });
});
