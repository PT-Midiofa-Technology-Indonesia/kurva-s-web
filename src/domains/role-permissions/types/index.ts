export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface PermissionItem {
  id: number;
  name: string;
  description: string;
  sortOrder: number;
}

export interface PermissionGroup {
  groupId: string;
  groupCode: string;
  groupName: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  permissions: {
    web: PermissionItem[];
    mobile: PermissionItem[];
  };
}

export interface Role {
  id: string | number;
  name: string;
  guardName?: string;
  description?: string;
  isActive: boolean;
  usersCount?: number;
  permissionIds: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RolePermissionUpdate {
  roleId: string;
  permissionIds: string[];
}
