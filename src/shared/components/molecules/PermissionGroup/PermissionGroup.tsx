import { Laptop, Smartphone } from 'lucide-react';

import { PermissionItem } from '@/components/molecules/PermissionItem';
import { SubPermission } from '@/types/permissions';
import { cn } from '@/utils/cn';

const ICON_MAP: Record<string, React.ReactNode> = {
  web: <Laptop className="w-5 h-5" />,
  mobile: <Smartphone className="w-5 h-5" />,
};

interface PermissionGroupProps {
  id: string;
  name: string;
  icon?: string;
  subPermissions: SubPermission[];
  onSubPermissionChange: (subPermissionId: string, checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function PermissionGroup({
  id,
  name,
  icon,
  subPermissions,
  onSubPermissionChange,
  className,
  disabled = false,
}: PermissionGroupProps) {
  return (
    <div className={cn('space-y-0', className)}>
      <div className="flex items-center gap-2 py-4 border-b border-slate-200">
        {icon && <div className="flex-shrink-0">{ICON_MAP[icon]}</div>}
        <span className="text-sm font-medium text-slate-950">{name}</span>
      </div>
      <div className="space-y-0">
        {subPermissions.map((subPerm) => (
          <PermissionItem
            key={subPerm.id}
            id={`${id}-${subPerm.id}`}
            name={subPerm.name}
            checked={subPerm.checked}
            onChange={(checked) => onSubPermissionChange(subPerm.id, checked)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
