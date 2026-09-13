import { useLayoutEffect, useRef } from "react";

/** Render at an actual device width, then fit the browser viewport to its frame. */
export function usePreviewViewport(device: "desktop" | "mobile", ready = true) {
  const container = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = container.current;
    if (!element || !ready) return;
    const resize = () => {
      const frame = element.querySelector("iframe");
      if (!frame || !element.clientWidth || !element.clientHeight) return;
      const width = device === "desktop" ? 1440 : 390;
      const scale = Math.min(1, element.clientWidth / width);
      Object.assign(frame.style, {
        width: `${width}px`,
        height: `${element.clientHeight / scale}px`,
        minHeight: "0",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    return () => observer.disconnect();
  }, [device, ready]);
  return container;
}
