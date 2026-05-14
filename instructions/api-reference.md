# [Red] Racer — API Reference

## Overview

[Red] Racer is an offline-first PWA. Most application data lives entirely on-device in **IndexedDB** (via Dexie) and **localStorage** — no authentication, no cloud sync, no login required.

The Express server (`server/`) serves the built React app and exposes a small HTTP API now, with a planned WebSocket instrument proxy for future WiFi/UDP instrument connectivity.

**Base URL (development):** `http://localhost:3001`  
**Client dev port:** `http://localhost:5173` (Vite proxies `/api` → `http://localhost:3001`)

---

## Table of Contents

1. [Server HTTP API](#server-http-api)
2. [Static Resources API](#static-resources-api)
3. [Planned: Instrument Proxy API](#planned-instrument-proxy-api)
4. [Client-Side Storage API (Dexie/IndexedDB)](#client-side-storage-api)
5. [Data Models](#data-models)
6. [File Export / Import API](#file-export--import-api)

---

## Server HTTP API

### `GET /api/health`

Health check for the Express server. Use this to verify the server process is running before attempting other operations.

**Request:** None

**Response `200 OK`:**
```json
{
  "status": "ok",
  "service": "[Red] Racer Server"
}
```

**Example:**
```sh
curl http://localhost:3001/api/health
```

---

### `GET *` (SPA Fallback)

All unmatched routes return the React PWA shell (`client/dist/index.html`). React Router handles client-side navigation from there.

This is intentional — deep-linking to any route (e.g. `/race/instruments`) will serve the app and let the client-side router take over.

---

## Static Resources API

Served by Express's static middleware from `client/dist/` and by Vite's dev server from `client/public/` during development. These are pre-cached by the PWA service worker.

### `GET /polar-resources/{filename}.xml`

Returns a polar diagram XML file for a specific boat class. The format uses `<point>` elements with `tws`, `twa`, `v`, `vmg`, and optional `heel` attributes.

**Path parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `filename` | string | XML filename (see table below) |

**Available files:**

| Label | Filename |
|-------|----------|
| Frers 33 | `Frers_33.xml` |
| Farr 40 | `Farr 40.xml` |
| X44.2 | `X442.xml` |
| J/22 | `J22_polars.xml` |
| Schock 34 | `Schock34_polars.xml` |
| B367 | `B367_polars.xml` |
| Melges 32 | `Melges32.xml` |
| Tartan 4100 | `Tartan4100.xml` |
| J/109 | `J109.xml` |

**Response `200 OK`:** XML document

```xml
<polars name="Frers 33">
  <point tws="6" twa="42" v="4.8" vmg="3.56" heel="12" />
  <point tws="6" twa="52" v="5.3" vmg="3.26" heel="14" />
  <!-- ... -->
</polars>
```

**Response `404`:** File not found

**Example:**
```sh
curl http://localhost:3001/polar-resources/Frers_33.xml
```

**Client usage** (`client/src/lib/polars.ts`):
```ts
import { loadPolarFromURL } from './polars';

const polars = await loadPolarFromURL('/polar-resources/Frers_33.xml');
```

---

## Planned: Instrument Proxy API

> **Status: Not yet implemented.** The server is scaffolded and ready for this extension. WiFi/UDP instrument connectivity is deferred to a future phase.

The Express server will act as a bridge between NMEA 0183/2000 instruments (connected over WiFi UDP) and the React PWA.

### WebSocket: `ws://localhost:3001/instruments`

Streams real-time `SailPoint` data to all connected clients as JSON frames.

**Message format (server → client):**
```json
{
  "type": "sailpoint",
  "data": {
    "lat": 37.8044,
    "lon": -122.2711,
    "timestamp": "2026-05-14T18:30:00.000Z",
    "speedOverGround": 6.2,
    "courseOverGround": 245,
    "speedOverWater": 5.9,
    "trueHeading": 248,
    "trueWindDirection": 310,
    "trueWindSpeed": 12.4,
    "trueWindAngle": 65,
    "apparentWindAngle": 58,
    "apparentWindSpeed": 14.1,
    "VMG": 4.8
  }
}
```

**Client message (client → server):** Not required; connection is read-only from the client perspective.

---

### `POST /api/instruments/config`

Configure the UDP/WiFi source address and port.

**Request body:**
```json
{
  "host": "192.168.1.100",
  "port": 2000,
  "protocol": "nmea0183"
}
```

**Response `200 OK`:**
```json
{
  "status": "configured",
  "host": "192.168.1.100",
  "port": 2000
}
```

---

### `GET /api/instruments/status`

Returns the current connection state of the instrument bridge.

**Response `200 OK`:**
```json
{
  "connected": false,
  "host": null,
  "port": null,
  "lastReceived": null
}
```

---

## Client-Side Storage API

All persistent data lives in **IndexedDB** (via Dexie) in the `RedRacerDB` database. The functions below (`client/src/lib/persistence.ts`) are the canonical read/write interface — call these from Zustand stores and React components, never write to IndexedDB directly.

### Database Schema

| Table | Primary Key | Indexed Fields |
|-------|-------------|----------------|
| `waypoints` | `id` (UUID) | `name` |
| `marks` | `id` (UUID) | `name` |
| `performance` | `id` (UUID) | `name`, `timeStamp` |
| `polars` | `id` (UUID) | `name` |
| `settings` | `key` (string) | — |

---

### `loadAll(): Promise<LoadAllResult>`

Loads all tables into plain objects. Called once on app mount.

```ts
const { waypoints, marks, performance, course, vessel, settingsMap } = await loadAll();
```

**Returns:**
```ts
{
  waypoints: (GPSPoint & { id: string })[];
  marks: (CourseMark & { id: string })[];
  performance: (PerformancePoint & { id: string })[];
  course: RaceCourse | null;
  vessel: Vessel;
  settingsMap: Record<string, unknown>;
}
```

---

### Waypoints

```ts
saveWaypoint(wp: GPSPoint & { id: string }): Promise<void>
deleteWaypoint(id: string): Promise<void>
```

---

### Marks

```ts
saveMark(mark: CourseMark & { id: string }): Promise<void>
deleteMark(id: string): Promise<void>
```

---

### Performance Points

```ts
savePerformancePoint(p: PerformancePoint & { id: string }): Promise<void>
deletePerformancePoint(id: string): Promise<void>
```

---

### Polars

```ts
savePolars(p: Polars & { id: string }): Promise<void>
```

---

### Settings

Generic key-value store. Used for `course`, `vessel`, and `AppSettings` fields.

```ts
getSetting<T>(key: string, defaultValue: T): Promise<T>
setSetting(key: string, value: unknown): Promise<void>
```

**Known setting keys:**

| Key | Type | Description |
|-----|------|-------------|
| `course` | `RaceCourse \| null` | Current race course state |
| `vessel` | `Vessel` | Boat profile |
| `bearing` | `BearingPrefs` | Magnetic declination and display mode |
| `distance` | `DistancePrefs` | Unit preferences |
| `startSequenceMinutes` | `number` | Start sequence countdown length |
| `email` | `string` | Contact email (legacy, unused) |
| `appVersion` | `string` | Last-run app version |
| `numberOfRuns` | `number` | Launch counter |

---

## Data Models

Defined in `client/src/types/index.ts`.

### `GPSPoint`

A named geographic coordinate (waypoint or start line endpoint).

```ts
interface GPSPoint {
  id?: string;          // UUID, assigned on save
  name: string;
  description?: string;
  lat: number;          // decimal degrees, WGS-84
  lon: number;          // decimal degrees, WGS-84
}
```

---

### `CourseMark`

A racing mark. Either an absolute lat/lon position or relative to a `GPSPoint` waypoint.

```ts
interface CourseMark {
  id?: string;
  name: string;
  description?: string;

  // Absolute position
  lat?: number;
  lon?: number;

  // Relative position (alternative to absolute)
  waypointId?: string;
  relativeName?: string;             // e.g. "Port" or "Starboard"
  relativeOffset?: {
    bearing: number;                 // degrees true
    distance: number;                // nautical miles
  };
}
```

---

### `RaceCourse`

The full race configuration including start line, marks, and timing.

```ts
interface RaceCourse {
  courseType: 'custom' | 'single' | 'windward-leeward' | 'triangle' | null;
  markIds: string[];        // ordered CourseMark ids defining the course legs
  rcBoat: GPSPoint | null;  // committee boat (start line starboard end)
  pinMark: GPSPoint | null; // pin end (start line port end)
  startTime: Date | null;
  endTime: Date | null;
  repeat: number;           // number of course repetitions
  currentLegIndex: number;  // 0-based index of the current leg
}
```

---

### `Vessel`

Boat profile used for display and polar lookups.

```ts
interface Vessel {
  name: string;
  length: number;       // overall length, feet
  declination: number;  // magnetic declination offset, degrees
}
```

---

### `PolarEntry`

A single data point in a polar diagram.

```ts
interface PolarEntry {
  tws: number;    // true wind speed, knots
  twa: number;    // true wind angle, degrees (0-180)
  v: number;      // boat speed at target, knots
  vmg: number;    // velocity made good, knots
  heel?: number;  // heel angle, degrees
}
```

---

### `Polars`

A named collection of polar entries for one boat class.

```ts
interface Polars {
  name: string;
  entries: PolarEntry[];
}
```

---

### `PerformancePoint`

A single recorded performance snapshot collected during sailing.

```ts
interface PerformancePoint {
  id?: string;
  name: string;
  timeStamp: Date;

  heel: number;
  apparentWindAngle: number;
  minAWA: number;
  maxAWA: number;
  apparentWindSpeed: number;
  minAWS: number;
  maxAWS: number;
  speedOverWater: number;
  minSOW: number;
  maxSOW: number;
  speedOverGround: number;
  minSOG: number;
  maxSOG: number;

  // Derived fields
  trueWindSpeed?: number;
  trueWindAngle?: number;
  percentOfTarget?: number;  // actual speed / polar target speed × 100
}
```

---

### `SailPoint`

A single GPS/instrument fix. Emitted by `geolocation.ts` and passed to `SailController`.

```ts
interface SailPoint {
  lat: number;
  lon: number;
  timestamp: Date;
  speedOverGround: number;   // knots
  courseOverGround: number;  // degrees true

  // Optional — present when instruments are connected
  speedOverWater?: number;        // knots
  trueHeading?: number;           // degrees true
  trueWindDirection?: number;     // degrees true
  trueWindSpeed?: number;         // knots
  trueWindAngle?: number;         // degrees (0-180)
  apparentWindAngle?: number;     // degrees
  apparentWindSpeed?: number;     // knots
  set?: number;                   // current set, degrees
  drift?: number;                 // current drift, knots
  VMG?: number;                   // velocity made good, knots
}
```

---

### `AppSettings`

Top-level application preferences stored in the `settings` table.

```ts
interface AppSettings {
  bearing: BearingPrefs;
  distance: DistancePrefs;
  startSequenceMinutes: number;
  email: string;
  appVersion: string;
  numberOfRuns: number;
}

interface BearingPrefs {
  declination: number;       // magnetic declination, degrees
  displayMagnetic: boolean;  // true = show magnetic, false = show true
}

interface DistancePrefs {
  unit: 'nm' | 'km' | 'mi';
  speedUnit: 'kts' | 'kmh' | 'mph';
}
```

---

## File Export / Import API

These replace the original SOAP email calls. All operations happen entirely in the browser — no server upload.

### Export GPX (waypoints)

```ts
import { saveToXML } from '../lib/gpx';
import { downloadFile } from '../lib/download';

const xml = saveToXML(waypoints);
downloadFile(xml, 'waypoints.gpx', 'application/gpx+xml');
```

### Import GPX

```ts
import { loadFromXML } from '../lib/gpx';

const input = document.querySelector<HTMLInputElement>('input[type=file]')!;
input.addEventListener('change', async () => {
  const text = await input.files![0].text();
  const waypoints = loadFromXML(text);
  // hydrate into store...
});
```

### Export Course (JSON)

```ts
const json = JSON.stringify(course, null, 2);
downloadFile(json, 'course.json', 'application/json');
```

### Export Track (CSV)

```ts
const csv = GPX.createExpeditionRace(sailDataHistory);
downloadFile(csv, 'track.csv', 'text/csv');
```

**Original SOAP → Download mapping:**

| Original SOAP call | Replacement |
|--------------------|-------------|
| `RedRacerWS.emailGPX(key, salt, email, gpx)` | `downloadFile(GPX.saveToXML(...), 'waypoints.gpx', ...)` |
| `RedRacerWS.emailRaceCourse(...)` | `downloadFile(JSON.stringify(course), 'course.json', ...)` |
| `Uploader POST to sendGPXTrack.aspx` | `downloadFile(GPX.createExpeditionRace(data), 'track.csv', ...)` |

---

## Geolocation API (Browser)

Wrapped in `client/src/lib/geolocation.ts`. Uses the standard `navigator.geolocation` API — no server involvement.

### Start watching position

```ts
import { startGeolocationWatcher } from '../lib/geolocation';

const stopWatcher = startGeolocationWatcher((sailPoint: SailPoint) => {
  sailController.update(sailPoint);
  useGeoStore.setState({ position: sailPoint });
});
```

### Stop watching

```ts
stopWatcher(); // calls navigator.geolocation.clearWatch internally
```

**Browser permissions required:** `geolocation`

**Accuracy modes:** High accuracy (`enableHighAccuracy: true`) is always requested for sailing use. Falls back to network-based location if GPS is unavailable.

---

## Error Handling Conventions

| Scenario | Behavior |
|----------|----------|
| IndexedDB unavailable | `loadAll()` throws; caught at app mount and logged to console |
| Polar XML not found | `loadPolarFromURL()` throws `Error('Failed to load polar: ...')` |
| GPS denied/unavailable | `geolocation.ts` fires error callback; `ConnectionStatus` component shows degraded state |
| Server unreachable | PWA service worker serves cached app shell; data access continues via IndexedDB |
| Instrument bridge not configured | `SailPoint` fields beyond `lat/lon/sog/cog` are `undefined`; UI gauges show `--` |

---

## Development Quick Reference

```sh
# Start both server and client dev servers
npm run dev

# Client only (port 5173)
npm run dev --workspace=client

# Server only (port 3001)
npm run dev --workspace=server

# Build for production
npm run build

# Health check
curl http://localhost:3001/api/health
```

**Vite proxy rule** (`client/vite.config.ts`): any request from the client to `/api/*` is forwarded to `http://localhost:3001` during development. In production, both are served from the same Express origin.
