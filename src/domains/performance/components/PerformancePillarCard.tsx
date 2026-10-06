'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { PILAR_ICONS } from '../constants';
import type { PerformancePillar } from '../types';

interface PerformancePillarCardProps {
  pillar: PerformancePillar;
  className?: string;
}

export function PerformancePillarCard({ pillar, className }: PerformancePillarCardProps) {
  const Icon = PILAR_ICONS[pillar.code];
  const progressValue = pillar.percentage ?? pillar.score ?? pillar.finalScore ?? 0;

  return (
    <Card size="sm" className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <Icon className="h-5 w-5 text-slate-700" />
            </div>
          )}
          <CardTitle className="text-sm">{pillar.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-semibold text-slate-900">{pillar.totalValue}</span>
          <span className="text-sm text-slate-500">/ {pillar.maxValue}</span>
        </div>
        <Progress value={progressValue} className="h-2" />
        <p className="text-xs text-slate-500">{progressValue.toFixed(1)}% tercapai</p>
      </CardContent>
    </Card>
  );
}
