import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import type { Permission } from '@/types/permissions';
import { PermissionsManager } from './PermissionsManager';

const meta: Meta<typeof PermissionsManager> = {
  title: 'Organisms/PermissionsManager',
  component: PermissionsManager,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PermissionsManager>;

const defaultPermissions: Permission[] = [
  {
    id: 'user-management',
    name: 'User Management',
    description: 'Manage user accounts and roles',
    selectAll: false,
    groups: [
      {
        id: 'website',
        name: 'Website',
        icon: 'web',
        subPermissions: [
          { id: 'create', name: 'Create User', checked: false },
          { id: 'read', name: 'View User', checked: false },
          { id: 'update', name: 'Edit User', checked: false },
          { id: 'delete', name: 'Delete User', checked: false },
          { id: 'export', name: 'Export User Data', checked: false },
        ],
      },
      {
        id: 'mobile',
        name: 'Mobile',
        icon: 'mobile',
        subPermissions: [
          { id: 'create', name: 'Create User', checked: false },
          { id: 'read', name: 'View User', checked: false },
          { id: 'update', name: 'Edit User', checked: false },
          { id: 'delete', name: 'Delete User', checked: false },
          { id: 'export', name: 'Export User Data', checked: false },
        ],
      },
    ],
  },
  {
    id: 'content-management',
    name: 'Content Management',
    description: 'Create and manage content',
    selectAll: false,
    groups: [
      {
        id: 'website',
        name: 'Website',
        icon: 'web',
        subPermissions: [
          { id: 'create', name: 'Create Content', checked: false },
          { id: 'read', name: 'View Content', checked: false },
          { id: 'update', name: 'Edit Content', checked: false },
          { id: 'delete', name: 'Delete Content', checked: true },
          { id: 'publish', name: 'Publish Content', checked: true },
        ],
      },
      {
        id: 'mobile',
        name: 'Mobile',
        icon: 'mobile',
        subPermissions: [
          { id: 'create', name: 'Create Content', checked: false },
          { id: 'read', name: 'View Content', checked: true },
          { id: 'update', name: 'Edit Content', checked: false },
          { id: 'delete', name: 'Delete Content', checked: false },
          { id: 'publish', name: 'Publish Content', checked: false },
        ],
      },
    ],
  },
];

export const Default: Story = {
  args: {
    permissions: defaultPermissions,
    disabled: false,
    onPermissionsChange: (permissions: Permission[]) => {
      console.log('Permissions changed:', permissions);
    },
  },
};

export const WithInitialSelection: Story = {
  args: {
    permissions: defaultPermissions.map((perm) => ({
      ...perm,
      selectAll: true,
      groups: perm.groups.map((group) => ({
        ...group,
        subPermissions: group.subPermissions.map((subPerm) => ({
          ...subPerm,
          checked: true,
        })),
      })),
    })),
    disabled: false,
    onPermissionsChange: (permissions: Permission[]) => {
      console.log('Permissions changed:', permissions);
    },
  },
};

export const Disabled: Story = {
  args: {
    permissions: defaultPermissions,
    disabled: true,
    onPermissionsChange: (permissions: Permission[]) => {
      console.log('Permissions changed:', permissions);
    },
  },
};

export const Interactive: Story = {
  render: () => {
    const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);

    const handlePermissionsChange = (updatedPermissions: Permission[]) => {
      setPermissions(updatedPermissions);
    };

    return (
      <div className="space-y-4">
        <PermissionsManager
          permissions={permissions}
          onPermissionsChange={handlePermissionsChange}
        />
        <div className="p-4 bg-slate-100 rounded-lg">
          <h3 className="font-medium mb-2">Current Permissions:</h3>
          <pre className="text-xs overflow-auto">{JSON.stringify(permissions, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

export const Empty: Story = {
  args: {
    permissions: [],
    onPermissionsChange: (permissions: Permission[]) => {
      console.log('Permissions changed:', permissions);
    },
  },
};
