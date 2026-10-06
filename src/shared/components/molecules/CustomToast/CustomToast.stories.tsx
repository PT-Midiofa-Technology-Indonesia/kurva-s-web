import type { Meta, StoryObj } from '@storybook/nextjs';
import { CustomToast } from './CustomToast';

const meta = {
  title: 'Molecules/CustomToast',
  component: CustomToast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onDismiss: { action: 'dismissed' },
  },
} satisfies Meta<typeof CustomToast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Upload berhasil',
    description: 'Dokumen telah tersimpan.',
  },
};

export const ErrorWithDismiss: Story = {
  args: {
    variant: 'error',
    title: 'Upload gagal',
    description: 'Periksa koneksi lalu coba lagi.',
    onDismiss: () => {},
  },
};

export const Progress: Story = {
  args: {
    variant: 'progress',
    title: 'Mengunggah dokumen',
    percent: 64,
  },
};

export const Loading: Story = {
  args: {
    variant: 'loading',
    title: 'Memproses pembayaran',
    description: 'Mohon tunggu sebentar.',
  },
};
