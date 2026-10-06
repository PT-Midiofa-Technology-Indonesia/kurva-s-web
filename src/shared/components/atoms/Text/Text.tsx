import { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type TextSize =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | '9xl';
export type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor =
  | 'foreground'
  | 'muted-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'primary'
  | 'primary-foreground'
  | 'secondary'
  | 'secondary-foreground'
  | 'destructive'
  | 'destructive-foreground'
  | 'brand'
  | 'brand-foreground'
  | 'slate-50'
  | 'slate-100'
  | 'slate-200'
  | 'slate-300'
  | 'slate-400'
  | 'slate-500'
  | 'slate-600'
  | 'slate-700'
  | 'slate-800'
  | 'slate-900'
  | 'slate-950'
  | 'amber-50'
  | 'amber-100'
  | 'amber-200'
  | 'amber-300'
  | 'amber-400'
  | 'amber-500'
  | 'amber-600'
  | 'amber-700'
  | 'amber-800'
  | 'amber-900'
  | 'amber-950'
  | 'destructive-50'
  | 'destructive-100'
  | 'destructive-200'
  | 'destructive-300'
  | 'destructive-400'
  | 'destructive-500'
  | 'destructive-600'
  | 'destructive-700'
  | 'destructive-800'
  | 'destructive-900'
  | 'destructive-950';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  as?: ElementType;
}

const sizeClasses: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
  '7xl': 'text-7xl',
  '8xl': 'text-8xl',
  '9xl': 'text-9xl',
};

const weightClasses: Record<TextWeight, string> = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colorClasses: Record<TextColor, string> = {
  foreground: 'text-foreground',
  'muted-foreground': 'text-muted-foreground',
  accent: 'text-accent',
  'accent-foreground': 'text-accent-foreground',
  primary: 'text-primary',
  'primary-foreground': 'text-primary-foreground',
  secondary: 'text-secondary',
  'secondary-foreground': 'text-secondary-foreground',
  destructive: 'text-destructive',
  'destructive-foreground': 'text-destructive-foreground',
  brand: 'text-primary',
  'brand-foreground': 'text-primary-foreground',
  'slate-50': 'text-slate-50',
  'slate-100': 'text-slate-100',
  'slate-200': 'text-slate-200',
  'slate-300': 'text-slate-300',
  'slate-400': 'text-slate-400',
  'slate-500': 'text-slate-500',
  'slate-600': 'text-slate-600',
  'slate-700': 'text-slate-700',
  'slate-800': 'text-slate-800',
  'slate-900': 'text-slate-900',
  'slate-950': 'text-slate-950',
  'amber-50': 'text-amber-50',
  'amber-100': 'text-amber-100',
  'amber-200': 'text-amber-200',
  'amber-300': 'text-amber-300',
  'amber-400': 'text-amber-400',
  'amber-500': 'text-amber-500',
  'amber-600': 'text-amber-600',
  'amber-700': 'text-amber-700',
  'amber-800': 'text-amber-800',
  'amber-900': 'text-amber-900',
  'amber-950': 'text-amber-950',
  'destructive-50': 'text-destructive-50',
  'destructive-100': 'text-destructive-100',
  'destructive-200': 'text-destructive-200',
  'destructive-300': 'text-destructive-300',
  'destructive-400': 'text-destructive-400',
  'destructive-500': 'text-destructive-500',
  'destructive-600': 'text-destructive-600',
  'destructive-700': 'text-destructive-700',
  'destructive-800': 'text-destructive-800',
  'destructive-900': 'text-destructive-900',
  'destructive-950': 'text-destructive-950',
};

export const Text = ({
  children,
  size = 'base',
  weight = 'normal',
  color = 'foreground',
  as = 'p',
  className,
  ...props
}: TextProps) => {
  const Component = as as ElementType;

  return (
    <Component
      className={cn(sizeClasses[size], weightClasses[weight], colorClasses[color], className)}
      {...props}
    >
      {children}
    </Component>
  );
};
