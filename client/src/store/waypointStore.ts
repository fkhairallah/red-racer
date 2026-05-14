import { create } from 'zustand';
import type { GPSPoint } from '../types';
import { db, generateId, saveWaypoint, deleteWaypoint } from '../lib/persistence';

interface WaypointState {
  waypoints: (GPSPoint & { id: string })[];
  load: () => Promise<void>;
  add: (wp: Omit<GPSPoint, 'id'>) => Promise<string>;
  update: (wp: GPSPoint & { id: string }) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useWaypointStore = create<WaypointState>((set, get) => ({
  waypoints: [],

  load: async () => {
    const waypoints = await db.waypoints.orderBy('name').toArray();
    set({ waypoints });
  },

  add: async (wp) => {
    const id = generateId();
    const full = { ...wp, id };
    await saveWaypoint(full);
    set({ waypoints: [...get().waypoints, full].sort((a, b) => a.name.localeCompare(b.name)) });
    return id;
  },

  update: async (wp) => {
    await saveWaypoint(wp);
    set({ waypoints: get().waypoints.map((w) => (w.id === wp.id ? wp : w)) });
  },

  remove: async (id) => {
    await deleteWaypoint(id);
    set({ waypoints: get().waypoints.filter((w) => w.id !== id) });
  },
}));
