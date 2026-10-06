import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { ProjectPortalSelect } from './ProjectPortalSelect';

const meta = {
  title: 'Molecules/ProjectPortalSelect',
  component: ProjectPortalSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProjectPortalSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const projects = [
  { id: 'proj-1', name: 'Curva Residence' },
  { id: 'proj-2', name: 'Curva Office Tower' },
  { id: 'proj-3', name: 'Curva Central Park' },
];

function InteractiveStory(args: React.ComponentProps<typeof ProjectPortalSelect>) {
  const [value, setValue] = useState(args.value);

  return <ProjectPortalSelect {...args} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: (args) => <InteractiveStory {...args} />,
  args: {
    projects,
    value: 'proj-1',
    onChange: () => {},
  },
};

export const Placeholder: Story = {
  render: (args) => <InteractiveStory {...args} />,
  args: {
    projects,
    value: null,
    onChange: () => {},
  },
};

export const CustomWidth: Story = {
  render: (args) => <InteractiveStory {...args} />,
  args: {
    projects,
    value: 'proj-2',
    className: 'min-w-64',
    onChange: () => {},
  },
};
