import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from './components/common/NavBar';

// Views
import { HomeView } from './views/Home/HomeView';

import { AtHome } from './views/Land/AtHome';
import { WaypointList } from './views/Land/WaypointList';
import { WaypointEdit } from './views/Land/WaypointEdit';
import { CourseMarksList } from './views/Land/CourseMarksList';
import { CourseMarkEdit } from './views/Land/CourseMarkEdit';
import { VesselCalibration } from './views/Land/VesselCalibration';
import { Settings } from './views/Land/Settings';
import { PolarsView } from './views/Land/PolarsView';
import { PolarTable } from './views/Land/PolarTable';
import { ImportExport } from './views/Land/ImportExport';
import { PerformanceList, PerformanceMeasure } from './views/Land/Performance';
import { WeatherView } from './views/Land/WeatherView';
import { SimpleInstrumentView } from './views/Race/SimpleInstrumentView';

import { RaceTimer } from './views/Line/RaceTimer';
import { CourseDefinition } from './views/Line/CourseDefinition';
import { CourseListOfMarks } from './views/Line/CourseListOfMarks';

import { AtRace } from './views/Race/AtRace';
import { InstrumentView } from './views/Race/InstrumentView';
import { CourseChart } from './views/Race/CourseChart';
import { WindView } from './views/Race/WindView';
import { PolarTargetView } from './views/Race/PolarTargetView';
import { LaylineView } from './views/Race/LaylineView';
import { LineBiasView } from './views/Race/LineBiasView';

import { Stopwatch } from './views/Tools/Stopwatch';
import { LocatePoint } from './views/Tools/LocatePoint';
import { NavigateSegment } from './views/Tools/NavigateSegment';

// Stores
import { useWaypointStore } from './store/waypointStore';
import { useMarkStore } from './store/markStore';
import { useCourseStore } from './store/courseStore';
import { useVesselStore } from './store/vesselStore';
import { useSettingsStore } from './store/settingsStore';
import { useGeoStore } from './store/geoStore';

function AppBootstrap() {
  const loadWaypoints = useWaypointStore((s) => s.load);
  const loadMarks = useMarkStore((s) => s.load);
  const loadCourse = useCourseStore((s) => s.load);
  const loadVessel = useVesselStore((s) => s.load);
  const loadSettings = useSettingsStore((s) => s.load);
  const startGeo = useGeoStore((s) => s.start);

  useEffect(() => {
    Promise.all([loadWaypoints(), loadMarks(), loadCourse(), loadVessel(), loadSettings()]);
    startGeo();
  }, []);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <AppBootstrap />
      <Routes>
        <Route path="/" element={<HomeView />} />

        {/* Land */}
        <Route path="/land" element={<AtHome />} />
        <Route path="/land/waypoints" element={<WaypointList />} />
        <Route path="/land/waypoints/:id" element={<WaypointEdit />} />
        <Route path="/land/marks" element={<CourseMarksList />} />
        <Route path="/land/marks/:id" element={<CourseMarkEdit />} />
        <Route path="/land/vessel" element={<VesselCalibration />} />
        <Route path="/land/settings" element={<Settings />} />
        <Route path="/land/polars" element={<PolarsView />} />
        <Route path="/land/polars/table" element={<PolarTable />} />
        <Route path="/land/import-export" element={<ImportExport />} />
        <Route path="/land/performance" element={<PerformanceList />} />
        <Route path="/land/performance/new" element={<PerformanceMeasure />} />
        <Route path="/land/weather" element={<WeatherView />} />

        {/* Line / start */}
        <Route path="/line" element={<RaceTimer />} />
        <Route path="/line/course" element={<CourseDefinition />} />
        <Route path="/line/marks" element={<CourseListOfMarks />} />

        {/* Race / on the water */}
        <Route path="/race" element={<AtRace />} />
        <Route path="/race/instruments" element={<InstrumentView />} />
        <Route path="/race/chart" element={<CourseChart />} />
        <Route path="/race/wind" element={<WindView />} />
        <Route path="/race/polars" element={<PolarTargetView />} />
        <Route path="/race/layline" element={<LaylineView />} />
        <Route path="/race/line-bias" element={<LineBiasView />} />
        <Route path="/race/simple" element={<SimpleInstrumentView />} />

        {/* Tools */}
        <Route path="/tools/stopwatch" element={<Stopwatch />} />
        <Route path="/tools/locate" element={<LocatePoint />} />
        <Route path="/tools/navigate" element={<NavigateSegment />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Bottom tab bar (hidden on full-screen race views) */}
      <NavBar />
    </BrowserRouter>
  );
}
