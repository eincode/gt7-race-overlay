import type { CSSProperties } from "react";

/**
 * Country flag as an image rather than emoji: OBS on Windows renders flag
 * emoji as two letters. Hidden if the code has no flag.
 */
export function Flag({ country, style }: { country: string; style: CSSProperties }) {
  if (!country) return null;
  return (
    <img
      src={`https://flagcdn.com/h40/${country.toLowerCase()}.png`}
      alt={country}
      style={style}
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  );
}
