import type {
  DriversListResponse,
  HealthResponse,
  RosterEntry,
  SessionMode,
  SessionResponse,
  Track,
} from "../types";

type OkResponse = { ok: boolean };

export function baseUrl(): string {
  return (
    (import.meta.env.VITE_SERVER_URL as string | undefined) ??
    `http://${window.location.hostname}:3000`
  );
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw Object.assign(
      new Error((data as { error?: string }).error ?? "Request failed"),
      {
        status: res.status,
      },
    );
  }
  return data;
}

export const api = {
  health(): Promise<HealthResponse> {
    return fetchJSON<HealthResponse>(`${baseUrl()}/health`);
  },

  getSession(): Promise<SessionResponse> {
    return fetchJSON<SessionResponse>(`${baseUrl()}/session`);
  },

  createSession(
    roster: RosterEntry[],
    mode: SessionMode,
    trackId: string,
  ): Promise<SessionResponse> {
    return fetchJSON<SessionResponse>(`${baseUrl()}/session`, {
      method: "POST",
      body: JSON.stringify({ roster, mode, trackId }),
    });
  },

  deleteSession(): Promise<{ ok: boolean }> {
    return fetchJSON<{ ok: boolean }>(`${baseUrl()}/session`, {
      method: "DELETE",
    });
  },

  getDrivers(): Promise<DriversListResponse> {
    return fetchJSON<DriversListResponse>(`${baseUrl()}/drivers`);
  },

  getTracks(): Promise<Track[]> {
    return fetchJSON<Track[]>(`${baseUrl()}/tracks`);
  },

  joinDriver(
    driverId: number,
  ): Promise<{ token: string; driverId: number; name: string }> {
    return fetchJSON(`${baseUrl()}/driver/join`, {
      method: "POST",
      body: JSON.stringify({ driverId }),
    });
  },

  addDriver(driver: RosterEntry): Promise<OkResponse> {
    return fetchJSON<OkResponse>(`${baseUrl()}/driver`, {
      method: "POST",
      body: JSON.stringify(driver),
    });
  },

  deleteDriver(driverId: number): Promise<OkResponse> {
    return fetchJSON<OkResponse>(`${baseUrl()}/driver`, {
      method: "DELETE",
      body: JSON.stringify({ driverId }),
    });
  },

  // ── Session mode ─────────────────────────────────────────────────────────

  setMode(mode: SessionMode): Promise<{ ok: boolean; mode: SessionMode }> {
    return fetchJSON(`${baseUrl()}/session/mode`, {
      method: "POST",
      body: JSON.stringify({ mode }),
    });
  },

  // ── Overlay panel controls ────────────────────────────────────────────────

  setStandings(body: { visible?: boolean }): Promise<OkResponse> {
    return fetchJSON<OkResponse>(`${baseUrl()}/overlay/standings`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  setSector(body: {
    visible?: boolean;
    driverIds?: number[];
  }): Promise<OkResponse> {
    return fetchJSON<OkResponse>(`${baseUrl()}/overlay/sector`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  setCarTelemetry(body: {
    visible?: boolean;
    driverIds?: number[];
  }): Promise<OkResponse> {
    return fetchJSON<OkResponse>(`${baseUrl()}/overlay/car-telemetry`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  setDriverShowcase(body: {
    visible?: boolean;
    driverId?: number | null;
  }): Promise<OkResponse> {
    return fetchJSON<OkResponse>(`${baseUrl()}/overlay/driver-showcase`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  setDriverTelemetry(body: {
    visible?: boolean;
    driverId?: number | null;
  }): Promise<OkResponse> {
    return fetchJSON<OkResponse>(`${baseUrl()}/overlay/driver-telemetry`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  wsUrl(): string {
    return baseUrl().replace(/^http/, "ws") + "/overlay";
  },
};
