import type { Meta, StoryObj } from '@storybook/nextjs';
import { ArrowLeft, ArrowRight, Building2, ChevronDown, Edit, Trash2, User } from 'lucide-react';
import { useCallback, useState } from 'react';

import { type ContextMenuItem, OrgChart, type OrgChartNode } from './OrgChart';

const meta: Meta<typeof OrgChart> = {
  title: 'Organisms/OrgChart',
  component: OrgChart,
  parameters: { layout: 'fullscreen' },
  argTypes: {},
  decorators: [
    (Story) => (
      <div style={{ height: '600px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OrgChart>;

const buildingIcon = <Building2 className="h-5 w-5 stroke-green-600" />;
const userIcon = <User className="h-5 w-5 stroke-teal-500" />;

const sampleTree: OrgChartNode[] = [
  {
    id: 'company-01',
    name: 'Company 01',
    type: 'Perusahaan',
    icon: buildingIcon,
    iconBgColor: '#DCFCE7',
    status: 'active',
    statusLabel: 'Aktif',
    children: [
      {
        id: 'mgr-01',
        name: 'Manager 01',
        type: 'Department 01',
        icon: userIcon,
        iconBgColor: '#CCFBF1',
        status: 'active',
        statusLabel: 'Aktif',
        children: [
          {
            id: 'staff-01',
            name: 'Staff 01',
            type: 'Department 01',
            icon: userIcon,
            iconBgColor: '#F1F5F9',
            status: 'active',
            statusLabel: 'Aktif',
          },
          {
            id: 'staff-02',
            name: 'Staff 02',
            type: 'Department 01',
            icon: userIcon,
            iconBgColor: '#F1F5F9',
            status: 'inactive',
            statusLabel: 'Tidak Aktif',
          },
        ],
      },
      {
        id: 'mgr-02',
        name: 'Manager 02',
        type: 'Department 02',
        icon: userIcon,
        iconBgColor: '#CCFBF1',
        status: 'inactive',
        statusLabel: 'Tidak Aktif',
        children: [
          {
            id: 'staff-03',
            name: 'Staff 03',
            type: 'Department 02',
            icon: userIcon,
            iconBgColor: '#F1F5F9',
            status: 'active',
            statusLabel: 'Aktif',
          },
          {
            id: 'staff-04',
            name: 'Staff 04',
            type: 'Department 02',
            icon: userIcon,
            iconBgColor: '#F1F5F9',
            status: 'inactive',
            statusLabel: 'Tidak Aktif',
          },
        ],
      },
    ],
  },
];

export const Default: Story = {
  args: {
    nodes: sampleTree,
  },
};

export const InteractiveFilter: Story = {
  name: 'Interactive (controls)',
  args: {
    nodes: sampleTree,
  },
};

export const CollapsedByDefault: Story = {
  args: {
    nodes: sampleTree,
    defaultCollapsed: ['company-01'],
  },
};

export const MultipleRoots: Story = {
  args: {
    nodes: [
      {
        id: 'div-a',
        name: 'Division A',
        type: 'Divisi',
        icon: buildingIcon,
        iconBgColor: '#DCFCE7',
        status: 'active',
        statusLabel: 'Aktif',
        children: [
          {
            id: 'mgr-a1',
            name: 'Manager A1',
            type: 'Division A',
            icon: userIcon,
            iconBgColor: '#CCFBF1',
            status: 'active',
            statusLabel: 'Aktif',
          },
          {
            id: 'mgr-a2',
            name: 'Manager A2',
            type: 'Division A',
            icon: userIcon,
            iconBgColor: '#CCFBF1',
            status: 'inactive',
            statusLabel: 'Tidak Aktif',
          },
        ],
      },
      {
        id: 'div-b',
        name: 'Division B',
        type: 'Divisi',
        icon: buildingIcon,
        iconBgColor: '#FEF3C7',
        status: 'active',
        statusLabel: 'Aktif',
        children: [
          {
            id: 'mgr-b1',
            name: 'Manager B1',
            type: 'Division B',
            icon: userIcon,
            iconBgColor: '#FEF9C3',
            status: 'active',
            statusLabel: 'Aktif',
          },
        ],
      },
    ],
  },
};

export const DeepHierarchy: Story = {
  args: {
    nodes: [
      {
        id: 'root',
        name: 'CEO',
        type: 'Executive',
        icon: buildingIcon,
        iconBgColor: '#DCFCE7',
        status: 'active',
        statusLabel: 'Aktif',
        children: [
          {
            id: 'cfo',
            name: 'CFO',
            type: 'Director',
            icon: userIcon,
            iconBgColor: '#CCFBF1',
            status: 'active',
            statusLabel: 'Aktif',
            children: [
              {
                id: 'acc-mgr',
                name: 'Accounting Mgr',
                type: 'Manager',
                icon: userIcon,
                iconBgColor: '#F1F5F9',
                status: 'active',
                statusLabel: 'Aktif',
                children: [
                  {
                    id: 'acc-1',
                    name: 'Accountant 01',
                    type: 'Staff',
                    icon: userIcon,
                    iconBgColor: '#F8FAFC',
                    status: 'active',
                    statusLabel: 'Aktif',
                  },
                  {
                    id: 'acc-2',
                    name: 'Accountant 02',
                    type: 'Staff',
                    icon: userIcon,
                    iconBgColor: '#F8FAFC',
                    status: 'inactive',
                    statusLabel: 'Tidak Aktif',
                  },
                ],
              },
            ],
          },
          {
            id: 'coo',
            name: 'COO',
            type: 'Director',
            icon: userIcon,
            iconBgColor: '#CCFBF1',
            status: 'inactive',
            statusLabel: 'Tidak Aktif',
            children: [
              {
                id: 'ops-mgr',
                name: 'Operations Mgr',
                type: 'Manager',
                icon: userIcon,
                iconBgColor: '#F1F5F9',
                status: 'active',
                statusLabel: 'Aktif',
              },
              {
                id: 'prod-mgr',
                name: 'Production Mgr',
                type: 'Manager',
                icon: userIcon,
                iconBgColor: '#F1F5F9',
                status: 'inactive',
                statusLabel: 'Tidak Aktif',
              },
            ],
          },
        ],
      },
    ],
  },
};

export const WithArrowActions: Story = {
  name: 'With arrow actions (click card to reveal)',
  render: function Render() {
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const handleNodeClick = useCallback((node: OrgChartNode) => {
      if (node.id === 'company-01') {
        setSelectedNodeId(null);
        return;
      }
      setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
    }, []);

    const handleAddSibling = useCallback((node: OrgChartNode) => {
      const target = node.parentId ?? null;
      console.log('Add sibling — parentId:', target);
      alert(`Tambah posisi sejajar\nParent: ${target ?? 'root'}`);
    }, []);

    const handleAddChild = useCallback((node: OrgChartNode) => {
      console.log('Add child — parentId:', node.id);
      alert(`Tambah posisi anak\nParent ID: ${node.id}`);
    }, []);

    return (
      <OrgChart
        nodes={sampleTree}
        selectedNodeId={selectedNodeId}
        onNodeClick={handleNodeClick}
        renderArrowActions={(node, left, top, w, h) => {
          if (node.id === 'company-01') return null;
          return (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
              key={`arrows-${node.id}`}
            >
              {/* Left arrow — add sibling above */}
              <button
                type="button"
                style={{
                  position: 'absolute',
                  left: left - 16,
                  top: top + h / 2 - 14,
                  width: 28,
                  height: 28,
                  pointerEvents: 'auto',
                }}
                className="flex items-center justify-center rounded-full bg-teal-500 text-white shadow-md hover:bg-teal-600 transition-colors"
                title="Tambah posisi sejajar"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSibling(node);
                }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>

              {/* Right arrow — add sibling below */}
              <button
                type="button"
                style={{
                  position: 'absolute',
                  left: left + w + 4,
                  top: top + h / 2 - 14,
                  width: 28,
                  height: 28,
                  pointerEvents: 'auto',
                }}
                className="flex items-center justify-center rounded-full bg-teal-500 text-white shadow-md hover:bg-teal-600 transition-colors"
                title="Tambah posisi sejajar"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSibling(node);
                }}
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              {/* Down arrow — add child */}
              <button
                type="button"
                style={{
                  position: 'absolute',
                  left: left + w / 2 - 14,
                  top: top + h + 4,
                  width: 28,
                  height: 28,
                  pointerEvents: 'auto',
                }}
                className="flex items-center justify-center rounded-full bg-teal-500 text-white shadow-md hover:bg-teal-600 transition-colors"
                title="Tambah posisi anak"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddChild(node);
                }}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        }}
      />
    );
  },
};

export const WithContextMenu: Story = {
  name: 'With context menu (right-click)',
  render: function Render() {
    const contextMenuItems: ContextMenuItem[] = [
      {
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        variant: 'default',
        onClick: (node) => {
          alert(`Edit node: ${node.name} (ID: ${node.id})`);
        },
      },
      {
        label: 'Hapus',
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'danger',
        onClick: (node) => {
          alert(`Delete node: ${node.name} (ID: ${node.id})`);
        },
      },
    ];

    return <OrgChart nodes={sampleTree} contextMenuItems={contextMenuItems} />;
  },
};
