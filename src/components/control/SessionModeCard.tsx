import { useState } from "react";
import { api } from "../../lib/api";
import type { Session, SessionMode } from "../../types";
import { Card } from "../ui/Card";
import { ModeTabs } from "./ModeTabs";

export function SessionModeCard({
  session,
  onModeChanged,
}: {
  session: Session;
  onModeChanged: (mode: SessionMode) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = session.mode;

  async function switchMode(mode: SessionMode) {
    if (mode === current || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.setMode(mode);
      onModeChanged(mode);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Session Mode">
      <ModeTabs
        current={current}
        onSelect={(m) => void switchMode(m)}
        disabled={busy}
      />
      {error && (
        <p className="mt-3 text-xs text-red-400 font-jetbrains">{error}</p>
      )}
    </Card>
  );
}
