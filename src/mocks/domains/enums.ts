import { HttpResponse, http } from 'msw';

const h = (path: string) => `/api/v1${path}`;

const enumData: Record<string, { value: string; label: string }[]> = {
  'uom-groups': [
    { value: 'length', label: 'Panjang' },
    { value: 'weight', label: 'Berat' },
    { value: 'volume', label: 'Volume' },
  ],
  'contract-types': [
    { value: 'permanent', label: 'Permanent' },
    { value: 'contract', label: 'Contract' },
  ],
  'employee-types': [
    { value: 'permanent_staff', label: 'Permanent Staff' },
    { value: 'project_worker', label: 'Project Worker' },
  ],
  'salary-types': [
    { value: 'monthly', label: 'Monthly' },
    { value: 'daily', label: 'Daily' },
  ],
  genders: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ],
  'user-types': [
    { value: 'non_employee', label: 'Non Employee' },
    { value: 'employee', label: 'Employee' },
  ],
  'company-position-levels': [
    { value: '1', label: 'Level 1' },
    { value: '2', label: 'Level 2' },
    { value: '3', label: 'Level 3' },
  ],
  'position-specializations': [
    { value: 'engineering', label: 'Engineering' },
    { value: 'management', label: 'Management' },
  ],
  'approval-request-statuses': [
    { value: 'in_progress', label: 'In Progress' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ],
  'delivery-order-status': [
    { value: 'requested', label: 'Requested' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'received', label: 'Received' },
  ],
  'allocation-type': [
    { value: 'unit', label: 'Unit' },
    { value: 'quantity', label: 'Quantity' },
  ],
  'loading-order-status': [
    { value: 'draft', label: 'Draft' },
    { value: 'prepared', label: 'Prepared' },
    { value: 'loaded', label: 'Loaded' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  'loading-order-source-type': [
    { value: 'allocation', label: 'Allocation' },
    { value: 'manual', label: 'Manual' },
  ],
  'pickup-order-status': [
    { value: 'draft', label: 'Draft' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  'pickup-order-type': [
    { value: 'pickup', label: 'Pickup' },
    { value: 'deliver', label: 'Deliver' },
  ],
  'project-source-categories': [
    { value: 'direct', label: 'Direct' },
    { value: 'tender', label: 'Tender' },
    { value: 'negotiation', label: 'Negotiation' },
  ],
};

export const enumHandlers = [
  http.get(h('/enums/:type'), ({ params }) => {
    const data = enumData[params.type as string] ?? [];
    return HttpResponse.json({
      success: true,
      message: 'Data retrieved successfully',
      data,
    });
  }),
];
