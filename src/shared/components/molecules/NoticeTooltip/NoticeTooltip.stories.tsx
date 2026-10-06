import type { Meta, StoryObj } from '@storybook/nextjs';
import { AlertTriangle } from 'lucide-react';
import { NoticeTooltip } from './NoticeTooltip';

const meta: Meta<typeof NoticeTooltip> = {
  title: 'Molecules/NoticeTooltip',
  component: NoticeTooltip,
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'Segera Lakukan pembayaran',
    description:
      'Pembayaran ini telah jatuh tempo. Segera lakukan pembayaran atau ubah tanggal jatuh tempo melalui menu Edit Due Date.',
    children: (
      <span className="inline-flex items-center gap-1 text-sm text-red-500">
        <AlertTriangle className="h-4 w-4" />
        17 Jul 2026
      </span>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof NoticeTooltip>;

export const Default: Story = {};
