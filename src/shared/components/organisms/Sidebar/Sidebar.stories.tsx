import type { Meta, StoryObj } from '@storybook/nextjs';
import { Ban, Layers3, LayoutDashboard, Users, Workflow } from 'lucide-react';
import { type SectionGroup, Sidebar } from '.';

const SidebarFooter = ({ isCollapsed }: { isCollapsed?: boolean }) => (
  <div className="flex items-center gap-2 px-2 py-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
    <div className="w-8 h-8 bg-slate-300 rounded-[10px] shrink-0" />
    {!isCollapsed && (
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-950 truncate">Arman Maulana</p>
        <p className="text-xs text-slate-500 truncate">Administrator</p>
      </div>
    )}
  </div>
);

const DEFAULT_SECTION_GROUPS: SectionGroup[] = [
  {
    id: 'quick-access',
    label: 'Quick Access',
    sections: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
        href: '/dashboard',
      },
    ],
  },
  {
    id: 'menu',
    label: 'Menu',
    sections: [
      {
        id: 'user-management',
        label: 'User Management',
        icon: <Users className="w-4 h-4" />,
        items: [
          {
            id: 'role-permission',
            label: 'Role Permission',
            href: '/user-management/role-permission',
          },
          { id: 'user', label: 'User', href: '/user-management/user' },
        ],
      },
      {
        id: 'organization',
        label: 'Organization Management',
        icon: <Workflow className="w-4 h-4" />,
        items: [
          { id: 'group', label: 'Group', href: '/organization/group' },
          { id: 'company', label: 'Company', href: '/organization/company' },
          { id: 'office', label: 'Office', href: '/organization/office' },
          {
            id: 'warehouse',
            label: 'Warehouse',
            href: '/organization/warehouse',
          },
          {
            id: 'hierarchy',
            label: 'Hierarchy',
            href: '/organization/job-position',
          },
        ],
      },
      {
        id: 'master-data',
        label: 'Master Data',
        icon: <Layers3 className="w-4 h-4" />,
        items: [
          {
            id: 'project-type',
            label: 'Project Type',
            href: '/master-data/project-type',
          },
          {
            id: 'document',
            label: 'Document',
            href: '/master-data/document',
          },
          {
            id: 'department',
            label: 'Department',
            href: '/master-data/department',
          },
          {
            id: 'job-item-type',
            label: 'Job Item Type',
            href: '/master-data/job-item-type',
          },
          {
            id: 'cost-item-type',
            label: 'Cost Item Type',
            href: '/master-data/cost-item-type',
          },
          {
            id: 'payment-type',
            label: 'Payment Type',
            href: '/master-data/payment-type',
          },
          {
            id: 'uom',
            label: 'Unit of Meause (UoM)',
            href: '/master-data/uom',
          },
          {
            id: 'item-master',
            label: 'Item Master',
            href: '/master-data/item-master',
          },
          {
            id: 'skill-master',
            label: 'Skill Master',
            href: '/master-data/skill-master',
          },
          {
            id: 'notification-type',
            label: 'Notification Type',
            href: '/master-data/notification-type',
          },
        ],
      },
      {
        id: 'other',
        label: 'Other',
        icon: <Ban className="w-4 h-4" />,
        href: '/other',
        items: [],
      },
    ],
  },
];

const meta = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isCollapsed: { control: 'boolean' },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sectionGroups: DEFAULT_SECTION_GROUPS,
    footer: <SidebarFooter />,
    isCollapsed: false,
  },
  decorators: [
    (Story: any) => (
      <div className="flex bg-white h-screen">
        <Story />
        <div className="flex-1 bg-slate-50 p-8">
          <h1 className="text-2xl font-bold text-slate-900">Content Area</h1>
          <p className="text-slate-600 mt-2">Sidebar is displayed on the left</p>
        </div>
      </div>
    ),
  ],
};

export const Collapsed: Story = {
  args: {
    sectionGroups: DEFAULT_SECTION_GROUPS,
    footer: <SidebarFooter isCollapsed />,
    isCollapsed: true,
  },
  decorators: [
    (Story: any) => (
      <div className="flex bg-white h-screen">
        <Story />
        <div className="flex-1 bg-slate-50 p-8">
          <h1 className="text-2xl font-bold text-slate-900">Content Area</h1>
          <p className="text-slate-600 mt-2">Sidebar is collapsed to icon-only mode</p>
        </div>
      </div>
    ),
  ],
};

export const WithoutFooter: Story = {
  args: {
    sectionGroups: DEFAULT_SECTION_GROUPS,
    isCollapsed: false,
  },
  decorators: [
    (Story: any) => (
      <div className="flex bg-white h-screen">
        <Story />
        <div className="flex-1 bg-slate-50 p-8">
          <h1 className="text-2xl font-bold text-slate-900">Content Area</h1>
        </div>
      </div>
    ),
  ],
};
