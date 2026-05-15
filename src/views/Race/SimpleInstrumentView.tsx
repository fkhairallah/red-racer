import { useEffect, useState } from 'react';
import { TopBar } from '../../components/common/NavBar';
import { useGeoStore } from '../../store/geoStore';
import { useCourseStore } from '../../store/courseStore';
import { useMarkStore } from '../../store/markStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useVesselStore } from '../../store/vesselStore';
import type { Polars } from '../../types';

function bearingBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function distanceNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getTackInfo(heading: number, windDir: number, windSpeed: number, polars: Polars | null) {
  const windRelative = ((windDir - heading) + 360) % 360;
  const tack: 'port' | 'starboard' = windRelative <= 180 ? 'starboard' : 'port';

  let tackAngle = 90;
  let conditionLabel = '';
  if (polars?.tackAngles?.length) {
    const cond = polars.tackAngles.find((c) => {
      if (c.twsRange.endsWith('+')) return windSpeed >= parseFloat(c.twsRange);
      const [min, max] = c.twsRange.split('-').map(parseFloat);
      return windSpeed >= min && windSpeed < max;
    }) ?? polars.tackAngles[polars.tackAngles.length - 1];
    if (cond) { tackAngle = cond.tackAngle; conditionLabel = cond.label; }
  }

  // starboard tack heading = windDir - θ/2, port tack heading = windDir + θ/2
  const tackToHeading = tack === 'starboard'
    ? ((windDir + tackAngle / 2) + 360) % 360
    : ((windDir - tackAngle / 2) + 360) % 360;

  return { tack, tackToHeading: Math.round(tackToHeading), tackAngle, conditionLabel };
}

function formatElapsed(start: Date): string {
  const ms = Date.now() - start.getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function SimpleInstrumentView() {
  const { currentPoint } = useGeoStore();
  const { course, advanceLeg, returnToPreviousLeg } = useCourseStore();
  const { marks } = useMarkStore();
  const { manualWind, instrumentMode } = useSettingsStore();
  const { polars } = useVesselStore();
  const [elapsed, setElapsed] = useState('');

  const windDir = instrumentMode === 'manual'
    ? manualWind.direction
    : (currentPoint?.trueWindDirection ?? manualWind.direction);
  const windSpeed = instrumentMode === 'manual'
    ? manualWind.speed
    : (currentPoint?.trueWindSpeed ?? manualWind.speed);
  const heading = currentPoint?.courseOverGround ?? currentPoint?.trueHeading;
  const tackInfo = heading != null ? getTackInfo(heading, windDir, windSpeed, polars) : null;

  const nextMark = marks.find((m) => m.id === course.markIds[course.currentLegIndex]);

  let markLat: number | undefined;
  let markLon: number | undefined;
  let markLabel = 'No mark';

  if (nextMark?.lat != null && nextMark?.lon != null) {
    markLat = nextMark.lat;
    markLon = nextMark.lon;
    markLabel = nextMark.name;
  } else if (currentPoint) {
    // Virtual mark 1 nm dead upwind
    const windRad = (manualWind.direction * Math.PI) / 180;
    markLat = currentPoint.lat + (1 / 60) * Math.cos(windRad);
    markLon =
      currentPoint.lon +
      ((1 / 60) * Math.sin(windRad)) / Math.cos((currentPoint.lat * Math.PI) / 180);
    markLabel = 'Upwind (virtual)';
  }

  let markBearing: number | undefined;
  let markDistance: number | undefined;
  if (markLat != null && markLon != null && currentPoint) {
    markBearing = bearingBetween(currentPoint.lat, currentPoint.lon, markLat, markLon);
    markDistance = distanceNm(currentPoint.lat, currentPoint.lon, markLat, markLon);
  }

  useEffect(() => {
    if (!course.startTime) return;
    const timer = setInterval(() => setElapsed(formatElapsed(course.startTime!)), 1000);
    return () => clearInterval(timer);
  }, [course.startTime]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TopBar title="Racing" />
      <main className="pt-14 pb-20 px-4 mt-2 space-y-3">

        {/* Next mark selector */}
        <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
          <button onClick={returnToPreviousLeg} className="bg-gray-700 px-3 py-2 rounded text-sm">‹</button>
          <div className="flex-1 text-center">
            <div className="text-xs text-gray-400">Next Mark</div>
            <div className="font-bold text-xl text-white">{markLabel}</div>
          </div>
          <button onClick={advanceLeg} className="bg-gray-700 px-3 py-2 rounded text-sm">›</button>
        </div>

        {/* Bearing — large */}
        <div className="bg-gray-800 rounded-xl p-5 text-center">
          <p className="text-sm text-gray-400 mb-1">Bearing to Mark</p>
          <p className="text-8xl font-mono font-bold tabular-nums">
            {markBearing != null ? `${Math.round(markBearing)}°` : '—'}
          </p>
        </div>

        {/* Tack card */}
        {tackInfo && (
          <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Current Tack</p>
              <p className={`text-2xl font-bold ${tackInfo.tack === 'starboard' ? 'text-green-400' : 'text-red-400'}`}>
                {tackInfo.tack === 'starboard' ? 'STBD' : 'PORT'}
              </p>
              {tackInfo.conditionLabel && (
                <p className="text-xs text-gray-400 mt-1">{tackInfo.conditionLabel} · {tackInfo.tackAngle}°</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Tack to</p>
              <p className="text-4xl font-mono font-bold tabular-nums">{tackInfo.tackToHeading}°</p>
              <p className="text-xs text-gray-400 mt-1">{tackInfo.tack === 'starboard' ? 'port' : 'stbd'} hdg</p>
            </div>
          </div>
        )}

        {/* Distance + Speed row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Distance</p>
            <p className="text-4xl font-mono font-bold tabular-nums">
              {markDistance != null ? markDistance.toFixed(2) : '—'}
            </p>
            <p className="text-sm text-gray-400 mt-1">nm</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Speed (GPS)</p>
            <p className="text-4xl font-mono font-bold tabular-nums">
              {currentPoint?.speedOverGround != null
                ? currentPoint.speedOverGround.toFixed(1)
                : '—'}
            </p>
            <p className="text-sm text-gray-400 mt-1">kts</p>
          </div>
        </div>

        {/* Elapsed */}
        {course.startTime && (
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Elapsed</p>
            <p className="text-3xl font-mono tabular-nums">{elapsed}</p>
          </div>
        )}

        {/* Wind reminder */}
        <div className="bg-gray-800 rounded-xl p-3 flex justify-between text-sm">
          <span className="text-gray-400">Manual Wind</span>
          <span className="font-mono text-white">
            {manualWind.direction}° · {manualWind.speed} kts
          </span>
        </div>
      </main>
    </div>
  );
}
