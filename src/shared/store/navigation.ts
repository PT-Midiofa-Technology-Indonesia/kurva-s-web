import { create } from 'zustand';
import type { NavItem } from '@/components/organisms/Navbar';

interface NavigationStore {
  breadcrumbs: NavItem[] | null;
  setBreadcrumbs: (breadcrumbs: NavItem[]) => void;
  clearBreadcrumbs: () => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  breadcrumbs: null,
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  clearBreadcrumbs: () => set({ breadcrumbs: null }),
}));
