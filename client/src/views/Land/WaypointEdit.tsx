import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useWaypointStore } from '../../store/waypointStore';
import { geoService } from '../../lib/geolocation';
import type { GPSPoint } from '../../types';

export function WaypointEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { waypoints, add, update, remove } = useWaypointStore();

  const existing = id && id !== 'new' ? waypoints.find((w) => w.id === id) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [lat, setLat] = useState(existing?.lat?.toFixed(6) ?? '');
  const [lon, setLon] = useState(existing?.lon?.toFixed(6) ?? '');
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setDescription(existing.description ?? '');
      setLat(existing.lat.toFixed(6));
      setLon(existing.lon.toFixed(6));
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
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    if (!name.trim()) { setError('Name is required'); return; }
    if (isNaN(parsedLat) || isNaN(parsedLon)) { setError('Invalid coordinates'); return; }

    const wp: Omit<GPSPoint, 'id'> = { name: name.trim(), description: description.trim(), lat: parsedLat, lon: parsedLon };
    if (existing) {
      await update({ ...wp, id: existing.id });
    } else {
      await add(wp);
    }
    navigate(-1);
  };

  const handleDelete = async () => {
    if (existing && confirm(`Delete waypoint "${existing.name}"?`)) {
      await remove(existing.id);
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title={existing ? 'Edit Waypoint' : 'New Waypoint'} />
      <main className="pt-14 pb-20 px-4 mt-4 space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <label className="block">
          <span className="text-sm text-gray-600">Name *</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mark name"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Description</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-gray-600">Latitude</span>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              inputMode="decimal"
              placeholder="41.12345"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Longitude</span>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              inputMode="decimal"
              placeholder="-72.98765"
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

        <button
          onClick={handleSave}
          className="w-full bg-red-700 text-white rounded-lg py-3 font-semibold"
        >
          Save
        </button>

        {existing && (
          <button
            onClick={handleDelete}
            className="w-full bg-white border border-red-400 text-red-600 rounded-lg py-3 font-semibold"
          >
            Delete Waypoint
          </button>
        )}
      </main>
    </div>
  );
}
