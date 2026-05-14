import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useCourseStore } from '../../store/courseStore';
import { useGeoStore } from '../../store/geoStore';
import { StartLineCanvas } from '../../components/canvas/StartLineCanvas';

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function RaceTimer() {
  const navigate = useNavigate();
  const { course, countdownSeconds, isInSequence, setInSequence, setRcBoat, setPinMark, startSequence, startRace, postpone } = useCourseStore();
  const { currentPoint } = useGeoStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [localSeconds, setLocalSeconds] = useState(countdownSeconds);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => { setLocalSeconds(countdownSeconds); }, [countdownSeconds]);

  const clearTimer = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  useEffect(() => () => clearTimer(), []);

  const handleStart = () => {
    startSequence();
    setInSequence(true);
    intervalRef.current = setInterval(() => {
      setLocalSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearTimer();
          setInSequence(false);
          startRace();
          navigate('/race/instruments');
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const handlePostpone = () => {
    clearTimer();
    postpone();
    setLocalSeconds(6 * 60);
    setStatusMsg('');
  };

  const handleSync = () => {
    setLocalSeconds(Math.round(localSeconds / 60) * 60);
  };

  const handleMarkRC = () => {
    if (!currentPoint) { setStatusMsg('No GPS fix'); return; }
    setRcBoat(currentPoint.lat, currentPoint.lon);
    setStatusMsg('RC location set');
  };

  const handleMarkPin = () => {
    if (!currentPoint) { setStatusMsg('No GPS fix'); return; }
    setPinMark(currentPoint.lat, currentPoint.lon);
    setStatusMsg('Pin location set');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TopBar title="Race Timer" />
      <main className="pt-14 pb-20 px-4 flex flex-col gap-4 mt-2">

        <StartLineCanvas
          rcBoat={course.rcBoat}
          pin={course.pinMark}
          boatLat={currentPoint?.lat}
          boatLon={currentPoint?.lon}
          inSequence={isInSequence}
          width={340}
          height={180}
        />

        {/* Big countdown */}
        <div className="text-center">
          <span className="text-8xl font-mono font-bold tabular-nums">
            {formatCountdown(localSeconds)}
          </span>
        </div>

        {statusMsg && <p className="text-center text-yellow-400 text-sm">{statusMsg}</p>}

        {!isInSequence ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={handleMarkPin} className="bg-orange-600 text-white rounded-lg py-3 font-semibold text-sm">
                📍 Mark Pin
              </button>
              <button onClick={handleMarkRC} className="bg-blue-700 text-white rounded-lg py-3 font-semibold text-sm">
                🚢 Mark RC
              </button>
              <button onClick={() => navigate('/line/course')} className="bg-gray-700 text-white rounded-lg py-3 font-semibold text-sm">
                📋 Course
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setLocalSeconds((s) => s + 60)} className="bg-gray-700 text-white rounded-lg py-3 font-semibold">+1 Min</button>
              <button onClick={() => setLocalSeconds((s) => Math.max(60, s - 60))} className="bg-gray-700 text-white rounded-lg py-3 font-semibold">−1 Min</button>
            </div>
            <button onClick={handleStart} className="w-full bg-red-700 text-white rounded-xl py-5 font-bold text-xl">
              START ({Math.round(localSeconds / 60)} min)
            </button>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <button onClick={handlePostpone} className="bg-yellow-600 text-white rounded-lg py-3 font-semibold text-sm">Postpone</button>
            <button onClick={handleSync} className="bg-gray-700 text-white rounded-lg py-3 font-semibold text-sm">Sync</button>
            <button onClick={() => setLocalSeconds((s) => s + 60)} className="bg-gray-700 text-white rounded-lg py-3 font-semibold text-sm">+1 Min</button>
          </div>
        )}
      </main>
    </div>
  );
}
