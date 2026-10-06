import type { Meta } from '@storybook/nextjs';
import { Plus } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { KanbanCard } from '@/components/atoms/KanbanCard';
import { KanbanItem } from '../KanbanItem';
import { KanbanColumn } from './KanbanColumn';

const meta = {
  title: 'Molecules/KanbanColumn',
  component: KanbanColumn,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'text' },
    title: { control: 'text' },
    count: { control: 'number' },
    itemIds: { control: 'object' },
  },
} satisfies Meta<typeof KanbanColumn>;

export default meta;

export const Default = {
  args: {
    id: 'todo',
    title: 'To Do',
    count: 2,
    itemIds: ['item-1', 'item-2'],
    children: (
      <>
        <KanbanItem id="item-1">
          <KanbanCard title="Task 1" description="First task description" />
        </KanbanItem>
        <KanbanItem id="item-2">
          <KanbanCard title="Task 2" description="Second task description" />
        </KanbanItem>
      </>
    ),
  },
};

export const WithHeaderAction = {
  args: {
    id: 'in-progress',
    title: 'In Progress',
    count: 2,
    itemIds: ['item-3', 'item-4'],
    header: (
      <Button variant="ghost" size="xs" leftIcon={<Plus size={14} />}>
        Add
      </Button>
    ),
    children: (
      <>
        <KanbanItem id="item-3">
          <KanbanCard
            title="Active Task"
            description="Working on this"
            dateRange="01/07/2025 - 30/09/2025"
            company="PT Karya Mandiri"
            attachments={{ count: 1, total: 3 }}
          />
        </KanbanItem>
        <KanbanItem id="item-4">
          <KanbanCard title="Review Task" description="Needs review" />
        </KanbanItem>
      </>
    ),
  },
};

export const Empty = {
  args: {
    id: 'done',
    title: 'Done',
    count: 0,
    itemIds: [],
    children: <p className="p-4 text-center text-sm text-muted-foreground">No tasks</p>,
  },
};

export const ManyItems = {
  args: {
    id: 'backlog',
    title: 'Backlog',
    count: 10,
    itemIds: Array.from({ length: 10 }, (_, i) => `backlog-${i}`),
    children: (
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <KanbanItem key={i} id={`backlog-${i}`}>
            <KanbanCard
              title={`Backlog Item ${i + 1}`}
              description={`Description for item ${i + 1}`}
            />
          </KanbanItem>
        ))}
      </>
    ),
  },
};
