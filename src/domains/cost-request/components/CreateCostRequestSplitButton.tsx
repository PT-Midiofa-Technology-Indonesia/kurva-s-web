'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/atoms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { COST_REQUEST_LABELS } from '../constants';
import type { CostRequestType } from '../types';

interface CreateCostRequestSplitButtonProps {
  onSelect: (requestType: CostRequestType) => void;
}

export function CreateCostRequestSplitButton({ onSelect }: CreateCostRequestSplitButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2">
          {COST_REQUEST_LABELS.LIST.CREATE_BUTTON}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSelect('project')}>Project</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect('non_project')}>Non Project</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
