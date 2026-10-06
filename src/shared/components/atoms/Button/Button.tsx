import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, ReactNode } from 'react';
import { Button as UITButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const atomButtonVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-lg transition-colors whitespace-nowrap select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:shrink-0 cursor-pointer data-[slot=button-group]:border-0 data-[slot=button-group]:px-0 data-[slot=button-group]:aria-expanded:bg-transparent data-[slot=button-group]:aria-expanded:text-primary [&:not(:first-child)]:data-[slot=button-group]:ml-1.5',
  {
    variants: {
      variant: {
        default: [
          'bg-brand-600 text-slate-50 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]',
          'hover:bg-brand-700 active:bg-brand-700',
          'disabled:bg-brand-600',
        ],
        outline: [
          'bg-white border border-slate-200 text-slate-950 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]',
          'hover:bg-slate-50 active:bg-slate-100',
          'disabled:text-slate-400',
        ],
        destructive: [
          'bg-destructive-500 text-slate-50 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]',
          'hover:bg-destructive-600 active:bg-destructive-700',
          'disabled:bg-destructive-200',
        ],
        ghost: [
          'bg-transparent text-slate-600',
          'hover:bg-slate-100 active:bg-slate-200',
          'disabled:text-slate-300',
        ],
        'ghost-destructive': [
          'bg-transparent text-destructive-500',
          'hover:bg-destructive-50 active:bg-destructive-100',
          'disabled:text-destructive-300',
        ],
        link: [
          'bg-transparent underline-offset-4 hover:underline text-slate-600',
          'hover:bg-transparent active:bg-transparent',
          'disabled:text-slate-300 disabled:underline-offset-0',
        ],
      },
      size: {
        xs: 'gap-1.5 px-2 py-[5px] text-xs leading-4 h-6',
        sm: 'gap-1.5 px-3 py-1.5 text-sm leading-5 h-8',
        md: 'gap-2 px-4 py-2 text-sm leading-5 h-9',
        lg: 'gap-2 px-6 py-2.5 text-sm leading-5 h-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof atomButtonVariants> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, leftIcon, rightIcon, isLoading, disabled, children, ...props },
    ref
  ) => {
    return (
      <UITButton
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(atomButtonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            width={size === 'xs' ? 12 : 16}
            height={size === 'xs' ? 12 : 16}
          >
            <title>Loading</title>
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </UITButton>
    );
  }
);

Button.displayName = 'Button';

export { atomButtonVariants };
