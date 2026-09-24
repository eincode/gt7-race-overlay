import { clip, FONT, ST } from "../tokens";

interface Props {
  curGear: string | number;
  shouldShift: boolean;
}

export function Gear({ curGear, shouldShift }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <span
        style={{
          fontSize: 11,
          letterSpacing: 2,
          color: ST.inkDim,
          fontWeight: 600,
        }}
      >
        GEAR
      </span>
      <div
        style={{
          position: "relative",
          background: shouldShift ? ST.accent : "#000",
          minWidth: 56,
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          clipPath: clip.smallSlash,
        }}
      >
        <span
          style={{
            fontFamily: FONT.title,
            fontSize: 42,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: shouldShift ? "#fff" : ST.ink,
            lineHeight: 1,
          }}
        >
          {curGear}
        </span>
      </div>
    </div>
  );
}
