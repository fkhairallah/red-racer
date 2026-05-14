import { useNavigate, useLocation } from 'react-router-dom';
import { ConnectionStatus } from './ConnectionStatus';

const tabs = [
  { path: '/land', label: 'Land', emoji: '⚓' },
  { path: '/line', label: 'Line', emoji: '🏁' },
  { path: '/race', label: 'Course', emoji: '🧭' },
];

export function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-stretch safe-area-inset-bottom z-50">
      {tabs.map(({ path, label, emoji }) => {
        const active = pathname.startsWith(path);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-xs transition-colors ${
              active ? 'text-red-600 font-semibold' : 'text-gray-500'
            }`}
          >
            <span className="text-lg">{emoji}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function TopBar({ title }: { title?: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const canGoBack = pathname !== '/' && pathname !== '/land' && pathname !== '/line' && pathname !== '/race';

  return (
    <header className="fixed top-0 left-0 right-0 bg-red-700 text-white flex items-center h-12 px-3 z-50 safe-area-inset-top">
      {canGoBack ? (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 bg-white text-red-700 font-bold text-sm px-3 py-1 rounded-full mr-2 active:bg-red-50"
        >
          ‹ Back
        </button>
      ) : (
        <span className="font-bold text-lg mr-2">[RED]</span>
      )}
      <span className="flex-1 font-semibold truncate">{title ?? 'Racer'}</span>
      <ConnectionStatus />
    </header>
  );
}
