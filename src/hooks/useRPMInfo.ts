import { useMemo } from "react";
import type { DriverTelemetry } from "../types";

export function useRPMInfo(tel: DriverTelemetry) {
  return useMemo(() => {
    const max = tel.maxAlertRPM;
    const rpmPctOfMax = Math.min(100, (tel.EngineRPM / max) * 100);
    const rpmPctInAlert = Math.min(
      1,
      (tel.EngineRPM - tel.minAlertRPM) /
        (tel.maxAlertRPM - tel.minAlertRPM || 1),
    );
    const minAlertPct = (tel.minAlertRPM / max) * 100;
    const inAlert = tel.EngineRPM >= tel.minAlertRPM;
    return { rpmPctOfMax, rpmPctInAlert, minAlertPct, inAlert };
  }, [tel.EngineRPM, tel.maxAlertRPM, tel.minAlertRPM]);
}
