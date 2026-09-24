import type { Session, SessionMode } from "../../types";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { SessionMode as SessionModeCard } from "./SessionMode";

export function SessionPage({
  session,
  onModeChanged,
  onDelete,
}: {
  session: Session;
  onModeChanged: (mode: SessionMode) => void;
  onDelete: () => void;
}) {
  return (
    <main className="grid flex-1 content-start gap-4 p-6 pb-10 grid-cols-[repeat(auto-fit,minmax(400px,1fr))]">
      <SessionModeCard
        session={session}
        onModeChanged={onModeChanged}
        onDelete={onDelete}
      />
      <KeyboardShortcuts />
    </main>
  );
}
