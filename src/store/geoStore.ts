import { create } from 'zustand';
import type { SailPoint } from '../types';
import { geoService } from '../lib/geolocation';

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
    const s = get();
    const track = s.isSavingTrack ? [...s.track, point] : s.track;
    set({ currentPoint: point, isConnected: geoService.isConnected, accuracy: geoService.accuracy, track });
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
