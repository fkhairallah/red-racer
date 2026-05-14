import { create } from 'zustand';
import type { BearingPrefs, DistancePrefs } from '../types';
import { getSetting, setSetting } from '../lib/persistence';

interface SettingsState {
  bearing: BearingPrefs;
  distance: DistancePrefs;
  startSequenceMinutes: number;

  load: () => Promise<void>;
  updateBearing: (b: BearingPrefs) => Promise<void>;
  updateDistance: (d: DistancePrefs) => Promise<void>;
  setStartSequence: (mins: number) => Promise<void>;
}

const DEFAULT_BEARING: BearingPrefs = { declination: -14.2, displayMagnetic: true };
const DEFAULT_DISTANCE: DistancePrefs = { unit: 'nm', speedUnit: 'kts' };

export const useSettingsStore = create<SettingsState>((set) => ({
  bearing: DEFAULT_BEARING,
  distance: DEFAULT_DISTANCE,
  startSequenceMinutes: 5,

  load: async () => {
    const [bearing, distance, startSequenceMinutes] = await Promise.all([
      getSetting<BearingPrefs>('bearing', DEFAULT_BEARING),
      getSetting<DistancePrefs>('distance', DEFAULT_DISTANCE),
      getSetting<number>('startSequenceMinutes', 5),
    ]);
    set({ bearing, distance, startSequenceMinutes });
  },

  updateBearing: async (b) => {
    await setSetting('bearing', b);
    set({ bearing: b });
  },

  updateDistance: async (d) => {
    await setSetting('distance', d);
    set({ distance: d });
  },

  setStartSequence: async (mins) => {
    await setSetting('startSequenceMinutes', mins);
    set({ startSequenceMinutes: mins });
  },
}));
