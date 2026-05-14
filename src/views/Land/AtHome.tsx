import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';

const sections = [
  { label: 'Waypoints', path: '/land/waypoints', emoji: '📍' },
  { label: 'Marks', path: '/land/marks', emoji: '🚩' },
  { label: 'Vessel Dynamics', path: '/land/vessel', emoji: '⚙️' },
  { label: 'Vessel Polars', path: '/land/polars', emoji: '📐' },
  { label: 'Settings', path: '/land/settings', emoji: '🔧' },
  { label: 'Import / Export', path: '/land/import-export', emoji: '📂' },
  { label: 'Memorize Performance', path: '/land/performance', emoji: '📊' },
];

export function AtHome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="On Land" />
      <main className="pt-14 pb-20 px-4 flex flex-col gap-3 mt-2">
        {sections.map(({ label, path, emoji }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-4 shadow-sm text-left active:bg-gray-100"
          >
            <span className="text-2xl">{emoji}</span>
            <span className="font-medium text-gray-800">{label}</span>
            <span className="ml-auto text-gray-400">›</span>
          </button>
        ))}
      </main>
    </div>
  );
}
