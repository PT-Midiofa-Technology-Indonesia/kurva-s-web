'use client';

import { useMemo } from 'react';
import { useProjectBOQ } from '@/domains/project-control';
import { InformasiProjectCard } from '@/domains/project-control/components/InformasiProjectCard';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import { ScheduleView } from '../components/ScheduleView';
import { SCHEDULE_INFORMATION_CARD_LABELS, SCHEDULE_PAGE_LABELS } from '../constants/schedule';
import { mapBOQItemsToScheduleTasks } from '../services/boq-to-schedule-tree';

export function SchedulePage() {
  const selectedProjectId = useSelectedProjectStore((s) => s.selectedProjectId);
  const { data: boqData } = useProjectBOQ(selectedProjectId);
  const project = boqData?.project;

  const tasks = useMemo(
    () => mapBOQItemsToScheduleTasks(boqData?.boq?.items ?? []),
    [boqData?.boq?.items]
  );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">{SCHEDULE_PAGE_LABELS.PAGE_TITLE}</h2>
      {project && (
        <InformasiProjectCard
          project={project}
          labels={SCHEDULE_INFORMATION_CARD_LABELS}
          hideEstimatedValue
        />
      )}
      <ScheduleView tasks={tasks} />
    </div>
  );
}
