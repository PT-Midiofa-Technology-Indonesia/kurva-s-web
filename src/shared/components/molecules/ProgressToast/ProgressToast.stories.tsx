import type { Meta, StoryObj } from '@storybook/nextjs';
import { ProgressToast } from './ProgressToast';

const meta = {
  title: 'Molecules/ProgressToast',
  component: ProgressToast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressToast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = {
  args: {
    label: 'Menyiapkan berkas',
    percent: 10,
  },
};

export const InProgress: Story = {
  args: {
    label: 'Mengunggah dokumen',
    percent: 55,
  },
};

export const Completed: Story = {
  args: {
    label: 'Sinkronisasi selesai',
    percent: 100,
  },
};
