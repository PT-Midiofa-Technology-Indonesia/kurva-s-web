'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface ProjectPortalSelectOption {
  id: string;
  name: string;
}

export interface ProjectPortalSelectProps {
  projects: ProjectPortalSelectOption[];
  value: string | null;
  onChange: (id: string) => void;
  className?: string;
}

export function ProjectPortalSelect({
  projects,
  value,
  onChange,
  className,
}: ProjectPortalSelectProps) {
  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger size="sm" className={cn('min-w-45 max-w-60', className)}>
        <SelectValue placeholder="Pilih Proyek" />
      </SelectTrigger>
      <SelectContent align="end">
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
