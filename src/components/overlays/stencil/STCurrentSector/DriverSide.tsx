import { fmtSectorMs } from '../../../../lib/utils';
import { ST, FONT, clip } from '../tokens';
import { Badge } from '../Badge';
import type { CurrentSectorData } from './useCurrentSector';

interface Props {
  data: CurrentSectorData;
  side: 'a' | 'b';
}

function fmtDelta(ms: number): string {
  return `${ms >= 0 ? '+' : '-'}${(Math.abs(ms) / 1000).toFixed(3)}`;
}

function resolveColor(key: string): string {
  switch (key) {
    case 'dim':  return ST.inkDim;
    case 'gain': return ST.gain;
    case 'loss': return ST.loss;
    default:     return ST.ink;
  }
}

export function DriverSide({ data, side }: Props) {
  const isA = side === 'a';
  const name = isA ? data.dA.name : data.dB.name;
  const pos = isA ? data.posA : data.posB;
  const displayMs = isA ? data.aDisplayMs : data.bDisplayMs;
  const colorKey = isA ? data.aColor : data.bColor;
  const isLeader = pos === 1;

  return (
    <div style={{
      padding: isA ? '14px 0 14px 16px' : '14px 16px 14px 0',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        justifyContent: isA ? 'flex-start' : 'flex-end',
      }}>
        {isA && (
          <Badge
            background={isLeader ? ST.leader : '#000'}
            color={isLeader ? '#0a0a0d' : ST.ink}
            padding="2px 8px"
            clipType={clip.smallSlash}
            tabular
          >
            P{pos}
          </Badge>
        )}
        <div style={{
          fontFamily: FONT.title,
          fontSize: 18, fontWeight: 700, letterSpacing: 0.8,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {name}
        </div>
        {!isA && (
          <Badge
            background="#000"
            color={ST.ink}
            padding="2px 8px"
            clipType={clip.smallSlash}
            tabular
          >
            P{pos}
          </Badge>
        )}
      </div>

      <div style={{
        textAlign: isA ? 'right' : 'left',
        paddingRight: isA ? 10 : 0,
        paddingLeft: isA ? 0 : 10,
      }}>
        <div style={{
          fontFamily: FONT.title,
          fontSize: 36, fontWeight: 700, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums', letterSpacing: 0.6,
          color: resolveColor(colorKey),
        }}>
          {displayMs != null ? fmtSectorMs(displayMs) : '\u2014'}
        </div>
        {!isA && data.deltaMs !== null && (
          <div style={{
            fontFamily: FONT.title,
            fontSize: 20, fontWeight: 700, lineHeight: 1,
            fontVariantNumeric: 'tabular-nums', letterSpacing: 0.6,
            color: data.isBFaster ? ST.gain : ST.loss,
            marginTop: 4,
          }}>
            {fmtDelta(data.deltaMs)}
          </div>
        )}
      </div>
    </div>
  );
}
