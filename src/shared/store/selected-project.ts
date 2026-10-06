'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SelectedProjectStore {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string) => void;
  clear: () => void;
}

export const useSelectedProjectStore = create<SelectedProjectStore>()(
  persist(
    (set) => ({
      selectedProjectId: null,
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),
      clear: () => set({ selectedProjectId: null }),
    }),
    { name: 'selected-project' }
  )
);
