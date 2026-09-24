import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { fmtTimestamp } from "../../lib/utils";
import type { DriversListResponse } from "../../types";
import { Card } from "../ui/Card";
import { StatusDot } from "../ui/StatusDot";

export function DriversTable({
  drivers,
}: {
  drivers: DriversListResponse["drivers"];
}) {
  const [rows, setRows] = useState(drivers);
  const [removing, setRemoving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRows(drivers);
  }, [drivers]);

  async function removeDriver(id: number) {
    setRemoving(id);
    setError(null);
    try {
      await api.deleteDriver(id);
      setRows((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <Card title="Drivers">
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-jetbrains">
          <thead>
            <tr className="text-left text-zinc-500 border-b border-zinc-700/50">
              {["ID", "Name", "Car Code", "Status", "Last Seen", ""].map(
                (h, i) => (
                  <th key={i} className="pb-2 pr-4 font-bold tracking-wider">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} className="border-b border-zinc-800/60">
                <td className="py-2 pr-4 text-zinc-400">{d.id}</td>
                <td className="py-2 pr-4 text-zinc-200 font-bold">{d.name}</td>
                <td className="py-2 pr-4 text-zinc-500">{d.carCode}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`flex items-center gap-1.5 ${d.connected ? "text-green-400" : "text-zinc-500"}`}
                  >
                    <StatusDot ok={d.connected} />
                    {d.connected ? "Connected" : "Offline"}
                  </span>
                </td>
                <td className="py-2 pr-4 text-zinc-500">
                  {d.lastSeen ? fmtTimestamp(d.lastSeen) : "—"}
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => void removeDriver(d.id)}
                    disabled={removing === d.id}
                    className="p-1 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40"
                    title="Remove driver"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-400 font-jetbrains">{error}</p>
      )}
    </Card>
  );
}
