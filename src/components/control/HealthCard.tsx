import type { HealthResponse } from "../../types";
import { Card } from "../ui/Card";
import { StatusDot } from "../ui/StatusDot";

export function HealthCard({
  health,
  error,
}: {
  health: HealthResponse | null;
  error: string | null;
}) {
  return (
    <Card title="Server Status">
      {error ? (
        <p className="text-sm text-red-400 font-jetbrains">{error}</p>
      ) : health ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {[
            {
              label: "Server",
              value: (
                <span className="flex items-center gap-2">
                  <StatusDot ok={health.ok} />
                  {health.ok ? "Online" : "Error"}
                </span>
              ),
            },
            {
              label: "Session",
              value: (
                <span className="flex items-center gap-2">
                  <StatusDot ok={health.session} />
                  {health.session ? "Active" : "None"}
                </span>
              ),
            },
            {
              label: "Drivers",
              value: `${health.drivers.connected} / ${health.drivers.total}`,
            },
            { label: "Overlay Clients", value: String(health.overlayClients) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-jetbrains">
                {label}
              </p>
              <p className="text-zinc-200 font-jetbrains">{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500 font-jetbrains">Polling…</p>
      )}
    </Card>
  );
}
