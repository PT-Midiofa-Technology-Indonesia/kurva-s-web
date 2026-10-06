'use client';

import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { Button } from '@/shared/components/atoms';

export interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function PageHeader({ title, onBack, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {onBack && (
        <Button
          variant="outline"
          onClick={onBack}
          aria-label="Back"
          className="h-9 px-4 text-sm font-medium text-slate-950 border-slate-200 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <h1 className="flex-1 text-lg font-semibold text-slate-950">{title}</h1>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}
