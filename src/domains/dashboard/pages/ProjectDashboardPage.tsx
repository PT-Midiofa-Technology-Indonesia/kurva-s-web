'use client';

import { useState } from 'react';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import { DashboardHero } from '../components/DashboardHero';
import { ProjectCostBudgetSection } from '../components/ProjectCostBudgetSection';
import { ProjectKpiSection } from '../components/ProjectKpiSection';
import { ProjectProgressCardSection } from '../components/ProjectProgressCardSection';
import { SCurveProjectSection } from '../components/SCurveProjectSection';
import type { SCurvePeriodMode } from '../types';

interface ProjectDashboardPageProps {
  role: string;
  userName: string;
}

export function ProjectDashboardPage({ role, userName }: ProjectDashboardPageProps) {
  const selectedProjectId = useSelectedProjectStore((s) => s.selectedProjectId);
  const [intervalMode, setIntervalMode] = useState<SCurvePeriodMode>('monthly');

  return (
    <div className="space-y-6 p-6">
      <DashboardHero role={role} userName={userName} />
      <ProjectProgressCardSection
        interval={intervalMode}
        projectId={selectedProjectId ?? undefined}
      />
      <SCurveProjectSection
        interval={intervalMode}
        onIntervalChange={setIntervalMode}
        projectId={selectedProjectId ?? undefined}
      />
      <ProjectCostBudgetSection
        interval={intervalMode}
        projectId={selectedProjectId ?? undefined}
      />
      <ProjectKpiSection interval={intervalMode} projectId={selectedProjectId ?? undefined} />
    </div>
  );
}
