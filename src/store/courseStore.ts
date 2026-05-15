import { create } from 'zustand';
import type { RaceCourse, CourseType } from '../types';
import { getSetting, setSetting } from '../lib/persistence';

const defaultCourse: RaceCourse = {
  courseType: null,
  markIds: [],
  rcBoat: null,
  pinMark: null,
  startTime: null,
  endTime: null,
  repeat: 1,
  currentLegIndex: 0,
};

interface CourseState {
  course: RaceCourse;
  countdownSeconds: number;
  isInSequence: boolean;

  load: () => Promise<void>;
  save: () => Promise<void>;

  setCourseType: (t: CourseType) => void;
  setMarkIds: (ids: string[]) => void;
  setRcBoat: (lat: number, lon: number) => void;
  setPinMark: (lat: number, lon: number) => void;
  setRepeat: (n: number) => void;
  advanceLeg: () => void;
  returnToPreviousLeg: () => void;

  startSequence: () => void;
  startRace: () => void;
  endRace: () => void;
  clearCourse: () => void;
  postpone: () => void;

  setCountdown: (seconds: number) => void;
  setInSequence: (v: boolean) => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  course: defaultCourse,
  countdownSeconds: 5 * 60,
  isInSequence: false,

  load: async () => {
    const saved = await getSetting<RaceCourse | null>('course', null);
    if (saved) set({ course: { ...defaultCourse, ...saved } });
    const mins = await getSetting<number>('startSequenceMinutes', 5);
    set({ countdownSeconds: mins * 60 });
  },

  save: async () => {
    await setSetting('course', get().course);
  },

  setCourseType: (t) => {
    set((s) => ({ course: { ...s.course, courseType: t } }));
    get().save();
  },

  setMarkIds: (ids) => {
    set((s) => ({ course: { ...s.course, markIds: ids } }));
    get().save();
  },

  setRcBoat: (lat, lon) => {
    set((s) => ({ course: { ...s.course, rcBoat: { name: 'RC', lat, lon } } }));
    get().save();
  },

  setPinMark: (lat, lon) => {
    set((s) => ({ course: { ...s.course, pinMark: { name: 'Pin', lat, lon } } }));
    get().save();
  },

  setRepeat: (n) => {
    set((s) => ({ course: { ...s.course, repeat: n } }));
    get().save();
  },

  advanceLeg: () => {
    set((s) => {
      const c = s.course;
      const next = Math.min(c.currentLegIndex + 1, Math.max(c.markIds.length - 1, 0));
      return { course: { ...c, currentLegIndex: next } };
    });
    get().save();
  },

  returnToPreviousLeg: () => {
    set((s) => {
      const c = s.course;
      return { course: { ...c, currentLegIndex: Math.max(0, c.currentLegIndex - 1) } };
    });
    get().save();
  },

  startSequence: () => {
    set((s) => ({ course: { ...s.course, startTime: null, endTime: null } }));
    get().save();
  },

  startRace: () => {
    set((s) => ({ course: { ...s.course, startTime: new Date(), currentLegIndex: 0 } }));
    get().save();
  },

  endRace: () => {
    set((s) => ({ course: { ...s.course, endTime: new Date() } }));
    get().save();
  },

  clearCourse: () => {
    set((s) => ({
      course: {
        ...s.course,
        rcBoat: null,
        pinMark: null,
        markIds: [],
        courseType: null,
        currentLegIndex: 0,
      },
    }));
    get().save();
  },

  postpone: () => {
    set({ isInSequence: false, countdownSeconds: 6 * 60 });
  },

  setCountdown: (seconds) => set({ countdownSeconds: seconds }),
  setInSequence: (v) => set({ isInSequence: v }),
}));
