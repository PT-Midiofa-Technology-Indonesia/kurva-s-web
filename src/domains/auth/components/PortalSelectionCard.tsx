'use client';

import { Card } from '@/components/ui/card';
import type { PortalCardData } from '../constants/portal';

interface PortalSelectionCardProps {
  card: PortalCardData;
  onSelect: (card: PortalCardData) => void;
}

export function PortalSelectionCard({ card, onSelect }: PortalSelectionCardProps) {
  const Icon = card.icon;
  const Chevron = card.chevronIcon;

  return (
    <Card
      className="cursor-pointer w-lg rounded-2xl border-0 p-0 shadow-md ring-0 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      onClick={() => onSelect(card)}
    >
      <div className="flex items-center gap-4 p-5">
        {/* Left: Icon box */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50">
          <Icon className="h-6 w-6 text-brand-600" />
        </div>

        {/* Middle: Label + Title */}
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{card.label}</span>
          <span className="text-lg font-semibold text-foreground">{card.title}</span>
        </div>

        {/* Right: Chevron */}
        <div className="ml-auto">
          <Chevron className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
}
