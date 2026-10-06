'use client';

import { PlusIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/shared/components/atoms';
import { type TabItem, Tabs } from '@/shared/components/molecules/Tabs';
import { CREATE_MOM_LABELS, GENERAL_TODO_TAB_ID } from '../constants';
import type { CreateMomFormValues, MomTodoByTab, TodoNode } from '../types';
import { createEmptyTodoNode } from '../utils/todo-tree.utils';
import { TodoTreeTable } from './TodoTreeTable';

const labels = CREATE_MOM_LABELS.TODO;

export interface TodoSectionProps {
  projects: { id: string; name: string }[];
  companyId?: string;
}

export function TodoSection({ projects, companyId }: TodoSectionProps) {
  const { setValue } = useFormContext<CreateMomFormValues>();
  const projectIds =
    (useWatch<CreateMomFormValues>({ name: 'projectIds' }) as string[] | undefined) ?? [];
  const todo = (useWatch<CreateMomFormValues>({ name: 'todo' }) as MomTodoByTab | undefined) ?? {};

  const tabs = useMemo(
    () => [
      { id: GENERAL_TODO_TAB_ID, name: labels.GENERAL_TAB },
      ...projects.filter((project) => projectIds.includes(project.id)),
    ],
    [projects, projectIds]
  );

  const [activeTabId, setActiveTabId] = useState(tabs[0].id);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTabId)) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  const activeNodes = todo[activeTabId] ?? [];

  const handleTabNodesChange = (tabId: string, nodes: TodoNode[]) => {
    setValue('todo', { ...todo, [tabId]: nodes }, { shouldValidate: true, shouldDirty: true });
  };

  const handleAddRootRow = () => {
    handleTabNodesChange(activeTabId, [...activeNodes, createEmptyTodoNode()]);
  };

  const tabItems: TabItem[] = tabs.map((tab) => ({
    key: tab.id,
    label: tab.name,
    content: null,
  }));

  return (
    <div className="flex flex-col">
      <div className="border-t border-slate-200">
        <div className="py-2 border-b border-slate-200">
          <Tabs
            items={tabItems}
            activeKey={activeTabId}
            onChange={setActiveTabId}
            tabListClassName="px-0 border-none"
          />
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-950">
          {labels.LABEL}
          <span className="text-destructive">*</span>
        </span>
        <Button type="button" size="sm" leftIcon={<PlusIcon />} onClick={handleAddRootRow}>
          {labels.ADD_BUTTON}
        </Button>
      </div>

      <div className="mt-3">
        {tabs.map((tab) => (
          <div key={tab.id} hidden={tab.id !== activeTabId}>
            <TodoTreeTable
              value={todo[tab.id] ?? []}
              onChange={(nodes) => handleTabNodesChange(tab.id, nodes)}
              companyId={companyId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
