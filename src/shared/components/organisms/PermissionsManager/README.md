# Permissions Manager Component

A comprehensive system for managing role permissions with collapsible sections, multi-platform support, and "select all" functionality.

## Overview

The Permissions Manager is built following the Atomic Design pattern and consists of:

- **Atoms**: `PermissionCheckbox` - Basic checkbox with label
- **Molecules**: `PermissionItem` - Single permission row, `PermissionGroup` - Group of permissions by platform
- **Organisms**: `PermissionsAccordion` - Collapsible permission section, `PermissionsManager` - Complete permissions container

## Structure

```
Permission
├── name: string
├── description: string
├── groups: PermissionGroup[]
│   ├── name: string (e.g., "Website", "Mobile")
│   ├── icon?: ReactNode
│   └── subPermissions: SubPermission[]
│       ├── name: string (e.g., "Create", "Read", "Update")
│       └── checked: boolean
└── selectAll: boolean
```

## Usage

### Basic Setup

```tsx
import { PermissionsManager } from '@/components/organisms';
import { Permission } from '@/types/permissions';
import { Laptop, Smartphone } from 'lucide-react';
import { useState } from 'react';

export function RoleForm() {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'user-management',
      name: 'User Management',
      description: 'Manage user accounts and roles',
      selectAll: false,
      groups: [
        {
          id: 'website',
          name: 'Website',
          icon: <Laptop className="w-5 h-5" />,
          subPermissions: [
            { id: 'create', name: 'Create User', checked: false },
            { id: 'read', name: 'View User', checked: false },
            { id: 'update', name: 'Edit User', checked: false },
            { id: 'delete', name: 'Delete User', checked: false },
          ],
        },
        {
          id: 'mobile',
          name: 'Mobile',
          icon: <Smartphone className="w-5 h-5" />,
          subPermissions: [
            { id: 'create', name: 'Create User', checked: false },
            { id: 'read', name: 'View User', checked: false },
            { id: 'update', name: 'Edit User', checked: false },
            { id: 'delete', name: 'Delete User', checked: false },
          ],
        },
      ],
    },
  ]);

  return (
    <PermissionsManager
      permissions={permissions}
      onPermissionsChange={setPermissions}
    />
  );
}
```

### With usePermissions Hook

```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionsManager } from '@/components/organisms';

export function RoleForm() {
  const {
    permissions,
    handlePermissionsChange,
    getSelectedPermissions,
    selectAllPermissions,
    deselectAllPermissions,
    resetPermissions,
  } = usePermissions({
    initialPermissions: [
      // ... your permissions array
    ],
  });

  const handleSave = () => {
    const selected = getSelectedPermissions();
    console.log('Selected permissions:', selected);
    // Submit to API
  };

  return (
    <div className="space-y-4">
      <PermissionsManager
        permissions={permissions}
        onPermissionsChange={handlePermissionsChange}
      />
      <div className="flex gap-2">
        <button onClick={selectAllPermissions}>Select All</button>
        <button onClick={deselectAllPermissions}>Deselect All</button>
        <button onClick={resetPermissions}>Reset</button>
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}
```

## Component Props

### PermissionsManager

```tsx
interface PermissionsManagerProps {
  permissions: Permission[];
  onPermissionsChange: (permissions: Permission[]) => void;
  className?: string;
  disabled?: boolean;
}
```

### PermissionsAccordion

```tsx
interface PermissionsAccordionProps {
  permission: Permission;
  onPermissionChange: (permission: Permission) => void;
  className?: string;
  disabled?: boolean;
}
```

### PermissionGroup

```tsx
interface PermissionGroupProps {
  id: string;
  name: string;
  icon?: React.ReactNode;
  subPermissions: SubPermission[];
  onSubPermissionChange: (subPermissionId: string, checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}
```

### PermissionItem

```tsx
interface PermissionItemProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}
```

### PermissionCheckbox

```tsx
interface PermissionCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}
```

## usePermissions Hook

The `usePermissions` hook provides utilities for managing permission state:

```tsx
const {
  permissions,                  // Current permissions state
  handlePermissionsChange,      // Update permissions
  getSelectedPermissions,       // Get array of selected permissions
  selectAllPermissions,         // Select all permissions
  deselectAllPermissions,       // Deselect all permissions
  resetPermissions,            // Reset to initial state
} = usePermissions({ initialPermissions });
```

### getSelectedPermissions Output

```tsx
[
  {
    permissionId: 'user-management',
    groupId: 'website',
    subPermissionId: 'create',
    subPermissionName: 'Create User',
  },
  // ...
]
```

## Integration Example

```tsx
import { PermissionsManager } from '@/components/organisms';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/atoms';
import { Input } from '@/components/atoms';

export function CreateRoleForm() {
  const [roleName, setRoleName] = useState('');
  const { permissions, handlePermissionsChange, getSelectedPermissions } = 
    usePermissions({
      initialPermissions: defaultPermissions,
    });

  const handleSubmit = async () => {
    const selectedPerms = getSelectedPermissions();
    
    const payload = {
      name: roleName,
      permissions: selectedPerms,
    };

    await createRole(payload);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="space-y-6">
        <Input
          label="Role Name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
        />

        <div>
          <h3 className="text-lg font-semibold mb-4">Permissions</h3>
          <PermissionsManager
            permissions={permissions}
            onPermissionsChange={handlePermissionsChange}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline">Cancel</Button>
          <Button>Save Role</Button>
        </div>
      </div>
    </form>
  );
}
```

## Features

✅ **Collapsible Sections** - Each permission group can be expanded/collapsed  
✅ **Select All Toggle** - Quick toggle to select/deselect all permissions  
✅ **Multi-Platform Support** - Group permissions by platform (Website, Mobile, etc.)  
✅ **Icon Support** - Display icons for each platform group  
✅ **Disabled State** - Disable entire permissions manager  
✅ **Reusable Structure** - Easy to adapt for different permission hierarchies  
✅ **TypeScript Support** - Full type safety with exported interfaces  
✅ **Accessibility** - Built with accessible form elements  

## Styling

All components use Tailwind CSS and follow the design system. Customize via:

- `className` prop on any component
- Tailwind utilities in your application
- CSS variables from the design system

## Notes

- Each `SubPermission` requires a unique `id` within its group
- Each `Permission` requires a unique `id` across all permissions
- Each `PermissionGroup` requires a unique `id` within its permission
- The `selectAll` state is automatically managed based on sub-permission selections
- Platform icons can be any React component (e.g., from lucide-react)
