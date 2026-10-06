import type { Meta, StoryObj } from '@storybook/nextjs';
import { LogOut, Settings, User } from 'lucide-react';
import { Navbar } from './Navbar';

const meta = {
  title: 'Organisms/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    notificationCount: { control: 'number' },
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const profileItems = [
  {
    label: 'Akun Saya',
    icon: <User className="w-5 h-5" />,
    onClick: () => {},
  },
  {
    label: 'Pengaturan',
    icon: <Settings className="w-5 h-5" />,
    onClick: () => {},
  },
  {
    label: 'Keluar',
    icon: <LogOut className="w-5 h-5" />,
    variant: 'destructive' as const,
    onClick: () => {},
  },
];

export const Default: Story = {
  args: {
    breadcrumbs: [
      { label: 'Dashboard', href: '#' },
      { label: 'Settings', href: '#' },
      { label: 'Profile' },
    ],
    profileName: 'Arman Maulana',
    profileRole: 'Administrator',
    profileItems,
  },
};

export const WithNotifications: Story = {
  args: {
    breadcrumbs: [{ label: 'Dashboard', href: '#' }, { label: 'Settings' }],
    profileName: 'Arman Maulana',
    profileRole: 'Administrator',
    profileItems,
    notificationCount: 5,
  },
};

export const WithoutBreadcrumbs: Story = {
  args: {
    profileName: 'Arman Maulana',
    profileRole: 'Administrator',
    profileItems,
  },
};

export const FullNavbar: Story = {
  args: {
    breadcrumbs: [
      { label: 'Home', href: '#' },
      { label: 'Dashboard', href: '#' },
      { label: 'Settings', href: '#' },
      { label: 'Profile' },
    ],
    profileName: 'Arman Maulana',
    profileRole: 'Administrator',
    profileItems,
    notificationCount: 3,
  },
};

export const Empty: Story = {
  args: {},
};
