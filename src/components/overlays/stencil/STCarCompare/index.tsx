import { createRosterLookup, getDriverPosition } from "../../../../lib/utils";
import type { OverlayData } from "../../../../types";
import { STPanelHeader } from "../STPanelHeader";
import { FONT, panelMotion, ST } from "../tokens";
import { Side } from "./Side";

interface Props {
  state: OverlayData;
  isVisible: boolean;
}

export function STCarCompare({ state, isVisible }: Props) {
  const { roster, drivers, raceState } = state;
  const { driverIds } = state.overlayState.carTelemetry;

  if (driverIds.length < 1) return null;
  const [aId, bId] = driverIds;
  const solo = driverIds.length === 1;

  const rosterById = createRosterLookup(roster);
  const aTel = drivers[aId]?.telemetry;
  const bTel = solo ? undefined : drivers[bId]?.telemetry;
  const dA = rosterById[aId];
  const dB = solo ? undefined : rosterById[bId];

  if (!aTel || !dA) return null;
  if (!solo && (!bTel || !dB)) return null;

  const aPos = getDriverPosition(raceState.order, aId);
  const bPos = solo ? 0 : getDriverPosition(raceState.order, bId);

  return (
    <div
      style={{
        position: "absolute",
        right: 28,
        bottom: 28,
        width: solo ? 380 : 700,
        fontFamily: FONT.body,
        color: ST.ink,
        ...panelMotion(isVisible, "right"),
      }}
    >
      <STPanelHeader
        title={solo ? "LIVE TELEMETRY" : "BATTLE · LIVE TELEMETRY"}
        status={solo ? `P${aPos}` : `P${aPos} VS P${bPos}`}
        statusColor={ST.inkDim}
      />

      <div style={{ display: "flex", position: "relative", marginTop: 2 }}>
        <Side d={dA} tel={aTel} mirror={false} />
        {!solo && bTel && dB && (
          <>
            <div style={{ width: 2, background: ST.accent }} />
            <Side d={dB} tel={bTel} mirror={false} />
          </>
        )}
      </div>
    </div>
  );
}
