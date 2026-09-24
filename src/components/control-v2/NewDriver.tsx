import { useState } from "react";
import { CountryPicker } from "../control/CountryPicker";
import { PhotoUpload } from "../ui/PhotoUpload";
import { InfoCard } from "./InfoCard";

export function NewDriver({
  onAdd,
}: {
  onAdd: (name: string, country: string, photoBase64: string | null) => void;
}) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim() || !country) return;
    onAdd(name.trim(), country, photo);
    setName("");
    setCountry(null);
    setPhoto(null);
  };

  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <InfoCard title="ADD DRIVER" gap="gap-[14px]">
      <div className="flex flex-wrap gap-4 mb-4">
        <PhotoUpload
          value={photo}
          initials={initials || undefined}
          onChange={setPhoto}
          className="relative h-[124px] w-[124px] shrink-0 rounded-[14px] border-2 border-dashed border-[#52525b] hover:border-[#71717a] transition-colors overflow-hidden bg-[#17171a] flex items-center justify-center group"
        />
        <div className="flex min-w-[220px] flex-1 flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="font-jetbrains text-[10px] font-bold tracking-[0.16em] text-zinc-500">
              NAME
            </span>
            <input
              placeholder="M. LASTNAME"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className="h-[54px] w-full rounded-[11px] border border-[#3f3f46] bg-[#141416] px-4 font-jetbrains text-base text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-white/25"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-jetbrains text-[10px] font-bold tracking-[0.16em] text-zinc-500">
              COUNTRY
            </span>
            <CountryPicker
              value={country}
              onChange={setCountry}
              inputClassName="h-[54px] w-full rounded-[11px] border border-[#3f3f46] bg-[#141416] px-4 pr-10 font-jetbrains text-base text-zinc-200 placeholder:text-zinc-500 focus:border-white/25 focus:outline-none"
            />
          </label>
        </div>
      </div>
      <button
        type="button"
        onClick={submit}
        className="w-full h-[60px] rounded-xl bg-red-600 font-oswald text-lg font-semibold tracking-[0.12em] text-white transition-colors"
      >
        + ADD DRIVER
      </button>
    </InfoCard>
  );
}
