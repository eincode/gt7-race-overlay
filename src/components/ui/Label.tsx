import type { ReactNode } from "react";

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-jetbrains">
      {children}
    </label>
  );
}
