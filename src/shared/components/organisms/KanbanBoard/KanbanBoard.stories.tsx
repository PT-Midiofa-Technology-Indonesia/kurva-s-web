import type { Meta, StoryObj } from '@storybook/nextjs';

import { KanbanBoard, type KanbanColumnConfig } from './KanbanBoard';

const defaultColumns: KanbanColumnConfig[] = [
  {
    id: 'identify',
    name: 'Prospect Identify',
    action: 'Tambah',
    onActionClick: () => console.log('Add to identify'),
    items: [
      {
        id: 'prospect-1',
        title: 'Judul Prospect Pembangunan Jembatan',
        description: 'Deskripsi singkat atau keterangan dari prospect ini',
        dateRange: '20/06/2025 - 20/12/2025',
        company: 'CV Pembangunan Indonesia',
        attachments: { count: 2, total: 3 },
      },
      {
        id: 'prospect-2',
        title: 'Judul Prospect Pembangunan Bendungan',
        description: 'Deskripsi singkat atau keterangan dari prospect ini',
        dateRange: '20/06/2025 - 20/12/2025',
        company: 'CV Pembangunan Indonesia',
        attachments: { count: 2, total: 3 },
      },
      {
        id: 'prospect-3',
        title: 'Judul Prospect Pembangunan Rumah',
        description: 'Deskripsi singkat atau keterangan dari prospect ini',
        dateRange: '20/06/2025 - 20/12/2025',
        company: 'CV Pembangunan Indonesia',
        attachments: { count: 2, total: 3 },
      },
    ],
  },
  {
    id: 'qualification',
    name: 'Qualification',
    items: [
      {
        id: 'prospect-4',
        title: 'Prospect Renovasi Gedung Kantor',
        description: 'Renovasi total lantai 3 dan 4 gedung utama',
        dateRange: '01/07/2025 - 30/09/2025',
        company: 'PT Karya Mandiri',
        attachments: { count: 1, total: 5 },
      },
      {
        id: 'prospect-5',
        title: 'Proyek Jalan Tol Serpong–Balaraja',
        description: 'Pengerjaan akses jalan tol seksi 2',
        dateRange: '15/07/2025 - 15/01/2026',
        company: 'PT Infrastruktur Nusantara',
        attachments: { count: 3, total: 4 },
      },
    ],
  },
  {
    id: 'proposal',
    name: 'Proposal',
    items: [
      {
        id: 'prospect-6',
        title: 'Pembangunan Gudang Logistik',
        description: 'Gudang kapasitas 5000 ton di kawasan industri',
        dateRange: '10/08/2025 - 10/02/2026',
        company: 'PT Logistik Sejahtera',
        attachments: { count: 4, total: 4 },
      },
    ],
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    items: [],
  },
];

const meta: Meta<typeof KanbanBoard> = {
  title: 'Organisms/KanbanBoard',
  component: KanbanBoard,
  parameters: { layout: 'fullscreen' },
  args: {
    columns: defaultColumns,
  },
  decorators: [
    (Story) => (
      <div className="p-6 h-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

export const Default: Story = {};

export const WithCardClick: Story = {
  args: {
    onCardClick: (item, columnId) => alert(`Clicked: ${item.title} (column: ${columnId})`),
  },
};

export const NoActions: Story = {
  args: {
    columns: defaultColumns.map(({ action: _, onActionClick: __, ...col }) => col),
  },
};

export const SingleColumn: Story = {
  args: {
    columns: [
      {
        id: 'identify',
        name: 'Prospect Identify',
        action: 'Tambah',
        items: [
          {
            id: 'r1',
            title: 'Judul Prospect Pembangunan Jembatan',
            description: 'Deskripsi singkat atau keterangan dari prospect ini',
            dateRange: '20/06/2025 - 20/12/2025',
            company: 'CV Pembangunan Indonesia',
            attachments: { count: 2, total: 3 },
          },
          {
            id: 'r2',
            title: 'Judul Prospect Pembangunan Bendungan',
            description: 'Deskripsi singkat atau keterangan dari prospect ini',
            dateRange: '20/06/2025 - 20/12/2025',
            company: 'CV Pembangunan Indonesia',
            attachments: { count: 1, total: 3 },
          },
        ],
      },
    ],
  },
};
