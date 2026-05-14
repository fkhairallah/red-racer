import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useMarkStore } from '../../store/markStore';

export function CourseMarksList() {
  const navigate = useNavigate();
  const { marks } = useMarkStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Course Marks" />
      <main className="pt-14 pb-20 px-4">
        <div className="flex justify-end py-3">
          <button
            onClick={() => navigate('/land/marks/new')}
            className="bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            + Add
          </button>
        </div>
        {marks.length === 0 && (
          <p className="text-gray-400 text-center mt-8">No marks yet. Tap + Add to create one.</p>
        )}
        <ul className="space-y-2">
          {marks.map((m) => (
            <li key={m.id}>
              <button
                onClick={() => navigate(`/land/marks/${m.id}`)}
                className="w-full bg-white rounded-xl px-4 py-3 shadow-sm text-left flex items-center gap-3 active:bg-gray-100"
              >
                <span className="text-xl">🚩</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800">{m.name}</div>
                  {m.description && <div className="text-sm text-gray-500 truncate">{m.description}</div>}
                  {m.lat != null ? (
                    <div className="text-xs text-gray-400 font-mono">{m.lat.toFixed(5)}, {m.lon?.toFixed(5)}</div>
                  ) : (
                    <div className="text-xs text-gray-400">Relative to waypoint</div>
                  )}
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
