import { create } from 'zustand';
import type { SailPoint } from '../types';
import { geoService } from '../lib/geolocation';
import { useSettingsStore } from './settingsStore';

interface GeoState {
  currentPoint: SailPoint | null;
  isConnected: boolean;
  accuracy: number;
  track: SailPoint[];
  isSavingTrack: boolean;

  start: () => void;
  stop: () => void;
  startTrack: () => void;
  stopTrack: () => SailPoint[];
  clearTrack: () => void;
}

export const useGeoStore = create<GeoState>((set, get) => {
  const onPoint = (point: SailPoint) => {
    const { instrumentMode, manualWind } = useSettingsStore.getState();
    let enriched = point;
    if (instrumentMode === 'manual') {
      // TWA: angle of wind relative to course, signed (-180 port … +180 starboard)
      const twa = ((manualWind.direction - point.courseOverGround + 540) % 360) - 180;
      enriched = {
        ...point,
        trueWindSpeed: manualWind.speed,
        trueWindDirection: manualWind.direction,
        trueWindAngle: twa,
      };
    }
    const s = get();
    const track = s.isSavingTrack ? [...s.track, enriched] : s.track;
    set({ currentPoint: enriched, isConnected: geoService.isConnected, accuracy: geoService.accuracy, track });
  };

  return {
    currentPoint: null,
    isConnected: false,
    accuracy: Infinity,
    track: [],
    isSavingTrack: false,

    start: () => {
      geoService.listen(onPoint);
      geoService.start();
    },

    stop: () => {
      geoService.unlisten(onPoint);
      geoService.stop();
      set({ isConnected: false });
    },

    startTrack: () => set({ isSavingTrack: true, track: [] }),

    stopTrack: () => {
      const track = get().track;
      set({ isSavingTrack: false });
      return track;
    },

    clearTrack: () => set({ track: [] }),
  };
});
