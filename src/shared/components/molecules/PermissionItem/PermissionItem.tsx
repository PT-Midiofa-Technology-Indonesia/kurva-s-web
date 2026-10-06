import { PermissionCheckbox } from '@/components/atoms/PermissionCheckbox';
import { cn } from '@/utils/cn';

interface PermissionItemProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function PermissionItem({
  id,
  name,
  checked,
  onChange,
  className,
  disabled = false,
}: PermissionItemProps) {
  return (
    <div className={cn('flex items-center justify-between py-3', className)}>
      <PermissionCheckbox
        id={id}
        label={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
