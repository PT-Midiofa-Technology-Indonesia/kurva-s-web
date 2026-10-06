'use client';

import { useState } from 'react';
import { Breadcrumb } from '@/components/atoms/Breadcrumb';
import { Navbar, type NavbarProps } from '@/components/organisms/Navbar';
import { Sidebar, type SidebarProps } from '@/components/organisms/Sidebar';
import { useBreadcrumbs } from '@/shared/hooks/use-breadcrumbs';
import { cn } from '@/utils/cn';

function DynamicBreadcrumbs() {
  const breadcrumbs = useBreadcrumbs();
  return (
    <Breadcrumb
      items={breadcrumbs.map((item, index) => ({
        ...item,
        isActive: index === breadcrumbs.length - 1,
      }))}
    />
  );
}

interface DashboardLayoutProps {
  children?: React.ReactNode;
  navbarProps?: Omit<NavbarProps, 'onToggleSidebar' | 'breadcrumbs' | 'breadcrumbSlot'>;
  sidebarSectionGroups?: SidebarProps['sectionGroups'];
  sidebarFooter?: SidebarProps['footer'];
  className?: string;
}

export default function DashboardLayout({
  children,
  navbarProps,
  sidebarSectionGroups,
  sidebarFooter,
  className,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={cn('flex h-screen w-full overflow-hidden bg-white', className)}>
      <Sidebar
        sectionGroups={sidebarSectionGroups}
        footer={sidebarFooter}
        isCollapsed={sidebarCollapsed}
      />

      <div className="flex min-h-0 flex-col flex-1 overflow-hidden">
        <Navbar
          {...navbarProps}
          breadcrumbSlot={<DynamicBreadcrumbs />}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto bg-white">
          <div className="mx-auto max-w-360">{children}</div>
        </main>
      </div>
    </div>
  );
}
