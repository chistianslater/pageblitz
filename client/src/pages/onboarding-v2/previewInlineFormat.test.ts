// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { plainOffset } from "./previewInlineFormat";

function editable(html: string): HTMLElement {
  const el = document.createElement("h1");
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

describe("plainOffset", () => {
  test("z\u00e4hlt Textknoten \u00fcber Elementgrenzen hinweg", () => {
    const el = editable("Heilung <em>beginnt</em> mit");
    const lastText = el.lastChild as Text; // " mit"
    expect(plainOffset(el, lastText, 2)).toBe("Heilung beginnt ".length + 1);
  });

  test("z\u00e4hlt br als ein Zeichen (wie serializeRichDom)", () => {
    const el = editable("eins<br>zwei");
    const zwei = el.lastChild as Text;
    expect(plainOffset(el, zwei, 0)).toBe("eins".length + 1);
  });

  test("Offset innerhalb des Startknotens", () => {
    const el = editable("Heilung beginnt");
    expect(plainOffset(el, el.firstChild as Text, 7)).toBe(7);
  });
});
