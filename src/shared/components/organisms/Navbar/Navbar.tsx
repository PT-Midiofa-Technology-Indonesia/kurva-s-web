import { Bell, PanelLeft } from 'lucide-react';
import { forwardRef } from 'react';
import { Breadcrumb } from '@/components/atoms/Breadcrumb';
import { Button } from '@/components/atoms/Button';
import { ProfileDropdown } from '@/components/molecules/ProfileDropdown';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href?: string;
}

export interface NavbarProps {
  breadcrumbs?: NavItem[];
  breadcrumbSlot?: React.ReactNode;
  projectSelectorSlot?: React.ReactNode;
  onToggleSidebar?: () => void;
  profileName?: string;
  profileRole?: string;
  profileAvatar?: React.ReactNode;
  profileItems?: {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'destructive';
    disabled?: boolean;
  }[];
  notificationCount?: number;
  onNotificationClick?: () => void;
  className?: string;
}

export const Navbar = forwardRef<HTMLElement, NavbarProps>(
  (
    {
      breadcrumbs,
      breadcrumbSlot,
      projectSelectorSlot,
      onToggleSidebar,
      profileName,
      profileRole,
      profileAvatar,
      profileItems,
      notificationCount,
      onNotificationClick,
      className,
    },
    ref
  ) => {
    return (
      <nav
        ref={ref}
        className={cn(
          'flex flex-row items-center justify-between px-6 py-2',
          'w-full h-13.5',
          'bg-white border-b border-slate-200',
          className
        )}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="md"
            onClick={onToggleSidebar}
            className="w-5 h-5 p-0 min-w-0"
          >
            <PanelLeft className="w-5 h-5 text-slate-500" />
          </Button>

          <div className="h-4 border-r border-slate-200" />

          {breadcrumbSlot ??
            (breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb
                items={breadcrumbs.map((item, index) => ({
                  ...item,
                  isActive: index === breadcrumbs.length - 1,
                }))}
              />
            ))}
        </div>

        <div className="flex items-center justify-between gap-6">
          <div className="relative flex items-center gap-2">
            {projectSelectorSlot}
            <Button
              variant="ghost"
              size="md"
              onClick={onNotificationClick}
              className="w-8 h-8 p-0 min-w-0 rounded-[10px] relative"
            >
              <Bell className="w-4 h-4 text-slate-950" />
              {notificationCount !== undefined && notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
              )}
            </Button>
            {(profileName || profileRole) && (
              <ProfileDropdown
                name={profileName || ''}
                role={profileRole || ''}
                avatar={profileAvatar}
                items={profileItems || []}
              />
            )}
          </div>
        </div>
      </nav>
    );
  }
);

Navbar.displayName = 'Navbar';
