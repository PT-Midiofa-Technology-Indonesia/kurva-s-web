import {
  Boxes,
  FileText,
  Handshake,
  Layers3,
  LayoutDashboard,
  LibraryBig,
  Package,
  PersonStanding,
  PresentationIcon,
  Receipt,
  ShoppingCart,
  Truck,
  Users,
  Users2,
  VectorSquare,
  Wallet,
  Warehouse,
  Workflow,
} from 'lucide-react';
import type { MenuItem, MenuSection, SectionGroup } from '@/components/organisms/Sidebar';
import type { PortalType } from '@/shared/lib/portal';
import type { PermissionRequirement } from '@/shared/types/permissions';

/**
 * A menu item that may narrow the portals it appears in.
 * Omitting `portals` inherits the parent section's.
 * `requiredPermission` optionally adds a permission requirement (opt-in security).
 */
export type PortalAwareMenuItem = MenuItem & {
  portals?: PortalType[];
  requiredPermission?: PermissionRequirement;
  notificationCode?: string;
};

/**
 * A sidebar section annotated with the portals it belongs to.
 * Declaring `portals` here is the ONLY thing needed to place a menu in a
 * portal — both the sidebar and the `proxy.ts` route guard derive from it.
 */
export type PortalAwareSection = Omit<MenuSection, 'items'> & {
  portals: PortalType[];
  items?: PortalAwareMenuItem[];
  requiredPermission?: PermissionRequirement;
  notificationCode?: string;
};

export interface PortalAwareSectionGroup extends Omit<SectionGroup, 'sections'> {
  sections: PortalAwareSection[];
}

export const SIDEBAR_SECTION_GROUPS: PortalAwareSectionGroup[] = [
  {
    id: 'quick-access',
    label: '',
    sections: [
      {
        id: 'dashboard-company',
        portals: ['company'],
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
        href: '/dashboard',
        requiredPermission: 'dashboard.company',
      },
      {
        id: 'dashboard-project',
        portals: ['project'],
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
        href: '/dashboard',
        requiredPermission: 'dashboard.project',
      },
    ],
  },
  {
    id: 'menu',
    label: 'Menu',
    sections: [
      {
        id: 'master-data',
        portals: ['company'],
        label: 'Master Data',
        icon: <Layers3 className="w-4 h-4" />,
        items: [
          {
            id: 'position',
            label: 'Position Master',
            href: '/master-data/position',
            requiredPermission: 'md.jp',
          },
          {
            id: 'project-type',
            label: 'Project Type',
            href: '/master-data/project-type',
            requiredPermission: 'md.ptyp',
          },
          {
            id: 'document',
            label: 'Document Type',
            href: '/master-data/document',
            requiredPermission: 'md.doc.typ',
          },
          {
            id: 'department',
            label: 'Department',
            href: '/master-data/department',
            requiredPermission: 'md.depart',
          },
          {
            id: 'project-capability',
            label: 'Project Capability',
            href: '/master-data/project-capability',
            requiredPermission: 'md.pcap',
          },
          {
            id: 'job-item-type',
            label: 'Job Item Type',
            href: '/master-data/job-item-type',
            requiredPermission: 'md.jityp',
          },
          {
            id: 'cost-item-type',
            label: 'Cost Item Type',
            href: '/master-data/cost-item-type',
            requiredPermission: 'md.cityp',
          },
          {
            id: 'payment-type',
            label: 'Payment Type',
            href: '/master-data/payment-type',
            requiredPermission: 'md.pityp',
          },
          {
            id: 'approval-group',
            label: 'Approval Group',
            href: '/master-data/approval-group',
            requiredPermission: 'md.appgrp',
          },
          {
            id: 'uom',
            label: 'Unit of Measure (UoM)',
            href: '/master-data/uom',
            requiredPermission: 'md.uom',
          },
          {
            id: 'item-master',
            label: 'Item Master',
            href: '/master-data/item-master',
            requiredPermission: ['md.im.ityp', 'md.im.ictg', 'md.im.ictlg'],
          },
          {
            id: 'skill-master',
            label: 'Skill Master',
            href: '/master-data/skill-master',
            requiredPermission: ['md.sm.slvl', 'md.sm.sctg', 'md.sm.sctlg'],
          },
          {
            id: 'employee-grade',
            label: 'Golongan',
            href: '/master-data/employee-grade',
            requiredPermission: 'md.gol',
          },
          // {
          //   id: 'notification-type',
          //   label: 'Notification Type',
          //   href: '/master-data/notification-type',
          // },
        ],
      },
      {
        id: 'organization',
        portals: ['company'],
        label: 'Organization Management',
        icon: <Workflow className="w-4 h-4" />,
        items: [
          {
            id: 'group',
            label: 'Group',
            href: '/organization/group',
            requiredPermission: 'oman.grp',
          },
          {
            id: 'company',
            label: 'Company',
            href: '/organization/company',
            requiredPermission: 'oman.cmpn',
          },
          {
            id: 'office',
            label: 'Office',
            href: '/organization/office',
            requiredPermission: 'oman.offc',
          },
          {
            id: 'warehouse',
            label: 'Warehouse',
            href: '/organization/warehouse',
            requiredPermission: 'oman.wrhs',
          },
          {
            id: 'hierarchy',
            label: 'Hierarchy',
            href: '/organization/hierarchy',
            requiredPermission: 'oman.hrrc',
          },
        ],
      },
      {
        id: 'user-management',
        portals: ['company'],
        label: 'User Management',
        icon: <Users className="w-4 h-4" />,
        items: [
          {
            id: 'role-permission',
            label: 'Role Permission',
            href: '/user-management/role-permission',
            requiredPermission: 'usman.rpm',
          },
          {
            id: 'user',
            label: 'User',
            href: '/user-management/user',
            requiredPermission: 'usman.user',
          },
        ],
      },
      {
        id: 'human-resource',
        portals: ['company'],
        label: 'Human Resource',
        icon: <Users2 className="w-4 h-4" />,
        items: [
          {
            id: 'manpower',
            label: 'Manpower',
            href: '/human-resource/manpower',
            requiredPermission: 'hr.man.emp',
          },
          {
            id: 'attendance',
            label: 'Attendance',
            href: '/human-resource/attendance',
            requiredPermission: 'hr.attn.rec',
          },
          {
            id: 'overtime',
            label: 'Overtime',
            href: '/human-resource/overtime',
            requiredPermission: 'hr.ot',
          },
          {
            id: 'leave',
            label: 'Leave',
            href: '/human-resource/leave',
            requiredPermission: 'hr.leave',
          },
          {
            id: 'payroll',
            label: 'Payroll',
            href: '/human-resource/payroll',
            requiredPermission: 'hr.pay.cmpt',
          },
          {
            id: 'performance-kpi',
            label: 'KPI',
            href: '/human-resource/kpi',
            requiredPermission: 'hr.kpi.emp',
          },
          // { id: 'kpi', label: 'KPI', href: '/human-resource/kpi' },
        ],
      },
      {
        id: 'vendor-management',
        portals: ['company'],
        label: 'Vendor Management',
        icon: <LibraryBig className="w-4 h-4" />,
        items: [
          {
            id: 'vendor-catalog',
            label: 'Vendor Catalog',
            href: '/vendor-management/vendor-catalog',
            requiredPermission: 'venman.ctlg',
          },
          {
            id: 'vendor-directory',
            label: 'Vendor Directory',
            href: '/vendor-management/vendor-directory',
            requiredPermission: [
              'venman.dir.item',
              'venman.dir.capability',
              'venman.dir.coverage',
              'venman.dir.offering',
            ],
          },
          // {
          //   id: 'vendor-rating',
          //   label: 'Vendor Rating',
          //   href: '/vendor-management/vendor-rating',
          // },
        ],
      },
      {
        id: 'prospectus',
        portals: ['company'],
        label: 'Prospectus',
        icon: <FileText className="w-4 h-4" />,
        items: [
          {
            id: 'prospect-document',
            label: 'Prospect Document',
            href: '/prospectus/prospect-document',
            requiredPermission: 'prosc.doc.stg',
          },
          {
            id: 'prospect',
            label: 'Prospect',
            href: '/prospectus/prospect',
            requiredPermission: 'prosc.pros',
          },
          // {
          //   id: 'prospect-activity',
          //   label: 'Prospect Activity',
          //   href: '/prospectus/prospect-activity',
          // },
          {
            id: 'prospect-fee',
            label: 'Prospect Fee',
            href: '/prospectus/prospect-fee',
            requiredPermission: ['prosc.fee.his', 'prosc.fee.stg'],
          },
        ],
      },
      {
        id: 'project-management',
        portals: ['project'],
        label: 'Project Management',
        icon: <PersonStanding className="w-4 h-4" />,
        items: [
          {
            id: 'project',
            label: 'Project',
            href: '/project-management/project',
            requiredPermission: 'projman.proj',
          },
          {
            id: 'manpower-planning',
            label: 'Manpower Planning',
            href: '/project-management/manpower-planning',
            requiredPermission: 'projman.mp',
          },
          {
            id: 'quality-control',
            label: 'Quality Control',
            href: '/project-management/quality-control',
            requiredPermission: 'projman.qc',
          },
          {
            id: 'schedule',
            label: 'Schedule',
            href: '/project-management/schedule',
            requiredPermission: 'projman.sch',
          },
          {
            id: 'project-monitoring',
            label: 'Project Monitoring',
            href: '/project-management/project-monitoring',
            requiredPermission: 'projman.mon',
          },
        ],
      },
      {
        id: 'project-control',
        portals: ['company'],
        label: 'Project Control',
        icon: <VectorSquare className="w-4 h-4" />,
        items: [
          {
            id: 'boq-management',
            label: 'BoQ Management',
            href: '/project-control/boq-management',
            requiredPermission: [
              'projc.boq.temp',
              'projc.boq.final',
              'projc.boq.quote',
              'projc.boq.exec',
            ],
          },
          {
            id: 'project',
            label: 'Project',
            href: '/project-control/project',
            requiredPermission: 'projc.proj',
          },
          {
            id: 'financial-project-report',
            label: 'Financial Project Report',
            href: '/project-control/financial-project-report',
            requiredPermission: 'projc.rpt',
          },
        ],
      },
      {
        id: 'meeting',
        portals: ['company'],
        label: 'Meeting',
        icon: <PresentationIcon className="w-4 h-4" />,
        items: [
          {
            id: 'mom',
            label: 'MoM',
            href: '/meeting/mom',
            requiredPermission: 'meet.mom',
          },
          {
            id: 'action-item',
            label: 'Action Item',
            href: '/meeting/action-item',
            requiredPermission: 'meet.act',
          },
        ],
      },
      {
        id: 'procurement',
        portals: ['company'],
        label: 'Procurement',
        icon: <ShoppingCart className="w-4 h-4" />,
        items: [
          {
            id: 'purchase-request',
            label: 'Purchase Request (PR)',
            href: '/procurement/purchase-request',
            requiredPermission: 'proc.pr',
          },
          {
            id: 'purchase-planning',
            label: 'Purchase Planning (PP)',
            href: '/procurement/purchase-planning',
            requiredPermission: 'proc.pp',
          },
          {
            id: 'purchase-order',
            label: 'Purchase Order (PO)',
            href: '/procurement/purchase-order',
            requiredPermission: 'proc.po',
          },
          {
            id: 'goods-receipt',
            label: 'Goods Receipt (GR)',
            href: '/procurement/goods-receipt',
            requiredPermission: 'proc.gr',
          },
        ],
      },
      {
        id: 'logistic',
        portals: ['company'],
        label: 'Logistic',
        icon: <Truck className="w-4 h-4" />,
        items: [
          {
            id: 'delivery-order',
            label: 'Delivery Order',
            href: '/logistic/delivery-order',
            requiredPermission: 'lgtc.do',
          },
          {
            id: 'loading-order',
            label: 'Loading Order',
            href: '/logistic/loading-order',
            requiredPermission: 'lgtc.lo',
          },
          {
            id: 'pickup-order',
            label: 'Pickup Order',
            href: '/logistic/pickup-order',
            requiredPermission: 'lgtc.pco',
          },
          {
            id: 'inbound',
            label: 'Inbound',
            href: '/logistic/inbound',
            requiredPermission: 'lgtc.in',
          },
          {
            id: 'outbound',
            label: 'Outbound',
            href: '/logistic/outbound',
            requiredPermission: 'lgtc.out',
          },
        ],
      },
      {
        id: 'inventory',
        portals: ['company'],
        label: 'Inventory',
        icon: <Warehouse className="w-4 h-4" />,
        items: [
          {
            id: 'stock-monitoring',
            label: 'Stock Monitoring',
            href: '/inventory/stock-monitoring',
            requiredPermission: 'inv.smon',
          },
          {
            id: 'stock-movement',
            label: 'Stock Movement',
            href: '/inventory/stock-movement',
            requiredPermission: 'inv.smov',
          },
        ],
      },
      {
        id: 'asset-management',
        portals: ['company'],
        label: 'Asset Management',
        icon: <Boxes className="w-4 h-4" />,
        href: '/asset-management',
        items: [
          {
            id: 'asset-catalog',
            label: 'Asset Catalog',
            href: '/asset-management/asset-catalog',
            requiredPermission: 'asman.ctlg',
          },
          {
            id: 'asset-category',
            label: 'Asset Category',
            href: '/asset-management/asset-category',
            requiredPermission: 'asman.ctgr',
          },
        ],
      },
      {
        id: 'resource-management',
        portals: ['company'],
        label: 'Resource Management',
        icon: <Package className="w-4 h-4" />,
        items: [
          {
            id: 'resource-catalog',
            label: 'Resource Catalog',
            href: '/resource-management/catalog',
            requiredPermission: 'resman.ctlg',
          },
          {
            id: 'resource-allocation',
            label: 'Resource Allocation',
            href: '/resource-management/allocation',
            requiredPermission: 'resman.alloc',
          },
        ],
      },
      {
        id: 'expense-management',
        portals: ['company'],
        label: 'Expense Management',
        icon: <Receipt className="w-4 h-4" />,
        items: [
          {
            id: 'cost-request',
            label: 'Cost Request',
            href: '/expense-management/cost-request',
            requiredPermission: 'exman.cost',
          },
        ],
      },
      {
        id: 'finance',
        portals: ['company'],
        notificationCode: 'FIN',
        label: 'Finance',
        icon: <Wallet className="w-4 h-4" />,
        items: [
          {
            id: 'payment-requests',
            label: 'Payment Requests',
            href: '/finance/payment-requests',
            requiredPermission: 'fin.pay',
            notificationCode: 'payment_requests',
          },
          {
            id: 'billing',
            label: 'Billing',
            href: '/finance/billings',
            requiredPermission: 'fin.bill',
          },
          {
            id: 'tax',
            label: 'Tax',
            href: '/finance/tax',
            requiredPermission: 'fin.taxr',
          },
          {
            id: 'finance-report',
            label: 'Finance Report',
            href: '/finance/finance-report',
            requiredPermission: 'fin.finr',
          },
        ],
      },
      {
        id: 'approval-management',
        portals: ['company'],
        notificationCode: 'APPR',
        label: 'Approval Management',
        icon: <Handshake className="w-4 h-4" />,
        items: [
          {
            id: 'approval-workflow',
            label: 'Approval Workflow',
            href: '/approval-management/approval-workflow',
            requiredPermission: 'appr.flow',
          },
          {
            id: 'approval-request',
            label: 'Approval Request',
            href: '/approval-management/approval-request',
            requiredPermission: 'appr.req',
            notificationCode: 'approval_requests',
          },
        ],
      },
    ],
  },
];

export const PATH_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'user-management': 'User Management',
  'role-permission': 'Role Permission',
  user: 'User',
  organization: 'Organization Management',
  group: 'Group',
  company: 'Company',
  department: 'Department',
  office: 'Office',
  warehouse: 'Warehouse',
  hierarchy: 'Hierarchy',
  'master-data': 'Master Data',
  'project-type': 'Project Type',
  document: 'Document',
  'job-item-type': 'Job Item Type',
  'cost-item-type': 'Cost Item Type',
  'payment-type': 'Payment Type',
  'approval-group': 'Approval Group',
  uom: 'Unit of Measure (UoM)',
  'item-master': 'Item Master',
  'asset-management': 'Asset Management',
  'asset-catalog': 'Asset Catalog',
  'asset-category': 'Asset Category',
  'skill-master': 'Skill Master',
  'employee-grade': 'Golongan',
  position: 'Position',
  'notification-type': 'Notification Type',
  'human-resource': 'Human Resource',
  manpower: 'Manpower',
  attendance: 'Attendance',
  overtime: 'Overtime',
  leave: 'Cuti',
  settings: 'Pengaturan',
  payroll: 'Payroll',
  'payroll-draft': 'Payroll Draft',
  kpi: 'KPI',
  'vendor-management': 'Vendor Management',
  'vendor-catalog': 'Vendor Catalog',
  'vendor-directory': 'Vendor Directory',
  prospectus: 'Prospectus',
  'prospect-document': 'Prospect Document',
  prospect: 'Prospect',
  'prospect-activity': 'Prospect Activity',
  'prospect-fee': 'Prospect Fee',
  finance: 'Finance',
  'payment-requests': 'Payment Requests',
  billings: 'Billing',
  'finance-report': 'Finance Report',
  'approval-management': 'Approval Management',
  'approval-workflow': 'Approval Workflow',
  'approval-request': 'Approval Request',
  meeting: 'Meeting',
  mom: 'MoM',
  'action-item': 'Action Item',
  'project-control': 'Project Control',
  'boq-management': 'BoQ Management',
  'financial-project-report': 'Financial Project Report',
  procurement: 'Procurement',
  'purchase-request': 'Purchase Request (PR)',
  'purchase-planning': 'Purchase Planning (PP)',
  'purchase-order': 'Purchase Order (PO)',
  'goods-receipt': 'Goods Receipt',
  logistic: 'Logistic',
  'delivery-order': 'Delivery Order',
  'loading-order': 'Loading Order',
  'pickup-order': 'Pickup Order',
  inbound: 'Inbound',
  outbound: 'Outbound',
  'project-management': 'Project Management',
  'manpower-planning': 'Manpower Planning',
  'quality-control': 'Quality Control',
  inventory: 'Inventory',
  'stock-monitoring': 'Stock Monitoring',
  'stock-movement': 'Stock Movement',
  'movement-history': 'Movement History',
  'resource-management': 'Resource Management',
  'resource-catalog': 'Resource Catalog',
  'resource-allocation': 'Resource Allocation',
  'expense-management': 'Expense Management',
  'cost-request': 'Cost Request',
  'project-monitoring': 'Project Monitoring',
  other: 'Other',
  profile: 'Akun Saya',
};

export const PROFILE_MENU_LABELS = {
  MY_ACCOUNT: 'Akun Saya',
  SETTINGS: 'Pengaturan',
  PORTAL: 'Switch Portal',
  LOGOUT: 'Keluar',
} as const;

export const AUTH_PATHS = {
  PROFILE: '/dashboard/profile',
  PORTAL_SELECTION: '/portal-selection',
} as const;
