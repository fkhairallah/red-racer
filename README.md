# [Red] Racer

A mobile sailing race-management app built with React + Capacitor for Android. Designed to be used on the water — from pre-race preparation through finish — with GPS-driven instruments, course management, and tactical tools.

---

## Version History

| Version | Date       | Notes                                  |
|---------|------------|----------------------------------------|
| 1.0.0   | 2026-05-15 | Initial release — Sprint 1 complete    |
| 1.2.0   | 2026-05-15 | Sprint 2 — polar table, start-line bias overlay, button state feedback |
| 1.3.0   | 2026-05-15 | Sprint 2 cont. — start-line bearing, favored-end canvas overlay, course screen scrolling, app icons, nav bar hides during countdown |

---

## Overview

[Red] Racer organises the sailing race workflow into three stages, each accessible from the home screen:

### On Land (Pre-Race Setup)
Everything needed before leaving the dock:

- **Waypoints** — Create and manage named GPS positions used for navigation.
- **Marks** — Define course marks (buoys, beacons) by GPS coordinates or name.
- **Vessel Dynamics** — Set vessel name, length, instrument mode (NMEA or manual), and select a polar curve.
- **Vessel Polars** — Load and review a polar diagram (boat speed vs. wind angle) used for target-speed calculations. Built-in polar curves are included for common sailboat classes.
- **Current Weather** — Manually enter true wind speed and direction when no NMEA instrument stream is available.
- **Import / Export** — Share or back up waypoints, marks, and course data via the device share sheet (GPX-compatible).
- **Memorize Performance** — Record performance snapshots (speed, wind, angle) to build a local performance history.
- **Settings** — Configure magnetic declination, bearing display mode (true vs. magnetic), and other preferences.

### At The Line (Start Sequence)
Tools for the pre-start and starting sequence:

- **Race Timer** — Count-down timer synced to the race start gun; counts up after the start.
- **Course Definition** — Select course type (windward-leeward, triangle, etc.) and number of laps.
- **Course Marks** — Order the marks that make up the course legs.
- **Start Line Bias** — Calculate which end of the start line (RC boat or pin) is favoured based on wind heading and line bearing. Includes a live SVG diagram of the line angle relative to the wind.

### On The Course (Racing)
Real-time racing instruments and navigation:

- **Instruments** — Primary instrument panel showing: SOG, SOW, COG, heading, TWD, TWS, AWA, AWS, TWA, bearing to next mark, distance to mark, VMG, and ETA. Includes a graphical compass pointer aimed at the next mark.
- **Simple Instruments** — Minimal single-stat view for quick glances at one gauge at a time.
- **Course Chart** — Leaflet map showing vessel position, course marks, and the active leg.
- **Wind History** — Rolling 120-sample chart of True Wind Speed and True Wind Direction with min/avg/max statistics.
- **Polar Target** — Live comparison of current boat speed against the polar target for the current true wind angle.
- **Layline Predictor** — Canvas view showing starboard and port laylines to the next mark, with distance and time-to-layline estimates.
- **Line Bias** — Accessible during a race for quick bias recalculation if the wind shifts.

### Tools
Standalone utilities available at any time:

- **Stopwatch** — General-purpose lap stopwatch.
- **Locate Point** — Drop a pin at the current GPS position and display coordinates.
- **Navigate Segment** — Point-to-point navigation between two saved waypoints or marks.

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Framework    | React 18 + TypeScript             |
| Build        | Vite 5                            |
| Native shell | Capacitor 8 (Android)             |
| State        | Zustand 4                         |
| Persistence  | Dexie 3 (IndexedDB)               |
| Map          | Leaflet 1.9 + react-leaflet       |
| Canvas       | Konva 9 + react-konva             |
| Charts       | Recharts 2                        |
| Animation    | Framer Motion 11                  |
| Styling      | Tailwind CSS 3                    |
| Sharing      | Capacitor Share plugin            |

---

## Project Structure

```
src/
  App.tsx                  # Route definitions
  main.tsx                 # Entry point
  types/index.ts           # Shared TypeScript types (SailPoint, Mark, Course, …)
  store/                   # Zustand stores (geo, course, marks, vessel, settings, waypoints)
  lib/                     # Pure utilities (geolocation service, polars, GPX, persistence)
  components/
    canvas/                # Konva canvases (compass pointer, layline, start line)
    common/                # Shared UI (NavBar, AnimatedTile, ConnectionStatus)
    gauges/                # Instrument gauge components
  views/
    Home/                  # Landing screen
    Land/                  # Pre-race setup screens
    Line/                  # Start-sequence screens
    Race/                  # On-water instrument screens
    Tools/                 # Standalone utility screens
```

---

## Development

```bash
npm install

# Web dev server
npm run dev

# Type check
npm run typecheck

# Build + sync + open in Android Studio
npm run android
```

GPS and instrument data are read from the browser Geolocation API (position, SOG, COG). Full instrument data (TWS, TWD, SOW, AWA, etc.) requires an NMEA instrument bridge that feeds additional fields into the `SailPoint` type. Without it, the app runs in **manual mode** using a user-entered wind value.
