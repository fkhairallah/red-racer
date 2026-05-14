import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useCourseStore } from '../../store/courseStore';
import type { CourseType } from '../../types';

const COURSE_TYPES: { type: CourseType; label: string; description: string; emoji: string }[] = [
  { type: 'custom', label: 'Custom Course', emoji: '🗺️', description: 'Any number of marks and gates' },
  { type: 'single', label: 'Single Mark', emoji: '🔴', description: 'Single mark. Adhoc navigation.' },
  { type: 'windward-leeward', label: 'Windward/Leeward', emoji: '⬆️', description: 'Traditional W/L with 2 marks' },
  { type: 'triangle', label: 'Olympic / Triangle', emoji: '🔺', description: 'Triangular course with reaching leg' },
];

export function CourseDefinition() {
  const navigate = useNavigate();
  const { course, setCourseType } = useCourseStore();

  const handleSelect = (type: CourseType) => {
    setCourseType(type);
    navigate('/line/marks');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Select Course" />
      <main className="pt-14 pb-20 px-4 mt-4 space-y-3">
        {COURSE_TYPES.map(({ type, label, description, emoji }) => (
          <button
            key={type}
            onClick={() => handleSelect(type)}
            className={`w-full flex items-center gap-4 rounded-xl px-4 py-4 shadow-sm text-left ${
              course.courseType === type ? 'bg-red-700 text-white' : 'bg-white text-gray-800'
            }`}
          >
            <span className="text-3xl">{emoji}</span>
            <div>
              <div className="font-semibold">{label}</div>
              <div className={`text-sm ${course.courseType === type ? 'text-red-100' : 'text-gray-500'}`}>{description}</div>
            </div>
            {course.courseType === type && <span className="ml-auto">✓</span>}
          </button>
        ))}
      </main>
    </div>
  );
}
