'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { PERFORMANCE_LABELS } from '../constants';
import type { PerformanceEmployee } from '../types';
import { GradeScoreBadge } from './GradeScoreBadge';

interface EmployeePerformanceCardProps {
  employee: PerformanceEmployee;
  onClick?: () => void;
  className?: string;
}

export function EmployeePerformanceCard({
  employee,
  onClick,
  className,
}: EmployeePerformanceCardProps) {
  const { name, position, avatar, performance } = employee;
  const score = employee.totalScore ?? performance?.score ?? 0;
  const grade = employee.grade ?? performance?.grade;
  const pillars = employee.pillars ?? performance?.pillars ?? [];

  // Get initials from name
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card
      size="sm"
      className={cn(
        'transition-all',
        onClick && 'cursor-pointer hover:shadow-md hover:ring-2 hover:ring-slate-200',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-700">
            {avatar ? (
              // biome-ignore lint/performance/noImgElement: external employee avatar URL, Next Image config not guaranteed
              <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
            <p className="truncate text-xs text-slate-500">{position || '-'}</p>
          </div>
          {grade ? <GradeScoreBadge grade={grade} /> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {pillars.map((pillar) => {
            const pct = pillar.percentage ?? pillar.score ?? pillar.finalScore ?? 0;
            return (
              <div key={pillar.id ?? pillar.code} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-600">{pillar.name}</span>
                  <span className="text-xs font-medium text-slate-900">{pct.toFixed(0)}%</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })}
        </div>
        <div className="flex items-baseline justify-between gap-2 border-t pt-3">
          <span className="text-xs font-medium text-slate-600">
            {PERFORMANCE_LABELS.CARD.TOTAL_SCORE}
          </span>
          <span className="text-lg font-semibold text-slate-900">{score.toFixed(1)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
