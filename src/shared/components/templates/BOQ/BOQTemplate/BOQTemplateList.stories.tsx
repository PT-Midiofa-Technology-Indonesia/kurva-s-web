'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import type { BOQTemplateRow } from './BOQTemplateList';
import { BOQTemplateList } from './BOQTemplateList';

const SEED: BOQTemplateRow[] = [
  {
    id: '1',
    name: 'Pekerjaan Jembatan',
    projectCapability: 'Pekerjaan Jembatan',
    status: 'active',
  },
  {
    id: '2',
    name: 'Pekerjaan Bangunan Office',
    projectCapability: 'Pekerjaan Bangunan Office',
    status: 'inactive',
  },
  {
    id: '3',
    name: 'Pekerjaan Jalan Layang',
    projectCapability: 'Pekerjaan Jalan Layang',
    status: 'active',
  },
  {
    id: '4',
    name: 'Pekerjaan Bendungan',
    projectCapability: 'Pekerjaan Bendungan',
    status: 'active',
  },
];

const MOCK_CAPABILITY_OPTIONS = [
  { label: 'Pekerjaan Jembatan', value: 'pekerjaan-jembatan' },
  { label: 'Pekerjaan Bangunan Office', value: 'pekerjaan-bangunan-office' },
  { label: 'Pekerjaan Jalan Layang', value: 'pekerjaan-jalan-layang' },
  { label: 'Pekerjaan Bendungan', value: 'pekerjaan-bendungan' },
  { label: 'Pekerjaan Elektrikal', value: 'pekerjaan-elektrikal' },
  { label: 'Pekerjaan Mekanikal', value: 'pekerjaan-mekanikal' },
  { label: 'Pekerjaan Finishing', value: 'pekerjaan-finishing' },
  { label: 'Pekerjaan Civil', value: 'pekerjaan-civil' },
  { label: 'Pekerjaan Struktur', value: 'pekerjaan-struktur' },
  { label: 'Pekerjaan Arsitektur', value: 'pekerjaan-arsitektur' },
  { label: 'Pekerjaan Plumbing', value: 'pekerjaan-plumbing' },
  { label: 'Pekerjaan Fire Fighting', value: 'pekerjaan-fire-fighting' },
  { label: 'Pekerjaan HVAC', value: 'pekerjaan-hvac' },
  { label: 'Pekerjaan Landscaping', value: 'pekerjaan-landscaping' },
  { label: 'Pekerjaan Interior Design', value: 'pekerjaan-interior-design' },
];

function Harness({ initial }: { initial: BOQTemplateRow[] }) {
  const [value, setValue] = useState<BOQTemplateRow[]>(initial);

  return (
    <BOQTemplateList
      value={value}
      onChange={setValue}
      projectCapabilityOptions={MOCK_CAPABILITY_OPTIONS}
    />
  );
}

const meta: Meta<typeof BOQTemplateList> = {
  title: 'Templates/BOQ Template/BOQTemplateList',
  component: BOQTemplateList,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof BOQTemplateList>;

/** Default list with 4 rows, mixed statuses */
export const Default: Story = { render: () => <Harness initial={SEED} /> };

/** No rows */
export const Empty: Story = { render: () => <Harness initial={[]} /> };
