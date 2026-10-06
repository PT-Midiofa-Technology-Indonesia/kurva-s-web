'use client';

import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

export interface ProfileDropdownProps {
  name: string;
  role?: string;
  avatar?: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  avatarFallback?: string;
}

export function ProfileDropdown({
  name,
  role,
  avatar,
  items,
  className,
  avatarFallback,
}: ProfileDropdownProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'flex items-center gap-3 px-2 py-1 rounded-lg border-none focus-visible:ring-0 h-full',
            className
          )}
        >
          {avatar ? (
            <div className="w-10 h-10 rounded-[10px] overflow-hidden">{avatar}</div>
          ) : (
            <div className="w-10 h-10 rounded-[10px] bg-slate-300 flex items-center justify-center text-sm font-medium text-slate-600">
              {avatarFallback || initials}
            </div>
          )}
          <div className="flex flex-col items-start">
            <Text size="base" weight="medium" className="text-slate-950">
              {name}
            </Text>
            {role && (
              <Text size="sm" className="text-slate-500">
                {role}
              </Text>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="w-[243px] p-1 bg-white rounded-lg border-0 shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1),0px_4px_6px_-1px_rgba(0,0,0,0.1)]"
      >
        <div className="px-3 py-2">
          <div className="flex items-center gap-4">
            {avatar ? (
              <div className="w-10 h-10 rounded-[10px] overflow-hidden">{avatar}</div>
            ) : (
              <div className="w-10 h-10 rounded-[10px] bg-slate-300 flex items-center justify-center text-sm font-medium text-slate-600">
                {avatarFallback || initials}
              </div>
            )}
            <div className="flex flex-col">
              <Text size="base" weight="medium" className="text-slate-950">
                {name}
              </Text>
              {role && (
                <Text size="sm" className="text-slate-500">
                  {role}
                </Text>
              )}
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 bg-slate-200" />

        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer',
              item.variant === 'default' && 'text-slate-950 focus:bg-slate-100',
              item.variant === 'destructive' && 'text-destructive-500 focus:bg-destructive-500',
              item.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {item.icon && (
              <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
            )}
            <Text
              size="base"
              className={item.variant === 'destructive' ? 'text-destructive-500' : ''}
            >
              {item.label}
            </Text>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function Dropdown({ trigger, items, className, align = 'start' }: DropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={4}
        className={cn(
          'w-[200px] p-1 bg-white rounded-lg border-0 shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1),0px_4px_6px_-1px_rgba(0,0,0,0.1)]',
          className
        )}
      >
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer',
              item.variant === 'default' && 'text-slate-950 focus:bg-slate-100',
              item.variant === 'destructive' && 'text-destructive-500 focus:bg-destructive-500',
              item.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {item.icon && <span className="w-4 h-4">{item.icon}</span>}
            <Text size="sm">{item.label}</Text>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
