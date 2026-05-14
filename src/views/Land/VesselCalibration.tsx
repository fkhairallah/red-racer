import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useVesselStore } from '../../store/vesselStore';
import { useSettingsStore } from '../../store/settingsStore';

export function VesselCalibration() {
  const navigate = useNavigate();
  const { vessel, updateVessel } = useVesselStore();
  const { bearing, updateBearing } = useSettingsStore();

  const [name, setName] = useState(vessel.name);
  const [length, setLength] = useState(String(vessel.length));
  const [declination, setDeclination] = useState(String(bearing.declination));
  const [displayMagnetic, setDisplayMagnetic] = useState(bearing.displayMagnetic);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateVessel({ name, length: parseFloat(length) || 32, declination: parseFloat(declination) || 0 });
    await updateBearing({ declination: parseFloat(declination) || 0, displayMagnetic });
    setSaved(true);
    setTimeout(() => navigate(-1), 800);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Vessel Dynamics" />
      <main className="pt-14 pb-20 px-4 mt-4 space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">Vessel Name</span>
          <input className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Length (ft)</span>
          <input className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono" value={length} onChange={(e) => setLength(e.target.value)} inputMode="decimal" />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Magnetic Declination (°) — negative = W</span>
          <input className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono" value={declination} onChange={(e) => setDeclination(e.target.value)} inputMode="decimal" />
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={displayMagnetic} onChange={(e) => setDisplayMagnetic(e.target.checked)} className="w-5 h-5" />
          <span className="text-sm text-gray-700">Display bearings in magnetic</span>
        </label>
        <button onClick={handleSave} className={`w-full rounded-lg py-3 font-semibold text-white ${saved ? 'bg-green-600' : 'bg-red-700'}`}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </main>
    </div>
  );
}
