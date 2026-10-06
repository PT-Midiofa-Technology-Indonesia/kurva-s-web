'use client';

import { ArrowLeft } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { ItemNotFound } from '@/shared/components/molecules';
import { FormPageSkeleton } from '@/shared/components/templates';
import { Button } from '@/shared/components/ui';
import {
  AttachmentsCard,
  PartnerInfoCard,
  TaxBreakdownCard,
  TaxReportStatusBadge,
  TaxSummaryCard,
  TransactionInfoCard,
} from '../components/TaxReportCards';
import { TAX_REPORT_LABELS } from '../constants';
import { useTaxReportDetailPage } from '../hooks/use-tax-report-detail-page';

export function TaxReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const taxReportId = id;
  const companyId = searchParams.get('companyId') ?? undefined;
  const { taxReport, isLoading, isError, handleBack } = useTaxReportDetailPage(
    taxReportId,
    companyId
  );

  if (isLoading) return <FormPageSkeleton />;
  if (isError)
    return <ItemNotFound message={TAX_REPORT_LABELS.DETAIL.LOAD_ERROR} onBack={handleBack} />;
  if (!taxReport)
    return <ItemNotFound message={TAX_REPORT_LABELS.DETAIL.NOT_FOUND} onBack={handleBack} />;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBack}
          aria-label={TAX_REPORT_LABELS.DETAIL.BACK}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 items-center gap-2">
          <h1 className="text-lg font-semibold text-slate-950">{taxReport.code}</h1>
          <TaxReportStatusBadge status={taxReport.status} />
        </div>
        {/* <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          {TAX_REPORT_LABELS.DETAIL.PRINT}
        </Button>
        <Button disabled={!taxDocumentUrl} asChild={Boolean(taxDocumentUrl)}>
          {taxDocumentUrl ? (
            <a href={taxDocumentUrl} target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              {TAX_REPORT_LABELS.DETAIL.DOWNLOAD}
            </a>
          ) : (
            TAX_REPORT_LABELS.DETAIL.DOWNLOAD
          )}
        </Button> */}
      </div>

      <TaxSummaryCard taxReport={taxReport} />
      <TaxBreakdownCard taxReport={taxReport} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <TransactionInfoCard taxReport={taxReport} />
          <PartnerInfoCard taxReport={taxReport} />
        </div>
        <AttachmentsCard taxReport={taxReport} />
      </div>
    </div>
  );
}
