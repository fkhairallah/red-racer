import { useState } from 'react';
import { TopBar } from '../../components/common/NavBar';
import { GaugeAngle, GaugeDistance, GaugeNumeric } from '../../components/gauges/Gauge';
import { useGeoStore } from '../../store/geoStore';
import { useWaypointStore } from '../../store/waypointStore';
import { useSettingsStore } from '../../store/settingsStore';

function bearingBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x = Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) - Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function distanceNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function NavigateSegment() {
  const { currentPoint } = useGeoStore();
  const { waypoints } = useWaypointStore();
  const { bearing: bearingPrefs } = useSettingsStore();

  const [fromId, setFromId] = useState(waypoints[0]?.id ?? '');
  const [toId, setToId] = useState(waypoints[1]?.id ?? waypoints[0]?.id ?? '');

  const from = waypoints.find((w) => w.id === fromId);
  const to = waypoints.find((w) => w.id === toId);

  const segBearing = from && to ? bearingBetween(from.lat, from.lon, to.lat, to.lon) : undefined;
  const segDist = from && to ? distanceNm(from.lat, from.lon, to.lat, to.lon) : undefined;

  let dtmBearing: number | undefined;
  let dtmDist: number | undefined;
  let vmg: number | undefined;

  if (currentPoint && to) {
    dtmBearing = bearingBetween(currentPoint.lat, currentPoint.lon, to.lat, to.lon);
    dtmDist = distanceNm(currentPoint.lat, currentPoint.lon, to.lat, to.lon);
    if (currentPoint.speedOverGround && segBearing != null) {
      const diff = ((segBearing - (currentPoint.courseOverGround ?? 0) + 360) % 360) * (Math.PI / 180);
      vmg = currentPoint.speedOverGround * Math.cos(diff);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Navigate Segment" />
      <main className="pt-14 pb-20 px-4 mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-gray-600">From</span>
            <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" value={fromId} onChange={(e) => setFromId(e.target.value)}>
              {waypoints.map((wp) => <option key={wp.id} value={wp.id}>{wp.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">To</span>
            <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" value={toId} onChange={(e) => setToId(e.target.value)}>
              {waypoints.map((wp) => <option key={wp.id} value={wp.id}>{wp.name}</option>)}
            </select>
          </label>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
          <p className="text-sm font-semibold text-gray-500 uppercase">Segment</p>
          <div className="grid grid-cols-2 gap-2">
            <GaugeAngle label="Segment Bearing" value={segBearing} displayMagnetic={bearingPrefs.displayMagnetic} declination={bearingPrefs.declination} />
            <GaugeDistance label="Segment Length" value={segDist} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
          <p className="text-sm font-semibold text-gray-500 uppercase">To Destination</p>
          <div className="grid grid-cols-2 gap-2">
            <GaugeAngle label="Course to Mark" value={dtmBearing} displayMagnetic={bearingPrefs.displayMagnetic} declination={bearingPrefs.declination} />
            <GaugeDistance label="Distance to Mark" value={dtmDist} />
          </div>
          <GaugeNumeric label="VMC (along segment)" value={vmg} precision={2} suffix=" kts" />
        </div>
      </main>
    </div>
  );
}
