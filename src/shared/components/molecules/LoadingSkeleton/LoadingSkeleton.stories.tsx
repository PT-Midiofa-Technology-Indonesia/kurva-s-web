import type { Meta, StoryObj } from '@storybook/nextjs';
import { LoadingSkeleton } from './LoadingSkeleton';

const meta: Meta<typeof LoadingSkeleton> = {
  title: 'Molecules/LoadingSkeleton',
  component: LoadingSkeleton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['line', 'paragraph', 'card', 'table-row', 'circle'],
    },
    count: {
      control: 'number',
    },
    width: {
      control: 'text',
    },
    height: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSkeleton>;

export const Line: Story = {
  args: {
    variant: 'line',
    width: '100%',
  },
};

export const LineWithCustomSize: Story = {
  args: {
    variant: 'line',
    width: '80%',
    height: 24,
  },
};

export const Paragraph: Story = {
  args: {
    variant: 'paragraph',
    count: 3,
  },
};

export const ParagraphFiveLines: Story = {
  args: {
    variant: 'paragraph',
    count: 5,
  },
};

export const Card: Story = {
  args: {
    variant: 'card',
  },
};

export const TableRow: Story = {
  render: () => (
    <table className="w-full">
      <thead className="border-b">
        <tr>
          <th className="text-left py-3 px-4">ID</th>
          <th className="text-left py-3 px-4">Name</th>
          <th className="text-left py-3 px-4">Email</th>
          <th className="text-left py-3 px-4">Status</th>
          <th className="text-left py-3 px-4">Action</th>
        </tr>
      </thead>
      <tbody>
        <LoadingSkeleton variant="table-row" />
        <LoadingSkeleton variant="table-row" />
        <LoadingSkeleton variant="table-row" />
      </tbody>
    </table>
  ),
};

export const Circle: Story = {
  args: {
    variant: 'circle',
    width: 48,
    height: 48,
  },
};

export const CircleSmall: Story = {
  args: {
    variant: 'circle',
    width: 32,
    height: 32,
  },
};

export const CircleLarge: Story = {
  args: {
    variant: 'circle',
    width: 64,
    height: 64,
  },
};

export const LoadingList: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="flex items-center gap-3">
        <LoadingSkeleton variant="circle" width={40} height={40} />
        <div className="flex-1">
          <LoadingSkeleton variant="line" width="100%" height={16} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LoadingSkeleton variant="circle" width={40} height={40} />
        <div className="flex-1">
          <LoadingSkeleton variant="line" width="100%" height={16} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LoadingSkeleton variant="circle" width={40} height={40} />
        <div className="flex-1">
          <LoadingSkeleton variant="line" width="100%" height={16} />
        </div>
      </div>
    </div>
  ),
};

export const GridCards: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <LoadingSkeleton variant="card" />
      <LoadingSkeleton variant="card" />
      <LoadingSkeleton variant="card" />
    </div>
  ),
};
