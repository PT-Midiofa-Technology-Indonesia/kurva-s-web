import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';

import { FileInput } from './FileInput';

const meta = {
  title: 'Molecules/FileInput',
  component: FileInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Basic Upload',
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="w-full max-w-2xl">
        <FileInput value={files} onChange={setFiles} />
      </div>
    );
  },
};

export const DocumentsOnly: Story = {
  name: 'Documents Only (PDF, DOC, DOCX)',
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="w-full max-w-2xl">
        <FileInput value={files} onChange={setFiles} accept=".pdf,.doc,.docx" />
      </div>
    );
  },
};

export const MaxThreeFiles: Story = {
  name: 'Maximum 3 Files',
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="w-full max-w-2xl">
        <FileInput value={files} onChange={setFiles} maxFiles={3} />
      </div>
    );
  },
};

export const SmallFileSize: Story = {
  name: 'Maximum 2MB Per File',
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="w-full max-w-2xl">
        <FileInput value={files} onChange={setFiles} maxSize={2 * 1024 * 1024} />
      </div>
    );
  },
};

export const DisabledState: Story = {
  name: 'Disabled',
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="w-full max-w-2xl">
        <FileInput value={files} onChange={setFiles} disabled />
      </div>
    );
  },
};

export const ErrorState: Story = {
  name: 'With Error Message',
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="w-full max-w-2xl">
        <FileInput
          value={files}
          onChange={setFiles}
          error="File size exceeds maximum limit of 5MB"
        />
      </div>
    );
  },
};
