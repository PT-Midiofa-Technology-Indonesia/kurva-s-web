'use client';

import { Plus } from 'lucide-react';
import { AsyncSelect, Button } from '@/components/atoms';
import { KanbanBoard } from '@/shared/components/organisms/KanbanBoard';
import { ProspectDetailModal } from '../components/ProspectDetailModal';
import { ProspectFormDrawer } from '../components/ProspectFormDrawer';
import { PROSPECT_LABELS } from '../constants';
import { useProspectPage } from '../hooks/use-prospect-page';

export function ProspectPage() {
  const labels = PROSPECT_LABELS;

  const {
    companyId,
    selectedCompanyName,
    companyOptions,
    isLoadingCompanies,
    companiesHasMore,
    companiesLoadMore,
    handleCompanyChange,
    kanbanColumns,
    isLoading,
    isDrawerOpen,
    handleOpenDrawer,
    handleCloseDrawer,
    handleCardMove,
    selectedProjectId,
    handleCardClick,
    handleCloseModal,
  } = useProspectPage();

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-950">{labels.PAGE_TITLE}</h1>

        <div className="flex items-center gap-3">
          <AsyncSelect
            className="w-52"
            value={companyId ?? null}
            options={companyOptions}
            placeholder={labels.COMPANY_PLACEHOLDER}
            aria-label="Pilih Perusahaan"
            isSearchable={false}
            isClearable={false}
            isLoading={isLoadingCompanies}
            onChange={handleCompanyChange}
            onScrollToBottom={companiesHasMore ? () => companiesLoadMore() : undefined}
          />

          <Button onClick={handleOpenDrawer} disabled={!companyId} leftIcon={<Plus size={14} />}>
            {labels.ADD_BUTTON}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={kanbanColumns}
          isLoading={isLoading}
          onCardMove={handleCardMove}
          onCardClick={(item) => handleCardClick(item.id)}
          className="h-[83dvh]"
        />
      </div>

      {companyId && (
        <ProspectFormDrawer
          open={isDrawerOpen}
          onClose={handleCloseDrawer}
          companyId={companyId}
          companyLabel={selectedCompanyName}
        />
      )}

      <ProspectDetailModal
        projectId={selectedProjectId}
        companyId={companyId ?? null}
        open={!!selectedProjectId}
        onClose={handleCloseModal}
      />
    </div>
  );
}
