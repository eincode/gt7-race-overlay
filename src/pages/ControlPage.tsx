import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { api } from '../lib/api';
import { useOverlayWS } from '../hooks/useOverlayWS';
import { fmtTimestamp, DRIVER_PHOTOS_KEY } from '../lib/utils';
import { CountryPicker } from '../components/control/CountryPicker';
import { countryFlag } from '../lib/countryList';
import type {
  HealthResponse,
  OverlayState,
  RosterEntry,
  Session,
  SessionMode,
  DriversListResponse,
} from '../types';

const MODES: { value: SessionMode; label: string }[] = [
  { value: 'race',       label: 'Race' },
  { value: 'qualifying', label: 'Qualifying' },
  { value: 'practice',   label: 'Practice' },
];

// ── LocalDriver type (in-memory only, not sent to server) ───────────────────

interface LocalDriver {
  tempId: string;
  name: string;
  country: string; // ISO 3166-1 alpha-2
  photoBase64: string | null;
}

const EMPTY_FORM: Omit<LocalDriver, 'tempId'> = {
  name: '',
  country: '',
  photoBase64: null,
};

// ── Demo roster (no photos) ──────────────────────────────────────────────────

const DEMO_LOCAL: LocalDriver[] = [
  { tempId: 'd1', name: 'M. TANAKA',  country: 'JP', photoBase64: null },
  { tempId: 'd2', name: 'K. SCHMIDT', country: 'DE', photoBase64: null },
  { tempId: 'd3', name: 'L. ROSSI',   country: 'IT', photoBase64: null },
  { tempId: 'd4', name: 'A. BENNETT', country: 'GB', photoBase64: null },
  { tempId: 'd5', name: 'R. SILVA',   country: 'BR', photoBase64: null },
  { tempId: 'd6', name: 'J. DUBOIS',  country: 'FR', photoBase64: null },
];

// ── Shared UI atoms ──────────────────────────────────────────────────────────

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/60 overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-1 h-4 bg-red-500 rounded-sm" />
          <h2 className="text-xs font-bold tracking-widest text-zinc-300 uppercase font-[family-name:var(--font-jetbrains)]">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${ok ? 'bg-green-400' : 'bg-red-500'}`} />;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-[family-name:var(--font-jetbrains)]">
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors ${props.className ?? ''}`}
    />
  );
}

// ── Photo upload area ────────────────────────────────────────────────────────

function PhotoUpload({
  value,
  initials,
  onChange,
}: {
  value: string | null;
  initials?: string;
  onChange: (base64: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative w-28 h-28 rounded-lg border-2 border-dashed border-zinc-600 hover:border-zinc-400 transition-colors overflow-hidden bg-zinc-900 flex items-center justify-center group"
        title="Click to upload photo"
      >
        {value ? (
          <img src={value} alt="Driver portrait" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-zinc-600 group-hover:text-zinc-400 transition-colors">
            {initials ? (
              <span className="text-3xl font-bold font-[family-name:var(--font-oswald)] text-zinc-700">
                {initials}
              </span>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            <span className="text-[10px] tracking-wider font-[family-name:var(--font-jetbrains)] px-1 text-center">
              {initials ? 'CHANGE' : 'UPLOAD'}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-bold tracking-widest font-[family-name:var(--font-jetbrains)]">
            {value ? 'CHANGE' : 'UPLOAD'}
          </span>
        </div>
      </button>

      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors font-[family-name:var(--font-jetbrains)]"
        >
          Remove photo
        </button>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── Driver card (in roster list) ─────────────────────────────────────────────

function DriverCard({
  driver,
  index,
  onRemove,
}: {
  driver: LocalDriver;
  index: number;
  onRemove: () => void;
}) {
  const flag = driver.country ? countryFlag(driver.country) : '🏁';

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/60 border border-zinc-700/40 group">
      {/* Photo / initials */}
      <div className="w-12 h-12 rounded-md overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center">
        {driver.photoBase64 ? (
          <img src={driver.photoBase64} alt={driver.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-bold font-[family-name:var(--font-oswald)] text-zinc-600">
            {driver.name ? driver.name.split(' ').map(w => w[0]).join('').slice(0, 2) : '?'}
          </span>
        )}
      </div>

      {/* Position badge */}
      <div className="w-8 text-center font-bold text-zinc-400 text-sm font-[family-name:var(--font-oswald)] shrink-0">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Flag */}
      <span className="text-xl shrink-0">{flag}</span>

      {/* Name + country code */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-zinc-100 text-sm truncate font-[family-name:var(--font-barlow)]">
          {driver.name || <span className="text-zinc-500 italic">Unnamed</span>}
        </div>
        <div className="text-xs text-zinc-500 font-[family-name:var(--font-jetbrains)] mt-0.5">
          {driver.country || '—'}
        </div>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-1"
        title="Remove driver"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Add driver form ──────────────────────────────────────────────────────────

function AddDriverForm({ onAdd }: { onAdd: (d: LocalDriver) => void }) {
  const [form, setForm] = useState<Omit<LocalDriver, 'tempId'>>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof LocalDriver, string>>>({});

  function set<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.country) e.country = 'Select a country';
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
    ? form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <div className="rounded-lg border border-zinc-700/40 bg-zinc-900/40 p-4">
      <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-4 font-[family-name:var(--font-jetbrains)]">
        Add Driver
      </h3>

      <div className="flex gap-6">
        {/* Photo */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <Label>Photo</Label>
          <PhotoUpload
            value={form.photoBase64}
            initials={initials}
            onChange={val => set('photoBase64', val)}
          />
        </div>

        {/* Fields */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Name */}
          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="M. LASTNAME"
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* Country picker */}
          <div>
            <Label>Country *</Label>
            <CountryPicker
              value={form.country || null}
              onChange={code => set('country', code ?? '')}
            />
            {errors.country && <p className="mt-1 text-xs text-red-400">{errors.country}</p>}
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

// ── Roster builder ───────────────────────────────────────────────────────────

function RosterBuilder({ onSessionCreated }: { onSessionCreated: (s: Session) => void }) {
  const [drivers, setDrivers] = useState<LocalDriver[]>([]);
  const [mode, setMode] = useState<SessionMode>('practice');
  const [trackId, setTrackId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function addDriver(d: LocalDriver) {
    setDrivers(prev => [...prev, d]);
  }

  function removeDriver(tempId: string) {
    setDrivers(prev => prev.filter(d => d.tempId !== tempId));
  }

  function loadDemo() {
    setDrivers(DEMO_LOCAL);
  }

  async function createSession() {
    if (drivers.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      const roster: RosterEntry[] = drivers.map((d, i) => ({
        id: i + 1,
        name: d.name,
        country: d.country,
      }));
      const res = await api.createSession(roster, mode, trackId.trim());

      // Persist photos locally — server doesn't accept them.
      // Keyed by the same IDs assigned above (i + 1).
      const photos: Record<number, string> = {};
      drivers.forEach((d, i) => { if (d.photoBase64) photos[i + 1] = d.photoBase64; });
      localStorage.setItem(DRIVER_PHOTOS_KEY, JSON.stringify(photos));

      setDrivers([]);
      onSessionCreated(res.session);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      title={`Roster Builder · ${drivers.length} driver${drivers.length !== 1 ? 's' : ''}`}
      action={
        <button
          type="button"
          onClick={loadDemo}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-[family-name:var(--font-jetbrains)] tracking-wider"
        >
          Load demo →
        </button>
      }
    >
      {/* Mode selector */}
      <div className="mb-5">
        <Label>Session Mode</Label>
        <div className="flex gap-2">
          {MODES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`flex-1 py-2 text-sm font-bold tracking-wider rounded transition-colors font-[family-name:var(--font-oswald)] ${
                mode === value
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Track ID */}
      <div className="mb-5">
        <Label>Track ID</Label>
        <Input
          value={trackId}
          onChange={e => setTrackId(e.target.value)}
          placeholder="e.g. tokyo_east"
        />
      </div>

      {/* Driver list */}
      {drivers.length > 0 && (
        <div className="flex flex-col gap-2 mb-5">
          {drivers.map((d, i) => (
            <DriverCard
              key={d.tempId}
              driver={d}
              index={i}
              onRemove={() => removeDriver(d.tempId)}
            />
          ))}
        </div>
      )}

      {drivers.length === 0 && (
        <p className="text-sm text-zinc-600 italic mb-5 font-[family-name:var(--font-jetbrains)]">
          No drivers yet. Fill in the form below or load a demo roster.
        </p>
      )}

      {/* Add form */}
      <AddDriverForm onAdd={addDriver} />

      {/* Create session */}
      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={createSession}
          disabled={drivers.length === 0 || !trackId.trim() || busy}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold tracking-wider rounded transition-colors"
        >
          {busy ? 'Creating…' : `Create Session (${drivers.length} driver${drivers.length !== 1 ? 's' : ''})`}
        </button>
        {drivers.length > 0 && (
          <button
            type="button"
            onClick={() => setDrivers([])}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors font-[family-name:var(--font-jetbrains)]"
          >
            Clear all
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-400 font-[family-name:var(--font-jetbrains)]">{error}</p>}
    </Card>
  );
}

// ── Session mode card ─────────────────────────────────────────────────────────

function SessionModeCard({
  session,
  onModeChanged,
}: {
  session: Session;
  onModeChanged: (mode: SessionMode) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = session.mode;

  async function switchMode(mode: SessionMode) {
    if (mode === current || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.setMode(mode);
      onModeChanged(mode);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Session Mode">
      <div className="flex gap-2">
        {MODES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => void switchMode(value)}
            disabled={busy}
            className={`flex-1 py-2.5 text-sm font-bold tracking-wider rounded transition-colors font-[family-name:var(--font-oswald)] disabled:opacity-50 ${
              current === value
                ? 'bg-red-600 text-white'
                : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-3 text-xs text-red-400 font-[family-name:var(--font-jetbrains)]">{error}</p>
      )}
    </Card>
  );
}

// ── Overlay controls ─────────────────────────────────────────────────────────

function ToggleBtn({
  visible, busy, onClick,
}: { visible: boolean; busy?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`px-3 py-1.5 text-xs font-bold tracking-widest rounded transition-colors font-[family-name:var(--font-jetbrains)] disabled:opacity-50 ${
        visible
          ? 'bg-red-600 hover:bg-red-500 text-white'
          : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-400'
      }`}
    >
      {visible ? '● LIVE' : '○ HIDDEN'}
    </button>
  );
}

function DriverSelect({
  label, value, roster, onChange, disabled,
}: {
  label: string;
  value: number | null;
  roster: RosterEntry[];
  onChange: (id: number | null) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value !== '' ? Number(e.target.value) : null)}
        disabled={disabled}
        className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-400 transition-colors disabled:opacity-50"
      >
        <option value="">— none —</option>
        {roster.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
    </div>
  );
}

function PanelRow({
  title, visible, busy, onToggle, children,
}: {
  title: string;
  visible: boolean;
  busy?: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-700/40 bg-zinc-900/30 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-200 font-[family-name:var(--font-barlow)] tracking-wide">
          {title}
        </span>
        <ToggleBtn visible={visible} busy={busy} onClick={onToggle} />
      </div>
      {children}
    </div>
  );
}

/** Overlay panel visibility controls — shown when a session is active. */
function OverlayControls({ session, overlayState: serverOverlayState }: {
  session: Session;
  overlayState: OverlayState;
}) {
  const { roster } = session;
  const [panels, setPanels] = useState<OverlayState>(serverOverlayState);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync from server when state changes (e.g. another control panel instance made changes).
  // Uses a functional updater that returns `prev` unchanged when values are identical,
  // so React skips re-renders on the 60Hz WS ticks where nothing changed.
  useEffect(() => {
    setPanels(prev => {
      const next = serverOverlayState;
      const equal =
        prev.standings.visible === next.standings.visible &&
        prev.sector.visible === next.sector.visible &&
        prev.sector.driverIds.length === next.sector.driverIds.length &&
        prev.sector.driverIds.every((id, i) => id === next.sector.driverIds[i]) &&
        prev.carTelemetry.visible === next.carTelemetry.visible &&
        prev.carTelemetry.driverIds.length === next.carTelemetry.driverIds.length &&
        prev.carTelemetry.driverIds.every((id, i) => id === next.carTelemetry.driverIds[i]) &&
        prev.driverShowcase.visible === next.driverShowcase.visible &&
        prev.driverShowcase.driverId === next.driverShowcase.driverId;
      return equal ? prev : next;
    });
  }, [serverOverlayState]);

  async function post(key: string, fn: () => Promise<unknown>, apply: (prev: OverlayState) => OverlayState) {
    setBusy(key);
    setError(null);
    try {
      await fn();
      setPanels(apply);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  // ── Standings ────────────────────────────────────────────────────────────

  function toggleStandings() {
    const next = !panels.standings.visible;
    void post('standings',
      () => api.setStandings({ visible: next }),
      p => ({ ...p, standings: { visible: next } }),
    );
  }

  // ── Sector Compare ───────────────────────────────────────────────────────

  function toggleSector() {
    const next = !panels.sector.visible;
    void post('sector',
      () => api.setSector({ visible: next, driverIds: panels.sector.driverIds }),
      p => ({ ...p, sector: { ...p.sector, visible: next } }),
    );
  }

  function setSectorDriver(slot: 0 | 1, id: number | null) {
    const ids: number[] = [...panels.sector.driverIds];
    if (id === null) ids.splice(slot, 1);
    else ids[slot] = id;
    const driverIds = ids.filter((x): x is number => x != null).slice(0, 2);
    void post('sector',
      () => api.setSector({ driverIds }),
      p => ({ ...p, sector: { ...p.sector, driverIds } }),
    );
  }

  // ── Car Telemetry ────────────────────────────────────────────────────────

  function toggleCarTelemetry() {
    const next = !panels.carTelemetry.visible;
    void post('carTelemetry',
      () => api.setCarTelemetry({ visible: next, driverIds: panels.carTelemetry.driverIds }),
      p => ({ ...p, carTelemetry: { ...p.carTelemetry, visible: next } }),
    );
  }

  function setCarTelDriver(slot: 0 | 1, id: number | null) {
    const ids: number[] = [...panels.carTelemetry.driverIds];
    if (id === null) ids.splice(slot, 1);
    else ids[slot] = id;
    const driverIds = ids.filter((x): x is number => x != null).slice(0, 2);
    void post('carTelemetry',
      () => api.setCarTelemetry({ driverIds }),
      p => ({ ...p, carTelemetry: { ...p.carTelemetry, driverIds } }),
    );
  }

  // ── Driver Showcase ──────────────────────────────────────────────────────

  function toggleShowcase() {
    const next = !panels.driverShowcase.visible;
    void post('driverShowcase',
      () => api.setDriverShowcase({ visible: next, driverId: panels.driverShowcase.driverId }),
      p => ({ ...p, driverShowcase: { ...p.driverShowcase, visible: next } }),
    );
  }

  function setShowcaseDriver(id: number | null) {
    void post('driverShowcase',
      () => api.setDriverShowcase({ driverId: id }),
      p => ({ ...p, driverShowcase: { ...p.driverShowcase, driverId: id } }),
    );
  }

  return (
    <Card title="Overlay Controls">
      <div className="flex flex-col gap-3">

        {/* Standings */}
        <PanelRow
          title="Standings"
          visible={panels.standings.visible}
          busy={busy === 'standings'}
          onToggle={toggleStandings}
        />

        {/* Sector Compare */}
        <PanelRow
          title="Sector Compare"
          visible={panels.sector.visible}
          busy={busy === 'sector'}
          onToggle={toggleSector}
        >
          <div className="grid grid-cols-2 gap-3 mt-3">
            <DriverSelect
              label="Driver A"
              value={panels.sector.driverIds[0] ?? null}
              roster={roster}
              disabled={busy === 'sector'}
              onChange={id => setSectorDriver(0, id)}
            />
            <DriverSelect
              label="Driver B"
              value={panels.sector.driverIds[1] ?? null}
              roster={roster}
              disabled={busy === 'sector'}
              onChange={id => setSectorDriver(1, id)}
            />
          </div>
        </PanelRow>

        {/* Car Telemetry */}
        <PanelRow
          title="Car Telemetry"
          visible={panels.carTelemetry.visible}
          busy={busy === 'carTelemetry'}
          onToggle={toggleCarTelemetry}
        >
          <div className="grid grid-cols-2 gap-3 mt-3">
            <DriverSelect
              label="Driver A"
              value={panels.carTelemetry.driverIds[0] ?? null}
              roster={roster}
              disabled={busy === 'carTelemetry'}
              onChange={id => setCarTelDriver(0, id)}
            />
            <DriverSelect
              label="Driver B"
              value={panels.carTelemetry.driverIds[1] ?? null}
              roster={roster}
              disabled={busy === 'carTelemetry'}
              onChange={id => setCarTelDriver(1, id)}
            />
          </div>
        </PanelRow>

        {/* Driver Showcase */}
        <PanelRow
          title="Driver Showcase"
          visible={panels.driverShowcase.visible}
          busy={busy === 'driverShowcase'}
          onToggle={toggleShowcase}
        >
          <div className="mt-3">
            <DriverSelect
              label="Driver"
              value={panels.driverShowcase.driverId}
              roster={roster}
              disabled={busy === 'driverShowcase'}
              onChange={setShowcaseDriver}
            />
          </div>
        </PanelRow>

      </div>
      {error && (
        <p className="mt-3 text-xs text-red-400 font-[family-name:var(--font-jetbrains)]">{error}</p>
      )}
    </Card>
  );
}

// ── Active session card ──────────────────────────────────────────────────────

function ActiveSessionCard({
  session,
  onDeleted,
}: {
  session: Session;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm('Delete the active session? This will disconnect all drivers.')) return;
    setBusy(true);
    try {
      await api.deleteSession();
      localStorage.removeItem(DRIVER_PHOTOS_KEY);
      onDeleted();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const statusColor =
    session.status === 'racing' ? 'text-green-400' :
    session.status === 'waiting' ? 'text-yellow-400' :
    'text-zinc-400';

  return (
    <Card title="Active Session">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 text-sm">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-[family-name:var(--font-jetbrains)]">Session ID</p>
          <p className="text-zinc-300 font-[family-name:var(--font-jetbrains)] text-xs">{session.id.slice(0, 8)}…</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-[family-name:var(--font-jetbrains)]">Status</p>
          <p className={`font-bold font-[family-name:var(--font-oswald)] tracking-wider ${statusColor}`}>
            {session.status.toUpperCase()}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-[family-name:var(--font-jetbrains)]">Drivers</p>
          <p className="text-zinc-300 font-[family-name:var(--font-jetbrains)]">{session.roster.length}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-[family-name:var(--font-jetbrains)]">Created</p>
          <p className="text-zinc-300 font-[family-name:var(--font-jetbrains)] text-xs">{fmtTimestamp(session.createdAt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleDelete}
          disabled={busy}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-bold tracking-wider rounded transition-colors"
        >
          {busy ? 'Deleting…' : 'Delete Session'}
        </button>
        <a
          href="/overlay/stencil"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-bold tracking-wider rounded transition-colors"
        >
          Open Overlay ↗
        </a>
      </div>
      {error && <p className="mt-3 text-sm text-red-400 font-[family-name:var(--font-jetbrains)]">{error}</p>}
    </Card>
  );
}

// ── Health card ──────────────────────────────────────────────────────────────

function HealthCard({ health, error }: { health: HealthResponse | null; error: string | null }) {
  return (
    <Card title="Server Status">
      {error ? (
        <p className="text-sm text-red-400 font-[family-name:var(--font-jetbrains)]">{error}</p>
      ) : health ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Server',          value: <span className="flex items-center gap-2"><StatusDot ok={health.ok} />{health.ok ? 'Online' : 'Error'}</span> },
            { label: 'Session',         value: <span className="flex items-center gap-2"><StatusDot ok={health.session} />{health.session ? 'Active' : 'None'}</span> },
            { label: 'Drivers',         value: `${health.drivers.connected} / ${health.drivers.total}` },
            { label: 'Overlay Clients', value: String(health.overlayClients) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1 font-[family-name:var(--font-jetbrains)]">{label}</p>
              <p className="text-zinc-200 font-[family-name:var(--font-jetbrains)]">{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500 font-[family-name:var(--font-jetbrains)]">Polling…</p>
      )}
    </Card>
  );
}

// ── Drivers table ────────────────────────────────────────────────────────────

function DriversTable({ drivers }: { drivers: DriversListResponse['drivers'] }) {
  return (
    <Card title="Drivers">
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-[family-name:var(--font-jetbrains)]">
          <thead>
            <tr className="text-left text-zinc-500 border-b border-zinc-700/50">
              {['ID', 'Name', 'Car Code', 'Status', 'Last Seen'].map(h => (
                <th key={h} className="pb-2 pr-4 font-bold tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id} className="border-b border-zinc-800/60">
                <td className="py-2 pr-4 text-zinc-400">{d.id}</td>
                <td className="py-2 pr-4 text-zinc-200 font-bold">{d.name}</td>
                <td className="py-2 pr-4 text-zinc-500">{d.carCode}</td>
                <td className="py-2 pr-4">
                  <span className={`flex items-center gap-1.5 ${d.connected ? 'text-green-400' : 'text-zinc-500'}`}>
                    <StatusDot ok={d.connected} />
                    {d.connected ? 'Connected' : 'Offline'}
                  </span>
                </td>
                <td className="py-2 text-zinc-500">
                  {d.lastSeen ? fmtTimestamp(d.lastSeen) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const HEALTH_POLL_MS = 5_000;
const DRIVERS_POLL_MS = 3_000;

export function ControlPage() {
  const { state: wsState } = useOverlayWS();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [drivers, setDrivers] = useState<DriversListResponse['drivers']>([]);

  const serverUrl =
    (import.meta.env.VITE_SERVER_URL as string | undefined) ?? 'http://localhost:3000';

  // Poll health
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const h = await api.health();
        if (!alive) return;
        setHealth(h);
        setHealthError(null);
      } catch {
        if (!alive) return;
        setHealth(null);
        setHealthError('Cannot reach server — is it running?');
      }
    };
    void poll();
    const id = setInterval(() => void poll(), HEALTH_POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Load session on mount
  useEffect(() => {
    api.getSession().then(r => setSession(r.session)).catch(() => setSession(null));
  }, []);

  // Poll drivers when session active
  const driversTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (driversTimer.current) clearInterval(driversTimer.current);
    if (!session) { setDrivers([]); return; }
    const poll = () => { api.getDrivers().then(r => setDrivers(r.drivers)).catch(() => {}); };
    poll();
    driversTimer.current = setInterval(poll, DRIVERS_POLL_MS);
    return () => { if (driversTimer.current) clearInterval(driversTimer.current); };
  }, [session]);

  const handleSessionCreated = useCallback((s: Session) => setSession(s), []);
  const handleSessionDeleted = useCallback(() => { setSession(null); setDrivers([]); }, []);
  const handleModeChanged    = useCallback((m: SessionMode) => {
    setSession(prev => prev ? { ...prev, mode: m } : null);
  }, []);

  return (
    <div className="control-root min-h-screen p-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-[0.2em] text-zinc-100 font-[family-name:var(--font-oswald)]">
            GT7 · RACE OVERLAY
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 font-[family-name:var(--font-jetbrains)] tracking-wider">
            Control Panel · {serverUrl}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot ok={health?.ok ?? false} />
          <span className="text-xs text-zinc-400 font-[family-name:var(--font-jetbrains)]">
            {health?.ok ? 'Server Online' : 'Server Offline'}
          </span>
        </div>
      </header>

      <div className="grid gap-4 max-w-3xl">
        <HealthCard health={health} error={healthError} />

        {session ? (
          <>
            <ActiveSessionCard session={session} onDeleted={handleSessionDeleted} />
            <SessionModeCard session={session} onModeChanged={handleModeChanged} />
            <OverlayControls key={session.id} session={session} overlayState={wsState.overlayState} />
            {drivers.length > 0 && <DriversTable drivers={drivers} />}
          </>
        ) : (
          <RosterBuilder onSessionCreated={handleSessionCreated} />
        )}
      </div>
    </div>
  );
}
