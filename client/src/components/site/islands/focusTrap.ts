const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

interface TabKeyEvent {
  key: string;
  shiftKey: boolean;
  preventDefault: () => void;
}

/** Hält Tab/Shift+Tab innerhalb eines als modal deklarierten Island-Panels. */
export function trapTabKey(event: TabKeyEvent, container: HTMLElement): void {
  if (event.key !== "Tab") return;

  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(
    element => !element.hidden && element.getAttribute("aria-hidden") !== "true"
  );

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) {
    event.preventDefault();
    return;
  }

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
