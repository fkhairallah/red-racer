import { create } from 'zustand';
import type { BearingPrefs, DistancePrefs, ManualWind } from '../types';
import { getSetting, setSetting } from '../lib/persistence';

interface SettingsState {
  bearing: BearingPrefs;
  distance: DistancePrefs;
  startSequenceMinutes: number;
  instrumentMode: 'instruments' | 'manual';
  manualWind: ManualWind;

  load: () => Promise<void>;
  updateBearing: (b: BearingPrefs) => Promise<void>;
  updateDistance: (d: DistancePrefs) => Promise<void>;
  setStartSequence: (mins: number) => Promise<void>;
  setInstrumentMode: (mode: 'instruments' | 'manual') => Promise<void>;
  setManualWind: (wind: ManualWind) => Promise<void>;
}

const DEFAULT_BEARING: BearingPrefs = { declination: -7.54, displayMagnetic: true };
const DEFAULT_DISTANCE: DistancePrefs = { unit: 'nm', speedUnit: 'kts' };
const DEFAULT_MANUAL_WIND: ManualWind = { speed: 10, direction: 180 };

export const useSettingsStore = create<SettingsState>((set) => ({
  bearing: DEFAULT_BEARING,
  distance: DEFAULT_DISTANCE,
  startSequenceMinutes: 5,
  instrumentMode: 'instruments',
  manualWind: DEFAULT_MANUAL_WIND,

  load: async () => {
    const [bearing, distance, startSequenceMinutes, instrumentMode, manualWind] = await Promise.all([
      getSetting<BearingPrefs>('bearing', DEFAULT_BEARING),
      getSetting<DistancePrefs>('distance', DEFAULT_DISTANCE),
      getSetting<number>('startSequenceMinutes', 5),
      getSetting<'instruments' | 'manual'>('instrumentMode', 'instruments'),
      getSetting<ManualWind>('manualWind', DEFAULT_MANUAL_WIND),
    ]);
    set({ bearing, distance, startSequenceMinutes, instrumentMode, manualWind });
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

  setInstrumentMode: async (mode) => {
    await setSetting('instrumentMode', mode);
    set({ instrumentMode: mode });
  },

  setManualWind: async (wind) => {
    await setSetting('manualWind', wind);
    set({ manualWind: wind });
  },
}));
