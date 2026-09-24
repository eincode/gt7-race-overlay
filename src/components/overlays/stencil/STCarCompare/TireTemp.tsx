import { FONT, ST } from '../tokens';
import { tireTempColor } from '../../../../lib/utils';

interface Props {
  value: number;
  pos: string;
}

export function TireTemp({ value, pos }: Props) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${ST.border}`,
        padding: "6px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1.4,
          color: ST.inkVeryDim,
        }}
      >
        {pos}
      </div>
      <div
        style={{
          fontFamily: FONT.title,
          fontSize: 18,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
          color: tireTempColor(value),
        }}
      >
        {Math.round(value)}
        <span
          style={{
            fontSize: 9,
            color: ST.inkVeryDim,
            fontWeight: 500,
            marginLeft: 2,
          }}
        >
          °
        </span>
      </div>
    </div>
  );
}
