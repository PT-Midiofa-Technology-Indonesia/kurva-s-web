export interface SubPermission {
  id: string;
  name: string;
  checked: boolean;
}

export interface PermissionGroup {
  id: string;
  icon?: string;
  name: string;
  subPermissions: SubPermission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  groups: PermissionGroup[];
  selectAll: boolean;
}

export type PermissionsChangedCallback = (permissions: Permission[]) => void;

/**
 * A permission requirement can be a single code or a list of codes.
 * A list uses OR semantics: the requirement is satisfied when the user holds
 * at least one of the listed codes.
 */
export type PermissionRequirement = string | string[];
