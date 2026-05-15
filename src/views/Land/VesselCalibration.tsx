import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useVesselStore } from '../../store/vesselStore';
import { useSettingsStore } from '../../store/settingsStore';
import { BUILTIN_POLARS, loadPolarFromURL } from '../../lib/polars';

export function VesselCalibration() {
  const navigate = useNavigate();
  const { vessel, polars, updateVessel, setPolars } = useVesselStore();
  const { instrumentMode, setInstrumentMode } = useSettingsStore();

  const [name, setName] = useState(vessel.name);
  const [length, setLength] = useState(String(vessel.length));
  const [manualMode, setManualMode] = useState(instrumentMode === 'manual');
  const [saved, setSaved] = useState(false);
  const [polarLoading, setPolarLoading] = useState(false);

  const handleSave = async () => {
    const mode = manualMode ? 'manual' : 'instruments';
    await updateVessel({ name, length: parseFloat(length) || 32, declination: vessel.declination });
    await setInstrumentMode(mode);
    setSaved(true);
    setTimeout(() => navigate(-1), 800);
  };

  const handlePolarSelect = async (file: string, label: string) => {
    setPolarLoading(true);
    try {
      const p = await loadPolarFromURL(`/polar-resources/${file}`);
      await setPolars({ ...p, name: label });
    } catch {
      alert('Failed to load polar file');
    } finally {
      setPolarLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Vessel Dynamics" />
      <main className="pt-14 pb-20 px-4 mt-4 space-y-4">

        {/* Instrument mode toggle */}
        <div className={`rounded-xl p-4 border-2 ${manualMode ? 'bg-amber-50 border-amber-400' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">No Instruments</p>
              <p className="text-sm text-gray-500 mt-0.5">Manual wind — no NMEA stream</p>
            </div>
            <button
              onClick={() => setManualMode(!manualMode)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${manualMode ? 'bg-amber-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${manualMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {manualMode && (
            <p className="text-xs text-amber-700 mt-2">Set wind speed &amp; direction in Current Weather</p>
          )}
        </div>

        {/* Vessel settings */}
        <label className="block">
          <span className="text-sm text-gray-600">Vessel Name</span>
          <input className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Length (ft)</span>
          <input className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono" value={length} onChange={(e) => setLength(e.target.value)} inputMode="decimal" />
        </label>

        {/* Polar selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Polar Curve</p>
          {polars && (
            <p className="text-xs text-green-700 font-medium">Active: {polars.name}</p>
          )}
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-800"
            value={polars?.name ?? ''}
            onChange={(e) => {
              const found = BUILTIN_POLARS.find((p) => p.label === e.target.value);
              if (found) handlePolarSelect(found.file, found.label);
            }}
            disabled={polarLoading}
          >
            <option value="">— Select polar curve —</option>
            {BUILTIN_POLARS.map(({ label }) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
          {polarLoading && <p className="text-xs text-blue-600">Loading polar…</p>}
        </div>

        <button onClick={handleSave} className={`w-full rounded-lg py-3 font-semibold text-white ${saved ? 'bg-green-600' : 'bg-red-700'}`}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </main>
    </div>
  );
}
