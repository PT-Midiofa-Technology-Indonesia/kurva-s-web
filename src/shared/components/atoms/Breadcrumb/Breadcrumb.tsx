import { ChevronRight, Home } from 'lucide-react';
import { Fragment, forwardRef } from 'react';
import {
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumb as UITBreadcrumb,
  BreadcrumbItem as UITBreadcrumbItem,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
  isHome?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: 'chevron' | 'slash';
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, className, separator = 'chevron', ...props }, ref) => {
    return (
      <UITBreadcrumb ref={ref} className={cn(className)} {...props}>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <Fragment key={index}>
                {index > 0 && (
                  <BreadcrumbSeparator>
                    {separator === 'chevron' ? (
                      <ChevronRight className="size-3.5" />
                    ) : (
                      <span className="text-slate-400">/</span>
                    )}
                  </BreadcrumbSeparator>
                )}

                <UITBreadcrumbItem>
                  {item.isHome ? (
                    <BreadcrumbLink href={item.href || '#'}>
                      <Home className="size-4" />
                      {item.label}
                    </BreadcrumbLink>
                  ) : isLast || item.isActive ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href || '#'}>{item.label}</BreadcrumbLink>
                  )}
                </UITBreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </UITBreadcrumb>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
