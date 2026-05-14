import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useVesselStore } from '../../store/vesselStore';
import { useGeoStore } from '../../store/geoStore';
import type { PerformancePoint } from '../../types';

function runningAvg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

export function PerformanceList() {
  const navigate = useNavigate();
  const { performance, removePerformance } = useVesselStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Performance" />
      <main className="pt-14 pb-20 px-4">
        <div className="flex justify-end py-3">
          <button onClick={() => navigate('/land/performance/new')} className="bg-red-700 text-white px-4 py-2 rounded-lg font-semibold">
            + Measure
          </button>
        </div>
        {performance.length === 0 && (
          <p className="text-gray-400 text-center mt-8">No performance data yet.</p>
        )}
        <ul className="space-y-2">
          {performance.map((p) => (
            <li key={p.id} className="bg-white rounded-xl px-4 py-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-400">{new Date(p.timeStamp).toLocaleString()}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    AWA: {p.apparentWindAngle.toFixed(0)}° | AWS: {p.apparentWindSpeed.toFixed(1)} | SOW: {p.speedOverWater.toFixed(1)} | SOG: {p.speedOverGround.toFixed(1)}
                  </div>
                  {p.percentOfTarget != null && (
                    <div className="text-sm text-blue-600">Target: {p.percentOfTarget.toFixed(0)}%</div>
                  )}
                </div>
                <button onClick={() => p.id && removePerformance(p.id)} className="text-red-400 text-lg ml-2">✕</button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export function PerformanceMeasure() {
  const navigate = useNavigate();
  const { addPerformance } = useVesselStore();
  const { currentPoint } = useGeoStore();

  const [name, setName] = useState('');
  const [heel, setHeel] = useState('');
  const [collecting, setCollecting] = useState(false);
  const [counter, setCounter] = useState(0);

  const awaData = useRef<number[]>([]);
  const awsData = useRef<number[]>([]);
  const sowData = useRef<number[]>([]);
  const sogData = useRef<number[]>([]);

  const [averages, setAverages] = useState({ awa: 0, aws: 0, sow: 0, sog: 0 });

  useEffect(() => {
    if (!collecting || !currentPoint) return;
    if (currentPoint.apparentWindAngle != null) awaData.current.push(currentPoint.apparentWindAngle);
    if (currentPoint.apparentWindSpeed != null) awsData.current.push(currentPoint.apparentWindSpeed);
    if (currentPoint.speedOverWater != null) sowData.current.push(currentPoint.speedOverWater);
    sogData.current.push(currentPoint.speedOverGround ?? 0);
    setCounter((c) => c + 1);
    setAverages({
      awa: runningAvg(awaData.current),
      aws: runningAvg(awsData.current),
      sow: runningAvg(sowData.current),
      sog: runningAvg(sogData.current),
    });
  }, [collecting, currentPoint]);

  const handleSave = async () => {
    if (!name.trim()) { alert('Enter a name'); return; }
    const p: Omit<PerformancePoint, 'id'> = {
      name: name.trim(),
      timeStamp: new Date(),
      heel: parseFloat(heel) || 0,
      apparentWindAngle: averages.awa,
      minAWA: Math.min(...(awaData.current.length ? awaData.current : [0])),
      maxAWA: Math.max(...(awaData.current.length ? awaData.current : [0])),
      apparentWindSpeed: averages.aws,
      minAWS: Math.min(...(awsData.current.length ? awsData.current : [0])),
      maxAWS: Math.max(...(awsData.current.length ? awsData.current : [0])),
      speedOverWater: averages.sow,
      minSOW: Math.min(...(sowData.current.length ? sowData.current : [0])),
      maxSOW: Math.max(...(sowData.current.length ? sowData.current : [0])),
      speedOverGround: averages.sog,
      minSOG: Math.min(...(sogData.current.length ? sogData.current : [0])),
      maxSOG: Math.max(...(sogData.current.length ? sogData.current : [0])),
    };
    await addPerformance(p);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Measure Performance" />
      <main className="pt-14 pb-20 px-4 mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-gray-600">Name</span>
            <input className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Heel (°)</span>
            <input className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono" value={heel} onChange={(e) => setHeel(e.target.value)} inputMode="decimal" />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCollecting(true)}
            disabled={collecting}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-semibold disabled:opacity-50"
          >
            Start ({counter})
          </button>
          <button
            onClick={() => setCollecting(false)}
            disabled={!collecting}
            className="flex-1 bg-yellow-500 text-white rounded-lg py-3 font-semibold disabled:opacity-50"
          >
            Pause
          </button>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm grid grid-cols-4 text-center text-sm">
          <div className="font-semibold text-gray-500">-</div>
          <div className="font-semibold text-gray-500">Avg</div>
          <div className="font-semibold text-blue-500">Min</div>
          <div className="font-semibold text-red-500">Max</div>
          {[
            { label: 'AWA', arr: awaData.current, avg: averages.awa },
            { label: 'AWS', arr: awsData.current, avg: averages.aws },
            { label: 'SOW', arr: sowData.current, avg: averages.sow },
            { label: 'SOG', arr: sogData.current, avg: averages.sog },
          ].map(({ label, arr, avg }) => (
            <>
              <div key={label} className="font-semibold">{label}</div>
              <div>{avg.toFixed(1)}</div>
              <div className="text-blue-500">{arr.length ? Math.min(...arr).toFixed(1) : '-'}</div>
              <div className="text-red-500">{arr.length ? Math.max(...arr).toFixed(1) : '-'}</div>
            </>
          ))}
        </div>

        <button onClick={handleSave} disabled={counter === 0} className="w-full bg-red-700 text-white rounded-lg py-3 font-semibold disabled:opacity-50">
          Save Performance Point
        </button>
      </main>
    </div>
  );
}
