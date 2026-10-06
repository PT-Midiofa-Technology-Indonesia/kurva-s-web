import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/utils/cn';

interface PermissionCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function PermissionCheckbox({
  id,
  label,
  checked,
  onChange,
  className,
  disabled = false,
}: PermissionCheckboxProps) {
  return (
    <div className={cn('flex items-center gap-3', disabled && !checked && 'opacity-50', className)}>
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
      <label
        htmlFor={id}
        className={cn(
          'text-sm font-normal text-slate-950 cursor-pointer',
          disabled && 'cursor-default'
        )}
      >
        {label}
      </label>
    </div>
  );
}
