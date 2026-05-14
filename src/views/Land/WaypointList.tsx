import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useWaypointStore } from '../../store/waypointStore';

export function WaypointList() {
  const navigate = useNavigate();
  const { waypoints } = useWaypointStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Waypoints" />
      <main className="pt-14 pb-20 px-4">
        <div className="flex justify-end py-3">
          <button
            onClick={() => navigate('/land/waypoints/new')}
            className="bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            + Add
          </button>
        </div>
        {waypoints.length === 0 && (
          <p className="text-gray-400 text-center mt-8">No waypoints yet. Tap + Add to create one.</p>
        )}
        <ul className="space-y-2">
          {waypoints.map((wp) => (
            <li key={wp.id}>
              <button
                onClick={() => navigate(`/land/waypoints/${wp.id}`)}
                className="w-full bg-white rounded-xl px-4 py-3 shadow-sm text-left flex items-center gap-3 active:bg-gray-100"
              >
                <span className="text-xl">📍</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800">{wp.name}</div>
                  {wp.description && (
                    <div className="text-sm text-gray-500 truncate">{wp.description}</div>
                  )}
                  <div className="text-xs text-gray-400 font-mono">
                    {wp.lat.toFixed(5)}, {wp.lon.toFixed(5)}
                  </div>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
