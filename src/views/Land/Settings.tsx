import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useSettingsStore } from '../../store/settingsStore';

export function Settings() {
  const navigate = useNavigate();
  const { distance, startSequenceMinutes, updateDistance, setStartSequence } = useSettingsStore();

  const [unit, setUnit] = useState<'nm' | 'km' | 'mi'>(distance.unit);
  const [speedUnit, setSpeedUnit] = useState<'kts' | 'kmh' | 'mph'>(distance.speedUnit);
  const [seqMins, setSeqMins] = useState(String(startSequenceMinutes));
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateDistance({ unit, speedUnit });
    await setStartSequence(parseFloat(seqMins) || 5);
    setSaved(true);
    setTimeout(() => navigate(-1), 800);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Settings" />
      <main className="pt-14 pb-20 px-4 mt-4 space-y-5">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Distance Unit</label>
          <div className="flex gap-3">
            {(['nm', 'km', 'mi'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-2 rounded-lg border font-semibold ${unit === u ? 'bg-red-700 text-white border-red-700' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Speed Unit</label>
          <div className="flex gap-3">
            {(['kts', 'kmh', 'mph'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setSpeedUnit(u)}
                className={`flex-1 py-2 rounded-lg border font-semibold ${speedUnit === u ? 'bg-red-700 text-white border-red-700' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="text-sm text-gray-600">Default Start Sequence (minutes)</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
            value={seqMins}
            onChange={(e) => setSeqMins(e.target.value)}
            inputMode="decimal"
          />
        </label>
        <button onClick={handleSave} className={`w-full rounded-lg py-3 font-semibold text-white ${saved ? 'bg-green-600' : 'bg-red-700'}`}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </main>
    </div>
  );
}
