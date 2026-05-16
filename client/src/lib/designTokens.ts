import type { CSSProperties } from "react";

type SafeCs = Record<string, any>;

function safeColor(val: any, fallback: string): string {
  return typeof val === "string" && val.length > 0 ? val : fallback;
}

export function colorTokenStyle(cs: SafeCs, dark: boolean): CSSProperties {
  return {
    "--pb-color-primary": safeColor(cs.primary, "#3b82f6"),
    "--pb-color-on-primary": safeColor(cs.onPrimary, "#ffffff"),
    "--pb-color-secondary": safeColor(cs.secondary, "#f5f5f5"),
    "--pb-color-accent": safeColor(cs.accent, cs.primary || "#6366f1"),
    "--pb-color-bg": dark
      ? safeColor(cs.darkBackground || cs.background, "#0a0a0a")
      : safeColor(cs.background, "#ffffff"),
    "--pb-color-surface": dark
      ? safeColor(cs.surface, "rgba(255,255,255,0.05)")
      : safeColor(cs.surface, "#fafafa"),
    "--pb-color-text": dark
      ? safeColor(cs.lightText, "#ffffff")
      : safeColor(cs.text, "#171717"),
    "--pb-color-text-muted": dark
      ? safeColor(cs.lightTextMuted, "rgba(255,255,255,0.6)")
      : safeColor(cs.textLight, "#737373"),
    "--pb-color-border": dark
      ? "rgba(255,255,255,0.1)"
      : "rgba(0,0,0,0.1)",
  } as CSSProperties;
}

export function sectionSpacingStyle(spacing?: string): CSSProperties {
  const map: Record<string, string> = {
    tight: "var(--pb-section-y-tight)",
    normal: "var(--pb-section-y)",
    spacious: "var(--pb-section-y-spacious)",
  };
  return {
    "--pb-section-y": map[spacing || "normal"] || map.normal,
  } as CSSProperties;
}

export function headlineSizeOverrides(size: string = "large"): CSSProperties {
  if (size === "medium")
    return {
      "--pb-hero-headline": "clamp(2rem, 4vw, 4rem)",
      "--pb-section-headline": "clamp(1.6rem, 3.2vw, 2.5rem)",
    } as CSSProperties;
  if (size === "small")
    return {
      "--pb-hero-headline": "clamp(1.6rem, 3.2vw, 3rem)",
      "--pb-section-headline": "clamp(1.4rem, 2.5vw, 2rem)",
    } as CSSProperties;
  return {};
}

export function buttonShapeClass(style?: string): string {
  if (style === "rounded") return "pb-btn-rounded";
  if (style === "square") return "pb-btn-square";
  return "pb-btn-pill";
}
