import React from 'react';
import { ST, FONT, clip } from './tokens';

interface BadgeProps {
  children: React.ReactNode;
  background?: string;
  color?: string;
  fontSize?: number;
  letterSpacing?: number;
  padding?: string;
  clipType?: typeof clip.smallSlash | typeof clip.gearSlash;
  tabular?: boolean;
  inline?: boolean;
  style?: React.CSSProperties;
}

export function Badge({
  children,
  background = ST.accent,
  color = '#fff',
  fontSize = 13,
  letterSpacing,
  padding = '4px 10px',
  clipType = clip.gearSlash,
  tabular = false,
  inline = false,
  style,
}: BadgeProps) {
  return (
    <span
      style={{
        display: inline ? 'inline-block' : undefined,
        background,
        color,
        fontFamily: FONT.title,
        fontSize,
        fontWeight: 700,
        ...(letterSpacing !== undefined ? { letterSpacing } : {}),
        padding,
        clipPath: clipType,
        flexShrink: 0,
        ...(tabular ? { fontVariantNumeric: 'tabular-nums' as const } : {}),
        ...style,
      }}
    >
      {children}
    </span>
  );
}
