import { useEffect, useState } from 'react';
import type { OverlayData } from '../../../types';
import { fmtLapMs, categoryInfo, loadDriverPhotos, createRosterLookup, getDriverPosition } from '../../../lib/utils';
import { ST, FONT, stripes, clip } from './tokens';
import { Badge } from './Badge';

interface Props {
  state: OverlayData;
  isVisible: boolean;
}

export function STShowcase({ state, isVisible }: Props) {
  const { roster, raceState, drivers } = state;
  const { driverId } = state.overlayState.driverShowcase;
  if (driverId == null) return null;

  const rosterById = createRosterLookup(roster);
  const d = rosterById[driverId];
  const tel = drivers[driverId]?.telemetry;
  if (!d || !tel) return null;

  const [photos, setPhotos] = useState<Record<number, string>>(() => loadDriverPhotos());
  useEffect(() => {
    if (isVisible) setPhotos(loadDriverPhotos());
  }, [isVisible]);
  const photo = photos[driverId] ?? null;

  const cat = categoryInfo(tel.carCategory);
  const currentPos = getDriverPosition(raceState.order, driverId);

  return (
    <div style={{
      position: 'absolute',
      left: '50%', bottom: 50,
      transform: isVisible ? 'translate(-50%, 0)' : 'translate(-50%, 24px)',
      width: 560,
      fontFamily: FONT.body,
      color: ST.ink,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 280ms ease, transform 280ms ease',
      pointerEvents: isVisible ? 'auto' : 'none',
      animation: isVisible ? 'stShowcaseIn 600ms cubic-bezier(.2,.7,.3,1) both' : 'none',
    }}>
      <div style={{
        display: 'flex',
        background: ST.surfaceSolid,
        backgroundImage: stripes,
        clipPath: clip.slashBoth,
      }}>
        {/* Driver portrait */}
        <div style={{
          width: 180, height: 230, position: 'relative',
          background: `linear-gradient(135deg, ${ST.accent}, ${ST.accentDark})`,
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          {photo ? (
            <img
              src={photo}
              alt={d.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />
          ) : (
            <>
              <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
                <defs>
                  <pattern id="stst" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#000" strokeWidth="1.4" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#stst)" />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT.title,
                fontSize: 92, fontWeight: 700,
                color: 'rgba(0,0,0,0.32)', letterSpacing: 2, lineHeight: 1,
              }}>
                {d.name.split(' ').slice(-1)[0].slice(0, 2)}
              </div>
              <div style={{
                position: 'absolute', bottom: 10, left: 10, right: 10,
                fontFamily: FONT.mono,
                fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: 'rgba(0,0,0,0.55)',
              }}>
                // DRIVER PORTRAIT
              </div>
            </>
          )}
        </div>

        {/* Driver info */}
        <div style={{
          flex: 1, padding: '20px 24px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge inline fontSize={11} letterSpacing={2.6} padding="3px 10px">
                NOW DRIVING
              </Badge>
              <Badge inline background={cat.color} color={cat.text} fontSize={11} letterSpacing={1.8} padding="3px 10px">
                {tel.carCategory}
              </Badge>
            </div>
            <div style={{
              fontFamily: FONT.title,
              fontSize: 38, fontWeight: 700, lineHeight: 0.95,
              letterSpacing: 1.2, marginTop: 10,
              textShadow: '0 2px 0 rgba(0,0,0,0.35)',
            }}>
              {d.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <span style={{
                fontFamily: FONT.mono,
                fontSize: 12, fontWeight: 700, letterSpacing: 1.6, color: ST.accent,
              }}>
                {d.country}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 18, marginTop: 12, alignItems: 'flex-end' }}>
            <StatBlock
              label="BEST"
              value={fmtLapMs(tel.bestLaptime)}
              large
            />
            <Divider />
            <StatBlock
              label="LAST"
              value={fmtLapMs(tel.lastLaptime)}
              dim
            />
            <Divider />
            <StatBlock
              label="START"
              value={`P${tel.RaceStartPosition} → P${currentPos}`}
              accent
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  label, value, large, dim, accent,
}: {
  label: string;
  value: string;
  large?: boolean;
  dim?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <div style={{
        fontFamily: FONT.mono,
        fontSize: 9.5, fontWeight: 700, letterSpacing: 1.6, color: ST.inkVeryDim,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: FONT.title,
        fontSize: large ? 22 : 20, fontWeight: large ? 700 : 600,
        fontVariantNumeric: 'tabular-nums', marginTop: 2, letterSpacing: 0.6,
        color: accent ? ST.accent : dim ? ST.inkDim : ST.ink,
      }}>
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, alignSelf: 'stretch', background: ST.border }} />;
}
