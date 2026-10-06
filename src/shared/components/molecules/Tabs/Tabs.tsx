'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TabPanel } from './TabPanel';
import type { TabsProps } from './types';

export function Tabs({
  items,
  defaultActiveKey,
  activeKey: controlledKey,
  onChange,
  variant = 'default',
  className,
  tabListClassName,
  tabItemClassName,
  contentClassName,
}: TabsProps) {
  const [internalKey, setInternalKey] = useState(defaultActiveKey ?? items[0]?.key ?? '');

  const activeKey = controlledKey ?? internalKey;

  const handleChange = (key: string) => {
    if (controlledKey === undefined) {
      setInternalKey(key);
    }
    onChange?.(key);
  };

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          variant === 'underline'
            ? 'flex flex-row items-center border-b border-slate-200 px-0 h-12 gap-0'
            : 'flex flex-row items-center px-6 py-2 gap-4 h-12 border-b border-slate-200',
          className,
          tabListClassName
        )}
      >
        <nav
          className={cn(
            'flex flex-row items-center flex-1',
            variant === 'underline' ? 'gap-0 h-full' : 'gap-1 h-8'
          )}
        >
          {items.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleChange(item.key)}
                className={cn(
                  variant === 'underline'
                    ? cn(
                        'relative flex h-full flex-1 items-center justify-center border-b-2 px-4 text-sm font-bold uppercase transition-all cursor-pointer',
                        isActive
                          ? 'border-cyan-700 text-cyan-800 bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                      )
                    : cn(
                        'flex flex-row justify-center items-center px-3 py-1.5 gap-1.5 h-8 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer',
                        isActive
                          ? 'bg-slate-100 text-slate-950'
                          : 'bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                      ),
                  tabItemClassName
                )}
              >
                {item.leftIcon && (
                  <span className="w-4 h-4 flex items-center justify-center shrink-0">
                    {item.leftIcon}
                  </span>
                )}
                {item.label}
                {item.rightIcon && (
                  <span className="w-4 h-4 flex items-center justify-center shrink-0">
                    {item.rightIcon}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {items.map((item) => (
        <TabPanel
          key={item.key}
          tabKey={item.key}
          activeKey={activeKey}
          isLoading={item.isLoading}
          loadingFallback={item.loadingFallback}
          remountOnChange={item.remountOnChange}
          className={contentClassName}
        >
          {item.content}
        </TabPanel>
      ))}
    </div>
  );
}
