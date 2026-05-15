import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useSettingsStore } from '../../store/settingsStore';
import { useGeoStore } from '../../store/geoStore';

export function WeatherView() {
  const navigate = useNavigate();
  const { manualWind, setManualWind } = useSettingsStore();
  const { currentPoint } = useGeoStore();

  const [windSpeed, setWindSpeed] = useState(String(manualWind.speed));
  const [windDir, setWindDir] = useState(String(manualWind.direction));
  const [fetching, setFetching] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fetchStatus, setFetchStatus] = useState('');

  const handleSave = async () => {
    await setManualWind({
      speed: parseFloat(windSpeed) || 0,
      direction: ((parseFloat(windDir) || 0) + 360) % 360,
    });
    setSaved(true);
    setTimeout(() => navigate(-1), 800);
  };

  const handleFetchWeather = async () => {
    const lat = currentPoint?.lat;
    const lon = currentPoint?.lon;
    if (lat == null || lon == null) {
      setFetchStatus('No GPS fix — cannot fetch weather');
      return;
    }
    setFetching(true);
    setFetchStatus('Fetching…');
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current_weather=true&wind_speed_unit=kn`
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const cw = data.current_weather;
      if (cw) {
        setWindSpeed(cw.windspeed.toFixed(1));
        setWindDir(String(Math.round(cw.winddirection)));
        setFetchStatus('Updated from forecast');
      } else {
        setFetchStatus('No weather data in response');
      }
    } catch {
      setFetchStatus('Failed to fetch — check connection');
    } finally {
      setFetching(false);
    }
  };

  const windDirNum = ((parseFloat(windDir) || 0) + 360) % 360;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Current Weather" />
      <main className="pt-14 pb-20 px-4 mt-4 space-y-4">

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-xs text-gray-500 mb-1">Wind Direction</p>
            <p className="text-4xl font-mono font-bold text-gray-800">{Math.round(windDirNum)}°</p>
            <p className="text-xs text-gray-400 mt-1">wind FROM</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-xs text-gray-500 mb-1">Wind Speed</p>
            <p className="text-4xl font-mono font-bold text-gray-800">{parseFloat(windSpeed).toFixed(1)}</p>
            <p className="text-xs text-gray-400 mt-1">kts</p>
          </div>
        </div>

        {/* Fetch from web */}
        <button
          onClick={handleFetchWeather}
          disabled={fetching}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold disabled:opacity-50"
        >
          {fetching ? 'Fetching…' : '🌤 Get Current Wind from Web'}
        </button>
        {fetchStatus && (
          <p className="text-center text-sm text-gray-500">{fetchStatus}</p>
        )}

        {/* Manual inputs */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-gray-700">Manual Override</p>
          <label className="block">
            <span className="text-sm text-gray-600">True Wind Speed (kts)</span>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-lg"
              value={windSpeed}
              onChange={(e) => setWindSpeed(e.target.value)}
              inputMode="decimal"
              placeholder="10"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">True Wind Direction (° true, wind FROM)</span>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-lg"
              value={windDir}
              onChange={(e) => setWindDir(e.target.value)}
              inputMode="decimal"
              placeholder="180"
            />
          </label>
        </div>

        <button
          onClick={handleSave}
          className={`w-full rounded-lg py-3 font-semibold text-white ${saved ? 'bg-green-600' : 'bg-red-700'}`}
        >
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </main>
    </div>
  );
}
