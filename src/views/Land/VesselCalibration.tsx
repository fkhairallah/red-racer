import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useVesselStore } from '../../store/vesselStore';
import { useSettingsStore } from '../../store/settingsStore';

export function VesselCalibration() {
  const navigate = useNavigate();
  const { vessel, updateVessel } = useVesselStore();
  const { bearing, updateBearing, instrumentMode, manualWind, setInstrumentMode, setManualWind } = useSettingsStore();

  const [name, setName] = useState(vessel.name);
  const [length, setLength] = useState(String(vessel.length));
  const [declination, setDeclination] = useState(String(bearing.declination));
  const [displayMagnetic, setDisplayMagnetic] = useState(bearing.displayMagnetic);
  const [manualMode, setManualMode] = useState(instrumentMode === 'manual');
  const [windSpeed, setWindSpeed] = useState(String(manualWind.speed));
  const [windDir, setWindDir] = useState(String(manualWind.direction));
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const mode = manualMode ? 'manual' : 'instruments';
    await updateVessel({ name, length: parseFloat(length) || 32, declination: parseFloat(declination) || 0 });
    await updateBearing({ declination: parseFloat(declination) || 0, displayMagnetic });
    await setInstrumentMode(mode);
    if (mode === 'manual') {
      await setManualWind({
        speed: parseFloat(windSpeed) || 0,
        direction: ((parseFloat(windDir) || 0) + 360) % 360,
      });
    }
    setSaved(true);
    setTimeout(() => navigate(-1), 800);
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
              <p className="text-sm text-gray-500 mt-0.5">Manually enter wind — no NMEA stream</p>
            </div>
            <button
              onClick={() => setManualMode(!manualMode)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${manualMode ? 'bg-amber-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${manualMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {manualMode && (
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-sm text-amber-800 font-medium">True Wind Speed (kts)</span>
                <input
                  className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 font-mono text-lg"
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(e.target.value)}
                  inputMode="decimal"
                  placeholder="10"
                />
              </label>
              <label className="block">
                <span className="text-sm text-amber-800 font-medium">True Wind Direction (° true)</span>
                <input
                  className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 font-mono text-lg"
                  value={windDir}
                  onChange={(e) => setWindDir(e.target.value)}
                  inputMode="decimal"
                  placeholder="180"
                />
              </label>
            </div>
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
