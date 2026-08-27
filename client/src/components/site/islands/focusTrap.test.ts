import { afterEach, describe, expect, test, vi } from "vitest";
import { trapTabKey } from "./focusTrap";

function element() {
  return {
    hidden: false,
    getAttribute: () => null,
    focus: vi.fn(),
  } as unknown as HTMLElement;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("trapTabKey", () => {
  test("wickelt Tab vom letzten zum ersten Element", () => {
    const first = element();
    const last = element();
    vi.stubGlobal("document", { activeElement: last });
    const container = {
      querySelectorAll: () => [first, last],
    } as unknown as HTMLElement;
    const preventDefault = vi.fn();

    trapTabKey({ key: "Tab", shiftKey: false, preventDefault }, container);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(first.focus).toHaveBeenCalledOnce();
  });

  test("wickelt Shift+Tab vom ersten zum letzten Element", () => {
    const first = element();
    const last = element();
    vi.stubGlobal("document", { activeElement: first });
    const container = {
      querySelectorAll: () => [first, last],
    } as unknown as HTMLElement;
    const preventDefault = vi.fn();

    trapTabKey({ key: "Tab", shiftKey: true, preventDefault }, container);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(last.focus).toHaveBeenCalledOnce();
  });
});
