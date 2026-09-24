import { FONT, ST } from '../tokens';

interface Props {
  label: string;
  val: number;
  color: string;
  mirror: boolean;
}

export function InputBar({ label, val, color, mirror }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexDirection: mirror ? "row-reverse" : "row",
      }}
    >
      <span
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.6,
          color: ST.inkVeryDim,
          width: 26,
          textAlign: mirror ? "right" : "left",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          position: "relative",
          height: 12,
          background: "rgba(255,255,255,0.04)",
          clipPath: mirror
            ? "polygon(6px 0, 100% 0, 100% 100%, 0 100%)"
            : "polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [mirror ? "right" : "left"]: 0,
            width: `${val}%`,
            background: color,
            transition: "width 0.12s linear",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: FONT.title,
          fontSize: 14,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: ST.ink,
          width: 36,
          textAlign: mirror ? "left" : "right",
        }}
      >
        {val}%
      </span>
    </div>
  );
}
