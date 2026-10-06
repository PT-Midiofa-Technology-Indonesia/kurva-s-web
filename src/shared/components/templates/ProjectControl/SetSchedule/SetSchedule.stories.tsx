import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { SetSchedule } from './SetSchedule';
import type { ScheduleNode } from './types';

function scheduleNode(
  patch: Partial<ScheduleNode> & Pick<ScheduleNode, 'id' | 'taskName'>
): ScheduleNode {
  return {
    startDate: '2026-06-01',
    endDate: '2026-06-01',
    days: 1,
    bobot: null,
    percent: 0,
    children: [],
    ...patch,
  };
}

const seedData: ScheduleNode[] = [
  scheduleNode({
    id: 'a',
    taskName: 'Pekerjaan Bangunan Office',
    startDate: '2026-06-01',
    endDate: '2026-08-30',
    days: 167,
    bobot: 3,
    percent: 0,
    children: [
      scheduleNode({
        id: 'a1',
        taskName: 'Pekerjaan Civil',
        startDate: '2026-06-01',
        endDate: '2026-06-02',
        days: 30,
        bobot: 2,
        percent: 0,
        children: [
          scheduleNode({
            id: 'a11',
            taskName: 'Area Lobby',
            startDate: '2026-06-01',
            endDate: '2026-06-02',
            days: 6,
            bobot: 2,
            percent: 25,
            children: [
              scheduleNode({
                id: 'a111',
                taskName: 'Pengerjaan Dinding',
                startDate: '2026-06-03',
                endDate: '2026-07-01',
                days: 6,
                bobot: 1,
                percent: 0,
                children: [
                  scheduleNode({
                    id: 'a1111',
                    taskName: 'Penataan Bata Dinding',
                    startDate: '2026-07-03',
                    endDate: '2026-07-04',
                    days: 16,
                    bobot: 1,
                    percent: 0,
                  }),
                  scheduleNode({
                    id: 'a1112',
                    taskName: 'Pemasangan Granit',
                    startDate: '2026-07-03',
                    endDate: '2026-07-04',
                    days: 31,
                    bobot: 1,
                    percent: 0,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
];

const meta = {
  title: 'Templates/ProjectControl/SetSchedule',
  component: SetSchedule,
  parameters: { layout: 'padded' },
  args: {
    value: seedData,
    onChange: () => {},
  },
} satisfies Meta<typeof SetSchedule>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledDemo({ initial, readOnly }: { initial: ScheduleNode[]; readOnly?: boolean }) {
  const [value, setValue] = useState(initial);
  return <SetSchedule value={value} onChange={setValue} readOnly={readOnly} />;
}

export const Default: Story = {
  render: () => <ControlledDemo initial={seedData} />,
};

export const ReadOnly: Story = {
  render: () => <ControlledDemo initial={seedData} readOnly />,
};

export const Empty: Story = {
  render: () => <ControlledDemo initial={[]} />,
};
