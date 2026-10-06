'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { GRADE_BG_COLORS } from '../constants';
import type { PerformanceGrade } from '../types';

interface GradeScoreBadgeProps {
  grade: PerformanceGrade;
  className?: string;
}

export function GradeScoreBadge({ grade, className }: GradeScoreBadgeProps) {
  const g = grade.code ?? grade.name ?? grade.grade ?? 'E';
  const colorClass =
    GRADE_BG_COLORS[g as keyof typeof GRADE_BG_COLORS] ?? 'bg-slate-100 text-slate-700';

  return (
    <Badge variant="outline" className={cn(colorClass, 'border-0', className)}>
      {g}
    </Badge>
  );
}
