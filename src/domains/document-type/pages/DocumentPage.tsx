'use client';

import { SegmentedControl } from '@/shared/components/atoms';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import { DOCUMENT_TAB_LABELS, DOCUMENT_TYPE_TABS, type DocumentTab } from '../constants';
import { DocumentModuleListContent } from './DocumentModuleListContent';
import { DocumentTypeListPage } from './DocumentTypeListPage';

interface DocumentUrlParams extends BaseQueryParams {
  tab?: string;
}

const TAB_ORDER: DocumentTab[] = [
  DOCUMENT_TYPE_TABS.DOCUMENT_TYPE,
  DOCUMENT_TYPE_TABS.DOCUMENT_MODULE,
];

export function DocumentPage() {
  const { queryParams, updateQueryParam } = useQueryParams<DocumentUrlParams>();
  const activeTab = (queryParams.tab as DocumentTab) ?? DOCUMENT_TYPE_TABS.DOCUMENT_TYPE;

  const handleTabChange = (tab: DocumentTab) => {
    updateQueryParam('tab', tab === DOCUMENT_TYPE_TABS.DOCUMENT_TYPE ? undefined : tab);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center px-3 py-2 gap-4 border-b border-slate-200">
        <nav className="flex items-center gap-1">
          <SegmentedControl
            options={TAB_ORDER.map((tab) => ({
              value: tab,
              label: DOCUMENT_TAB_LABELS[tab],
            }))}
            value={activeTab}
            onChange={(value) => handleTabChange(value as DocumentTab)}
          />
        </nav>
      </div>

      {activeTab === DOCUMENT_TYPE_TABS.DOCUMENT_TYPE && <DocumentTypeListPage />}

      {activeTab === DOCUMENT_TYPE_TABS.DOCUMENT_MODULE && <DocumentModuleListContent />}
    </div>
  );
}
