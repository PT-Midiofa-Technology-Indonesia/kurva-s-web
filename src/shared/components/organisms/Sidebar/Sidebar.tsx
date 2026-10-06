'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NotificationDot } from '@/components/atoms/NotificationDot';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/cn';

interface MenuItem {
  id: string;
  label: string;
  badge?: string | number;
  href?: string;
  unreadCount?: number;
}

interface MenuSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  items?: MenuItem[];
  isOpen?: boolean;
  href?: string;
  hasUnread?: boolean;
}

interface SectionGroup {
  id: string;
  label: string;
  sections: MenuSection[];
}

interface SidebarProps {
  sectionGroups?: SectionGroup[];
  footer?: React.ReactNode;
  isCollapsed?: boolean;
}

export type { MenuItem, MenuSection, SectionGroup, SidebarProps };

export default function Sidebar({ sectionGroups = [], footer, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Auto-open parent sections when a child route is active
  useEffect(() => {
    sectionGroups.forEach((group) => {
      group.sections.forEach((section) => {
        if (section.items?.some((item) => pathname.startsWith(item.href || ''))) {
          setOpenSections((prev) => ({
            ...prev,
            [section.id]: true,
          }));
        }
      });
    });
  }, [pathname, sectionGroups]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const isActiveLink = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div
      className={cn(
        'relative z-20 flex flex-col h-screen bg-slate-50 border-r border-slate-200 transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-70'
      )}
    >
      {/* Header with Logo */}
      <div
        className={cn(
          'flex items-center justify-center px-4 py-3 border-b border-slate-200 transition-all duration-300',
          !isCollapsed && 'justify-start gap-3'
        )}
      >
        <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">C</span>
        </div>
        {!isCollapsed && <span className="text-sm font-medium text-slate-950">Curva-S</span>}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {sectionGroups.map((group) => (
          <div key={group.id}>
            {group.label.trim() ? (
              <h3
                className={cn(
                  'text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 px-2 transition-all',
                  isCollapsed && 'hidden'
                )}
              >
                {group.label}
              </h3>
            ) : null}
            <div className="space-y-1">
              {group.sections.map((section) => (
                <div key={section.id}>
                  {section.items && section.items.length > 0 ? (
                    <MenuSection
                      section={section}
                      isCollapsed={isCollapsed}
                      isOpen={openSections[section.id]}
                      onToggle={() => toggleSection(section.id)}
                      isActive={
                        isActiveLink(section.href) ||
                        section.items.some((item) => isActiveLink(item.href))
                      }
                      isActiveLink={isActiveLink}
                    />
                  ) : (
                    <Link
                      href={section.href || '#'}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-sm',
                        isActiveLink(section.href)
                          ? 'bg-brand-600 text-white font-medium'
                          : 'text-slate-700 hover:bg-slate-100',
                        isCollapsed && 'justify-center'
                      )}
                      title={isCollapsed ? section.label : undefined}
                    >
                      <div className="w-4 h-4 flex-shrink-0">{section.icon}</div>
                      {!isCollapsed && <span className="flex-1 text-left">{section.label}</span>}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {footer && <div className="px-2 py-4 border-t border-slate-200">{footer}</div>}
    </div>
  );
}

interface MenuSectionProps {
  section: MenuSection;
  isCollapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  isActive: boolean;
  isActiveLink: (href?: string) => boolean;
}

function MenuSection({
  section,
  isCollapsed,
  isOpen,
  onToggle,
  isActive,
  isActiveLink,
}: MenuSectionProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDrawer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsDrawerOpen(false);
    }, 100);
  };

  const hasItems = section.items && section.items.length > 0;

  const button = (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={isCollapsed && hasItems ? openDrawer : undefined}
      onMouseLeave={isCollapsed && hasItems ? closeDrawer : undefined}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-sm cursor-pointer',
        isActive ? 'bg-brand-100 text-brand-900 font-medium' : 'text-slate-700 hover:bg-slate-100'
      )}
      title={isCollapsed ? section.label : undefined}
    >
      <div className="relative w-4 h-4 shrink-0 mx-auto">
        {section.icon}
        {section.hasUnread && <NotificationDot className="absolute -top-0.5 -right-0.5" />}
      </div>
      {!isCollapsed && (
        <>
          <span className="flex-1 text-left">{section.label}</span>
          {hasItems && (
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform duration-300',
                isOpen ? 'rotate-180' : 'rotate-0',
                isActive ? 'text-brand-900' : 'text-slate-950'
              )}
            />
          )}
        </>
      )}
    </button>
  );

  return (
    <div>
      {isCollapsed && hasItems ? (
        <Popover open={isDrawerOpen} modal={false}>
          <PopoverTrigger asChild>{button}</PopoverTrigger>
          <PopoverContent
            side="right"
            sideOffset={8}
            align="start"
            className="w-auto min-w-[200px] p-0"
            onMouseEnter={openDrawer}
            onMouseLeave={closeDrawer}
          >
            <div className="px-3 py-2 text-sm font-medium border-b border-border bg-muted/50">
              {section.label}
            </div>
            <div className="p-2 space-y-0.5">
              {section.items?.map((item) => (
                <Link
                  key={item.id}
                  href={item.href || '#'}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                    isActiveLink(item.href)
                      ? 'bg-brand-600 text-white font-medium'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <span className="flex-1 whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-xs',
                        isActiveLink(item.href) ? 'text-brand-100' : 'text-slate-500'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {!!item.unreadCount && <NotificationDot count={item.unreadCount} />}
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        button
      )}

      {/* Submenu Items - Expanded Sidebar */}
      {!isCollapsed && hasItems && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isOpen ? 'max-h-[2000px] opacity-100 mt-1' : 'max-h-0 opacity-0'
          )}
        >
          <div className="ml-4 pl-3 border-l border-slate-300 space-y-1">
            {section.items?.map((item) => (
              <Link
                key={item.id}
                href={item.href || '#'}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-sm text-left',
                  isActiveLink(item.href)
                    ? 'bg-brand-600 text-white font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      'text-xs',
                      isActiveLink(item.href) ? 'text-brand-100' : 'text-slate-500'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {!!item.unreadCount && <NotificationDot count={item.unreadCount} />}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
