/**
 * Integration tests for the Permission Store
 * Tests: setPermissions, clearPermissions, hasPermission, hasAnyPermission, hasAllPermissions, localStorage persistence
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { usePermissionStore } from '@/domains/permission/store';

const MOCK_USER_PERMISSIONS = {
  userId: 'user-1',
  permissions: ['usman.rpm', 'usman.user', 'dashboard.company'],
  roles: ['admin', 'manager'],
};

const MINIMAL_PERMISSIONS = {
  userId: 'user-2',
  permissions: ['dashboard.project'],
  roles: ['viewer'],
};

const STORE_KEY = 'permission-store';

// Clear localStorage before and after tests
beforeEach(() => {
  localStorage.clear();
  usePermissionStore.getState().clearPermissions();
});

afterEach(() => {
  localStorage.clear();
  usePermissionStore.getState().clearPermissions();
});

describe('Permission Store', () => {
  describe('setPermissions action', () => {
    it('should set permissions and roles from UserPermissions data', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);

      const state = usePermissionStore.getState();
      expect(state.userId).toBe(MOCK_USER_PERMISSIONS.userId);
      expect(state.roles).toEqual(MOCK_USER_PERMISSIONS.roles);
      expect(state.permissions).toEqual(MOCK_USER_PERMISSIONS.permissions);
    });

    it('should persist to localStorage with key permission-store', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);

      const stored = localStorage.getItem(STORE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.userId).toBe(MOCK_USER_PERMISSIONS.userId);
      expect(parsed.state.roles).toEqual(MOCK_USER_PERMISSIONS.roles);
      expect(parsed.state.permissions).toEqual(MOCK_USER_PERMISSIONS.permissions);
    });

    it('should overwrite existing permissions when called again', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);
      expect(usePermissionStore.getState().roles).toEqual(MOCK_USER_PERMISSIONS.roles);

      usePermissionStore.getState().setPermissions(MINIMAL_PERMISSIONS);
      expect(usePermissionStore.getState().roles).toEqual(MINIMAL_PERMISSIONS.roles);
      expect(usePermissionStore.getState().userId).toBe(MINIMAL_PERMISSIONS.userId);
    });
  });

  describe('clearPermissions action', () => {
    it('should clear all permissions and roles', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);
      expect(usePermissionStore.getState().roles.length).toBeGreaterThan(0);

      usePermissionStore.getState().clearPermissions();

      const state = usePermissionStore.getState();
      expect(state.userId).toBeNull();
      expect(state.roles).toEqual([]);
      expect(state.permissions).toEqual([]);
    });

    it('should clear localStorage entry', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);
      expect(localStorage.getItem(STORE_KEY)).not.toBeNull();

      usePermissionStore.getState().clearPermissions();

      const stored = localStorage.getItem(STORE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.userId).toBeNull();
      expect(parsed.state.roles).toEqual([]);
      expect(parsed.state.permissions).toEqual([]);
    });
  });

  describe('hasPermission method', () => {
    it('should return true for existing permission code', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);
      expect(usePermissionStore.getState().hasPermission('usman.rpm')).toBe(true);
    });

    it('should return false for non-existent permission code', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);
      expect(usePermissionStore.getState().hasPermission('nonexistent.permission')).toBe(false);
    });

    it('should return false when no permissions are set', () => {
      usePermissionStore.getState().clearPermissions();
      expect(usePermissionStore.getState().hasPermission('dashboard.view')).toBe(false);
    });
  });

  describe('hasAnyPermission method', () => {
    it('should return true if ANY required permission exists', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);
      expect(
        usePermissionStore
          .getState()
          .hasAnyPermission(['nonexistent1', 'usman.rpm', 'nonexistent2'])
      ).toBe(true);
    });

    it('should return false if NONE of the required permissions exist', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);
      expect(usePermissionStore.getState().hasAnyPermission(['nonexistent1', 'nonexistent2'])).toBe(
        false
      );
    });

    it('should return false for empty array', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);
      expect(usePermissionStore.getState().hasAnyPermission([])).toBe(false);
    });
  });

  describe('hasAllPermissions method', () => {
    it('should return true if ALL required permissions exist', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);
      expect(usePermissionStore.getState().hasAllPermissions(['usman.rpm', 'usman.user'])).toBe(
        true
      );
    });

    it('should return false if NOT ALL required permissions exist', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);
      expect(
        usePermissionStore.getState().hasAllPermissions(['usman.rpm', 'nonexistent.permission'])
      ).toBe(false);
    });

    it('should return true for empty array (vacuous truth)', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);
      expect(usePermissionStore.getState().hasAllPermissions([])).toBe(true);
    });
  });

  describe('localStorage persistence', () => {
    it('should persist state after setPermissions', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);

      const stored = localStorage.getItem(STORE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.userId).toBe(MOCK_USER_PERMISSIONS.userId);
    });

    it('should be cleared from localStorage when clearPermissions is called', () => {
      usePermissionStore.getState().setPermissions(MOCK_USER_PERMISSIONS);
      usePermissionStore.getState().clearPermissions();

      const stored = localStorage.getItem(STORE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.userId).toBeNull();
      expect(parsed.state.roles).toEqual([]);
      expect(parsed.state.permissions).toEqual([]);
    });
  });
});
