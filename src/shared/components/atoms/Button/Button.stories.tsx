import type { Meta, StoryObj } from '@storybook/nextjs';
import { ArrowRight, Download, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    leftIcon: { control: false },
    rightIcon: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'md',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="default">Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="ghost-destructive">Ghost Destructive</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const WithLeftIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs" leftIcon={<Plus size={12} />}>
        Add
      </Button>
      <Button size="sm" leftIcon={<Plus size={14} />}>
        Add Item
      </Button>
      <Button size="md" leftIcon={<Download size={16} />}>
        Download
      </Button>
      <Button size="lg" leftIcon={<Plus size={16} />}>
        Add Item
      </Button>
    </div>
  ),
};

export const WithRightIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" rightIcon={<ArrowRight size={14} />}>
        Next
      </Button>
      <Button size="md" rightIcon={<ArrowRight size={16} />}>
        Continue
      </Button>
      <Button size="lg" variant="outline" rightIcon={<ArrowRight size={16} />}>
        Learn More
      </Button>
    </div>
  ),
};

export const DisabledStates: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="default" disabled>
        Default
      </Button>
      <Button variant="outline" disabled>
        Outline
      </Button>
      <Button variant="destructive" disabled>
        Destructive
      </Button>
      <Button variant="ghost" disabled>
        Ghost
      </Button>
      <Button variant="ghost-destructive" disabled>
        Ghost Destructive
      </Button>
    </div>
  ),
};

export const LoadingState: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" isLoading>
        Saving
      </Button>
      <Button size="md" isLoading>
        Loading
      </Button>
      <Button size="md" variant="outline" isLoading>
        Processing
      </Button>
      <Button size="md" variant="destructive" isLoading>
        Deleting
      </Button>
      <Button size="md" variant="ghost" isLoading>
        Loading
      </Button>
      <Button size="md" variant="ghost-destructive" isLoading>
        Loading
      </Button>
    </div>
  ),
};

export const DestructiveVariant: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="destructive" size="sm" leftIcon={<Trash2 size={14} />}>
        Delete
      </Button>
      <Button variant="destructive" size="md" leftIcon={<Trash2 size={16} />}>
        Delete Item
      </Button>
      <Button variant="destructive" size="lg" leftIcon={<Trash2 size={16} />}>
        Delete Account
      </Button>
      <Button variant="destructive" disabled leftIcon={<Trash2 size={16} />}>
        Delete
      </Button>
    </div>
  ),
};

export const AllSizesAllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          <Button variant="default" size={size}>
            Default {size}
          </Button>
          <Button variant="outline" size={size}>
            Outline {size}
          </Button>
          <Button variant="destructive" size={size}>
            Destructive {size}
          </Button>
        </div>
      ))}
    </div>
  ),
};
