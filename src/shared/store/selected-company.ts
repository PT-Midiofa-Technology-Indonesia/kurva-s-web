'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SelectedCompanyState {
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  clear: () => void;
}

export const useSelectedCompanyStore = create<SelectedCompanyState>()(
  persist(
    (set) => ({
      selectedCompanyId: null,
      setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
      clear: () => set({ selectedCompanyId: null }),
    }),
    { name: 'selected-company' }
  )
);
