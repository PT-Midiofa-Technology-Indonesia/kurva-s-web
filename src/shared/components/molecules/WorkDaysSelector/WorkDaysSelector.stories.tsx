import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { WorkDaysSelector } from './WorkDaysSelector';

const meta = {
  title: 'Molecules/WorkDaysSelector',
  component: WorkDaysSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WorkDaysSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveStory(args: React.ComponentProps<typeof WorkDaysSelector>) {
  const [value, setValue] = useState(args.value ?? []);

  return <WorkDaysSelector {...args} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: (args) => <InteractiveStory {...args} />,
  args: {
    label: 'Hari Kerja',
    value: ['senin', 'selasa', 'rabu', 'kamis', 'jumat'],
  },
};

export const WeekendIncluded: Story = {
  render: (args) => <InteractiveStory {...args} />,
  args: {
    label: 'Hari Operasional',
    value: ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'],
  },
};

export const Disabled: Story = {
  args: {
    label: 'Hari Kerja',
    value: ['senin', 'selasa', 'rabu'],
    disabled: true,
  },
};
