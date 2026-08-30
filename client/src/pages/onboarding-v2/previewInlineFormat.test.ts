// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { serializeRichDom } from "@/components/site/richText";
import { applyMarkToRange } from "./previewInlineFormat";

function editable(html: string): HTMLElement {
  const el = document.createElement("h1");
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

describe("applyMarkToRange", () => {
  test("wrappt eine Textauswahl in die Akzent-Auszeichnung", () => {
    const el = editable("Heilung beginnt mit Zuhören.");
    const range = document.createRange();
    const textNode = el.firstChild as Text;
    range.setStart(textNode, 20);
    range.setEnd(textNode, 28);
    applyMarkToRange(document, range, "==", el);
    expect(serializeRichDom(el)).toBe("Heilung beginnt mit ==Zuhören.==");
  });

  test("entfernt die Auszeichnung, wenn die Auswahl in ihr liegt", () => {
    const el = editable('Hallo <em class="pb-rich-accent">Welt</em>');
    const inner = el.querySelector("em")!.firstChild as Text;
    const range = document.createRange();
    range.setStart(inner, 0);
    range.setEnd(inner, 4);
    applyMarkToRange(document, range, "==", el);
    expect(serializeRichDom(el)).toBe("Hallo Welt");
  });

  test("entpackt gleiche Auszeichnungen im Fragment statt zu verschachteln", () => {
    const el = editable("Ein <strong>fettes</strong> Wort");
    const range = document.createRange();
    range.setStart(el.firstChild as Text, 0);
    range.setEnd(el.lastChild as Text, 5);
    applyMarkToRange(document, range, "**", el);
    expect(serializeRichDom(el)).toBe("**Ein fettes Wort**");
    expect(el.querySelectorAll("strong strong").length).toBe(0);
  });

  test("kursiv auf Akzent-Text unwrappt nicht das Akzent-em", () => {
    const el = editable('Hallo <em class="pb-rich-accent">Welt</em>');
    const inner = el.querySelector("em")!.firstChild as Text;
    const range = document.createRange();
    range.setStart(inner, 0);
    range.setEnd(inner, 4);
    applyMarkToRange(document, range, "*", el);
    expect(el.querySelector("em.pb-rich-accent")).not.toBeNull();
  });
});
