import type { Meta, StoryObj } from '@storybook/nextjs';
import { FileAttachmentList } from './FileAttachmentList';

const meta = {
  title: 'Molecules/FileAttachmentList',
  component: FileAttachmentList,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    emptyMessage: 'No attachments.',
    downloadLabel: (fileName: string) => `Download ${fileName}`,
    groups: [
      {
        label: 'Tax Invoice',
        files: [{ id: '1', fileName: 'tax-invoice.pdf', fileSize: 91648, url: '#' }],
      },
      {
        label: 'Supporting Documents',
        files: [
          { id: '2', fileName: 'supporting-document.pdf', fileSize: 182272, url: '#' },
          { id: '3', fileName: 'invoice.pdf', fileSize: 73320, url: '#' },
        ],
      },
    ],
  },
} satisfies Meta<typeof FileAttachmentList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };

export const Empty: Story = {
  args: {
    groups: [],
    emptyMessage: 'No attachments.',
    downloadLabel: (fileName: string) => `Download ${fileName}`,
  },
};
