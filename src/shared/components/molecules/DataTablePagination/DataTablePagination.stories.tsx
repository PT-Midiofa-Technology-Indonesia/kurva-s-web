import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { DataTablePagination } from './DataTablePagination';

type DemoProps = {
  totalItems?: number;
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
};

function DataTablePaginationDemo({
  totalItems = 50,
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions,
}: DemoProps) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="rounded-md border w-full max-w-3xl">
      <DataTablePagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        pageSizeOptions={pageSizeOptions}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}

const meta = {
  title: 'Molecules/DataTablePagination',
  component: DataTablePaginationDemo,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    totalItems: { control: { type: 'number', min: 1, max: 500 } },
    initialPageSize: { control: { type: 'select' }, options: [5, 10, 20, 50] },
    initialPage: { control: { type: 'number', min: 1 } },
    pageSizeOptions: { control: false },
  },
} satisfies Meta<typeof DataTablePaginationDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { totalItems: 50, initialPageSize: 10, initialPage: 1 },
};

export const MiddlePage: Story = {
  args: { totalItems: 50, initialPageSize: 10, initialPage: 3 },
};

export const LastPage: Story = {
  args: { totalItems: 50, initialPageSize: 10, initialPage: 5 },
};

export const CustomPageSizes: Story = {
  args: { totalItems: 100, initialPageSize: 5, initialPage: 1 },
  render: (args) => <DataTablePaginationDemo {...args} pageSizeOptions={[5, 15, 25, 50, 100]} />,
};

export const SinglePage: Story = {
  args: { totalItems: 3, initialPageSize: 10, initialPage: 1 },
};
