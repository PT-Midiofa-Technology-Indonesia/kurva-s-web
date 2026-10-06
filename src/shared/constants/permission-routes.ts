/**
 * Map routes to required permissions
 * Routes without an entry = no permission check (public within portal)
 * Synced from SIDEBAR_SECTION_GROUPS in navigation.tsx
 */
import type { PermissionRequirement } from '@/shared/types/permissions';

type PermissionRouteConfig = {
  requiredPermission?: PermissionRequirement;
  portalPermission?: Record<string, PermissionRequirement>;
};

export const PERMISSION_ROUTES: Record<string, PermissionRouteConfig> = {
  '/dashboard': {
    portalPermission: { company: 'dashboard.company', project: 'dashboard.project' },
  },
  '/user-management/role-permission': { requiredPermission: 'usman.rpm' },
  '/user-management/user': { requiredPermission: 'usman.user' },
  '/organization/group': { requiredPermission: 'oman.grp' },
  '/organization/company': { requiredPermission: 'oman.cmpn' },
  '/organization/office': { requiredPermission: 'oman.offc' },
  '/organization/warehouse': { requiredPermission: 'oman.wrhs' },
  '/organization/hierarchy': { requiredPermission: 'oman.hrrc' },
  '/master-data/position': { requiredPermission: 'md.jp' },
  '/master-data/project-type': { requiredPermission: 'md.ptyp' },
  '/master-data/document': { requiredPermission: 'md.doc.typ' },
  '/master-data/department': { requiredPermission: 'md.depart' },
  '/master-data/project-capability': { requiredPermission: 'md.pcap' },
  '/master-data/job-item-type': { requiredPermission: 'md.jityp' },
  '/master-data/cost-item-type': { requiredPermission: 'md.cityp' },
  '/master-data/payment-type': { requiredPermission: 'md.pityp' },
  '/master-data/approval-group': { requiredPermission: 'md.appgrp' },
  '/master-data/uom': { requiredPermission: 'md.uom' },
  '/master-data/item-master': {
    requiredPermission: ['md.im.ityp', 'md.im.ictg', 'md.im.ictlg'],
  },
  '/master-data/skill-master': {
    requiredPermission: ['md.sm.slvl', 'md.sm.sctg', 'md.sm.sctlg'],
  },
  '/master-data/employee-grade': { requiredPermission: 'md.gol' },
  '/asset-management/asset-catalog': { requiredPermission: 'asman.ctlg' },
  '/asset-management/asset-category': { requiredPermission: 'asman.ctgr' },
  '/human-resource/manpower': { requiredPermission: 'hr.man.emp' },
  '/human-resource/attendance': { requiredPermission: 'hr.attn.rec' },
  '/human-resource/overtime': { requiredPermission: 'hr.ot' },
  '/human-resource/leave': { requiredPermission: 'hr.leave' },
  '/human-resource/payroll': { requiredPermission: 'hr.pay.cmpt' },
  '/vendor-management/vendor-catalog': { requiredPermission: 'venman.ctlg' },
  '/vendor-management/vendor-directory': {
    requiredPermission: [
      'venman.dir.item',
      'venman.dir.capability',
      'venman.dir.coverage',
      'venman.dir.offering',
    ],
  },
  '/finance/payment-requests': { requiredPermission: 'fin.pay' },
  '/finance/billings': { requiredPermission: 'fin.bill' },
  '/finance/tax': { requiredPermission: 'fin.taxr' },
  '/finance/tax-report': { requiredPermission: 'fin.taxr' },
  '/finance/tax-filing': { requiredPermission: 'fin.taxf' },
  '/finance/finance-report': { requiredPermission: 'fin.finr' },
  '/prospectus/prospect-document': { requiredPermission: 'prosc.doc.stg' },
  '/prospectus/prospect': { requiredPermission: 'prosc.pros' },
  '/prospectus/prospect-fee': { requiredPermission: ['prosc.fee.his', 'prosc.fee.stg'] },
  '/project-control/boq-management': {
    requiredPermission: ['projc.boq.temp', 'projc.boq.final', 'projc.boq.quote', 'projc.boq.exec'],
  },
  '/project-control/project': { requiredPermission: 'projc.proj' },
  '/project-control/financial-project-report': { requiredPermission: 'projc.rpt' },
  '/approval-management/approval-workflow': { requiredPermission: 'appr.flow' },
  '/approval-management/approval-request': { requiredPermission: 'appr.req' },
  '/procurement/purchase-request': { requiredPermission: 'proc.pr' },
  '/procurement/purchase-planning': { requiredPermission: 'proc.pp' },
  '/procurement/purchase-order': { requiredPermission: 'proc.po' },
  '/procurement/goods-receipt': { requiredPermission: 'proc.gr' },
  '/project-management/project': { requiredPermission: 'projman.proj' },
  '/project-management/manpower-planning': { requiredPermission: 'projman.mp' },
  '/project-management/quality-control': { requiredPermission: 'projman.qc' },
  '/project-management/schedule': { requiredPermission: 'projman.sch' },
  '/project-management/project-monitoring': { requiredPermission: 'projman.mon' },
  '/logistic/delivery-order': { requiredPermission: 'lgtc.do' },
  '/logistic/loading-order': { requiredPermission: 'lgtc.lo' },
  '/logistic/pickup-order': { requiredPermission: 'lgtc.pco' },
  '/logistic/inbound': { requiredPermission: 'lgtc.in' },
  '/logistic/outbound': { requiredPermission: 'lgtc.out' },
  '/inventory/stock-monitoring': { requiredPermission: 'inv.smon' },
  '/inventory/stock-movement': { requiredPermission: 'inv.smov' },
  '/resource-management/catalog': { requiredPermission: 'resman.ctlg' },
  '/resource-management/allocation': { requiredPermission: 'resman.alloc' },
  '/expense-management/cost-request': { requiredPermission: 'exman.cost' },
};
