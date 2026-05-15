import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useCourseStore } from '../../store/courseStore';
import { useSettingsStore } from '../../store/settingsStore';

const raceActions = [
  { label: 'Course Chart', path: '/race/chart', emoji: '🗺️', nmea: false },
  { label: 'Layline Predictor', path: '/race/layline', emoji: '📏', nmea: true },
  { label: 'Locate Point', path: '/tools/locate', emoji: '🎯', nmea: false },
  { label: 'Stopwatch', path: '/tools/stopwatch', emoji: '⏱️', nmea: false },
  { label: 'Navigate Segment', path: '/tools/navigate', emoji: '🔭', nmea: false },
  { label: 'Monitor Polars', path: '/race/polars', emoji: '📐', nmea: true },
  { label: 'Start Line Bias', path: '/race/line-bias', emoji: '🧭', nmea: false },
  { label: 'Wind Predictor', path: '/race/wind', emoji: '💨', nmea: true },
];

export function AtRace() {
  const navigate = useNavigate();
  const { course, endRace, clearCourse, advanceLeg, returnToPreviousLeg } = useCourseStore();
  const { instrumentMode } = useSettingsStore();
  const instrumentPath = instrumentMode === 'manual' ? '/race/simple' : '/race/instruments';
  const hasNmea = instrumentMode !== 'manual';

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
          {raceActions.map(({ label, path, emoji, nmea }) => {
            const disabled = nmea && !hasNmea;
            return (
              <button
                key={path}
                onClick={() => !disabled && navigate(path)}
                disabled={disabled}
                className={`flex items-center gap-4 rounded-xl px-4 py-4 text-left ${disabled ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed' : 'bg-gray-800 active:bg-gray-700'}`}
              >
                <span className={`text-2xl ${disabled ? 'opacity-40' : ''}`}>{emoji}</span>
                <div className="flex-1">
                  <span className="font-medium">{label}</span>
                  {disabled && <p className="text-xs text-gray-600">Requires NMEA</p>}
                </div>
                <span className={disabled ? 'text-gray-700' : 'text-gray-500'}>›</span>
              </button>
            );
          })}
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
