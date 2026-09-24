import type { HealthResponse } from "../../types";
import { StatusDot } from "../ui/StatusDot";

export function ControlHeader({ health }: { health: HealthResponse | null }) {
  const serverUrl =
    (import.meta.env.VITE_SERVER_URL as string | undefined) ??
    "http://localhost:3000";

  return (
    <header className="mb-6 flex items-center justify-between px-20">
      <div>
        <h1 className="text-xl font-bold tracking-[0.2em] text-zinc-100 font-oswald">
          GT7 · RACE OVERLAY
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5 font-jetbrains tracking-wider">
          Control Panel · {serverUrl}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot ok={health?.ok ?? false} />
        <span className="text-xs text-zinc-400 font-jetbrains">
          {health?.ok ? "Server Online" : "Server Offline"}
        </span>
      </div>
    </header>
  );
}
