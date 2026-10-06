import type { Meta, StoryObj } from '@storybook/nextjs';
import { Breadcrumb } from './Breadcrumb';

const meta = {
  title: 'Atoms/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    separator: {
      control: 'select',
      options: ['chevron', 'slash'],
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Dashboard', href: '#' },
      { label: 'Settings', href: '#' },
      { label: 'Profile' },
    ],
  },
};

export const WithHome: Story = {
  args: {
    items: [
      { label: 'Home', href: '#', isHome: true },
      { label: 'Dashboard', href: '#' },
      { label: 'Settings', href: '#' },
      { label: 'Profile' },
    ],
  },
};

export const Simple: Story = {
  args: {
    items: [{ label: 'Home', href: '#' }, { label: 'Products' }],
  },
};

export const Deep: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Dashboard', href: '#' },
      { label: 'Reports', href: '#' },
      { label: 'Sales', href: '#' },
      { label: 'January 2024' },
    ],
  },
};

export const WithActive: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Projects', href: '#', isActive: true },
      { label: 'Project Alpha' },
    ],
  },
};

export const SlashSeparator: Story = {
  args: {
    items: [{ label: 'Home', href: '#' }, { label: 'Dashboard', href: '#' }, { label: 'Settings' }],
    separator: 'slash',
  },
};

export const CurrentPageOnly: Story = {
  args: {
    items: [{ label: 'Current Page' }],
  },
};
