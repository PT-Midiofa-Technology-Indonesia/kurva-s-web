'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PermissionStore {
  permissions: string[];
  roles: string[];
  userId: string | null;

  setPermissions: (data: { userId: string; permissions: string[]; roles: string[] }) => void;
  clearPermissions: () => void;
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
  hasAllPermissions: (codes: string[]) => boolean;
}

export const usePermissionStore = create<PermissionStore>()(
  persist(
    (set, get) => ({
      permissions: [],
      roles: [],
      userId: null,

      setPermissions: ({ userId, permissions, roles }) => set({ userId, permissions, roles }),

      clearPermissions: () => set({ permissions: [], roles: [], userId: null }),

      hasPermission: (code) => get().permissions.includes(code),

      hasAnyPermission: (codes) => codes.some((code) => get().permissions.includes(code)),

      hasAllPermissions: (codes) => codes.every((code) => get().permissions.includes(code)),
    }),
    {
      name: 'permission-store',
    }
  )
);
