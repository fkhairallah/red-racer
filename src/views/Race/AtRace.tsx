import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useCourseStore } from '../../store/courseStore';
import { useSettingsStore } from '../../store/settingsStore';

const raceActions = [
  { label: 'Course Chart', path: '/race/chart', emoji: '🗺️' },
  { label: 'Wind Predictor', path: '/race/wind', emoji: '💨' },
  { label: 'Monitor Polars', path: '/race/polars', emoji: '📐' },
  { label: 'Layline Predictor', path: '/race/layline', emoji: '📏' },
  { label: 'Start Line Bias', path: '/race/line-bias', emoji: '🧭' },
  { label: 'Locate Point', path: '/tools/locate', emoji: '🎯' },
  { label: 'Navigate Segment', path: '/tools/navigate', emoji: '🔭' },
  { label: 'Stopwatch', path: '/tools/stopwatch', emoji: '⏱️' },
];

export function AtRace() {
  const navigate = useNavigate();
  const { course, endRace, clearCourse, advanceLeg, returnToPreviousLeg } = useCourseStore();
  const { instrumentMode } = useSettingsStore();
  const instrumentPath = instrumentMode === 'manual' ? '/race/simple' : '/race/instruments';

  const currentMarkId = course.markIds[course.currentLegIndex];

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <TopBar title="On The Course" />

      {/* Fixed: current mark navigation */}
      {course.markIds.length > 0 && (
        <div className="pt-14 px-4 mt-2 shrink-0">
          <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-3">
            <button onClick={returnToPreviousLeg} className="bg-gray-700 px-3 py-2 rounded-lg text-sm">‹ Prev</button>
            <div className="flex-1 text-center">
              <div className="text-xs text-gray-400">Next Mark</div>
              <div className="font-bold text-lg">{currentMarkId ?? 'End'}</div>
              <div className="text-xs text-gray-400">{course.currentLegIndex + 1} of {course.markIds.length}</div>
            </div>
            <button onClick={advanceLeg} className="bg-gray-700 px-3 py-2 rounded-lg text-sm">Next ›</button>
          </div>
        </div>
      )}

      {/* Scrollable: action tiles + bottom actions */}
      <div className={`flex-1 overflow-y-auto px-4 pb-20 ${course.markIds.length > 0 ? 'pt-3' : 'pt-16'}`}>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => navigate(instrumentPath)}
            className="flex items-center gap-4 bg-gray-800 rounded-xl px-4 py-4 text-left active:bg-gray-700"
          >
            <span className="text-2xl">📊</span>
            <div className="flex-1">
              <span className="font-medium">Instrument Panel</span>
              {instrumentMode === 'manual' && (
                <p className="text-xs text-gray-400">Simple view · no NMEA</p>
              )}
            </div>
            <span className="text-gray-500">›</span>
          </button>
          {raceActions.map(({ label, path, emoji }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex items-center gap-4 bg-gray-800 rounded-xl px-4 py-4 text-left active:bg-gray-700"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="font-medium">{label}</span>
              <span className="ml-auto text-gray-500">›</span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {course.startTime && (
            <button
              onClick={() => { endRace(); navigate('/'); }}
              className="w-full bg-red-800 text-white rounded-xl py-4 font-bold text-lg"
            >
              🏁 Cross Finish Line
            </button>
          )}
          <button
            onClick={() => { clearCourse(); navigate('/'); }}
            className="w-full bg-gray-700 text-white rounded-xl py-4 font-bold text-lg"
          >
            🗑️ Clear Course
          </button>
        </div>
        <div className="h-16" />
      </div>
    </div>
  );
}
