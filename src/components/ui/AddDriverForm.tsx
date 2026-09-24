import { useState } from "react";
import { CountryPicker } from "../control/CountryPicker";
import { EMPTY_FORM, type LocalDriver } from "../control/localDriver";
import { Input } from "./Input";
import { Label } from "./Label";
import { PhotoUpload } from "./PhotoUpload";

export function AddDriverForm({ onAdd }: { onAdd: (d: LocalDriver) => void }) {
  const [form, setForm] = useState<Omit<LocalDriver, "tempId">>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LocalDriver, string>>
  >({});

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.country) e.country = "Select a country";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAdd() {
    if (!validate()) return;
    onAdd({ ...form, tempId: `${Date.now()}-${Math.random()}` });
    setForm(EMPTY_FORM);
    setErrors({});
  }

  const initials = form.name
    ? form.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <div className="rounded-lg border border-zinc-700/40 bg-zinc-900/40 p-4">
      <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-4 font-jetbrains">
        Add Driver
      </h3>

      <div className="flex gap-6">
        {/* Photo */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <Label>Photo</Label>
          <PhotoUpload
            value={form.photoBase64}
            initials={initials}
            onChange={(val) => set("photoBase64", val)}
          />
        </div>

        {/* Fields */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Name */}
          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="M. LASTNAME"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Country picker */}
          <div>
            <Label>Country *</Label>
            <CountryPicker
              value={form.country || null}
              onChange={(code) => set("country", code ?? "")}
            />
            {errors.country && (
              <p className="mt-1 text-xs text-red-400">{errors.country}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleAdd}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold tracking-wider rounded transition-colors"
            >
              + Add Driver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
