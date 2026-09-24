import { ST, FONT, clip } from './tokens';

interface Props {
  title: string;
  status?: string;
  statusColor?: string;
  padding?: string;
  marginBottom?: number;
  clipSide?: 'right' | 'left' | 'none';
  titleSize?: number;
  gap?: number;
}

export function STPanelHeader({
  title,
  status,
  statusColor = ST.accent,
  padding = '8px 16px',
  marginBottom,
  clipSide = 'right',
  titleSize = 15,
  gap = 10,
}: Props) {
  const clipPath = clipSide === 'right' ? clip.slashRight : clipSide === 'left' ? clip.slashLeft : undefined;

  return (
    <div style={{
      background: ST.surfaceSolid,
      padding,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...(clipPath ? { clipPath } : {}),
      ...(marginBottom != null ? { marginBottom } : {}),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap }}>
        <span style={{ width: 4, height: 18, background: ST.accent, flexShrink: 0 }} />
        <span style={{
          fontFamily: FONT.title,
          fontSize: titleSize,
          fontWeight: 700,
          letterSpacing: 3,
        }}>
          {title}
        </span>
      </div>
      {status && (
        <span style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          color: statusColor,
          letterSpacing: 2,
          fontWeight: 700,
        }}>
          {status}
        </span>
      )}
    </div>
  );
}
