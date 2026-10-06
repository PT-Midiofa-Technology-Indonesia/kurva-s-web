import type { Meta, StoryObj } from '@storybook/nextjs';
import { Building2, Users } from 'lucide-react';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

import { OrgTree, type OrgTreeNode } from './OrgTree';

const meta: Meta<typeof OrgTree> = {
  title: 'Organisms/OrgTree',
  component: OrgTree,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof OrgTree>;

const mockNodes: OrgTreeNode[] = [
  {
    id: 'dept-01',
    name: 'Departemen 01',
    type: 'Department',
    icon: <Building2 className="h-4 w-4 stroke-amber-600" />,
    iconBgColor: '#FEF3C7',
    positionCount: 4,
    positionLabel: 'Position',
    status: 'active',
    statusLabel: 'Aktif',
    children: [
      {
        id: 'mgr-01',
        name: 'Manager 01',
        type: 'Manager',
        icon: <Users className="h-4 w-4 stroke-teal-600" />,
        iconBgColor: '#C8FFF7',
        positionCount: 2,
        positionLabel: 'Position',
        status: 'active',
        statusLabel: 'Aktif',
      },
      {
        id: 'mgr-02',
        name: 'Manager 02',
        type: 'Manager',
        icon: <Users className="h-4 w-4 stroke-teal-600" />,
        iconBgColor: '#C8FFF7',
        positionCount: 2,
        positionLabel: 'Position',
        status: 'inactive',
        statusLabel: 'Nonaktif',
      },
    ],
  },
  {
    id: 'dept-02',
    name: 'Departemen 02',
    type: 'Department',
    icon: <Building2 className="h-4 w-4 stroke-amber-600" />,
    iconBgColor: '#FEF3C7',
    positionCount: 6,
    positionLabel: 'Position',
    status: 'active',
    statusLabel: 'Aktif',
    children: [
      {
        id: 'mgr-03',
        name: 'Manager 03',
        type: 'Manager',
        icon: <Users className="h-4 w-4 stroke-teal-600" />,
        iconBgColor: '#C8FFF7',
        positionCount: 3,
        positionLabel: 'Position',
        status: 'active',
        statusLabel: 'Aktif',
        children: [
          {
            id: 'emp-01',
            name: 'Employee 01',
            type: 'Employee',
            icon: <Users className="h-4 w-4 stroke-green-600" />,
            iconBgColor: '#DCFCE7',
            status: 'active',
            statusLabel: 'Aktif',
          },
          {
            id: 'emp-02',
            name: 'Employee 02',
            type: 'Employee',
            icon: <Users className="h-4 w-4 stroke-green-600" />,
            iconBgColor: '#DCFCE7',
            status: 'active',
            statusLabel: 'Aktif',
          },
        ],
      },
      {
        id: 'mgr-04',
        name: 'Manager 04',
        type: 'Manager',
        icon: <Users className="h-4 w-4 stroke-teal-600" />,
        iconBgColor: '#C8FFF7',
        positionCount: 3,
        positionLabel: 'Position',
        status: 'active',
        statusLabel: 'Aktif',
      },
    ],
  },
];

export const Default: Story = {
  args: {
    title: 'Company 01',
    subtitle: '10 Position · Departemen · Posisi',
    nodes: mockNodes,
    defaultExpanded: true,
  },
};

export const WithActions: Story = {
  args: {
    title: 'Company 01',
    subtitle: '10 Position · Departemen · Posisi',
    nodes: mockNodes,
    defaultExpanded: true,
    renderActions: (node) => (
      <>
        <DropdownMenuItem>Edit {node.name}</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
      </>
    ),
  },
};

export const WithClickHandler: Story = {
  args: {
    title: 'Company 01',
    subtitle: '10 Position · Departemen · Posisi',
    nodes: mockNodes,
    defaultExpanded: true,
    onNodeClick: (node) => {
      console.log('Clicked node:', node);
      alert(`Clicked: ${node.name}`);
    },
  },
};

export const CollapsedByDefault: Story = {
  args: {
    title: 'Company 01',
    subtitle: '10 Position · Departemen · Posisi',
    nodes: mockNodes,
    defaultExpanded: false,
  },
};

export const SimpleSingleLevel: Story = {
  args: {
    title: 'Organization Structure',
    subtitle: '1 Department',
    nodes: [
      {
        id: 'dept-01',
        name: 'Sales Department',
        type: 'Department',
        icon: <Building2 className="h-4 w-4 stroke-amber-600" />,
        iconBgColor: '#FEF3C7',
        positionCount: 5,
        positionLabel: 'Position',
        status: 'active',
        statusLabel: 'Aktif',
      },
    ],
    defaultExpanded: true,
  },
};

export const DeepNesting: Story = {
  args: {
    title: 'Large Organization',
    subtitle: '20+ Positions',
    nodes: [
      {
        id: 'company',
        name: 'Company Head',
        type: 'Executive',
        icon: <Building2 className="h-4 w-4 stroke-amber-600" />,
        iconBgColor: '#FEF3C7',
        positionCount: 1,
        status: 'active',
        children: [
          {
            id: 'cfo',
            name: 'Chief Financial Officer',
            type: 'Director',
            icon: <Users className="h-4 w-4 stroke-teal-600" />,
            iconBgColor: '#C8FFF7',
            positionCount: 1,
            status: 'active',
            children: [
              {
                id: 'acc-mgr',
                name: 'Accounting Manager',
                type: 'Manager',
                icon: <Users className="h-4 w-4 stroke-teal-600" />,
                iconBgColor: '#C8FFF7',
                positionCount: 3,
                status: 'active',
                children: [
                  {
                    id: 'accountant-1',
                    name: 'Senior Accountant',
                    type: 'Staff',
                    icon: <Users className="h-4 w-4 stroke-green-600" />,
                    iconBgColor: '#DCFCE7',
                    status: 'active',
                  },
                  {
                    id: 'accountant-2',
                    name: 'Junior Accountant',
                    type: 'Staff',
                    icon: <Users className="h-4 w-4 stroke-green-600" />,
                    iconBgColor: '#DCFCE7',
                    status: 'active',
                  },
                ],
              },
              {
                id: 'audit-mgr',
                name: 'Audit Manager',
                type: 'Manager',
                icon: <Users className="h-4 w-4 stroke-teal-600" />,
                iconBgColor: '#C8FFF7',
                positionCount: 2,
                status: 'active',
              },
            ],
          },
        ],
      },
    ],
    defaultExpanded: true,
  },
};

export const WithFullFeaturing: Story = {
  args: {
    title: 'Company 01',
    subtitle: '10 Position · Departemen · Posisi',
    nodes: mockNodes,
    defaultExpanded: true,
    alwaysShowActions: true,
    renderActions: (_node) => (
      <>
        <DropdownMenuItem>View Details</DropdownMenuItem>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Move</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
      </>
    ),
    onNodeClick: (node) => {
      console.log('Selected node:', node);
    },
  },
};
