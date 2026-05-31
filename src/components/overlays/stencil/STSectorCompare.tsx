import type { OverlayData } from '../../../types';
import { fmtLapMs, fmtSectorMs } from '../../../lib/utils';
import { ST, clip, sectorColor } from './tokens';

interface Props {
  state: OverlayData;
}

export function STSectorCompare({ state }: Props) {
  const { roster, raceState, drivers } = state;
  const { driverIds } = state.overlayState.sector;
  const { mode, sectorCount } = raceState;

  if (driverIds.length < 2 || sectorCount === 0) return null;

  const [aId, bId] = driverIds;
  const rosterById = Object.fromEntries(roster.map(d => [d.id, d]));
  const isRace = mode === 'race';

  const Row = ({ driverId, isTop }: { driverId: number; isTop: boolean }) => {
    const d = rosterById[driverId];
    const tel = drivers[driverId]?.telemetry;
    const dv = drivers[driverId]?.derived;
    if (!d) return null;

    return (
      <div style={{
        display: 'flex', alignItems: 'stretch',
        borderTop: isTop ? 'none' : `1px solid ${ST.border}`,
      }}>
        {/* Driver info cell */}
        <div style={{
          width: 150, padding: '12px 14px',
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: 19, fontWeight: 700, letterSpacing: 1, lineHeight: 1,
          }}>
            {d.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10, fontWeight: 700, color: ST.inkDim, letterSpacing: 1,
            }}>
              {d.country}
            </span>
            <span style={{ width: 3, height: 3, background: ST.inkVeryDim }} />
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10, color: ST.inkVeryDim, letterSpacing: 0.8,
            }}>
              {fmtLapMs(tel?.bestLaptime)}
            </span>
          </div>
        </div>

        {/* Sector cells — rendered dynamically based on sectorCount */}
        {Array.from({ length: sectorCount }, (_, i) => {
          // Race: last-lap sectors with colour status; Qualifying/Practice: best-lap sectors, always neutral
          const status = isRace ? (dv?.sectorStatus[i] ?? 'neutral') : 'neutral';
          const ms = isRace ? dv?.sectors[i] : dv?.bestLapSectors[i];

          return (
            <div key={i} style={{
              flex: 1, position: 'relative',
              background: sectorColor(status),
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px 0',
            }}>
              <div style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 10, letterSpacing: 1.8, fontWeight: 700,
                color: status === 'neutral' ? ST.inkVeryDim : 'rgba(0,0,0,0.6)',
              }}>
                S{i + 1}
              </div>
              <div style={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: 22, fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: status === 'neutral' ? ST.ink : '#0a0a0d',
                lineHeight: 1, letterSpacing: 0.4,
              }}>
                {fmtSectorMs(ms)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      position: 'absolute', right: 28, top: 28, width: 560,
      fontFamily: '"Barlow Condensed", system-ui, sans-serif',
      color: ST.ink,
      clipPath: clip.slashLeft,
    }}>
      {/* Header */}
      <div style={{
        background: ST.surfaceSolid,
        padding: '10px 18px 10px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 4, height: 24, background: ST.accent }} />
          <span style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: 17, fontWeight: 700, letterSpacing: 3, color: ST.ink,
          }}>
            SECTOR COMPARE
          </span>
        </div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10, color: ST.accent, letterSpacing: 2, fontWeight: 700,
        }}>
          {isRace ? '◆ TIMING LIVE' : '◆ BEST LAP'}
        </div>
      </div>

      <Row driverId={aId} isTop />
      <Row driverId={bId} isTop={false} />
    </div>
  );
}
