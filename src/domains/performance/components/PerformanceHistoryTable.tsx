'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { PERFORMANCE_LABELS } from '../constants';
import type { PerformanceHistory } from '../types';
import { GradeScoreBadge } from './GradeScoreBadge';

interface PerformanceHistoryTableProps {
  data: PerformanceHistory[];
  isLoading?: boolean;
  className?: string;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <TableRow key={idx}>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function PerformanceHistoryTable({
  data,
  isLoading = false,
  className,
}: PerformanceHistoryTableProps) {
  const labels = PERFORMANCE_LABELS.DETAIL.HISTORY;

  // Mock pillar scores - in real implementation, these would come from the API
  // ponytail: pillar breakdown not in PerformanceHistory type, add when API provides it
  const getPillarScores = () => ({
    attendance: '-',
    productivity: '-',
    violation: '-',
    workQuality: '-',
  });

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{labels.PERIOD}</TableHead>
            <TableHead className="text-center">{labels.ATTENDANCE}</TableHead>
            <TableHead className="text-center">{labels.PRODUCTIVITY}</TableHead>
            <TableHead className="text-center">
              {PERFORMANCE_LABELS.DETAIL.PILLARS.VIOLATION}
            </TableHead>
            <TableHead className="text-center">{labels.QUALITY}</TableHead>
            <TableHead className="text-center">{labels.SCORE}</TableHead>
            <TableHead className="text-center">{labels.GRADE}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-sm text-slate-500">
                {labels.EMPTY}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const pillarScores = getPillarScores();
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.period}</TableCell>
                  <TableCell className="text-center text-sm">{pillarScores.attendance}</TableCell>
                  <TableCell className="text-center text-sm">{pillarScores.productivity}</TableCell>
                  <TableCell className="text-center text-sm">{pillarScores.violation}</TableCell>
                  <TableCell className="text-center text-sm">{pillarScores.workQuality}</TableCell>
                  <TableCell className="text-center font-semibold">
                    {(item.score ?? item.totalScore ?? 0).toFixed(1)}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.grade ? <GradeScoreBadge grade={item.grade} /> : '-'}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
