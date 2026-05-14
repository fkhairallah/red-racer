import { TopBar } from '../../components/common/NavBar';
import { LaylineCanvas } from '../../components/canvas/LaylineCanvas';
import { useGeoStore } from '../../store/geoStore';
import { useCourseStore } from '../../store/courseStore';
import { useMarkStore } from '../../store/markStore';

function bearingBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function LaylineView() {
  const { currentPoint } = useGeoStore();
  const { course } = useCourseStore();
  const { marks } = useMarkStore();

  const nextMark = marks.find((m) => m.id === course.markIds[course.currentLegIndex]);

  const boatBearing =
    currentPoint && nextMark?.lat != null
      ? bearingBetween(currentPoint.lat, currentPoint.lon, nextMark.lat, nextMark.lon!)
      : 0;

  const twd = currentPoint?.trueWindDirection ?? 0;
  const sog = currentPoint?.speedOverGround ?? 1;

  // Simple layline timing estimate
  const laylines = nextMark?.lat != null && currentPoint ? (() => {
    const portAngle = ((twd + 45) + 360) % 360;
    const stbAngle = ((twd - 45) + 360) % 360;
    // Very rough: distance / sog
    const distToMark = 1; // placeholder — would need real calc
    return {
      starboard: { angle: stbAngle, distanceToLine: distToMark * 0.7, timeToLine: (distToMark * 0.7 / sog) * 3600 },
      port: { angle: portAngle, distanceToLine: distToMark * 0.85, timeToLine: (distToMark * 0.85 / sog) * 3600 },
    };
  })() : undefined;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TopBar title="Layline Predictor" />
      <main className="pt-14 pb-20 flex flex-col items-center px-4 mt-4 gap-4">
        {!nextMark && (
          <p className="text-gray-400 text-center">No next mark set. Define a course first.</p>
        )}
        <LaylineCanvas twd={twd} boatBearing={boatBearing} laylines={laylines} size={320} />
        {laylines && (
          <div className="bg-gray-800 rounded-xl p-4 w-full space-y-1 font-mono text-sm">
            <div className="text-green-400">STB: {laylines.starboard.distanceToLine.toFixed(2)} nm / {laylines.starboard.timeToLine.toFixed(0)} s</div>
            <div className="text-red-400">PRT: {laylines.port.distanceToLine.toFixed(2)} nm / {laylines.port.timeToLine.toFixed(0)} s</div>
          </div>
        )}
        {!currentPoint?.trueWindDirection && (
          <p className="text-gray-400 text-center text-sm">Layline calculation requires wind data from instruments.</p>
        )}
      </main>
    </div>
  );
}
