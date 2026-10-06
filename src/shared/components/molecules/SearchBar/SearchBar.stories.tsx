import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { SearchBar } from './SearchBar';

const meta = {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    width: { control: 'text' },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Type here',
    width: '288px',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Type here',
    defaultValue: 'Search query',
    width: '288px',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Type here',
    disabled: true,
    width: '288px',
  },
};

export const WithClear: Story = {
  args: {
    placeholder: 'Type here',
    showClear: true,
    width: '288px',
    value: 'Sample text',
  },
};

export const Interactive: Story = {
  args: {},
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="space-y-4">
        <SearchBar
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onClear={() => setValue('')}
          showClear
          placeholder="Search..."
          width="288px"
        />
        <p className="text-sm text-slate-500">Value: {value}</p>
      </div>
    );
  },
};

export const Sizes: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col gap-4">
      <SearchBar placeholder="Small" width="200px" />
      <SearchBar placeholder="Default (288px)" width="288px" />
      <SearchBar placeholder="Large" width="400px" />
    </div>
  ),
};
