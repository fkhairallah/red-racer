import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useMarkStore } from '../../store/markStore';
import { useWaypointStore } from '../../store/waypointStore';
import { geoService } from '../../lib/geolocation';
import type { CourseMark } from '../../types';

export function CourseMarkEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { marks, add, update, remove } = useMarkStore();
  const { waypoints } = useWaypointStore();

  const existing = id && id !== 'new' ? marks.find((m) => m.id === id) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [lat, setLat] = useState(existing?.lat?.toFixed(6) ?? '');
  const [lon, setLon] = useState(existing?.lon?.toFixed(6) ?? '');
  const [waypointId, setWaypointId] = useState(existing?.waypointId ?? '');
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const isRelative = waypointId !== '';

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setDescription(existing.description ?? '');
      setLat(existing.lat?.toFixed(6) ?? '');
      setLon(existing.lon?.toFixed(6) ?? '');
      setWaypointId(existing.waypointId ?? '');
    }
  }, [existing]);

  const handleGPS = async () => {
    setLocating(true);
    try {
      const pos = await geoService.getCurrentPosition();
      setLat(pos.coords.latitude.toFixed(6));
      setLon(pos.coords.longitude.toFixed(6));
    } catch {
      setError('Could not get GPS position');
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    const mark: Omit<CourseMark, 'id'> = { name: name.trim(), description: description.trim() };

    if (isRelative) {
      mark.waypointId = waypointId;
    } else {
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      if (isNaN(parsedLat) || isNaN(parsedLon)) { setError('Invalid coordinates'); return; }
      mark.lat = parsedLat;
      mark.lon = parsedLon;
    }

    if (existing) {
      await update({ ...mark, id: existing.id });
    } else {
      await add(mark);
    }
    navigate(-1);
  };

  const handleDelete = async () => {
    if (existing && confirm(`Delete mark "${existing.name}"?`)) {
      await remove(existing.id);
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title={existing ? 'Edit Mark' : 'New Mark'} />
      <main className="pt-14 pb-20 px-4 mt-4 space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <label className="block">
          <span className="text-sm text-gray-600">Name *</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Description</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div>
          <span className="text-sm text-gray-600 block mb-1">Position</span>
          <label className="flex items-center gap-2 mb-2">
            <input type="radio" checked={!isRelative} onChange={() => setWaypointId('')} />
            <span className="text-sm">Fixed GPS coordinates</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={isRelative} onChange={() => setWaypointId(waypoints[0]?.id ?? '')} />
            <span className="text-sm">Relative to waypoint</span>
          </label>
        </div>

        {!isRelative && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-gray-600">Latitude</span>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  inputMode="decimal"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Longitude</span>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  inputMode="decimal"
                />
              </label>
            </div>
            <button
              onClick={handleGPS}
              disabled={locating}
              className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold disabled:opacity-50"
            >
              {locating ? 'Getting GPS…' : '📡 Use My Current Location'}
            </button>
          </>
        )}

        {isRelative && (
          <label className="block">
            <span className="text-sm text-gray-600">Linked Waypoint</span>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={waypointId}
              onChange={(e) => setWaypointId(e.target.value)}
            >
              {waypoints.map((wp) => (
                <option key={wp.id} value={wp.id}>{wp.name}</option>
              ))}
            </select>
          </label>
        )}

        <button onClick={handleSave} className="w-full bg-red-700 text-white rounded-lg py-3 font-semibold">
          Save
        </button>

        {existing && (
          <button onClick={handleDelete} className="w-full bg-white border border-red-400 text-red-600 rounded-lg py-3 font-semibold">
            Delete Mark
          </button>
        )}
      </main>
    </div>
  );
}
