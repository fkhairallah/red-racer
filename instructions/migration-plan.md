# [Red] Racer — Migration Plan: AIR → Node.js / React PWA

## Context

The `RedRacer-Air` directory contains an Adobe AIR/Flex mobile sailing racing assistant that can no longer be built or distributed. The goal is to migrate it to a modern web stack (Node.js backend + React frontend as a PWA) so it runs in any mobile browser and is installable on home screens.

Key constraints chosen by the user:
- **Instrument connectivity deferred** — build with browser Geolocation (standalone GPS) first; WiFi/UDP bridge comes later
- **Data storage**: localStorage + IndexedDB (offline-first, no login required)
- **SOAP email APIs replaced** with browser file downloads (no server-side email)
- **Map**: Leaflet.js + OpenStreetMap
- **Animation**: React-Konva (Canvas-based) for custom gauges and sailing graphics
- **RegattaLib** already ported to TypeScript at `github.com/fkhairallah/red-regatta` — use it directly via npm/local package

---

## Tech Stack

| Concern | Choice |
|---|---|
| Build tool | Vite + vite-plugin-pwa |
| Language | TypeScript throughout |
| UI framework | React 18 |
| Routing | React Router v6 (mirrors pushView/popView) |
| Global state | Zustand (replaces `gVar` global class) |
| Persistence | Dexie.js (IndexedDB) + localStorage for small prefs |
| Canvas / Animation | React-Konva |
| Charts | Recharts (TWS/TWD history line charts) |
| Map | Leaflet + react-leaflet |
| Business logic | `red-regatta` TypeScript library |
| Server | Node.js + Express (minimal — serves PWA, placeholder for future instrument proxy) |
| Styling | Tailwind CSS (mobile-first, replaces Flex/Spark CSS) |

---

## Repository Structure

```
red-racer/
├── instructions/                  # This file and other docs
├── client/                        # React PWA
│   ├── src/
│   │   ├── store/                 # Zustand slices (replaces gVar)
│   │   │   ├── courseStore.ts     # RaceCourse, countdown, race status
│   │   │   ├── waypointStore.ts   # waypoints ArrayCollection
│   │   │   ├── markStore.ts       # marks ArrayCollection
│   │   │   ├── vesselStore.ts     # Vessel, Polars, performance
│   │   │   └── settingsStore.ts   # bearing prefs, distance prefs, wifi params
│   │   ├── lib/
│   │   │   ├── persistence.ts     # Dexie schema + save/load (replaces PersistenceManager)
│   │   │   ├── gpx.ts             # GPX import/export (port of Model.Data.GPX)
│   │   │   └── geolocation.ts     # Browser GPS wrapper (replaces SailDataConnector standalone mode)
│   │   ├── components/
│   │   │   ├── gauges/            # dGauge, dGaugeAngle, dGaugeDistance, dGaugeNumeric
│   │   │   ├── canvas/            # All React-Konva components (see below)
│   │   │   └── common/            # Layout tiles, status indicator, nav bar
│   │   ├── views/
│   │   │   ├── Home/              # HomeView — 3-tile animated landing screen
│   │   │   ├── Land/              # AtHome, WaypointList, WaypointEdit, CourseMarksList,
│   │   │   │                      #   CourseMarkEdit, EditGPSCoordinates, VesselCalibration,
│   │   │   │                      #   NewProfileView (settings), PolarsView, SelectPolarView,
│   │   │   │                      #   EditPolarView, PerformanceShowList, PerformanceGetNew,
│   │   │   │                      #   ImportExport
│   │   │   ├── Line/              # RaceTimer, CourseDefinition, CourseListOfMarks
│   │   │   ├── Race/              # AtRace (menu), CourseCurrentView (InstrumentView),
│   │   │   │                      #   WindView, PolarTargetView, LaylineView, CourseDetails,
│   │   │   │                      #   FinishRace, CourseChart
│   │   │   └── Tools/             # InstrumentView, LocatePoint, NavigateSegment, StopWatch,
│   │   │                          #   WindDirection (manual wind entry)
│   │   └── App.tsx                # Router shell + global nav bar
│   ├── public/
│   │   ├── polar-resources/       # XML files (Frers33, J22, etc.) — bundled as static assets
│   │   └── icons/                 # PWA icons
│   └── vite.config.ts             # PWA plugin config, manifest
├── server/
│   └── src/index.ts               # Express — serves /dist, ready for future WS instrument proxy
├── package.json                   # Workspace root (npm workspaces)
└── RedRacer-Air/                  # Original source — reference only, do not modify
```

---

## Migration Phases

### Phase 1 — Project Scaffolding
1. Create npm workspace root with `client/` and `server/` packages.
2. `client/`: Vite + React + TypeScript, add `vite-plugin-pwa`, Tailwind, React Router, Zustand, Dexie, React-Konva, Recharts, Leaflet + react-leaflet.
3. `server/`: minimal Express app serving `client/dist`.
4. Install `red-regatta` from GitHub.
5. Copy `polarResources/*.xml` to `client/public/polar-resources/`.

### Phase 2 — State & Persistence Layer
Port `gVar.as` → Zustand stores + Dexie.

| ActionScript | TypeScript equivalent |
|---|---|
| `gVar.waypoints: ArrayCollection` | `useWaypointStore().waypoints: GPSPoint[]` |
| `gVar.marks: ArrayCollection` | `useMarkStore().marks: CourseMark[]` |
| `gVar.course: RaceCourse` | `useCourseStore().course: RaceCourse` |
| `gVar.vessel: Vessel` | `useVesselStore().vessel: Vessel` |
| `gVar.bearing: Bearing` | `useSettingsStore().bearing: Bearing` |
| `gVar.performance: ArrayCollection` | `useVesselStore().performance: PerformancePoint[]` |
| `gVar.loadFromStorage(pm)` | `persistence.ts: loadAll()` on app mount |
| `gVar.saveToStorage(pm)` | Dexie `liveQuery` + Zustand `subscribe` auto-save |
| `gVar.vData: SailDataConnector` | `useGeoStore()` + browser Geolocation API |
| `gVar.masterC: SailController` | `SailController` from red-regatta, held in a Zustand slice |
| `gVar.countdownTime` | `useCourseStore().countdownSeconds` |

**Dexie schema** — tables: `waypoints`, `marks`, `polars`, `performance`, `settings`.

### Phase 3 — App Shell & Navigation
- `App.tsx`: React Router with nested routes, bottom tab bar (On Land / At Line / On Course).
- Action bar: Tools callout button (Instruments, LocatePoint, NavSegment, Stopwatch, Help link).
- `SaildataSourceIndicator` → `ConnectionStatus` component (shows GPS lock quality).
- On mount: call `loadAll()`, instantiate `SailController`, start Geolocation watcher.

**Route map** (mirrors pushView hierarchy):
```
/                  → HomeView
/land              → AtHome
/land/waypoints    → WaypointList
/land/waypoints/:id → WaypointEdit
/land/marks        → CourseMarksList
/land/marks/:id    → CourseMarkEdit
/land/vessel       → VesselCalibration
/land/settings     → NewProfileView
/land/polars       → PolarsView
/land/import-export → ImportExport
/land/performance  → PerformanceShowList
/line              → RaceTimer
/line/course       → CourseDefinition
/race              → AtRace (sub-menu)
/race/instruments  → InstrumentView (CourseCurrentView)
/race/chart        → CourseChart
/race/wind         → WindView
/race/polars       → PolarTargetView
/race/layline      → LaylineView
/tools/locate      → LocatePoint
/tools/navigate    → NavigateSegment
/tools/stopwatch   → StopWatch
/tools/wind        → WindDirection
```

### Phase 4 — On Land Views
- **WaypointList / WaypointEdit**: sorted list with add/edit/delete. GPS "use my location" button.
- **CourseMarksList / CourseMarkEdit / EditGPSCoordinates**: mark CRUD; relative mark linked to waypoint dropdown.
- **VesselCalibration**: name, length; magnetic declination offset.
- **PolarsView / SelectPolarView / EditPolarView**: table display; load from bundled XML.
- **PerformanceShowList / PerformanceGetNew**: collect AWA/AWS/SOW/SOG running averages; save PerformancePoint to Dexie.
- **ImportExport**:
  - Import: `<input type="file" accept=".gpx">` → `FileReader` → `GPX.loadFromXML()`.
  - Export GPX: `GPX.saveToXML()` → `Blob` → browser download. **Replaces SOAP `emailGPX`.**
  - Export course: serialize RaceCourse → JSON → download. **Replaces SOAP `emailRaceCourse`.**

### Phase 5 — At The Line Views
- **RaceTimer**: `setInterval` countdown, +1/-1 min buttons, Start/Sync/Postpone.
- **CourseDefinition**: select course type from predefined list.
- **CourseListOfMarks**: assign waypoints to course slots.
- **StartLine Konva canvas**: draws RC/pin, start line, boat position, favorability coloring.

### Phase 6 — On The Course Views
- **InstrumentView**: gauge grid (SOW, SOG, COW, COG, TWD, TWS, AWA, AWS, TWA, elapsed time, coordinates).
- **Next mark panel**: CompassPointer canvas, bearing, distance, ETA, VMG.
- **CourseChart**: react-leaflet map with marks, course polyline, moving boat marker.
- **WindView**: Recharts LineChart for TWS and TWD history with min/max/avg labels.
- **PolarTargetView**: gauge grid (target speed, Δ speed, target VMG, Δ VMG, target angle, heel).
- **LaylineView**: Konva canvas (overhead: mark, laylines, boat, port/starboard labels).

### Phase 7 — React-Konva Canvas Components

| Original | Konva Component | Description |
|---|---|---|
| `CompassPointer.mxml` | `<CompassPointer>` | Rotating arrow; props: `heading`, `targetBearing` |
| `SailCompass.mxml` | `<SailCompass>` | Circular compass with TWD, target angle arcs |
| `dStartLine` / StartLineSkin | `<StartLineCanvas>` | Line, boats, boat position, favorability |
| `dMap` (laylines) | `<LaylineCanvas>` | Overhead view with port/starboard laylines |
| `dDashboard` / DashboardSkin | `<DashboardCanvas>` | Boat silhouette, wind arrow, targets |
| `dTile` / `dTileGroup` | `<AnimatedTile>` | CSS tile with slide-in animation |

### Phase 8 — Geolocation & SailController Integration
- `geolocation.ts`: wraps `navigator.geolocation.watchPosition`; publishes `SailPoint` events.
- On each GPS fix: call `sailController.update(sailPoint)`, update Zustand, trigger canvas re-renders.
- `SailController` from red-regatta holds running averages, polar targets, start status, layline calcs.

### Phase 9 — PWA Configuration
- `vite-plugin-pwa` with `GenerateSW` strategy.
- Manifest: name "[Red] Racer", theme color `#cc0000`, display `standalone`, orientation `portrait`.
- Cache: pre-cache app shell and polar XML resources; network-first for map tiles.

---

## SOAP → Download Conversion

| Original SOAP call | Replacement |
|---|---|
| `RedRacerWS.emailGPX(key, salt, email, gpx)` | `downloadFile(GPX.saveToXML(...), 'waypoints.gpx', 'application/gpx+xml')` |
| `RedRacerWS.emailRaceCourse(...)` | `downloadFile(JSON.stringify(course), 'course.json', 'application/json')` |
| `Uploader POST to sendGPXTrack.aspx` | `downloadFile(GPX.createExpeditionRace(sailData), 'track.csv', 'text/csv')` |

---

## Verification Checklist

1. `npm run dev` starts without errors.
2. App opens on mobile browser; PWA install prompt appears.
3. Add waypoint via GPS, export GPX → downloads; re-import it.
4. Load Frers 33 polars XML, edit one entry, verify persists after refresh.
5. Set RC/Pin positions; start 5-min countdown; confirm transition to instrument view at 0.
6. Gauge grid updates on each GPS tick; course chart shows moving boat marker.
7. Kill network — app still loads from service worker cache; data still accessible.
