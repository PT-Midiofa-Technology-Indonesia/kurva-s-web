// Mock data for company and employee selection
// TODO: Replace with real API calls when backend is ready

export const MOCK_COMPANIES = [
  { value: 'company-1', label: 'PT Teknologi Indonesia' },
  { value: 'company-2', label: 'PT Digital Solutions' },
  { value: 'company-3', label: 'PT Creative Agency' },
  { value: 'company-4', label: 'PT Financial Services' },
];

export interface MockEmployee {
  value: string;
  label: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
}

export const MOCK_EMPLOYEES: MockEmployee[] = [
  // PT Teknologi Indonesia
  {
    value: 'emp-1',
    label: 'Budi Santoso',
    companyId: 'company-1',
    name: 'Budi Santoso',
    email: 'budi.santoso@teknologi.id',
    phone: '628123456789',
  },
  {
    value: 'emp-2',
    label: 'Siti Nurhaliza',
    companyId: 'company-1',
    name: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@teknologi.id',
    phone: '628234567890',
  },
  {
    value: 'emp-3',
    label: 'Ahmad Wijaya',
    companyId: 'company-1',
    name: 'Ahmad Wijaya',
    email: 'ahmad.wijaya@teknologi.id',
    phone: '628345678901',
  },
  // PT Digital Solutions
  {
    value: 'emp-4',
    label: 'Rina Handayani',
    companyId: 'company-2',
    name: 'Rina Handayani',
    email: 'rina.handayani@digital.co.id',
    phone: '628456789012',
  },
  {
    value: 'emp-5',
    label: 'Dewi Kusuma',
    companyId: 'company-2',
    name: 'Dewi Kusuma',
    email: 'dewi.kusuma@digital.co.id',
    phone: '628567890123',
  },
  {
    value: 'emp-6',
    label: 'Bambang Sutrisno',
    companyId: 'company-2',
    name: 'Bambang Sutrisno',
    email: 'bambang.sutrisno@digital.co.id',
    phone: '628678901234',
  },
  // PT Creative Agency
  {
    value: 'emp-7',
    label: 'Nur Aini',
    companyId: 'company-3',
    name: 'Nur Aini',
    email: 'nur.aini@creative.co.id',
    phone: '628789012345',
  },
  {
    value: 'emp-8',
    label: 'Rendra Pratama',
    companyId: 'company-3',
    name: 'Rendra Pratama',
    email: 'rendra.pratama@creative.co.id',
    phone: '628890123456',
  },
  // PT Financial Services
  {
    value: 'emp-9',
    label: 'Linda Susanti',
    companyId: 'company-4',
    name: 'Linda Susanti',
    email: 'linda.susanti@financial.id',
    phone: '628901234567',
  },
  {
    value: 'emp-10',
    label: 'Hendra Gunawan',
    companyId: 'company-4',
    name: 'Hendra Gunawan',
    email: 'hendra.gunawan@financial.id',
    phone: '628912345678',
  },
];
