import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateBillingFormValues } from '../../schemas';
import type {
  BillingPaymentBankAccount,
  BillingPaymentDetail,
  BillingPaymentTax,
  BillingProjectDetail,
} from '../../types';
import { Step1Info } from './Step1Info';
import { Step2Progress } from './Step2Progress';
import { Step3Document } from './Step3Document';
import { Step4Payment } from './Step4Payment';

vi.mock('lucide-react', async () => {
  const actual = await vi.importActual<typeof import('lucide-react')>('lucide-react');
  return {
    ...actual,
    Upload: ({ className }: any) => <div className={className} data-testid="upload-icon" />,
    FileText: ({ className }: any) => <div className={className} data-testid="file-text-icon" />,
    X: ({ className }: any) => <div className={className} data-testid="x-icon" />,
  };
});

vi.mock('../../hooks/use-billing-documents', () => ({
  useBillingDocuments: () => ({
    data: {
      data: {
        requirements: [
          {
            id: 'req-1',
            documentTypeId: 'doc-1',
            documentTypeName: 'Surat Tagihan',
            isMandatory: true,
            isUploaded: true,
            uploadedDocuments: [
              {
                id: 'file-1',
                fileName: 'Surat Tagihan.doc',
                fileSize: 1024,
                url: 'https://example.com/file.doc',
              },
            ],
          },
        ],
        isAllMandatoryUploaded: true,
      },
    },
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../hooks/use-upload-billing-document', () => ({
  useUploadBillingDocument: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../../hooks/use-delete-billing-document', () => ({
  useDeleteBillingDocument: () => ({ mutate: vi.fn(), isPending: false }),
}));

type BillingPaymentDetailMockValue = {
  data: {
    data: Partial<BillingPaymentDetail> & {
      bankAccounts: BillingPaymentBankAccount[];
      taxes: BillingPaymentTax[];
      paymentMethods: string[];
      summary: BillingPaymentDetail['summary'];
      termNumber: number;
    };
  };
  isLoading: boolean;
};

const billingPaymentDetailMock = vi.fn<() => BillingPaymentDetailMockValue>(() => ({
  data: {
    data: {
      bankAccounts: [],
      taxes: [],
      paymentMethods: ['transfer'],
      summary: {
        baseAmount: 100000,
        taxAmount: 11000,
        totalAmount: 111000,
        termNumber: 1,
      },
      termNumber: 1,
    },
  },
  isLoading: false,
}));

vi.mock('../../hooks/use-billing-payment-detail', () => ({
  useBillingPaymentDetail: () => billingPaymentDetailMock(),
}));

vi.mock('../../hooks/use-billing-tax-types', () => ({
  useBillingTaxTypes: () => ({
    data: {
      data: [{ id: 'tax-1', name: 'PPN' }],
    },
    isLoading: false,
  }),
}));

vi.mock('../../hooks/use-save-billing-bank-account', () => ({
  useSaveBillingBankAccount: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../../hooks/use-delete-billing-bank-account', () => ({
  useDeleteBillingBankAccount: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../../hooks/use-save-billing-tax', () => ({
  useSaveBillingTax: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../../hooks/use-delete-billing-tax', () => ({
  useDeleteBillingTax: () => ({ mutate: vi.fn(), isPending: false }),
}));

const setBillingPaymentMutate = vi.fn();

vi.mock('../../hooks/use-set-billing-payment', () => ({
  useSetBillingPayment: () => ({ mutate: setBillingPaymentMutate, isPending: false }),
}));

vi.mock('../../hooks/use-set-billing-as-invoiced', () => ({
  useSetBillingAsInvoiced: () => ({ mutate: vi.fn(), isPending: false }),
}));

const defaultBillingPaymentDetail: BillingPaymentDetailMockValue = {
  data: {
    data: {
      bankAccounts: [],
      taxes: [],
      paymentMethods: ['transfer'],
      summary: {
        baseAmount: 100000,
        taxAmount: 11000,
        totalAmount: 111000,
        termNumber: 1,
      },
      termNumber: 1,
    },
  },
  isLoading: false,
};

beforeEach(() => {
  setBillingPaymentMutate.mockReset();
  billingPaymentDetailMock.mockReset();
  billingPaymentDetailMock.mockReturnValue(defaultBillingPaymentDetail);
});

function FormWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Partial<CreateBillingFormValues>;
}) {
  const form = useForm<CreateBillingFormValues>({
    defaultValues: {
      projectId: '',
      billingType: '',
      percentage: undefined,
      billedAt: '',
      dueDate: '',
      notes: '',
      paymentMethods: ['transfer'],
      paymentTermDays: 14,
      invoiceNumber: '',
      vatPercentage: 11,
      withholdingPercentage: 2,
      reviewNotes: '',
      progressItems: [],
      ...defaultValues,
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...form}>{children}</FormProvider>
    </QueryClientProvider>
  );
}

const PROJECT_DETAIL_FIXTURE: BillingProjectDetail = {
  project: {
    id: 'project-1',
    code: 'PRJ-001',
    name: 'Project Alpha',
    description: null,
    currentStage: 'execution',
    currentStageName: 'Execution',
    estimatedValue: 75_000_000,
    totalValue: 100_000_000,
    actualValue: 80_000_000,
    projectStartDate: '2026-08-01',
    projectEndDate: '2026-08-31',
    tenderSubmissionDeadline: null,
    outcomeReason: null,
    isActive: true,
    statusBoqPlanning: true,
    statusBoqFinal: true,
    statusBoqExecution: true,
    isRabComplete: true,
    isLimitBudgetComplete: true,
    isCcoComplete: false,
    hasProjectHierarchy: true,
    hasProjectWarehouse: false,
    company: { id: 'company-1', name: 'PT Curva' },
    client: { id: 'client-1', name: 'PT Client' },
    createdBy: { id: 'user-1', name: 'Adi' },
    projectType: { id: 'type-1', name: 'Progress', code: 'progress' },
    workStartTime: null,
    workEndTime: null,
    workDays: [],
    startedAt: null,
    cancelledAt: null,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
    pic: { id: 'pic-1', code: 'PIC-1', name: 'Budi' },
  },
  documentRequirements: [],
  summary: {
    paidBillingPercentage: 40,
    readyToBillPercentage: 15,
    unworkedPercentage: 45,
    paidBillingAmount: 40_000_000,
    readyToBillAmount: 15_000_000,
    remainingBillingAmount: 45_000_000,
  },
  billing: {
    active: [],
    history: [],
  },
};

describe('billing create steps', () => {
  it('renders project detail data in step 1 cards', () => {
    render(
      <FormWrapper defaultValues={{ projectId: 'project-1', billingType: 'progress' }}>
        <Step1Info
          projectDetail={PROJECT_DETAIL_FIXTURE}
          handleNext={vi.fn()}
          handleCancel={vi.fn()}
        />
      </FormWrapper>
    );

    expect(screen.getByText('PT Curva')).toBeInTheDocument();
    expect(screen.getByText('Tidak Ada Tagihan')).toBeInTheDocument();
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Budi')).toBeInTheDocument();
    expect(screen.getByText(/100\.000\.000/)).toBeInTheDocument();
    expect(screen.getByText(/80\.000\.000/)).toBeInTheDocument();
  });

  it('renders empty state when progress data unavailable', () => {
    render(
      <FormWrapper>
        <Step2Progress handleBack={vi.fn()} handleNext={vi.fn()} />
      </FormWrapper>
    );

    expect(screen.getByText('Belum ada data progress.')).toBeInTheDocument();
  });

  it('renders loading state in step 2 when loading', () => {
    render(
      <FormWrapper>
        <Step2Progress isLoading handleBack={vi.fn()} handleNext={vi.fn()} />
      </FormWrapper>
    );

    expect(screen.getByText('Memuat data progress...')).toBeInTheDocument();
  });

  it('disables step 2 actions while submitting', () => {
    render(
      <FormWrapper>
        <Step2Progress isSubmitting handleBack={vi.fn()} handleNext={vi.fn()} />
      </FormWrapper>
    );

    expect(screen.getByRole('button', { name: 'Menyimpan...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Batal' })).toBeDisabled();
  });

  it('renders uploaded file list above file input area in document step', () => {
    render(
      <FormWrapper>
        <Step3Document
          billingId="billing-1"
          companyId="company-1"
          handleBack={vi.fn()}
          handleNext={vi.fn()}
        />
      </FormWrapper>
    );

    const uploadedFile = screen.getByText('Surat Tagihan.doc');
    const addMoreLabel = screen.getByText('Klik untuk Upload');

    const relation = uploadedFile.compareDocumentPosition(addMoreLabel);
    expect(relation & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('opens add account and tax modals in payment step', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ projectId: 'project-1' }}>
        <Step4Payment billingId="billing-1" companyId="company-1" handleBack={vi.fn()} />
      </FormWrapper>
    );

    await user.click(screen.getByRole('button', { name: /Tambah rekening/i }));
    expect(screen.getByText('Tambah Rekening')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close/i }));

    await user.click(screen.getByRole('checkbox', { name: 'Terapkan Pajak' }));
    await user.click(screen.getByRole('button', { name: /Tambah pajak/i }));
    expect(screen.getByText('Tambah Pajak')).toBeInTheDocument();
  });

  it('supports multiple payment methods and saves all selected methods', async () => {
    const user = userEvent.setup();
    billingPaymentDetailMock.mockReturnValue({
      data: {
        data: {
          bankAccounts: [
            {
              id: 'bank-1',
              bankName: 'BCA',
              accountNumber: '1234567890',
              accountName: 'PT Curva',
            },
          ],
          taxes: [
            {
              id: 'tax-1',
              taxTypeId: 'tax-type-1',
              taxName: 'PPN',
              percentage: 11,
              taxAmount: 11000,
            },
          ],
          paymentMethods: ['transfer'],
          summary: {
            baseAmount: 100000,
            taxAmount: 11000,
            totalAmount: 111000,
            termNumber: 1,
          },
          termNumber: 1,
        },
      },
      isLoading: false,
    });

    render(
      <FormWrapper defaultValues={{ projectId: 'project-1', paymentMethods: ['transfer'] }}>
        <Step4Payment billingId="billing-1" companyId="company-1" handleBack={vi.fn()} />
      </FormWrapper>
    );

    await user.click(screen.getByRole('checkbox', { name: 'Billyet Giro(BG)' }));
    await user.click(screen.getByRole('checkbox', { name: 'Terapkan Pajak' }));
    await user.click(screen.getByRole('button', { name: 'Save as Draft' }));

    expect(setBillingPaymentMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethods: expect.arrayContaining(['transfer', 'check']),
        bankAccounts: [
          expect.objectContaining({
            id: 'bank-1',
            bankName: 'BCA',
          }),
        ],
        taxes: undefined,
      }),
      expect.any(Object)
    );
  });

  it('shows account section only when transfer selected', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ projectId: 'project-1', paymentMethods: ['cash'] }}>
        <Step4Payment billingId="billing-1" companyId="company-1" handleBack={vi.fn()} />
      </FormWrapper>
    );

    expect(screen.queryByText('Rekening dan Virtual Account Penerima')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tambah rekening/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Transfer Bank' }));

    expect(screen.getByText('Rekening dan Virtual Account Penerima')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tambah rekening/i })).toBeInTheDocument();
  });

  it('shows tax section details only when apply tax checked', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ projectId: 'project-1', paymentMethods: ['transfer'] }}>
        <Step4Payment billingId="billing-1" companyId="company-1" handleBack={vi.fn()} />
      </FormWrapper>
    );

    expect(screen.queryByRole('button', { name: /Tambah pajak/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Terapkan Pajak' }));

    expect(screen.getByRole('button', { name: /Tambah pajak/i })).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Terapkan Pajak' }));

    expect(screen.queryByRole('button', { name: /Tambah pajak/i })).not.toBeInTheDocument();
  });

  it('omits account and tax payload when related checkbox off', async () => {
    const user = userEvent.setup();
    setBillingPaymentMutate.mockReset();
    billingPaymentDetailMock.mockReturnValue({
      data: {
        data: {
          bankAccounts: [
            {
              id: 'bank-1',
              bankName: 'BCA',
              accountNumber: '1234567890',
              accountName: 'PT Curva',
            },
          ],
          taxes: [
            {
              id: 'tax-1',
              taxTypeId: 'tax-type-1',
              taxName: 'PPN',
              percentage: 11,
              taxAmount: 11000,
            },
          ],
          paymentMethods: ['transfer'],
          summary: {
            baseAmount: 100000,
            taxAmount: 11000,
            totalAmount: 111000,
            termNumber: 1,
          },
          termNumber: 1,
        },
      },
      isLoading: false,
    });

    render(
      <FormWrapper defaultValues={{ projectId: 'project-1', paymentMethods: ['cash'] }}>
        <Step4Payment billingId="billing-1" companyId="company-1" handleBack={vi.fn()} />
      </FormWrapper>
    );

    await user.click(screen.getByRole('checkbox', { name: 'Terapkan Pajak' }));
    await user.click(screen.getByRole('button', { name: 'Save as Draft' }));

    expect(setBillingPaymentMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethods: ['cash'],
        bankAccounts: undefined,
        taxes: undefined,
      }),
      expect.any(Object)
    );

    billingPaymentDetailMock.mockReturnValue({
      data: {
        data: {
          bankAccounts: [],
          taxes: [],
          paymentMethods: ['transfer'],
          summary: {
            baseAmount: 100000,
            taxAmount: 11000,
            totalAmount: 111000,
            termNumber: 1,
          },
          termNumber: 1,
        },
      },
      isLoading: false,
    });
  });
});
