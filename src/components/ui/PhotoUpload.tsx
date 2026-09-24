import { useRef, type ChangeEvent } from "react";

export function PhotoUpload({
  value,
  initials,
  onChange,
  className = "relative w-28 h-28 rounded-lg border-2 border-dashed border-zinc-600 hover:border-zinc-400 transition-colors overflow-hidden bg-zinc-900 flex items-center justify-center group",
}: {
  value: string | null;
  initials?: string;
  onChange: (base64: string | null) => void;
  className?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={className}
        title="Click to upload photo"
      >
        {value ? (
          <img
            src={value}
            alt="Driver portrait"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-zinc-600 group-hover:text-zinc-400 transition-colors">
            {initials ? (
              <span className="text-3xl font-bold font-oswald text-zinc-700">
                {initials}
              </span>
            ) : (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
            <span className="text-[10px] tracking-wider font-jetbrains px-1 text-center">
              {initials ? "CHANGE" : "UPLOAD"}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-bold tracking-widest font-jetbrains">
            {value ? "CHANGE" : "UPLOAD"}
          </span>
        </div>
      </button>

      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors font-jetbrains"
        >
          Remove photo
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
