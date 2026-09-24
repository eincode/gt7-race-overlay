import type { ReactNode } from "react";

export function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/60 overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-1 h-4 bg-red-500 rounded-sm" />
          <h2 className="text-xs font-bold tracking-widest text-zinc-300 uppercase font-jetbrains">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
