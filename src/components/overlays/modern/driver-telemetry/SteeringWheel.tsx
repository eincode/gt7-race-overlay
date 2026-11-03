import { telemetryStyles as T } from "../styles";

/** Wheel inside a fixed crosshair ring, turned `rotationDeg` degrees clockwise (0 = centred). */
export function SteeringWheel({ rotationDeg }: { rotationDeg: number }) {
  return (
    <svg viewBox="0 0 100 100" style={T.wheel} aria-hidden>
      <g stroke="#fff" strokeWidth={1} opacity={0.6} fill="none">
        <circle cx={50} cy={50} r={46} />
        <line x1={50} y1={0} x2={50} y2={9} />
        <line x1={0} y1={50} x2={9} y2={50} />
        <line x1={91} y1={50} x2={100} y2={50} />
        <line x1={50} y1={91} x2={50} y2={100} />
      </g>

      <g transform={`rotate(${rotationDeg} 50 50)`} fill="#fff">
        <circle cx={50} cy={50} r={34} fill="none" stroke="#fff" strokeWidth={7} />
        <rect x={17} y={46} width={66} height={8} rx={2} />
        <path d="M44 52 H56 L59 83 H41 Z" />
        <circle cx={50} cy={51} r={11} />
      </g>
    </svg>
  );
}
