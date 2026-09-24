import type { RosterEntry } from "../../types";
import { NewDriver } from "./NewDriver";
import { RosterCard } from "./RosterCard";

export function DriversPage({
  roster,
  onRemove,
  onAddDriver,
  error,
}: {
  roster: RosterEntry[];
  onRemove: (id: number) => void;
  onAddDriver: (name: string, country: string, photoBase64: string | null) => void;
  error: string | null;
}) {
  return (
    <main className="grid flex-1 content-start gap-4 p-6 pb-10 grid-cols-[repeat(auto-fit,minmax(400px,1fr))]">
      {error && (
        <p className="col-span-full font-jetbrains text-xs tracking-[0.12em] text-red-400">
          FAILED — {error}
        </p>
      )}
      <NewDriver onAdd={onAddDriver} />
      <RosterCard roster={roster} onRemove={onRemove} />
    </main>
  );
}
