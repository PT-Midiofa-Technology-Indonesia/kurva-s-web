'use client';

import { Download } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/shared/components/atoms/Button';
import { ItemNotFound } from '@/shared/components/molecules';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { FormPageSkeleton } from '@/shared/components/templates';
import { FinancialReportTree } from '../components/financial-project-report/FinancialReportTree';
import { useExportFinancialReport } from '../hooks';
import { useFinancialReport } from '../hooks/use-financial-report';

export function FinancialReportDetailPage() {
  const params = useParams<{ id?: string }>();
  const projectId = params.id ?? '';
  const router = useRouter();
  const { data, isLoading, isError } = useFinancialReport(projectId);
  const { isExporting, handleExport } = useExportFinancialReport(projectId);

  const handleBack = useCallback(() => {
    router.push('/project-control/financial-project-report');
  }, [router]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <FormPageSkeleton />
      </div>
    );
  }

  if (isError || !data?.project) {
    return (
      <div className="p-6">
        <ItemNotFound
          message="Data Financial Project Report tidak ditemukan."
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title={`Financial Project Report - ${data.project.name}`} onBack={handleBack} />
        <Button
          type="button"
          leftIcon={<Download />}
          disabled={isExporting}
          onClick={() => handleExport()}
        >
          {isExporting ? 'Mengunduh...' : 'Export Excel'}
        </Button>
      </div>

      <FinancialReportTree projectId={projectId} items={data.items} />
    </div>
  );
}
