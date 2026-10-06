'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Pencil } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { DocumentModuleSettingsPanel } from '../components/DocumentModuleSettingsPanel';
import { DOCUMENT_MODULE_LABELS } from '../constants';
import { useDocumentModulePage } from '../hooks/use-document-module-page';
import type { DocumentModule } from '../types/document-module';

export function DocumentModuleListContent() {
  const {
    modules,
    totalItems,
    isLoading,
    isError,
    search,
    handleSearchChange,
    selectedModule,
    settingsOpen,
    handleSettingsOpen,
    handleSettingsClose,
    handleSuccess,
  } = useDocumentModulePage();

  const columns = useMemo<ColumnDef<DocumentModule>[]>(
    () => [
      {
        accessorKey: 'module',
        header: DOCUMENT_MODULE_LABELS.LIST.COLUMNS.MODULE,
        cell: ({ row }) => <span className="font-medium capitalize">{row.original.module}</span>,
      },
      {
        id: 'mandatoryDocs',
        header: DOCUMENT_MODULE_LABELS.LIST.COLUMNS.MANDATORY_DOCS,
        cell: ({ row }) => {
          const docs = row.original.mandatoryDocs;
          if (docs.length === 0) return <span className="text-slate-400">-</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {docs.map((doc) => (
                <Badge key={doc.id} variant="outline" className="rounded-md">
                  {doc.code}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        id: 'optionalDocs',
        header: DOCUMENT_MODULE_LABELS.LIST.COLUMNS.OPTIONAL_DOCS,
        cell: ({ row }) => {
          const docs = row.original.optionalDocs;
          if (docs.length === 0) return <span className="text-slate-400">-</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {docs.map((doc) => (
                <Badge key={doc.id} variant="secondary" className="rounded-md">
                  {doc.code}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: DOCUMENT_MODULE_LABELS.LIST.COLUMNS.ACTIONS,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            onClick={() => handleSettingsOpen(row.original)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Pengaturan
          </Button>
        ),
      },
    ],
    [handleSettingsOpen]
  );

  return (
    <>
      <ListPageTemplate<DocumentModule>
        title={DOCUMENT_MODULE_LABELS.LIST.TITLE}
        data={modules}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={DOCUMENT_MODULE_LABELS.LIST.EMPTY}
        searchPlaceholder={DOCUMENT_MODULE_LABELS.LIST.SEARCH_PLACEHOLDER}
        search={search}
        onSearchChange={handleSearchChange}
        page={1}
        perPage={10}
        totalItems={totalItems}
        totalPages={1}
        onPaginationChange={() => {}}
      />

      <DocumentModuleSettingsPanel
        open={settingsOpen}
        onClose={handleSettingsClose}
        module={selectedModule}
        onSuccess={handleSuccess}
      />
    </>
  );
}
