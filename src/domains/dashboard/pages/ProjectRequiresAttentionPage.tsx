'use client';

import { ArrowLeft, CircleAlert, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { DataTablePagination } from '@/components/molecules';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { useMe } from '@/domains/auth';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { getErrorMessage } from '@/shared/lib/api-error';
import { cn } from '@/utils/cn';

import { useDashboardProjectProgress } from '../hooks/use-dashboard-project-progress';
import { formatPercent, formatSignedPercentage } from '../services/format';
import type { DashboardProjectProgressAttentionItem, DashboardProjectStatus } from '../types';

const PROJECT_STATUS_META: Record<
  DashboardProjectStatus,
  {
    label: string;
    badge: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
    className: string;
  }
> = {
  on_track: {
    label: 'On track',
    badge: 'success',
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  attention: {
    label: 'Attention',
    badge: 'warning',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  delayed: {
    label: 'Delayed',
    badge: 'destructive',
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
  },
  unmeasured: {
    label: 'Unmeasured',
    badge: 'outline',
    className: 'border-slate-200 bg-slate-50 text-slate-600',
  },
};

export function ProjectRequiresAttentionPage() {
  const { data: user, isPending: isMePending } = useMe();
  const { queryParams, setQueryParams, updateQueryParam } = useQueryParams<{
    companyId?: string;
    page?: number;
    perPage?: number;
  }>();

  const selectedCompanyId = useMemo(() => {
    const queryCompanyId = queryParams.companyId?.trim() || undefined;
    if (queryCompanyId) return queryCompanyId;

    const activeCompanyId = user?.companies.find((company) => company.isActive)?.id;
    return activeCompanyId ?? user?.companies[0]?.id;
  }, [queryParams.companyId, user?.companies]);

  const selectedCompanyName = useMemo(() => {
    if (!selectedCompanyId) return 'Company';

    return user?.companies.find((company) => company.id === selectedCompanyId)?.name ?? 'Company';
  }, [selectedCompanyId, user?.companies]);

  const attentionQuery = useDashboardProjectProgress(selectedCompanyId);

  const attentionItems = useMemo(() => {
    const items = [...(attentionQuery.data?.requiresAttention ?? [])];

    return items.sort((left, right) => {
      const rank = getProjectStatusRank(right.status) - getProjectStatusRank(left.status);
      if (rank !== 0) return rank;
      return (left.variance ?? 0) - (right.variance ?? 0);
    });
  }, [attentionQuery.data?.requiresAttention]);

  const totalItems = attentionItems.length;
  const requestedPageSize =
    typeof queryParams.perPage === 'number' && Number.isFinite(queryParams.perPage)
      ? queryParams.perPage
      : 10;
  const currentPageSize = Math.max(requestedPageSize, 1);
  const totalPages = Math.max(Math.ceil(totalItems / currentPageSize), 1);
  const requestedPage =
    typeof queryParams.page === 'number' && Number.isFinite(queryParams.page)
      ? queryParams.page
      : 1;
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  useEffect(() => {
    if ((queryParams.page ?? 1) !== currentPage) {
      updateQueryParam('page', currentPage);
    }
  }, [currentPage, queryParams.page, updateQueryParam]);

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * currentPageSize;
    return attentionItems.slice(start, start + currentPageSize);
  }, [attentionItems, currentPage, currentPageSize]);

  if (isMePending) {
    return <ProjectRequiresAttentionPageSkeleton />;
  }

  if (!selectedCompanyId) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Company context is missing</AlertTitle>
          <AlertDescription>
            Dashboard membutuhkan company aktif untuk memuat daftar project yang butuh perhatian.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (attentionQuery.isError) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader companyId={selectedCompanyId} companyName={selectedCompanyName} />

        <Alert variant="destructive">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Gagal memuat data project</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>
              {getErrorMessage(attentionQuery.error, 'Terjadi kesalahan saat memuat data ini.')}
            </span>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void attentionQuery.refetch();
                }}
              >
                <RefreshCcw data-icon="inline-start" />
                Coba lagi
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (attentionQuery.isPending || !attentionQuery.data) {
    return <ProjectRequiresAttentionPageSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader companyId={selectedCompanyId} companyName={selectedCompanyName} />

      <Card className="border-slate-200 shadow-none p-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b">
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Planned</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No projects requiring attention were returned for this company.
                  </TableCell>
                </TableRow>
              ) : (
                pagedItems.map((item) => <AttentionTableRow key={item.projectId} item={item} />)
              )}
            </TableBody>
          </Table>

          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={currentPageSize}
            totalItems={totalItems}
            onPageChange={(page) => updateQueryParam('page', page)}
            onPageSizeChange={(size) => {
              setQueryParams({
                page: 1,
                perPage: size,
              });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function PageHeader({ companyId }: { companyId: string; companyName: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <Button asChild variant="outline" size="sm">
        <Link href={`/dashboard?companyId=${companyId}`}>
          <ArrowLeft className="h-4 w-4" data-icon="inline-start" />
          Back to dashboard
        </Link>
      </Button>
    </div>
  );
}

function AttentionTableRow({ item }: { item: DashboardProjectProgressAttentionItem }) {
  const meta = PROJECT_STATUS_META[item.status];

  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500">{item.projectCode}</p>
          <p className="text-sm font-medium text-slate-950">{item.projectName}</p>
        </div>
      </TableCell>
      <TableCell className="text-right">{formatPercent(item.plannedProgress)}</TableCell>
      <TableCell className="text-right">{formatPercent(item.actualProgress)}</TableCell>
      <TableCell className="text-right">
        <span
          className={cn(
            'font-medium',
            item.variance < 0
              ? 'text-destructive'
              : item.variance > 0
                ? 'text-green-700'
                : 'text-slate-950'
          )}
        >
          {formatSignedPercentage(item.variance)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <Badge className={meta.className} variant={meta.badge}>
          {meta.label}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

function ProjectRequiresAttentionPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-36 rounded-md" />
      </div>

      <Card className="border-slate-200 shadow-none">
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-96" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-48" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getProjectStatusRank(status: DashboardProjectStatus): number {
  switch (status) {
    case 'delayed':
      return 3;
    case 'attention':
      return 2;
    case 'on_track':
      return 1;
    case 'unmeasured':
      return 0;
    default:
      return 0;
  }
}
