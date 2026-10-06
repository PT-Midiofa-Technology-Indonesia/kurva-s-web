'use client';

import { Button, Table } from '@/shared/components/atoms';
import { Badge } from '@/shared/components/ui/badge';
import { ProspectDocumentSettingDrawer } from '../components/ProspectDocumentSettingDrawer';
import { PROSPECT_DOCUMENT_LABELS } from '../constants';
import { useProspectDocumentPage } from '../hooks/use-prospect-document-page';
import { useProspectStageDocuments } from '../hooks/use-prospect-stage-documents';

export function ProspectDocumentPage() {
  const labels = PROSPECT_DOCUMENT_LABELS;
  const { data: stages, isLoading } = useProspectStageDocuments();
  const { selectedStage, isDrawerOpen, handleOpenSetting, handleCloseDrawer } =
    useProspectDocumentPage();

  const columns = [
    { header: labels.TABLE.STAGE, className: 'w-[260px]' },
    { header: labels.TABLE.DOCUMENT_TYPE },
    { header: labels.TABLE.ACTION, className: 'text-right w-[120px]' },
  ];

  const tableData =
    stages?.map((row) => [
      <span key="stage" className="text-sm text-slate-700">
        {row.stageName}
      </span>,
      row.documentRequirements.length > 0 ? (
        <div key="docs" className="flex flex-wrap gap-1.5">
          {row.documentRequirements.map((req) => (
            <Badge key={req.id} variant="secondary">
              {req.documentType?.code ?? 'N/A'}
            </Badge>
          ))}
        </div>
      ) : (
        <span key="empty" className="text-sm text-slate-400">
          {labels.TABLE.EMPTY_DOCUMENTS}
        </span>
      ),
      <div key="action" className="text-right">
        <Button
          variant="link"
          size="sm"
          onClick={() => handleOpenSetting(row.stage)}
          className="h-auto p-0 text-cyan-600 hover:text-cyan-700"
        >
          {labels.ACTION.SETTING}
        </Button>
      </div>,
    ]) ?? [];

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-slate-950">{labels.PAGE_TITLE}</h1>

      <Table columns={columns} data={tableData} isLoading={isLoading} />

      <ProspectDocumentSettingDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        stage={selectedStage}
      />
    </div>
  );
}
