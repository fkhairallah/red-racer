import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TopBar } from '../../components/common/NavBar';
import { useGeoStore } from '../../store/geoStore';
const MAX_HISTORY = 120;

export function WindView() {
  const { currentPoint } = useGeoStore();
  const [history, setHistory] = useState<{ t: number; tws?: number; twd?: number }[]>([]);

  useEffect(() => {
    if (!currentPoint) return;
    setHistory((prev) => {
      const next = [
        ...prev,
        { t: prev.length, tws: currentPoint.trueWindSpeed, twd: currentPoint.trueWindDirection },
      ];
      return next.slice(-MAX_HISTORY);
    });
  }, [currentPoint]);

  const twsVals = history.map((h) => h.tws).filter((v): v is number => v != null);
  const twdVals = history.map((h) => h.twd).filter((v): v is number => v != null);

  const stats = (vals: number[]) => ({
    min: vals.length ? Math.min(...vals).toFixed(1) : 'N/A',
    max: vals.length ? Math.max(...vals).toFixed(1) : 'N/A',
    avg: vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 'N/A',
  });

  const twsStats = stats(twsVals);
  const twdStats = stats(twdVals);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TopBar title="Wind History" />
      <main className="pt-14 pb-20 px-2 mt-2 space-y-4">

        <div className="bg-gray-800 rounded-xl p-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-blue-400">TWS Min: {twsStats.min}</span>
            <span>Avg: {twsStats.avg}</span>
            <span className="text-red-400">Max: {twsStats.max}</span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="t" hide />
              <YAxis stroke="#aaa" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="tws" name="TWS (kts)" stroke="#60a5fa" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-xl p-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-blue-400">TWD Min: {twdStats.min}°</span>
            <span>Avg: {twdStats.avg}°</span>
            <span className="text-red-400">Max: {twdStats.max}°</span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="t" hide />
              <YAxis stroke="#aaa" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="twd" name="TWD (°)" stroke="#f87171" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {!currentPoint?.trueWindDirection && (
          <p className="text-gray-400 text-center text-sm">
            Wind data requires instrument connection.<br/>Using standalone GPS mode — wind data not available.
          </p>
        )}
      </main>
    </div>
  );
}
