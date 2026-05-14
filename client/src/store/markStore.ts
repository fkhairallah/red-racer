import { create } from 'zustand';
import type { CourseMark } from '../types';
import { db, generateId, saveMark, deleteMark } from '../lib/persistence';

interface MarkState {
  marks: (CourseMark & { id: string })[];
  load: () => Promise<void>;
  add: (mark: Omit<CourseMark, 'id'>) => Promise<string>;
  update: (mark: CourseMark & { id: string }) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useMarkStore = create<MarkState>((set, get) => ({
  marks: [],

  load: async () => {
    const marks = await db.marks.orderBy('name').toArray();
    set({ marks });
  },

  add: async (mark) => {
    const id = generateId();
    const full = { ...mark, id };
    await saveMark(full);
    set({ marks: [...get().marks, full].sort((a, b) => a.name.localeCompare(b.name)) });
    return id;
  },

  update: async (mark) => {
    await saveMark(mark);
    set({ marks: get().marks.map((m) => (m.id === mark.id ? mark : m)) });
  },

  remove: async (id) => {
    await deleteMark(id);
    set({ marks: get().marks.filter((m) => m.id !== id) });
  },
}));
