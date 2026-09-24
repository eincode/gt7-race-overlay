import { useMemo } from 'react';
import type { DriverTelemetry } from '../types';

export function useGearInfo(tel: DriverTelemetry) {
  return useMemo(() => {
    const curGear = tel.currentGear === 0 ? 'N' : String(tel.currentGear);
    const shouldShift = tel.suggestedGear > tel.currentGear && tel.EngineRPM > tel.minAlertRPM;
    return { curGear, shouldShift, suggestedGear: tel.suggestedGear };
  }, [tel.currentGear, tel.suggestedGear, tel.EngineRPM, tel.minAlertRPM]);
}
