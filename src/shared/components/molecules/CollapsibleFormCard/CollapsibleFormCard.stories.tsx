import type { Meta, StoryObj } from '@storybook/nextjs';
import { CollapsibleFormCard } from './CollapsibleFormCard';

const meta: Meta<typeof CollapsibleFormCard> = {
  title: 'Molecules/CollapsibleFormCard',
  component: CollapsibleFormCard,
};
export default meta;

type Story = StoryObj<typeof CollapsibleFormCard>;

export const Open: Story = {
  args: {
    title: 'Purchase Order',
    defaultOpen: true,
    children: <div className="px-6 py-4 text-sm text-slate-500">Belum ada purchase order</div>,
  },
};

export const Closed: Story = {
  args: {
    title: 'Purchase Order',
    defaultOpen: false,
    children: <div className="px-6 py-4 text-sm text-slate-500">Belum ada purchase order</div>,
  },
};
