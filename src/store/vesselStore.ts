import { create } from 'zustand';
import type { Vessel, Polars, PerformancePoint } from '../types';
import { db, generateId, getSetting, setSetting, savePolars, savePerformancePoint, deletePerformancePoint } from '../lib/persistence';

interface VesselState {
  vessel: Vessel;
  polars: Polars | null;
  performance: (PerformancePoint & { id: string })[];

  load: () => Promise<void>;
  updateVessel: (v: Vessel) => Promise<void>;
  setPolars: (p: Polars) => Promise<void>;
  addPerformance: (p: Omit<PerformancePoint, 'id'>) => Promise<void>;
  removePerformance: (id: string) => Promise<void>;
}

export const useVesselStore = create<VesselState>((set, get) => ({
  vessel: { name: 'My Boat', length: 32, declination: 0 },
  polars: null,
  performance: [],

  load: async () => {
    const vessel = await getSetting<Vessel>('vessel', { name: 'My Boat', length: 32, declination: 0 });
    const polarsArr = await db.polars.toArray();
    const activeId = await getSetting<string | null>('activePolarsId', null);
    const polars = activeId ? (polarsArr.find((p) => p.id === activeId) ?? null) : (polarsArr[0] ?? null);
    const performance = await db.performance.toArray();
    set({ vessel, polars, performance });
  },

  updateVessel: async (v) => {
    await setSetting('vessel', v);
    set({ vessel: v });
  },

  setPolars: async (p) => {
    const id = generateId();
    const full = { ...p, id };
    await savePolars(full);
    await setSetting('activePolarsId', id);
    set({ polars: full });
  },

  addPerformance: async (p) => {
    const id = generateId();
    const full = { ...p, id };
    await savePerformancePoint(full);
    set({ performance: [...get().performance, full] });
  },

  removePerformance: async (id) => {
    await deletePerformancePoint(id);
    set({ performance: get().performance.filter((p) => p.id !== id) });
  },
}));
