'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/atoms';

export interface ItemNotFoundProps {
  message?: string;
  backLabel?: string;
  onBack?: () => void;
}

export function ItemNotFound({
  message = 'Item tidak ditemukan',
  backLabel = 'Kembali',
  onBack,
}: ItemNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <p className="text-sm text-muted-foreground">{message}</p>
      {onBack && (
        <Button variant="outline" onClick={onBack} className="h-9 px-4 text-sm gap-2">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
      )}
    </div>
  );
}
