import type { OverlayData } from '../../../../types';
import { ST, FONT, panelMotion } from '../tokens';
import { STPanelHeader } from '../STPanelHeader';
import { useCurrentSector } from './useCurrentSector';
import { DriverSide } from './DriverSide';

interface Props {
  state: OverlayData;
  isVisible: boolean;
}

export function STCurrentSector({ state, isVisible }: Props) {
  const data = useCurrentSector(state);
  if (!data) return null;

  return (
    <div style={{
      position: 'absolute',
      left: 28, bottom: 28,
      width: 620,
      fontFamily: FONT.body,
      color: ST.ink,
      ...panelMotion(isVisible, 'left'),
    }}>
      <STPanelHeader
        title="CURRENT SECTOR"
        status="\u25c6 LIVE"
        marginBottom={2}
      />

      <div style={{
        background: ST.surface,
        display: 'grid',
        gridTemplateColumns: '1fr 72px 1fr',
      }}>
        <DriverSide data={data} side="a" />

        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 2,
          borderLeft: `1px solid ${ST.border}`,
          borderRight: `1px solid ${ST.border}`,
        }}>
          <div style={{
            fontFamily: FONT.mono,
            fontSize: 9, fontWeight: 700, letterSpacing: 2.5,
            color: ST.inkVeryDim,
          }}>
            SECTOR
          </div>
          <div style={{
            fontFamily: FONT.title,
            fontSize: 36, fontWeight: 700, lineHeight: 1,
            color: ST.accent,
          }}>
            {data.displaySectorIdx + 1}
          </div>
        </div>

        <DriverSide data={data} side="b" />
      </div>
    </div>
  );
}
