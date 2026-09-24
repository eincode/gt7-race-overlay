import { clip, FONT, ST, stripes } from "../tokens";

interface Props {
  name: string;
  position: number;
  speedKmh: number;
}

export function Header({ name, position, speedKmh }: Props) {
  const isLeader = position === 1;

  return (
    <div
      style={{
        position: "relative",
        background: ST.surfaceSolid,
        backgroundImage: stripes,
        clipPath: clip.slashRight,
        padding: "10px 16px 10px 18px",
        marginBottom: 4,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: ST.accent,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT.title,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              display: "flex",
              alignItems: "center",
              whiteSpace: "hidden",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span
              style={{
                background: isLeader ? ST.leader : ST.accent,
                color: isLeader ? "#0a0a0d" : "#fff",
                fontFamily: FONT.title,
                fontSize: 12,
                fontWeight: 700,
                marginRight: "12px",
                padding: "1px 7px",
              }}
            >
              P{position}
            </span>
            {name}
          </div>
        </div>
        <div
          style={{
            fontFamily: FONT.title,
            fontSize: 20,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: ST.inkDim,
          }}
        >
          {speedKmh.toFixed(0)}
          <span style={{ fontSize: 11, letterSpacing: 1 }}> KM/H</span>
        </div>
      </div>
    </div>
  );
}
