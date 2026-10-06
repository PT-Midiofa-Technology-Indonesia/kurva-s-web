import type { Meta, StoryObj } from '@storybook/nextjs';
import { Calendar, Clock, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

const meta = {
  title: 'Atoms/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    options: { control: false },
    value: { control: false },
    onChange: { control: false },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultOptions = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export const Default: Story = {
  args: {
    options: defaultOptions,
    value: 'day',
    onChange: () => {},
  },
};

export const TwoOptions: Story = {
  args: {
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
    value: 'active',
    onChange: () => {},
  },
};

export const FourOptions: Story = {
  args: {
    options: [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
      { value: 'kanban', label: 'Kanban' },
      { value: 'timeline', label: 'Timeline' },
    ],
    value: 'grid',
    onChange: () => {},
  },
};

export const WithLeftIcons: Story = {
  args: {
    options: [
      { value: 'list', label: 'List', leftIcon: <List size={16} /> },
      { value: 'grid', label: 'Grid', leftIcon: <LayoutGrid size={16} /> },
      { value: 'calendar', label: 'Calendar', leftIcon: <Calendar size={16} /> },
      { value: 'timeline', label: 'Timeline', leftIcon: <Clock size={16} /> },
    ],
    value: 'grid',
    onChange: () => {},
  },
};

export const WithRightIcons: Story = {
  args: {
    options: [
      { value: 'day', label: 'Day', rightIcon: <Calendar size={14} /> },
      { value: 'week', label: 'Week', rightIcon: <Calendar size={14} /> },
      { value: 'month', label: 'Month', rightIcon: <Calendar size={14} /> },
    ],
    value: 'week',
    onChange: () => {},
  },
};

export const WithBothIcons: Story = {
  args: {
    options: [
      {
        value: 'list',
        label: 'List',
        leftIcon: <List size={16} />,
        rightIcon: <Calendar size={14} />,
      },
      {
        value: 'grid',
        label: 'Grid',
        leftIcon: <LayoutGrid size={16} />,
        rightIcon: <Calendar size={14} />,
      },
    ],
    value: 'list',
    onChange: () => {},
  },
};

export const Interactive: Story = {
  args: {
    options: defaultOptions,
    value: 'week',
    onChange: () => {},
  },
  render: ({ options, onChange }) => {
    const [value, setValue] = useState('week');
    return (
      <div className="flex flex-col gap-4 items-center">
        <SegmentedControl
          options={options}
          value={value}
          onChange={(v) => {
            setValue(v);
            onChange(v);
          }}
        />
        <p className="text-sm text-slate-500">Selected: {value}</p>
      </div>
    );
  },
};

export const WithIconsInteractive: Story = {
  args: {
    options: [
      { value: 'list', label: 'List', leftIcon: <List size={16} /> },
      { value: 'grid', label: 'Grid', leftIcon: <LayoutGrid size={16} /> },
      { value: 'calendar', label: 'Calendar', leftIcon: <Calendar size={16} /> },
    ],
    value: 'grid',
    onChange: () => {},
  },
  render: ({ options, onChange }) => {
    const [value, setValue] = useState('grid');
    return (
      <div className="flex flex-col gap-4 items-center">
        <SegmentedControl
          options={options}
          value={value}
          onChange={(v) => {
            setValue(v);
            onChange(v);
          }}
        />
        <p className="text-sm text-slate-500">Selected: {value}</p>
      </div>
    );
  },
};
