import { Card } from "../ui/Card";

export function KeyboardShortcuts() {
  const shortcuts = [
    { key: "Alt + 1", action: "Toggle Standings" },
    { key: "Alt + 2", action: "Toggle Sector Compare" },
    { key: "Alt + 3", action: "Toggle Car Telemetry" },
    { key: "Alt + 4", action: "Toggle Driver Showcase" },
    { key: "Alt + 5", action: "Toggle Driver Telemetry" },
  ];

  return (
    <Card title="Keyboard Shortcuts">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {shortcuts.map(({ key, action }) => (
          <div key={key} className="flex items-center gap-2.5 py-0.5">
            <kbd className="inline-flex items-center px-2 py-0.5 rounded border border-zinc-600 bg-zinc-800/80 text-[11px] font-bold text-zinc-200 font-jetbrains min-w-[68px] justify-center">
              {key}
            </kbd>
            <span className="text-xs text-zinc-400 font-jetbrains">
              {action}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
