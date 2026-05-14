import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { Gauge, GaugeAngle, GaugeDistance, GaugeNumeric } from '../../components/gauges/Gauge';
import { CompassPointer } from '../../components/canvas/CompassPointer';
import { useGeoStore } from '../../store/geoStore';
import { useCourseStore } from '../../store/courseStore';
import { useMarkStore } from '../../store/markStore';
import { useSettingsStore } from '../../store/settingsStore';

function bearingBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function distanceNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // nm
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatElapsed(start: Date): string {
  const ms = Date.now() - start.getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function InstrumentView() {
  const navigate = useNavigate();
  const { currentPoint } = useGeoStore();
  const { course, advanceLeg, returnToPreviousLeg } = useCourseStore();
  const { marks } = useMarkStore();
  const { bearing: bearingPrefs } = useSettingsStore();
  const [elapsed, setElapsed] = useState('');

  const nextMark = marks.find((m) => m.id === course.markIds[course.currentLegIndex]);

  let markBearing: number | undefined;
  let markDistance: number | undefined;
  let vmg: number | undefined;
  let eta: string | undefined;

  if (nextMark && nextMark.lat != null && currentPoint) {
    markBearing = bearingBetween(currentPoint.lat, currentPoint.lon, nextMark.lat, nextMark.lon!);
    markDistance = distanceNm(currentPoint.lat, currentPoint.lon, nextMark.lat, nextMark.lon!);
    if (currentPoint.speedOverGround && markBearing != null) {
      const diff = ((markBearing - (currentPoint.courseOverGround ?? 0) + 360) % 360) * (Math.PI / 180);
      vmg = currentPoint.speedOverGround * Math.cos(diff);
      if (vmg > 0) eta = (markDistance / vmg < 1)
        ? `${((markDistance / vmg) * 60).toFixed(1)}min`
        : `${Math.floor(markDistance / vmg)}:${String(Math.floor(((markDistance / vmg) % 1) * 60)).padStart(2, '0')}`;
    }
  }

  useEffect(() => {
    if (!course.startTime) return;
    const timer = setInterval(() => setElapsed(formatElapsed(course.startTime!)), 1000);
    return () => clearInterval(timer);
  }, [course.startTime]);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-auto">
      <TopBar title="Instruments" />
      <main className="pt-14 pb-20 px-2 mt-2 space-y-4">

        {/* Next mark */}
        <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
          <button onClick={returnToPreviousLeg} className="bg-gray-700 px-3 py-2 rounded text-sm">‹</button>
          <button
            onClick={() => navigate('/line/course')}
            className="flex-1 text-center"
          >
            <div className="text-xs text-gray-400">Next Mark</div>
            <div className={`font-bold text-xl ${nextMark ? 'text-white' : 'text-red-400'}`}>
              {nextMark?.name ?? 'No mark set'}
            </div>
          </button>
          <button onClick={advanceLeg} className="bg-gray-700 px-3 py-2 rounded text-sm">›</button>
        </div>

        {/* Compass + bearing/distance */}
        <div className="flex gap-3 bg-gray-800 rounded-xl p-3">
          <CompassPointer
            heading={currentPoint?.courseOverGround ?? 0}
            targetBearing={markBearing ?? 0}
            size={130}
          />
          <div className="flex-1 grid grid-cols-1 gap-2">
            <GaugeAngle label="Bearing to Mark" value={markBearing} displayMagnetic={bearingPrefs.displayMagnetic} declination={bearingPrefs.declination} />
            <GaugeDistance label="Distance" value={markDistance} />
            <GaugeNumeric label="VMG" value={vmg} precision={2} />
            <Gauge label="ETA" value={eta ?? 'N/A'} />
          </div>
        </div>

        {/* Main gauges */}
        <div className="grid grid-cols-2 gap-2">
          <GaugeNumeric label="SOG" value={currentPoint?.speedOverGround} precision={1} suffix=" kts" />
          <GaugeNumeric label="SOW" value={currentPoint?.speedOverWater} precision={1} suffix=" kts" />
          <GaugeAngle label="COG" value={currentPoint?.courseOverGround} displayMagnetic={bearingPrefs.displayMagnetic} declination={bearingPrefs.declination} />
          <GaugeAngle label="Heading" value={currentPoint?.trueHeading} displayMagnetic={bearingPrefs.displayMagnetic} declination={bearingPrefs.declination} />
          <GaugeAngle label="TWD" value={currentPoint?.trueWindDirection} displayMagnetic={bearingPrefs.displayMagnetic} declination={bearingPrefs.declination} />
          <GaugeNumeric label="TWS" value={currentPoint?.trueWindSpeed} precision={1} suffix=" kts" />
        </div>

        {/* Extended gauges */}
        <div className="grid grid-cols-2 gap-2">
          <GaugeNumeric label="AWA" value={currentPoint?.apparentWindAngle} precision={0} suffix="°" />
          <GaugeNumeric label="AWS" value={currentPoint?.apparentWindSpeed} precision={1} suffix=" kts" />
          <GaugeNumeric label="TWA" value={currentPoint?.trueWindAngle} precision={0} suffix="°" />
          {course.startTime && <Gauge label="Elapsed" value={elapsed} />}
        </div>

        {/* Position */}
        {currentPoint && (
          <div className="bg-gray-800 rounded-xl p-3 font-mono text-sm text-center">
            {currentPoint.lat.toFixed(5)}° {currentPoint.lon.toFixed(5)}°
          </div>
        )}
      </main>
    </div>
  );
}
