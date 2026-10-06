import type { Meta, StoryObj } from '@storybook/nextjs';
import { Eye, MoreVertical, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BOQProjectListItem } from '../types/boq-project-list.types';
import { BOQProjectList } from './BOQProjectList';

const SAMPLE_PROJECTS: BOQProjectListItem[] = [
  {
    id: '1',
    projectName: 'Pekerjaan Jembatan',
    projectOwner: 'Company 1',
    clientName: 'PT Client 1',
    estimatedValue: 5000000000,
    totalValue: 6000000000,
    projectStartDate: '2026-06-30T17:00:00.000000Z',
    projectEndDate: '2027-06-29T17:00:00.000000Z',
    description: 'Pembangunan jembatan',
    settingStatus: 'complete',
    statusBoqComplete: false,
    statusBoqPlanning: false,
    statusBoqFinal: false,
    statusBoqExecution: false,
  },
  {
    id: '2',
    projectName: 'Pekerjaan Bangunan Office',
    projectOwner: 'Company 1',
    clientName: 'PT Client 1',
    estimatedValue: 2500000000,
    totalValue: 3000000000,
    projectStartDate: '2026-06-30T17:00:00.000000Z',
    projectEndDate: '2027-06-29T17:00:00.000000Z',
    description: 'Pembangunan gedung kantor',
    settingStatus: 'incomplete',
    isClickable: true,
    statusBoqComplete: false,
    statusBoqPlanning: false,
    statusBoqFinal: false,
    statusBoqExecution: false,
  },
  {
    id: '3',
    projectName: 'Pekerjaan Jalan Layang',
    projectOwner: 'Company 1',
    clientName: 'PT Client 1',
    estimatedValue: 3000000000,
    totalValue: 3500000000,
    projectStartDate: '2026-06-30T17:00:00.000000Z',
    projectEndDate: '2027-06-29T17:00:00.000000Z',
    description: 'Pembangunan jalan layang',
    settingStatus: 'incomplete',
    statusBoqComplete: false,
    statusBoqPlanning: false,
    statusBoqFinal: false,
    statusBoqExecution: false,
  },
  {
    id: '4',
    projectName: 'Pekerjaan Bendungan',
    projectOwner: 'Company 1',
    clientName: 'PT Client 1',
    estimatedValue: 7000000000,
    totalValue: 8000000000,
    projectStartDate: '2026-06-30T17:00:00.000000Z',
    projectEndDate: '2027-06-29T17:00:00.000000Z',
    description: 'Pembangunan bendungan',
    settingStatus: 'complete',
    statusBoqComplete: false,
    statusBoqPlanning: false,
    statusBoqFinal: false,
    statusBoqExecution: false,
  },
  {
    id: '5',
    projectName: 'Pekerjaan Jalan Tol',
    projectOwner: 'Company 1',
    clientName: 'PT Client 1',
    estimatedValue: 4000000000,
    totalValue: 5000000000,
    projectStartDate: '2026-06-30T17:00:00.000000Z',
    projectEndDate: '2027-06-29T17:00:00.000000Z',
    description: 'Pembangunan jalan tol',
    settingStatus: 'complete',
    statusBoqComplete: false,
    statusBoqPlanning: false,
    statusBoqFinal: false,
    statusBoqExecution: false,
  },
];

const SETTING_OPTIONS = [
  { value: 'all', label: 'Semua Setting' },
  { value: 'complete', label: 'Complete' },
  { value: 'incomplete', label: 'Incomplete' },
];

const meta: Meta<typeof BOQProjectList> = {
  title: 'Templates/BOQ/BOQProjectList',
  component: BOQProjectList,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof BOQProjectList>;

export const Planning: Story = {
  args: {
    config: {
      settingColumnLabel: 'Setting BoQ',
      showFilter: true,
      filterPlaceholder: 'Semua Setting',
      filterOptions: SETTING_OPTIONS,
    },
    data: SAMPLE_PROJECTS,
    totalItems: 100,
    totalPages: 20,
    page: 3,
    renderAction: (_project: BOQProjectListItem) => (
      <div className="flex items-center gap-1 text-teal-600 cursor-pointer">
        <Settings size={16} />
        <span className="text-sm">BoQ</span>
      </div>
    ),
  },
};

export const Final: Story = {
  args: {
    config: {
      settingColumnLabel: 'Setting Limit Budget',
      showFilter: true,
      filterPlaceholder: 'Semua Setting',
      filterOptions: SETTING_OPTIONS,
    },
    data: SAMPLE_PROJECTS,
    totalItems: 100,
    totalPages: 20,
    page: 3,
    renderAction: (_project: BOQProjectListItem) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="p-1 rounded hover:bg-muted">
            <MoreVertical size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye size={14} />
            <span>View BoQ Final</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings size={14} />
            <span>Limit Budget</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
};

export const Execution: Story = {
  args: {
    config: {
      settingColumnLabel: 'Setting CCO',
      showFilter: false,
    },
    data: SAMPLE_PROJECTS,
    totalItems: 100,
    totalPages: 20,
    page: 3,
    renderAction: (_project: BOQProjectListItem) => (
      <div className="flex items-center gap-1 text-teal-600 cursor-pointer">
        <Settings size={16} />
        <span className="text-sm">CCO</span>
      </div>
    ),
  },
};

export const Loading: Story = {
  render: () => (
    <BOQProjectList
      config={{
        settingColumnLabel: 'Setting BoQ',
        showFilter: true,
        filterPlaceholder: 'Semua Setting',
        filterOptions: SETTING_OPTIONS,
      }}
      data={[]}
      isLoading
      renderAction={() => null}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <BOQProjectList
      config={{
        settingColumnLabel: 'Setting BoQ',
        showFilter: true,
        filterPlaceholder: 'Semua Setting',
        filterOptions: SETTING_OPTIONS,
      }}
      data={[]}
      totalItems={0}
      totalPages={0}
      renderAction={() => null}
    />
  ),
};
