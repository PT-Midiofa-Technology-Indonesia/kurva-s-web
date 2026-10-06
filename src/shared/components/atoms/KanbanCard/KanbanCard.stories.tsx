import type { Meta, StoryObj } from '@storybook/nextjs';
import { KanbanCard } from './KanbanCard';

const meta = {
  title: 'Atoms/KanbanCard',
  component: KanbanCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    dateRange: { control: 'text' },
    company: { control: 'text' },
  },
} satisfies Meta<typeof KanbanCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Judul Prospect Pembangunan Jembatan',
    description: 'Deskripsi singkat atau keterangan dari prospect ini',
    dateRange: '20/06/2025 - 20/12/2025',
    company: 'CV Pembangunan Indonesia',
    attachments: { count: 2, total: 3 },
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Prospect tanpa detail tambahan',
  },
};

export const WithTags: Story = {
  args: {
    title: 'Proyek Renovasi Gedung Kantor',
    description: 'Renovasi total lantai 3 dan 4 gedung utama',
    dateRange: '01/07/2025 - 30/09/2025',
    company: 'PT Karya Mandiri',
  },
};

export const WithAttachments: Story = {
  args: {
    title: 'Pembangunan Gudang Logistik',
    description: 'Gudang kapasitas 5000 ton di kawasan industri',
    dateRange: '10/08/2025 - 10/02/2026',
    company: 'PT Logistik Sejahtera',
    attachments: { count: 4, total: 4 },
  },
};
