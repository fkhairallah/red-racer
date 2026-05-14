import Dexie, { type Table } from 'dexie';
import type { GPSPoint, CourseMark, PerformancePoint, Polars, RaceCourse } from '../types';

class RedRacerDB extends Dexie {
  waypoints!: Table<GPSPoint & { id: string }>;
  marks!: Table<CourseMark & { id: string }>;
  performance!: Table<PerformancePoint & { id: string }>;
  polars!: Table<Polars & { id: string }>;
  settings!: Table<{ key: string; value: unknown }>;

  constructor() {
    super('RedRacerDB');
    this.version(1).stores({
      waypoints: 'id, name',
      marks: 'id, name',
      performance: 'id, name, timeStamp',
      polars: 'id, name',
      settings: 'key',
    });
  }
}

export const db = new RedRacerDB();

export function generateId(): string {
  return crypto.randomUUID();
}

// Settings helpers
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const row = await db.settings.get(key);
  return row ? (row.value as T) : defaultValue;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}

// Load everything from DB into plain objects
export async function loadAll() {
  const [waypoints, marks, performance, settings, course, vessel] = await Promise.all([
    db.waypoints.toArray(),
    db.marks.toArray(),
    db.performance.toArray(),
    db.settings.toArray(),
    getSetting<RaceCourse | null>('course', null),
    getSetting('vessel', { name: 'My Boat', length: 32, declination: 0 }),
  ]);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return { waypoints, marks, performance, course, vessel, settingsMap };
}

export async function saveWaypoint(wp: GPSPoint & { id: string }) {
  await db.waypoints.put(wp);
}

export async function deleteWaypoint(id: string) {
  await db.waypoints.delete(id);
}

export async function saveMark(mark: CourseMark & { id: string }) {
  await db.marks.put(mark);
}

export async function deleteMark(id: string) {
  await db.marks.delete(id);
}

export async function savePerformancePoint(p: PerformancePoint & { id: string }) {
  await db.performance.put(p);
}

export async function deletePerformancePoint(id: string) {
  await db.performance.delete(id);
}

export async function savePolars(p: Polars & { id: string }) {
  await db.polars.put(p);
}
