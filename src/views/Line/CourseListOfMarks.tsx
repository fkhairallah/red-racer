import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useCourseStore } from '../../store/courseStore';
import { useMarkStore } from '../../store/markStore';

export function CourseListOfMarks() {
  const navigate = useNavigate();
  const { course, setMarkIds, setRepeat } = useCourseStore();
  const { marks } = useMarkStore();

  const [selectedIds, setSelectedIds] = useState<string[]>(course.markIds);
  const [repeat, setRepeatLocal] = useState(course.repeat);

  const toggleMark = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    setMarkIds(selectedIds);
    setRepeat(repeat);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Course Marks" />
      <main className="pt-14 pb-20 px-4 mt-4">
        <p className="text-sm text-gray-500 mb-3">Select marks in order for the course:</p>

        {marks.length === 0 && (
          <p className="text-gray-400 text-center mt-8">No marks defined. Go to Land → Marks.</p>
        )}

        <ul className="space-y-2 mb-6">
          {marks.map((m) => {
            const idx = selectedIds.indexOf(m.id);
            return (
              <li key={m.id}>
                <button
                  onClick={() => toggleMark(m.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm text-left ${
                    idx >= 0 ? 'bg-red-700 text-white' : 'bg-white text-gray-800'
                  }`}
                >
                  {idx >= 0 && <span className="font-bold text-sm w-6 shrink-0">{idx + 1}.</span>}
                  {idx < 0 && <span className="w-6 shrink-0" />}
                  <span className="font-medium">{m.name}</span>
                  {m.description && <span className={`text-sm truncate ${idx >= 0 ? 'text-red-100' : 'text-gray-500'}`}>{m.description}</span>}
                </button>
              </li>
            );
          })}
        </ul>

        <label className="block mb-4">
          <span className="text-sm text-gray-600">Repeat (laps)</span>
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
            value={repeat}
            onChange={(e) => setRepeatLocal(parseInt(e.target.value) || 1)}
          />
        </label>

        <button onClick={handleSave} className="w-full bg-red-700 text-white rounded-xl py-3 font-semibold">
          Save Course ({selectedIds.length} marks)
        </button>
      </main>
    </div>
  );
}
