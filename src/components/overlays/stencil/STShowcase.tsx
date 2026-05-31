import { useState } from 'react';
import type { OverlayData } from '../../../types';
import { fmtLapMs, categoryInfo, DRIVER_PHOTOS_KEY } from '../../../lib/utils';
import { ST, stripes, clip } from './tokens';

interface Props {
  state: OverlayData;
}

export function STShowcase({ state }: Props) {
  const { roster, raceState, drivers } = state;
  const { driverId } = state.overlayState.driverShowcase;
  if (driverId == null) return null;

  const d = roster.find(x => x.id === driverId);
  const tel = drivers[driverId]?.telemetry;
  if (!d || !tel) return null;

  // Read photos from localStorage on mount. STShowcase unmounts when hidden and
  // remounts when shown, so this always picks up the latest photo for the session.
  const [photos] = useState<Record<number, string>>(() => {
    try { return JSON.parse(localStorage.getItem(DRIVER_PHOTOS_KEY) ?? '{}') as Record<number, string>; }
    catch { return {}; }
  });
  const photo = photos[driverId] ?? null;

  const cat = categoryInfo(tel.carCategory);
  const currentPos = raceState.order.indexOf(driverId) + 1;

  return (
    <div style={{
      position: 'absolute',
      left: '50%', bottom: 50,
      transform: 'translateX(-50%)',
      width: 560,
      fontFamily: '"Barlow Condensed", system-ui, sans-serif',
      color: ST.ink,
      animation: 'stShowcaseIn 600ms cubic-bezier(.2,.7,.3,1) both',
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
                fontFamily: 'Oswald, sans-serif',
                fontSize: 92, fontWeight: 700,
                color: 'rgba(0,0,0,0.32)', letterSpacing: 2, lineHeight: 1,
              }}>
                {d.name.split(' ').slice(-1)[0].slice(0, 2)}
              </div>
              <div style={{
                position: 'absolute', bottom: 10, left: 10, right: 10,
                fontFamily: '"JetBrains Mono", monospace',
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
              <div style={{
                display: 'inline-block',
                background: ST.accent, color: '#fff',
                padding: '3px 10px',
                fontFamily: 'Oswald, sans-serif',
                fontSize: 11, fontWeight: 700, letterSpacing: 2.6,
                clipPath: clip.gearSlash,
              }}>
                NOW DRIVING
              </div>
              <div style={{
                display: 'inline-block',
                background: cat.color, color: cat.text,
                padding: '3px 10px',
                fontFamily: 'Oswald, sans-serif',
                fontSize: 11, fontWeight: 700, letterSpacing: 1.8,
                clipPath: clip.gearSlash,
              }}>
                {tel.carCategory}
              </div>
            </div>
            <div style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: 38, fontWeight: 700, lineHeight: 0.95,
              letterSpacing: 1.2, marginTop: 10,
              textShadow: '0 2px 0 rgba(0,0,0,0.35)',
            }}>
              {d.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <span style={{
                fontFamily: '"JetBrains Mono", monospace',
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
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9.5, fontWeight: 700, letterSpacing: 1.6, color: ST.inkVeryDim,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'Oswald, sans-serif',
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
