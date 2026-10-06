import type { Meta, StoryObj } from '@storybook/nextjs';
import { z } from 'zod';
import { AdvancedFilter } from './AdvancedFilter';

const filterSchema = z.object({
  vendor: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => (val instanceof Date ? val.toISOString() : val)),
  dateTo: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => (val instanceof Date ? val.toISOString() : val)),
});

type FilterFormData = {
  vendor?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

const meta = {
  title: 'Molecules/AdvancedFilter',
  component: AdvancedFilter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AdvancedFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Advanced Filter',
    schema: filterSchema,
    fields: [
      {
        name: 'vendor',
        label: 'Vendor',
        type: 'text',
        placeholder: 'Search vendor...',
        colSpan: 6,
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Pending', value: 'pending' },
        ],
        colSpan: 6,
      },
      {
        name: 'dateFrom',
        label: 'Date From',
        type: 'date',
        colSpan: 6,
      },
      {
        name: 'dateTo',
        label: 'Date To',
        type: 'date',
        colSpan: 6,
      },
    ],
    defaultValues: {
      vendor: undefined,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    },
    onApply: (data: FilterFormData) => {
      console.log('Applied filters:', data);
    },
    onReset: () => {
      console.log('Reset filters');
    },
  },
  render: (args: any) => (
    <div className="w-full max-w-4xl">
      <AdvancedFilter {...args} />
    </div>
  ),
};

export const MultipleRows: Story = {
  args: {
    title: 'Advanced Filter',
    schema: z.object({
      vendor: z.string().optional(),
      status: z.string().optional(),
      category: z.string().optional(),
      dateFrom: z
        .union([z.date(), z.string()])
        .optional()
        .transform((val) => (val instanceof Date ? val.toISOString() : val)),
      dateTo: z
        .union([z.date(), z.string()])
        .optional()
        .transform((val) => (val instanceof Date ? val.toISOString() : val)),
      tags: z.string().optional(),
    }),
    fields: [
      {
        name: 'vendor',
        label: 'Vendor',
        type: 'text',
        placeholder: 'Search vendor...',
        colSpan: 4,
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
        colSpan: 4,
      },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
        colSpan: 4,
      },
      {
        name: 'dateFrom',
        label: 'Date From',
        type: 'date',
        colSpan: 6,
      },
      {
        name: 'dateTo',
        label: 'Date To',
        type: 'date',
        colSpan: 6,
      },
    ],
    onApply: (data: any) => {
      console.log('Applied filters:', data);
    },
    onReset: () => {
      console.log('Reset filters');
    },
  },
  render: (args: any) => (
    <div className="w-full max-w-4xl">
      <AdvancedFilter {...args} />
    </div>
  ),
};

export const WithoutTitle: Story = {
  args: {
    title: undefined,
    schema: filterSchema,
    fields: [
      {
        name: 'vendor',
        label: 'Vendor',
        type: 'text',
        placeholder: 'Search vendor...',
        colSpan: 6,
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
        colSpan: 6,
      },
    ],
    onApply: (data: FilterFormData) => {
      console.log('Applied filters:', data);
    },
  },
  render: (args: any) => (
    <div className="w-full max-w-4xl">
      <AdvancedFilter {...args} />
    </div>
  ),
};

export const Loading: Story = {
  args: {
    title: 'Advanced Filter',
    schema: filterSchema,
    fields: [
      {
        name: 'vendor',
        label: 'Vendor',
        type: 'text',
        placeholder: 'Search vendor...',
        colSpan: 6,
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
        colSpan: 6,
      },
    ],
    onApply: (data: FilterFormData) => {
      console.log('Applied filters:', data);
    },
    isLoading: true,
  },
  render: (args: any) => (
    <div className="w-full max-w-4xl">
      <AdvancedFilter {...args} />
    </div>
  ),
};
