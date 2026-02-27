import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  label?: string;
}

/**
 * MacBook-style mockup that wraps a website preview inside a laptop frame.
 * The screen area is scrollable so the full website can be explored.
 */
export default function MacbookMockup({ children, label }: Props) {
  return (
    <div className="flex flex-col items-center w-full h-full px-6 py-8 select-none">
      {label && (
        <p className="text-slate-400 text-xs mb-4 font-medium tracking-wide uppercase">
          {label}
        </p>
      )}

      {/* Laptop body */}
      <div className="w-full max-w-2xl">
        {/* Screen */}
        <div
          className="relative rounded-t-xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #2a2a2e 0%, #1c1c1f 100%)",
            padding: "10px 10px 0 10px",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 30px 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* Camera notch */}
          <div className="flex items-center justify-center h-5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          </div>

          {/* Browser chrome */}
          <div
            className="rounded-t-lg overflow-hidden"
            style={{ background: "#1e1e20" }}
          >
            {/* Browser toolbar */}
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{ background: "#2c2c2e", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Traffic lights */}
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>

              {/* URL bar */}
              <div
                className="flex-1 mx-2 flex items-center gap-1.5 px-3 py-1 rounded-md text-xs text-slate-400"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="truncate">deine-website.pageblitz.de</span>
              </div>

              {/* Reload icon */}
              <svg className="w-3 h-3 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>

            {/* Website content – scrollable */}
            <div
              className="overflow-y-auto overflow-x-hidden"
              style={{
                height: "420px",
                background: "#fff",
                transform: "scale(1)",
                transformOrigin: "top left",
              }}
            >
              <div style={{ minHeight: "100%", pointerEvents: "none" }}>
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard base */}
        <div
          className="relative"
          style={{
            background: "linear-gradient(180deg, #2a2a2e 0%, #222225 100%)",
            height: "22px",
            borderRadius: "0 0 4px 4px",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {/* Trackpad hint */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
            style={{
              width: "60px",
              height: "10px",
              borderRadius: "3px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
        </div>

        {/* Stand / shadow */}
        <div
          style={{
            height: "6px",
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
    </div>
  );
}
