import type { RosterEntry } from "../../types";
import { InfoCard } from "./InfoCard";
import { RosterRow } from "./RosterRow";

export function RosterCard({
  roster,
  onRemove,
}: {
  roster: RosterEntry[];
  onRemove: (id: number) => void;
}) {
  return (
    <InfoCard title="ROSTER" right={`${roster.length} ENTERED`}>
      <div className="flex flex-col gap-4">
        {roster.map((entry, i) => (
          <RosterRow
            key={entry.id}
            entry={entry}
            index={i}
            onRemove={onRemove}
          />
        ))}
      </div>
    </InfoCard>
  );
}
