import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Switch } from './Switch';

const meta = {
  title: 'Atoms/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default'],
    },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Switch',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch size="sm" label="Small" />
      <Switch size="default" label="Default" />
    </div>
  ),
};

export const WithLabelLeft: Story = {
  args: {
    label: 'Switch',
    labelPosition: 'left',
  },
};

export const WithoutLabel: Story = {
  args: {
    showLabel: false,
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch disabled label="Disabled off" />
      <Switch disabled defaultChecked label="Disabled on" />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <Switch checked={checked} onCheckedChange={setChecked} label="Interactive Switch" />
        <p className="text-sm text-slate-500">Value: {checked ? 'On' : 'Off'}</p>
      </div>
    );
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Small</p>
        <div className="flex flex-wrap items-center gap-4">
          <Switch size="sm" label="Small off" />
          <Switch size="sm" defaultChecked label="Small on" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Default</p>
        <div className="flex flex-wrap items-center gap-4">
          <Switch size="default" label="Default off" />
          <Switch size="default" defaultChecked label="Default on" />
        </div>
      </div>
    </div>
  ),
};
