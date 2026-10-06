import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_DIR = join(process.cwd(), 'app');
const REMOVABLE_ROUTE_OVERRIDE_PROPS: Record<string, string[]> = {
  'src/domains/action-item/pages/ActionItemPage.tsx': ['initialQueryParams'],
  'src/domains/mom/pages/MomDetailPage.tsx': ['momId'],
  'src/domains/payroll/pages/PayrollPage.tsx': ['initialTab'],
  'src/domains/payroll/pages/PayrollDraftDetailPage.tsx': ['draftId'],
  'src/domains/document-type/pages/DocumentPage.tsx': ['initialTab'],
  'src/domains/company/pages/DetailCompanyPage.tsx': ['companyId'],
  'src/domains/company/pages/EditCompanyPage.tsx': ['companyId'],
  'src/domains/group/pages/EditGroupPage.tsx': ['groupId'],
  'src/domains/office/pages/EditOfficePage.tsx': ['officeId'],
  'src/domains/warehouse/pages/EditWarehousePage.tsx': ['id'],
  'src/domains/approval-request/pages/ApprovalRequestDetailPage.tsx': ['approvalRequestId'],
  'src/domains/vendor-directory/pages/VendorDirectoryPage.tsx': ['initialTab'],
  'src/domains/project-control/pages/ProjectControlPage.tsx': ['initialTab'],
  'src/domains/project-control/pages/BOQManagementPage.tsx': ['initialTab'],
  'src/domains/finance/billing/pages/BillingDetailPage.tsx': ['companyId'],
  'src/domains/item-master/pages/ItemMasterPage.tsx': ['initialTab'],
  'src/domains/skill-master/pages/SkillMasterPage.tsx': ['initialTab'],
  'src/domains/inventory/pages/StockMonitoringPage.tsx': ['initialTab'],
  'src/domains/action-item/pages/TaskControlTab.tsx': ['initialQueryParams'],
  'src/domains/action-item/pages/QualityControlTab.tsx': ['initialQueryParams'],
  'src/domains/manpower/pages/DetailManpowerPage.tsx': ['employeeId'],
  'src/domains/manpower/pages/EditManpowerPage.tsx': ['employeeId'],
  'src/domains/finance/payment-request/pages/PaymentRequestDetailPage.tsx': [
    'paymentRequestId',
    'companyId',
  ],
  'src/domains/logistic/pages/DoDetailPage.tsx': ['id'],
  'src/domains/logistic/pages/DoEditPage.tsx': ['id'],
  'src/domains/finance-report/pages/FinanceReportDetailPage.tsx': ['financeReportId', 'companyId'],
  'src/domains/cost-request/pages/CostRequestDetailPage.tsx': ['id'],
  'src/domains/finance/tax-report/pages/TaxReportDetailPage.tsx': ['taxReportId', 'companyId'],
  'src/domains/finance/tax-filing/pages/TaxFilingDetailPage.tsx': ['taxFilingId', 'companyId'],
  'src/domains/project-control/pages/DetailProjectHierarchyTemplatePage.tsx': ['templateId'],
  'src/domains/project-control/pages/FinancialReportDetailPage.tsx': ['projectId'],
  'src/domains/project-control/pages/CreateProjectHierarchyNodePage.tsx': [
    'projectId',
    'presetParentId',
    'presetParentName',
  ],
  'src/domains/project-control/pages/DetailProjectHierarchyPage.tsx': ['projectId'],
  'src/domains/project-control/pages/EditProjectHierarchyTemplateNodePage.tsx': [
    'templateId',
    'nodeId',
  ],
  'src/domains/project-control/pages/EditProjectHierarchyNodePage.tsx': ['projectId', 'nodeId'],
  'src/domains/project-control/pages/CreateProjectHierarchyTemplateNodePage.tsx': [
    'templateId',
    'presetParentId',
    'presetParentName',
  ],
  'src/domains/prospect-fee/pages/ProspectFeePage.tsx': ['initialTab', 'initialCompanyId'],
  'src/domains/prospect-fee/pages/ProspectFeeSettingDetailPage.tsx': ['id', 'initialCompanyId'],
  'src/domains/project-type/pages/EditProjectTypePage.tsx': ['projectTypeId'],
  'src/domains/position/pages/EditPositionPage.tsx': ['positionId'],
  'src/domains/cost-item-type/pages/EditCostItemTypePage.tsx': ['costItemTypeId'],
  'src/domains/project-capability/pages/EditProjectCapabilityPage.tsx': ['projectCapabilityId'],
  'src/domains/hierarchy-management/pages/EditHierarchyManagementPage.tsx': [
    'hierarchyManagementId',
  ],
  'src/domains/document-type/pages/EditDocumentTypePage.tsx': ['documentTypeId'],
  'src/domains/employee-grade/pages/EditEmployeeGradePage.tsx': ['employeeGradeId'],
  'src/domains/payment-type/pages/EditPaymentTypePage.tsx': ['paymentTypeId'],
  'src/domains/uom/pages/EditUomPage.tsx': ['id'],
  'src/domains/job-item-type/pages/EditJobItemTypePage.tsx': ['jobItemTypeId'],
  'src/domains/vendor-catalog/pages/EditVendorCatalogPage.tsx': ['id'],
  'src/domains/vendor-catalog/pages/DetailVendorCatalogPage.tsx': ['vendorId'],
  'src/domains/role-permissions/pages/DetailRolePage.tsx': ['roleId'],
  'src/domains/role-permissions/pages/EditRolePage.tsx': ['roleId'],
  'src/domains/users/pages/DetailUserPage.tsx': ['userId'],
  'src/domains/users/pages/EditUserPage.tsx': ['userId'],
  'src/domains/procurement/pages/GoodsReceiptDetailPage.tsx': ['goodsReceiptId'],
  'src/domains/procurement/pages/PurchaseOrderDetailPage.tsx': ['purchaseOrderId'],
  'src/domains/procurement/pages/PurchasePlanningDetailPage.tsx': ['draftId'],
  'src/domains/procurement/pages/PurchaseRequestDetailPage.tsx': ['purchaseRequestId'],
  'src/domains/inventory/pages/StockMovementHistoryPage.tsx': [
    'itemType',
    'itemId',
    'code',
    'name',
    'warehouseName',
  ],
  'src/domains/asset-management/pages/EditAssetCategoryPage.tsx': ['assetCategoryId'],
  'src/domains/performance/pages/KPIGradeSettingsPage.tsx': ['gradeId'],
  'src/domains/performance/pages/KPIDetailPage.tsx': ['id', 'employeeId'],
};

function collectPageFiles(dir: string): string[] {
  const pageFiles: string[] = [];

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      pageFiles.push(...collectPageFiles(full));
      continue;
    }

    if (entry === 'page.tsx') {
      pageFiles.push(full);
    }
  }

  return pageFiles;
}

describe('app route pages', () => {
  it('never marks page.tsx files as client components', () => {
    const offenders = collectPageFiles(APP_DIR).filter((filePath) => {
      const source = readFileSync(filePath, 'utf8');
      return /^['"]use client['"]\s*;?/m.test(source);
    });

    expect(offenders).toEqual([]);
  });

  it('never consumes params or searchParams in page.tsx files', () => {
    const offenders = collectPageFiles(APP_DIR).flatMap((filePath) => {
      const source = readFileSync(filePath, 'utf8');
      const reasons: string[] = [];

      if (/\bparams\s*:\s*Promise<|\bsearchParams\s*:\s*Promise</.test(source)) {
        reasons.push('declares route params');
      }

      if (/await\s+params\b|await\s+searchParams\b/.test(source)) {
        reasons.push('awaits route params');
      }

      if (/useParams\s*\(|useSearchParams\s*\(/.test(source)) {
        reasons.push('reads route params from hook');
      }

      return reasons.length > 0 ? [`${filePath}: ${reasons.join(', ')}`] : [];
    });

    expect(offenders).toEqual([]);
  });

  it('never delegates app route rendering to co-located PageClient wrappers', () => {
    const offenders = collectPageFiles(APP_DIR).flatMap((filePath) => {
      const source = readFileSync(filePath, 'utf8');
      const reasons: string[] = [];

      if (/import\s+PageClient\s+from\s+['"]\.\/PageClient['"]/.test(source)) {
        reasons.push('imports ./PageClient');
      }

      if (/<PageClient\s*\/>|return\s+<PageClient\s*\/>/.test(source)) {
        reasons.push('renders <PageClient />');
      }

      return reasons.length > 0 ? [`${filePath}: ${reasons.join(', ')}`] : [];
    });

    expect(offenders).toEqual([]);
  });

  it('removes audited route override props from domain pages', () => {
    const offenders = Object.entries(REMOVABLE_ROUTE_OVERRIDE_PROPS).flatMap(
      ([relativePath, props]) => {
        const filePath = join(process.cwd(), relativePath);
        const source = readFileSync(filePath, 'utf8');

        const functionSignatures = Array.from(
          source.matchAll(/export\s+(?:default\s+)?function\s+\w+\s*\(([\s\S]*?)\)\s*{/gm)
        ).map((match) => match[1]);

        return props
          .filter((prop) => {
            const escapedProp = prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const interfacePattern = new RegExp(
              `interface\\s+(?:\\w+Props|Props)\\s*{[\\s\\S]*?\\b${escapedProp}\\??\\s*:`,
              'm'
            );
            const typePattern = new RegExp(
              `type\\s+(?:\\w+Props|Props)\\s*=\\s*{[\\s\\S]*?\\b${escapedProp}\\??\\s*:`,
              'm'
            );
            const paramPattern = new RegExp(`\\b${escapedProp}\\b`);

            return (
              interfacePattern.test(source) ||
              typePattern.test(source) ||
              functionSignatures.some((signature) => paramPattern.test(signature))
            );
          })
          .map((prop) => `${relativePath}: ${prop}`);
      }
    );

    expect(offenders).toEqual([]);
  });
});
