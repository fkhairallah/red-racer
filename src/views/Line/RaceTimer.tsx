import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useCourseStore } from '../../store/courseStore';
import { useGeoStore } from '../../store/geoStore';
import { useSettingsStore } from '../../store/settingsStore';
import { StartLineCanvas } from '../../components/canvas/StartLineCanvas';

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Compact wind direction knob ───────────────────────────────────────────────
function WindKnob({
  direction,
  onDrag,
  onCommit,
  size = 76,
}: {
  direction: number;
  onDrag: (d: number) => void;
  onCommit: (d: number) => void;
  size?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  const getAngle = (clientX: number, clientY: number): number => {
    const rect = svgRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const deg = (Math.atan2(clientX - cx, cy - clientY) * 180) / Math.PI;
    return ((Math.round(deg) % 360) + 360) % 360;
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    onDrag(getAngle(e.clientX, e.clientY));
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.buttons !== 1) return;
    onDrag(getAngle(e.clientX, e.clientY));
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    onCommit(getAngle(e.clientX, e.clientY));
  };

  const r = size / 2 - 6;
  const rad = (direction * Math.PI) / 180;
  const arrowX = size / 2 + Math.sin(rad) * (r - 4);
  const arrowY = size / 2 - Math.cos(rad) * (r - 4);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      style={{ touchAction: 'none', cursor: 'pointer', flexShrink: 0 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="#1f2937" stroke="#4b5563" strokeWidth={2} />
      {/* Cardinal ticks */}
      {[0, 90, 180, 270].map((a) => {
        const ar = (a * Math.PI) / 180;
        const x1 = size / 2 + Math.sin(ar) * (r - 5);
        const y1 = size / 2 - Math.cos(ar) * (r - 5);
        const x2 = size / 2 + Math.sin(ar) * r;
        const y2 = size / 2 - Math.cos(ar) * r;
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6b7280" strokeWidth={2} />;
      })}
      {/* Direction arrow pointing to wind source */}
      <line
        x1={size / 2} y1={size / 2}
        x2={arrowX} y2={arrowY}
        stroke="#60a5fa" strokeWidth={2.5} strokeLinecap="round"
      />
      <circle cx={arrowX} cy={arrowY} r={4} fill="#60a5fa" />
      <circle cx={size / 2} cy={size / 2} r={3} fill="#9ca3af" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────

export function RaceTimer() {
  const navigate = useNavigate();
  const {
    course,
    countdownSeconds,
    isInSequence,
    setInSequence,
    setRcBoat,
    setPinMark,
    startSequence,
    startRace,
    postpone,
  } = useCourseStore();
  const { currentPoint } = useGeoStore();
  const { instrumentMode, manualWind, setManualWind } = useSettingsStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [localSeconds, setLocalSeconds] = useState(countdownSeconds);
  const [statusMsg, setStatusMsg] = useState('');

  // Local wind direction — initialized from store; changes are local until persisted
  const [localWindDir, setLocalWindDir] = useState(manualWind.direction);

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
          navigate(instrumentMode === 'manual' ? '/race/simple' : '/race/instruments');
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

  const isManual = instrumentMode === 'manual';
  // Manual mode: use local state (instant feedback). Instruments mode: use live NMEA.
  const windDir = isManual ? localWindDir : (currentPoint?.trueWindDirection ?? localWindDir);

  // Update local state on every drag; persist to store on release or button press.
  const handleWindDirDrag = useCallback((d: number) => {
    setLocalWindDir(d);
  }, []);

  const handleWindDirCommit = useCallback((d: number) => {
    setLocalWindDir(d);
    setManualWind({ ...manualWind, direction: d });
  }, [manualWind, setManualWind]);

  const canvasWidth = 340;
  const canvasHeight = 200;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TopBar title="Race Timer" />
      <main className="pt-14 pb-20 px-4 flex flex-col gap-3 mt-2">

        {/* Wind direction row */}
        <div className="bg-gray-800 rounded-xl px-3 py-2 flex items-center gap-3">
          {isManual ? (
            <WindKnob
              direction={localWindDir}
              onDrag={handleWindDirDrag}
              onCommit={handleWindDirCommit}
              size={72}
            />
          ) : (
            <div className="w-[72px] h-[72px] flex items-center justify-center rounded-full bg-gray-700 text-blue-400 text-xs text-center leading-tight">
              NMEA<br />wind
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs text-gray-400">Wind FROM</p>
            <p className="text-3xl font-mono font-bold tabular-nums">{Math.round(((windDir % 360) + 360) % 360)}°</p>
            {isManual && (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => handleWindDirCommit((localWindDir - 5 + 360) % 360)}
                  className="bg-gray-700 px-2 py-0.5 rounded text-sm"
                >
                  −5°
                </button>
                <button
                  onClick={() => handleWindDirCommit((localWindDir + 5) % 360)}
                  className="bg-gray-700 px-2 py-0.5 rounded text-sm"
                >
                  +5°
                </button>
              </div>
            )}
          </div>
          <div className="text-right text-sm text-gray-400">
            <span className="block text-xs mb-0.5">Speed</span>
            <span className="font-mono text-white">{manualWind.speed} kts</span>
          </div>
        </div>

        {/* Start line canvas — wind-up orientation */}
        <StartLineCanvas
          rcBoat={course.rcBoat}
          pin={course.pinMark}
          boatLat={currentPoint?.lat}
          boatLon={currentPoint?.lon}
          inSequence={isInSequence}
          windDirection={windDir}
          width={canvasWidth}
          height={canvasHeight}
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
              <button onClick={handleMarkPin} className="bg-orange-700 text-white rounded-lg py-3 font-semibold text-sm">
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
