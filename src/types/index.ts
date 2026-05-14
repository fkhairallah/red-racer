// Core domain types mirroring red-regatta library models

export interface GPSPoint {
  id?: string;
  name: string;
  description?: string;
  lat: number;
  lon: number;
}

export interface CourseMark {
  id?: string;
  name: string;
  description?: string;
  lat?: number;
  lon?: number;
  // When the mark is relative to a waypoint
  waypointId?: string;
  relativeName?: string; // e.g. "Port" or "Starboard"
  relativeOffset?: { bearing: number; distance: number };
}

export type CourseType = 'custom' | 'single' | 'windward-leeward' | 'triangle';

export interface CourseLayout {
  courseType: CourseType;
  text: string;
  description: string;
  imagePath?: string;
}

export interface RaceCourse {
  courseType: CourseType | null;
  markIds: string[];       // ordered list of CourseMark ids
  rcBoat: GPSPoint | null; // start line committee boat
  pinMark: GPSPoint | null;// start line pin end
  startTime: Date | null;
  endTime: Date | null;
  repeat: number;
  currentLegIndex: number;
}

export interface Vessel {
  name: string;
  length: number;         // feet
  declination: number;    // magnetic declination degrees
}

export interface PolarEntry {
  tws: number;  // true wind speed
  twa: number;  // true wind angle
  v: number;    // boat speed
  vmg: number;
  heel?: number;
}

export interface Polars {
  name: string;
  entries: PolarEntry[];
}

export interface PerformancePoint {
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
  trueWindSpeed?: number;
  trueWindAngle?: number;
  percentOfTarget?: number;
}

export interface SailPoint {
  lat: number;
  lon: number;
  timestamp: Date;
  speedOverGround: number;
  courseOverGround: number;
  speedOverWater?: number;
  trueHeading?: number;
  trueWindDirection?: number;
  trueWindSpeed?: number;
  trueWindAngle?: number;
  apparentWindAngle?: number;
  apparentWindSpeed?: number;
  set?: number;    // current set
  drift?: number;  // current drift
  VMG?: number;
}

export interface BearingPrefs {
  declination: number;          // magnetic declination offset
  displayMagnetic: boolean;
}

export interface DistancePrefs {
  unit: 'nm' | 'km' | 'mi';
  speedUnit: 'kts' | 'kmh' | 'mph';
}

export interface ManualWind {
  speed: number;     // knots TWS
  direction: number; // degrees true TWD
}

export interface AppSettings {
  bearing: BearingPrefs;
  distance: DistancePrefs;
  startSequenceMinutes: number;
  email: string;
  appVersion: string;
  numberOfRuns: number;
  instrumentMode: 'instruments' | 'manual';
  manualWind: ManualWind;
}
