export interface LocalDriver {
  tempId: string;
  name: string;
  country: string; // ISO 3166-1 alpha-2
  photoBase64: string | null;
}

export const EMPTY_FORM: Omit<LocalDriver, "tempId"> = {
  name: "",
  country: "",
  photoBase64: null,
};
