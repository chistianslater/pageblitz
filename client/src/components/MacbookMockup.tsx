import { ReactNode, useRef, useState, useEffect } from "react";

interface Props {
  children: ReactNode;
  label?: string;
}

/**
 * MacBook-style browser mockup.
 * The inner website is rendered at DESKTOP_WIDTH and scaled down proportionally
 * via ResizeObserver so the user always sees the full desktop view without
 * any empty blue/grey strips on the sides.
 */
const DESKTOP_WIDTH = 1280;
const ASPECT_RATIO = 0.62; // height / width ≈ 16:10

export default function MacbookMockup({ children, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale(w / DESKTOP_WIDTH);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const viewportH = Math.round(DESKTOP_WIDTH * ASPECT_RATIO);
  const scaledH = Math.round(viewportH * scale);

  return (
    <div className="flex flex-col w-full h-full px-4 py-6 select-none">
      {label && (
        <p className="text-slate-400 text-xs mb-3 font-medium tracking-widest uppercase text-center">
          {label}
        </p>
      )}

      {/* Laptop body */}
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #2a2a2e 0%, #1c1c1f 100%)",
          padding: "8px 8px 0 8px",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px rgba(0,0,0,0.7), 0 8px 16px rgba(0,0,0,0.4)",
        }}
      >
        {/* Camera notch */}
        <div className="flex items-center justify-center h-4 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
        </div>

        {/* Browser chrome */}
        <div className="rounded-t-lg overflow-hidden" style={{ background: "#1e1e20" }}>
          {/* Toolbar */}
          <div
            className="flex items-center gap-2 px-3"
            style={{
              height: "36px",
              background: "#2c2c2e",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex gap-1.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div
              className="flex-1 mx-2 flex items-center gap-1.5 px-3 py-1 rounded-md text-xs text-slate-400 truncate"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="truncate">deine-website.pageblitz.de</span>
            </div>
            <svg className="w-3 h-3 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>

          {/* Scaled viewport */}
          {/* Outer div: measured by ResizeObserver, height = scaled viewport height */}
          <div
            ref={containerRef}
            className="w-full overflow-hidden"
            style={{ height: `${scaledH}px`, background: "#fff" }}
          >
            {/* Inner div: always DESKTOP_WIDTH wide, scaled down */}
            <div
              style={{
                width: `${DESKTOP_WIDTH}px`,
                height: `${viewportH}px`,
                transformOrigin: "top left",
                transform: `scale(${scale})`,
                pointerEvents: "none",
                overflow: "hidden",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard base */}
      <div
        style={{
          background: "linear-gradient(180deg, #2a2a2e 0%, #222225 100%)",
          height: "18px",
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex justify-center items-center h-full">
          <div
            style={{
              width: "56px",
              height: "8px",
              borderRadius: "3px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
        </div>
      </div>

      {/* Shadow */}
      <div
        style={{
          height: "4px",
          background: "linear-gradient(180deg, #1a1a1c 0%, #111113 100%)",
          borderRadius: "0 0 8px 8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}
      />
      <div
        style={{
          height: "3px",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)",
          marginTop: "2px",
        }}
      />
    </div>
  );
}
