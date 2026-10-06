import { forwardRef, ReactNode } from 'react';
import { Switch as ShadcnSwitch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default';
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  labelPosition?: 'left' | 'right';
  showLabel?: boolean;
  className?: string;
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked,
      disabled,
      size = 'default',
      onCheckedChange,
      label,
      labelPosition = 'left',
      showLabel = true,
      ...props
    },
    ref
  ) => {
    const content = (
      <ShadcnSwitch
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        size={size}
        onCheckedChange={onCheckedChange}
        className={cn(
          'data-[state=unchecked]:bg-slate-200 data-[state=checked]:bg-brand-500',
          disabled && 'pointer-events-none data-[state=unchecked]:bg-slate-300',
          className
        )}
        {...props}
      />
    );

    if (!showLabel || !label) {
      return (
        <div className={cn(disabled && 'pointer-events-none cursor-not-allowed opacity-50')}>
          {content}
        </div>
      );
    }

    return (
      <label
        className={cn(
          'inline-flex items-center gap-3',
          labelPosition === 'left' ? 'flex-row-reverse' : 'flex-row',
          disabled && 'pointer-events-none cursor-not-allowed opacity-50'
        )}
      >
        {content}
        <span className="text-sm font-normal text-slate-950">{label}</span>
      </label>
    );
  }
);

Switch.displayName = 'Switch';
