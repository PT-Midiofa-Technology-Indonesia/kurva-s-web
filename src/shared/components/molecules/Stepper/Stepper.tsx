'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { StepperPanel } from './StepperPanel';
import type { StepItem } from './types';

export interface StepperProps {
  items: StepItem[];
  /** Uncontrolled: initial active step key. Defaults to first item. */
  defaultActiveKey?: string;
  /** Controlled: active step key. Pair with onChange. */
  activeKey?: string;
  onChange?: (key: string) => void;
  /** Allow clicking completed steps to navigate back. Default false. */
  stepClickable?: boolean;
  className?: string;
  contentClassName?: string;
  variant?: 'default' | 'teal' | 'tab';
}

export function Stepper({
  items,
  defaultActiveKey,
  activeKey: controlledKey,
  onChange,
  stepClickable = false,
  className,
  contentClassName,
  variant = 'default',
}: StepperProps) {
  const [internalKey, setInternalKey] = useState(defaultActiveKey ?? items[0]?.key ?? '');
  const activeKey = controlledKey ?? internalKey;
  const activeIndex = items.findIndex((item) => item.key === activeKey);

  const handleStepClick = (key: string) => {
    if (controlledKey === undefined) {
      setInternalKey(key);
    }
    onChange?.(key);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Row 1: circles + connectors */}
      <div className={cn('flex justify-center items-center', variant === 'tab' && 'w-full')}>
        {items.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const canClick = stepClickable && isCompleted;

          const isTeal = variant === 'teal';
          const circleBgClass =
            isCompleted || isActive
              ? isTeal
                ? 'bg-teal-500 hover:bg-teal-600'
                : 'bg-brand-600 hover:bg-brand-700'
              : 'bg-slate-200 text-slate-500 hover:bg-slate-200';

          const textClass =
            isCompleted || isActive
              ? isTeal
                ? 'text-teal-600 font-semibold'
                : 'text-brand-700 font-semibold'
              : 'text-slate-400 font-normal';

          const lineClass = isCompleted
            ? isTeal
              ? 'bg-teal-500'
              : 'bg-brand-600'
            : 'bg-slate-200';

          if (variant === 'tab') {
            return (
              <div
                key={`tab-${step.key}`}
                className="flex-1 border-b-2"
                style={{ borderColor: isCompleted || isActive ? '#0d9488' : '#e2e8f0' }}
              >
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-center gap-3 pb-4 transition-colors',
                    !canClick && !isActive && 'cursor-default opacity-80'
                  )}
                  disabled={!isActive && !canClick}
                  onClick={() => handleStepClick(step.key)}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold',
                      isCompleted || isActive
                        ? 'border-teal-600 text-teal-600'
                        : 'border-slate-300 text-slate-400'
                    )}
                  >
                    {isCompleted ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      isCompleted || isActive ? 'text-teal-600' : 'text-slate-400'
                    )}
                  >
                    {step.label}
                  </span>
                </button>
              </div>
            );
          }

          return (
            <div key={`circle-${step.key}`} className="flex flex-row items-baseline">
              <div className="flex flex-col items-center gap-2 w-18">
                <button
                  type="button"
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white transition-colors',
                    circleBgClass,
                    isActive && 'ring-4 ring-slate-50',
                    !canClick && !isActive && 'cursor-default opacity-80'
                  )}
                  disabled={!isActive && !canClick}
                  onClick={() => handleStepClick(step.key)}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                </button>
                <div className={cn('text-xs text-center', textClass)}>{step.label}</div>
              </div>

              {index < items.length - 1 && (
                <div className="flex h-10 items-center">
                  <div className={cn('h-[2px] w-20 shrink-0 mx-2', lineClass)} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Content area */}
      <div className="mt-6">
        {items.map((step) => (
          <StepperPanel
            key={step.key}
            stepKey={step.key}
            activeKey={activeKey}
            isLoading={step.isLoading}
            loadingFallback={step.loadingFallback}
            className={contentClassName}
          >
            {step.content}
          </StepperPanel>
        ))}
      </div>
    </div>
  );
}
