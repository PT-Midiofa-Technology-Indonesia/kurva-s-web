import type { Meta, StoryObj } from '@storybook/nextjs';
import { Ban, Layers3, LayoutDashboard, Users, Workflow } from 'lucide-react';
import { DashboardLayout } from '.';

const DashboardFooter = () => (
  <div className="flex items-center gap-2 px-2 py-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
    <div className="w-8 h-8 bg-slate-300 rounded-[10px] flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-950 truncate">Arman Maulana</p>
      <p className="text-xs text-slate-500 truncate">Administrator</p>
    </div>
  </div>
);

const DEFAULT_SECTION_GROUPS = [
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
          { id: 'department', label: 'Department', href: '/master-data/department' },
          { id: 'office', label: 'Office', href: '/organization/office' },
          { id: 'warehouse', label: 'Warehouse', href: '/organization/warehouse' },
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
          { id: 'project-type', label: 'Project Type', href: '/master-data/project-type' },
          { id: 'document', label: 'Document', href: '/master-data/document' },
          { id: 'job-item-type', label: 'Job Item Type', href: '/master-data/job-item-type' },
          { id: 'cost-item-type', label: 'Cost Item Type', href: '/master-data/cost-item-type' },
          { id: 'payment-type', label: 'Payment Type', href: '/master-data/payment-type' },
          { id: 'uom', label: 'Unit of Meause (UoM)', href: '/master-data/uom' },
          { id: 'item-master', label: 'Item Master', href: '/master-data/item-master' },
          { id: 'skill-master', label: 'Skill Master', href: '/master-data/skill-master' },
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
  title: 'Templates/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  sidebarSectionGroups: DEFAULT_SECTION_GROUPS,
  sidebarFooter: <DashboardFooter />,
  navbarProps: {
    profileName: 'Arman Maulana',
    profileRole: 'Administrator',
    profileItems: [
      {
        label: 'Akun Saya',
        onClick: () => console.log('Account clicked'),
      },
      {
        label: 'Pengaturan',
        onClick: () => console.log('Settings clicked'),
      },
      {
        label: 'Keluar',
        variant: 'destructive' as const,
        onClick: () => console.log('Logout clicked'),
      },
    ],
    notificationCount: 1,
  },
};

export const Default: Story = {
  args: {
    ...defaultArgs,
    children: (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-950 mb-4">Dashboard</h1>
        <p className="text-slate-600">
          Welcome to your dashboard. The sidebar and navbar are now integrated together.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-slate-900">Card {i}</h3>
              <p className="text-sm text-slate-600 mt-2">Sample content for demonstration</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const EmptyContent: Story = {
  args: {
    sidebarSectionGroups: DEFAULT_SECTION_GROUPS,
    sidebarFooter: <DashboardFooter />,
    navbarProps: {
      profileName: 'Arman Maulana',
      profileRole: 'Administrator',
    },
    children: (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-950">Welcome</h1>
        <p className="text-slate-600 mt-4">
          This is your dashboard layout with sidebar and navbar combined.
        </p>
      </div>
    ),
  },
};

export const WithLongContent: Story = {
  args: {
    ...defaultArgs,
    children: (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-950 mb-4">Dashboard</h1>
        <p className="text-slate-600 mb-8">
          This content area has scrollable content to demonstrate how the layout handles overflow.
        </p>
        {[...Array(20)].map((_, i) => (
          <div key={i} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-semibold text-slate-900">Item {i + 1}</h3>
            <p className="text-sm text-slate-600 mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        ))}
      </div>
    ),
  },
};
