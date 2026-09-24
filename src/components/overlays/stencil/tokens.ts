import type { CSSProperties } from "react";

export const FONT = {
  title: "Oswald, sans-serif",
  mono: '"JetBrains Mono", monospace',
  body: '"Barlow Condensed", system-ui, sans-serif',
} as const;

export const ST = {
  surface: "rgba(8, 8, 11, 0.90)",
  surfaceSolid: "#0a0a0d",
  border: "rgba(255, 255, 255, 0.06)",
  ink: "#f4f4f6",
  inkDim: "rgba(244,244,246,0.55)",
  inkVeryDim: "rgba(244,244,246,0.28)",
  accent: "#ff3344",
  accentDark: "#a31a26",
  leader: "#f6c945",
  gain: "oklch(0.78 0.18 145)",
  loss: "oklch(0.65 0.22 25)",
  fastest: "oklch(0.65 0.22 305)",
} as const;

export const stripes = `repeating-linear-gradient(
  -45deg,
  rgba(255,255,255,0.02) 0 6px,
  transparent 6px 12px
)`;

export const clip = {
  slashRight: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)",
  slashLeft: "polygon(18px 0, 100% 0, 100% 100%, 0 100%, 0 18px)",
  slashBoth:
    "polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px)",
  gearSlash: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
  smallSlash: "polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)",
} as const;

export function panelMotion(
  isVisible: boolean,
  side: "left" | "right" = "left",
): Pick<
  CSSProperties,
  "opacity" | "transform" | "transition" | "pointerEvents"
> {
  const offset = side === "right" ? 24 : -24;
  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateX(0)" : `translateX(${offset}px)`,
    transition: "opacity 280ms ease, transform 280ms ease",
    pointerEvents: isVisible ? "auto" : "none",
  };
}

export function sectorColor(status: string): string {
  switch (status) {
    case "purple":
      return ST.fastest;
    case "green":
      return ST.gain;
    case "red":
      return ST.loss;
    default:
      return "#1a1a20";
  }
}
