import { useNavigate } from 'react-router-dom';
import { version } from '../../../package.json';
import { AnimatedTile } from '../../components/common/AnimatedTile';
import { TopBar } from '../../components/common/NavBar';
import { useCourseStore } from '../../store/courseStore';
import { useWaypointStore } from '../../store/waypointStore';
import { useMarkStore } from '../../store/markStore';
import { useVesselStore } from '../../store/vesselStore';

function formatElapsed(start: Date): string {
  const ms = Date.now() - start.getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function HomeView() {
  const navigate = useNavigate();
  const { course } = useCourseStore();
  const { waypoints } = useWaypointStore();
  const { marks } = useMarkStore();
  const { polars } = useVesselStore();

  const landDetails: string[] = [];
  if (!polars) landDetails.push('No polars set');
  landDetails.push(`${waypoints.length} waypoints, ${marks.length} marks`);

  const lineDetails: string[] = [];
  if (course.rcBoat && course.pinMark) lineDetails.push('Start line set');
  else lineDetails.push('No start line');

  const courseDetails: string[] = [];
  if (course.startTime && !course.endTime) {
    courseDetails.push('Racing! ET: ' + formatElapsed(course.startTime));
  } else if (course.endTime && course.startTime) {
    courseDetails.push('Finished in: ' + formatElapsed(course.startTime));
  }
  if (!course.courseType) courseDetails.push('No course set');
  else courseDetails.push(`Course: ${course.courseType} ×${course.repeat}`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-700 flex flex-col">
      <TopBar title="[Red] Racer" />
      <main className="flex-1 flex flex-col justify-center gap-4 px-4 pt-16 pb-20">
        <AnimatedTile
          label="On Land"
          details={landDetails}
          color="#2079cc"
          emoji="⚓"
          onClick={() => navigate('/land')}
          index={0}
        />
        <AnimatedTile
          label="At The Line"
          details={lineDetails}
          color="#4caf50"
          emoji="🏁"
          onClick={() => navigate('/line')}
          index={1}
        />
        <AnimatedTile
          label="On The Course"
          details={courseDetails}
          color="#ff9800"
          emoji="🧭"
          onClick={() => navigate('/race')}
          index={2}
        />
        <p className="text-center text-white/70 text-sm mt-2">v{version}</p>
      </main>
    </div>
  );
}
