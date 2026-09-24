import type { ReactNode } from "react";

export function InfoCard({
  title,
  right,
  children,
  gap = "gap-4",
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  gap?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[18px] border border-white/9 bg-[#1c1c1f] ${gap} px-5 py-[18px]`}
    >
      <div className="flex items-center gap-4 mb-[18px]">
        <span className={`h-[34px] w-1 rounded-sm bg-red-600`} />
        <span className="flex-1 font-oswald text-[21px] font-medium tracking-[0.07em] text-zinc-100">
          {title}
        </span>
        {right && (
          <span className="font-jetbrains text-xs text-zinc-500">{right}</span>
        )}
      </div>
      {children}
    </section>
  );
}
