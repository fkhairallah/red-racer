import { useEffect, useRef, useState } from 'react';
import { TopBar } from '../../components/common/NavBar';

function formatMs(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

export function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef<number>(0);
  const savedRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed(savedRef.current + Date.now() - startRef.current);
    }, 50);
    return () => clearInterval(id);
  }, [running]);

  const handleStart = () => {
    startRef.current = Date.now();
    setRunning(true);
  };
  const handleStop = () => {
    savedRef.current = elapsed;
    setRunning(false);
  };
  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
    savedRef.current = 0;
    setLaps([]);
  };
  const handleLap = () => {
    setLaps((prev) => [...prev, elapsed]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TopBar title="Stopwatch" />
      <main className="pt-14 pb-20 px-4 mt-4 flex flex-col items-center gap-6">
        <div className="text-6xl font-mono font-bold tabular-nums mt-8">
          {formatMs(elapsed)}
        </div>
        <div className="grid grid-cols-3 gap-3 w-full">
          {!running ? (
            <button onClick={handleStart} className="col-span-2 bg-green-700 text-white rounded-xl py-4 font-bold text-xl">Start</button>
          ) : (
            <button onClick={handleStop} className="col-span-2 bg-yellow-600 text-white rounded-xl py-4 font-bold text-xl">Stop</button>
          )}
          <button onClick={handleReset} className="bg-gray-700 text-white rounded-xl py-4 font-semibold">Reset</button>
        </div>
        {running && (
          <button onClick={handleLap} className="w-full bg-gray-700 text-white rounded-xl py-3 font-semibold">Lap</button>
        )}
        {laps.length > 0 && (
          <div className="w-full space-y-1">
            {laps.map((lap, i) => (
              <div key={i} className="flex justify-between bg-gray-800 rounded-lg px-4 py-2 font-mono text-sm">
                <span>Lap {i + 1}</span>
                <span>{formatMs(lap)}</span>
                {i > 0 && <span className="text-gray-400">+{formatMs(lap - laps[i - 1])}</span>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
