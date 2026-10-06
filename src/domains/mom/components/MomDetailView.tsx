'use client';

import { useEffect, useMemo, useState } from 'react';
import { type TabItem, Tabs } from '@/shared/components/molecules/Tabs';
import { formatDate, formatTime } from '@/shared/utils/format';
import { CREATE_MOM_LABELS, DETAIL_MOM_LABELS, GENERAL_TODO_TAB_ID } from '../constants';
import type { MomDetail } from '../types';
import { TodoTreeView } from './TodoTreeView';

const fieldLabels = CREATE_MOM_LABELS.FIELDS;
const todoLabels = CREATE_MOM_LABELS.TODO;

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-950 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

export interface MomDetailViewProps {
  detail: MomDetail;
  companyName: string;
  projects: { id: string; name: string }[];
  participantNames: string[];
}

export function MomDetailView({
  detail,
  companyName,
  projects,
  participantNames,
}: MomDetailViewProps) {
  const projectTabs = useMemo(
    () => projects.filter((project) => detail.projectIds.includes(project.id)),
    [projects, detail.projectIds]
  );

  const tabs = useMemo(
    () => [{ id: GENERAL_TODO_TAB_ID, name: todoLabels.GENERAL_TAB }, ...projectTabs],
    [projectTabs]
  );

  const [activeTabId, setActiveTabId] = useState(tabs[0].id);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTabId)) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  const tabItems: TabItem[] = useMemo(
    () =>
      tabs.map((tab) => ({
        key: tab.id,
        label: tab.name,
        content: <TodoTreeView value={detail.todo[tab.id] ?? []} />,
      })),
    [tabs, detail.todo]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col gap-4">
        <DetailField label={fieldLabels.TITLE} value={detail.title} />
        <DetailField label={fieldLabels.COMPANY} value={companyName} />
        <DetailField
          label={DETAIL_MOM_LABELS.PROJECT_LABEL(projectTabs.length)}
          value={projectTabs.map((project) => project.name).join(', ')}
        />
        <DetailField label={fieldLabels.LOCATION} value={detail.location} />
        <DetailField
          label={DETAIL_MOM_LABELS.PARTICIPANTS_LABEL(participantNames.length)}
          value={participantNames.join(', ')}
        />

        <div className="grid grid-cols-4 gap-4">
          <DetailField label={fieldLabels.START_DATE} value={formatDate(detail.startAt)} />
          <DetailField label={fieldLabels.START_TIME} value={formatTime(detail.startAt)} />
          <DetailField label={fieldLabels.END_DATE} value={formatDate(detail.endAt)} />
          <DetailField label={fieldLabels.END_TIME} value={formatTime(detail.endAt)} />
        </div>

        <DetailField label={fieldLabels.TOPIC} value={detail.topic} />
        <DetailField label={fieldLabels.DECISION} value={detail.decision} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-6 pt-6">
          <h2 className="text-sm font-medium text-slate-950">{todoLabels.LABEL}</h2>
        </div>
        <Tabs items={tabItems} activeKey={activeTabId} onChange={setActiveTabId} />
      </div>
    </div>
  );
}
