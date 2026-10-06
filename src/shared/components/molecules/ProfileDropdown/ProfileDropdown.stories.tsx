import type { Meta, StoryObj } from '@storybook/nextjs';
import { Bell, HelpCircle, LogOut, Settings, User } from 'lucide-react';
import { Dropdown, DropdownItem, ProfileDropdown } from './ProfileDropdown';

const meta = {
  title: 'Molecules/ProfileDropdown',
  component: ProfileDropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProfileDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems: DropdownItem[] = [
  {
    label: 'Akun Saya',
    icon: <User className="w-5 h-5" />,
    onClick: () => console.log('Account clicked'),
  },
  {
    label: 'Pengaturan',
    icon: <Settings className="w-5 h-5" />,
    onClick: () => console.log('Settings clicked'),
  },
];

const logoutItem: DropdownItem[] = [
  {
    label: 'Akun Saya',
    icon: <User className="w-5 h-5" />,
    onClick: () => console.log('Account clicked'),
  },
  {
    label: 'Pengaturan',
    icon: <Settings className="w-5 h-5" />,
    onClick: () => console.log('Settings clicked'),
  },
  {
    label: 'Keluar',
    icon: <LogOut className="w-5 h-5" />,
    variant: 'destructive',
    onClick: () => console.log('Logout clicked'),
  },
];

export const Default: Story = {
  args: {
    name: 'John Doe',
    role: 'Admin',
    items: [
      {
        label: 'Profile',
        icon: <User className="w-5 h-5" />,
        onClick: () => {},
      },
    ],
  },
};

export const WithAvatar: Story = {
  args: {
    name: 'John Doe',
    role: 'Admin',
    items: [
      {
        label: 'Profile',
        icon: <User className="w-5 h-5" />,
        onClick: () => {},
      },
    ],
  },
};

export const MultipleItems: Story = {
  args: {
    name: 'John Doe',
    role: 'Admin',
    items: [
      {
        label: 'Profile',
        icon: <User className="w-5 h-5" />,
        onClick: () => {},
      },
      {
        label: 'Settings',
        icon: <Settings className="w-5 h-5" />,
        onClick: () => {},
      },
      {
        label: 'Logout',
        icon: <LogOut className="w-5 h-5" />,
        variant: 'destructive',
        onClick: () => {},
      },
    ],
  },
};

export const WithLogout: Story = {
  args: {
    name: 'Arman Maulana',
    role: 'Administrator',
    items: logoutItem,
  },
};

export const WithCustomAvatar: Story = {
  args: {
    name: 'Arman Maulana',
    role: 'Administrator',
    avatar: (
      // biome-ignore lint/performance/noImgElement: storybook avatar mock
      <img
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces"
        alt="Avatar"
        className="w-full h-full object-cover"
      />
    ),
    items: defaultItems,
  },
};

export const DifferentRoles: Story = {
  args: {
    name: 'User',
    role: 'Role',
    items: defaultItems,
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Profile Dropdown Variants</h3>
      <div className="flex flex-col gap-4">
        <ProfileDropdown name="Arman Maulana" items={logoutItem} />
        <ProfileDropdown name="Sarah Smith" items={defaultItems} />
        <ProfileDropdown name="John Doe" items={defaultItems} />
      </div>
    </div>
  ),
};

export const SimpleDropdown: Story = {
  args: {
    name: 'Test',
    role: 'Test',
    items: [],
  },
  render: () => {
    const notificationItems: DropdownItem[] = [
      {
        label: 'Notifications',
        icon: <Bell className="w-4 h-4" />,
        onClick: () => console.log('Notifications'),
      },
      {
        label: 'Help',
        icon: <HelpCircle className="w-4 h-4" />,
        onClick: () => console.log('Help'),
      },
      {
        label: 'Settings',
        icon: <Settings className="w-4 h-4" />,
        onClick: () => console.log('Settings'),
      },
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Simple Dropdown</h3>
        <Dropdown
          trigger={
            <button type="button" className="px-4 py-2 bg-primary text-white rounded-md">
              Open Menu
            </button>
          }
          items={notificationItems}
        />
      </div>
    );
  },
};

export const AllMenuItems: Story = {
  args: {
    name: 'Arman Maulana',
    role: 'Administrator',
    items: logoutItem,
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Full Profile Dropdown</h3>
      <ProfileDropdown
        name="Arman Maulana"
        items={[
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
            variant: 'destructive',
            onClick: () => {},
          },
        ]}
      />
    </div>
  ),
};

export const WithDisabledItems: Story = {
  args: {
    name: 'Arman Maulana',
    role: 'Administrator',
    items: [
      { label: 'Akun Saya', icon: <User className="w-5 h-5" /> },
      {
        label: 'Pengaturan',
        icon: <Settings className="w-5 h-5" />,
        disabled: true,
      },
      {
        label: 'Keluar',
        icon: <LogOut className="w-5 h-5" />,
        variant: 'destructive',
      },
    ],
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">With Disabled Items</h3>
      <ProfileDropdown
        name="Arman Maulana"
        items={[
          {
            label: 'Akun Saya',
            icon: <User className="w-5 h-5" />,
          },
          {
            label: 'Pengaturan',
            icon: <Settings className="w-5 h-5" />,
            disabled: true,
          },
          {
            label: 'Keluar',
            icon: <LogOut className="w-5 h-5" />,
            variant: 'destructive',
          },
        ]}
      />
    </div>
  ),
};
