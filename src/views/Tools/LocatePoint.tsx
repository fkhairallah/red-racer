import { useState, useMemo } from 'react';
import { TopBar } from '../../components/common/NavBar';
import { GaugeAngle, GaugeDistance } from '../../components/gauges/Gauge';
import { useGeoStore } from '../../store/geoStore';
import { useWaypointStore } from '../../store/waypointStore';
import { useMarkStore } from '../../store/markStore';
import { useCourseStore } from '../../store/courseStore';
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
  const R = 3440.065;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface LocateEntry {
  id: string;
  name: string;
  lat: number;
  lon: number;
  group: string;
}

export function LocatePoint() {
  const { currentPoint } = useGeoStore();
  const { waypoints } = useWaypointStore();
  const { marks } = useMarkStore();
  const { course } = useCourseStore();
  const { bearing: bearingPrefs } = useSettingsStore();

  const entries = useMemo<LocateEntry[]>(() => {
    const list: LocateEntry[] = [];

    if (course.rcBoat) list.push({ id: '__rc', name: 'RC Boat', lat: course.rcBoat.lat, lon: course.rcBoat.lon, group: 'Course' });
    if (course.pinMark) list.push({ id: '__pin', name: 'Pin Mark', lat: course.pinMark.lat, lon: course.pinMark.lon, group: 'Course' });

    for (const m of marks) {
      if (m.lat != null && m.lon != null) {
        list.push({ id: `mark:${m.id}`, name: m.name, lat: m.lat, lon: m.lon, group: 'Marks' });
      }
    }

    for (const w of waypoints) {
      list.push({ id: `wp:${w.id}`, name: w.name, lat: w.lat, lon: w.lon, group: 'Waypoints' });
    }

    return list;
  }, [course.rcBoat, course.pinMark, marks, waypoints]);

  const [selectedId, setSelectedId] = useState('');
  const resolvedId = selectedId || entries[0]?.id || '';
  const target = entries.find((e) => e.id === resolvedId);

  let bearing: number | undefined;
  let distance: number | undefined;
  if (currentPoint && target) {
    bearing = bearingBetween(currentPoint.lat, currentPoint.lon, target.lat, target.lon);
    distance = distanceNm(currentPoint.lat, currentPoint.lon, target.lat, target.lon);
  }

  const groups = ['Course', 'Marks', 'Waypoints'];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Locate Point" />
      <main className="pt-14 pb-20 px-4 mt-4 space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">Select Point</span>
          <select
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={resolvedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {groups.map((group) => {
              const groupEntries = entries.filter((e) => e.group === group);
              if (groupEntries.length === 0) return null;
              return (
                <optgroup key={group} label={group}>
                  {groupEntries.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </label>

        {target && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="font-semibold">{target.name}</p>
            <p className="text-xs font-mono text-gray-400 mt-1">{target.lat.toFixed(5)}, {target.lon.toFixed(5)}</p>
          </div>
        )}

        {entries.length === 0 && (
          <p className="text-gray-400 text-center text-sm">No waypoints or marks saved yet.</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <GaugeAngle label="Bearing" value={bearing} displayMagnetic={bearingPrefs.displayMagnetic} declination={bearingPrefs.declination} />
          <GaugeDistance label="Distance" value={distance} />
        </div>

        {!currentPoint && (
          <p className="text-gray-400 text-center text-sm">Waiting for GPS fix…</p>
        )}
      </main>
    </div>
  );
}
