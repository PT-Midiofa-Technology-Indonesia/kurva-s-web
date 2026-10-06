import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';

import { APPROVAL_REQUEST_LABELS } from '../../constants';
import { ApprovalRequestDetailPage } from '../ApprovalRequestDetailPage';

const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack }),
  usePathname: () => '/approval-management/approval-request/ar-001',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ approvalRequestId: TEST_ID }),
}));

const TEST_ID = 'ar-001';

describe('ApprovalRequestDetailPage Integration', () => {
  afterEach(() => {
    mockBack.mockClear();
  });

  it('renders without crashing', () => {
    render(<ApprovalRequestDetailPage />);
  });

  it('displays page title', async () => {
    render(<ApprovalRequestDetailPage />);
    await waitFor(() => {
      expect(
        screen.getAllByText(APPROVAL_REQUEST_LABELS.DETAIL.PAGE_TITLE).length
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays submission info section heading', async () => {
    render(<ApprovalRequestDetailPage />);
    await waitFor(() => {
      expect(
        screen.getByText(APPROVAL_REQUEST_LABELS.DETAIL.SECTIONS.SUBMISSION_INFO)
      ).toBeInTheDocument();
    });
  });

  it('displays requestor name and department', async () => {
    render(<ApprovalRequestDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Operasional')).toBeInTheDocument();
    });
  });

  it('displays workflow name in submission info', async () => {
    render(<ApprovalRequestDetailPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Penambahan Karyawan Baru').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays current step and company data from detail response', async () => {
    render(<ApprovalRequestDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('PT Maju Jaya Lancar Satu')).toBeInTheDocument();
      expect(screen.getByText('Step 01/02 - Persetujuan HR Manager')).toBeInTheDocument();
    });
  });

  it('displays history approval section', async () => {
    render(<ApprovalRequestDetailPage />);
    await waitFor(() => {
      expect(screen.getByText(APPROVAL_REQUEST_LABELS.DETAIL.SECTIONS.HISTORY)).toBeInTheDocument();
    });
  });

  it('shows Reject and Approve buttons when status is in_progress', async () => {
    render(<ApprovalRequestDetailPage />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: APPROVAL_REQUEST_LABELS.DETAIL.BUTTONS.REJECT })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: APPROVAL_REQUEST_LABELS.DETAIL.BUTTONS.APPROVE })
      ).toBeInTheDocument();
    });
  });

  it('hides Reject and Approve buttons when status is approved', async () => {
    server.use(
      http.get(getApiPath('/approval-requests/:id'), () => {
        return HttpResponse.json({
          success: true,
          message: 'OK',
          data: {
            id: TEST_ID,
            code: 'AR001',
            status: 'approved',
            currentStepOrder: 2,
            workflow: { id: 'wf-001', name: 'Penambahan Karyawan Baru', code: 'WF001' },
            company: { id: 'company-001', name: 'PT Maju Jaya Lancar Satu' },
            requestor: { id: 'user-001', name: 'Admin', department: 'Operasional' },
            finalDecider: null,
            waktuPengajuanFormatted: '12 Juni 2026 05:47 WIB',
            payload: { name: 'Anisa Liliandari' },
            steps: [],
            histories: [],
          },
        });
      })
    );

    render(<ApprovalRequestDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('PT Maju Jaya Lancar Satu')).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('button', { name: APPROVAL_REQUEST_LABELS.DETAIL.BUTTONS.REJECT })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: APPROVAL_REQUEST_LABELS.DETAIL.BUTTONS.APPROVE })
    ).not.toBeInTheDocument();
  });

  it('opens reject drawer when Reject button is clicked', async () => {
    const user = userEvent.setup();
    render(<ApprovalRequestDetailPage />);

    const rejectButton = await screen.findByRole('button', {
      name: APPROVAL_REQUEST_LABELS.DETAIL.BUTTONS.REJECT,
    });
    await user.click(rejectButton);

    await waitFor(() => {
      expect(
        screen.getAllByText(APPROVAL_REQUEST_LABELS.REJECT_DRAWER.TITLE).length
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByPlaceholderText(APPROVAL_REQUEST_LABELS.REJECT_DRAWER.REASON_PLACEHOLDER)
      ).toBeInTheDocument();
    });
  });

  it('shows validation error in reject drawer when comment is empty', async () => {
    const user = userEvent.setup();
    render(<ApprovalRequestDetailPage />);

    const rejectButton = await screen.findByRole('button', {
      name: APPROVAL_REQUEST_LABELS.DETAIL.BUTTONS.REJECT,
    });
    await user.click(rejectButton);

    const submitButton = await screen.findByRole('button', {
      name: APPROVAL_REQUEST_LABELS.REJECT_DRAWER.SUBMIT,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Alasan wajib diisi')).toBeInTheDocument();
    });
  });

  it('submits reject successfully', async () => {
    const user = userEvent.setup();
    render(<ApprovalRequestDetailPage />);

    const rejectButton = await screen.findByRole('button', {
      name: APPROVAL_REQUEST_LABELS.DETAIL.BUTTONS.REJECT,
    });
    await user.click(rejectButton);

    const textarea = await screen.findByPlaceholderText(
      APPROVAL_REQUEST_LABELS.REJECT_DRAWER.REASON_PLACEHOLDER
    );
    await user.type(textarea, 'Dokumen tidak lengkap.');

    const submitButton = await screen.findByRole('button', {
      name: APPROVAL_REQUEST_LABELS.REJECT_DRAWER.SUBMIT,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Pengajuan berhasil ditolak/i)).toBeInTheDocument();
    });
  });

  it('calls approve API when Approve button is clicked', async () => {
    const user = userEvent.setup();
    render(<ApprovalRequestDetailPage />);

    const approveButton = await screen.findByRole('button', {
      name: APPROVAL_REQUEST_LABELS.DETAIL.BUTTONS.APPROVE,
    });
    await user.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText(/Pengajuan berhasil disetujui/i)).toBeInTheDocument();
    });
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<ApprovalRequestDetailPage />);

    const backButton = await screen.findByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('shows not found message when API returns error', async () => {
    server.use(
      http.get(getApiPath('/approval-requests/:id'), () => {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      })
    );

    render(<ApprovalRequestDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(APPROVAL_REQUEST_LABELS.DETAIL.NOT_FOUND)).toBeInTheDocument();
    });
  });

  it('shows error toast when reject API fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(getApiPath('/approval-requests/:id/reject'), () => {
        return HttpResponse.json(
          { success: false, message: 'Gagal menolak pengajuan.', data: null, errorCode: 'ERROR' },
          { status: 422 }
        );
      })
    );

    render(<ApprovalRequestDetailPage />);

    const rejectButton = await screen.findByRole('button', {
      name: APPROVAL_REQUEST_LABELS.DETAIL.BUTTONS.REJECT,
    });
    await user.click(rejectButton);

    const textarea = await screen.findByPlaceholderText(
      APPROVAL_REQUEST_LABELS.REJECT_DRAWER.REASON_PLACEHOLDER
    );
    await user.type(textarea, 'Alasan penolakan');

    const submitButton = await screen.findByRole('button', {
      name: APPROVAL_REQUEST_LABELS.REJECT_DRAWER.SUBMIT,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Gagal menolak pengajuan/i)).toBeInTheDocument();
    });
  });

  it('renders cost breakdown section when detail contains costBreakdown', async () => {
    server.use(
      http.get(getApiPath('/approval-requests/:id'), () => {
        return HttpResponse.json({
          success: true,
          message: 'OK',
          data: {
            id: TEST_ID,
            code: 'AR090',
            status: 'in_progress',
            currentStepOrder: 1,
            approvableType: 'purchase_order',
            approvableId: 'po-001',
            workflow: { id: 'wf-po', name: 'Approval PO Flow', code: 'PO_FLOW' },
            company: { id: 'company-001', name: 'PT WIW Konstruksi Nusantara' },
            requestor: { id: 'user-001', name: 'Admin', department: 'Project Operations' },
            finalDecider: null,
            waktuPengajuanFormatted: '11 September 2026 22:06 WIB',
            payload: { po_code: 'PO/2026/0012' },
            steps: [],
            histories: [],
            detail: {
              type: 'purchase_order',
              title: 'Approval PO - PO/2026/0012',
              summary: [
                { label: 'Kode PO', value: 'PO/2026/0012', format: 'text' },
                { label: 'Total Nominal', value: 200, format: 'currency' },
              ],
              table: {
                columns: [
                  { label: 'No', format: 'text' },
                  { label: 'Item Barang', format: 'text' },
                  { label: 'Total', format: 'currency' },
                ],
                rows: [[1, 'Bata Merah', 200]],
              },
              costBreakdown: {
                title: 'RINCIAN NILAI',
                dpp: 200,
                taxAmount: 18,
                totalPayable: 218,
                taxes: [
                  {
                    id: 'tax-1',
                    name: 'Pajak Pertambahan Nilai',
                    rate: 11,
                    label: 'Pajak Pertambahan Nilai 11%',
                    amount: 22,
                    effect: 'ADDITION',
                  },
                  {
                    id: 'tax-2',
                    name: 'PPh 23',
                    rate: 2,
                    label: 'PPh 23 (2%)',
                    amount: 4,
                    effect: 'DEDUCTION',
                  },
                ],
              },
            },
          },
        });
      })
    );

    render(<ApprovalRequestDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('RINCIAN NILAI')).toBeInTheDocument();
      expect(screen.getByText('DPP (Nilai Sebelum Pajak)')).toBeInTheDocument();
      expect(screen.getByText('Pajak Pertambahan Nilai 11%')).toBeInTheDocument();
      expect(screen.getByText('PPh 23 (2%)')).toBeInTheDocument();
      expect(screen.getByText('- Rp 4')).toBeInTheDocument();
      expect(screen.getByText('Total Dibayarkan ke Vendor')).toBeInTheDocument();
      expect(screen.getAllByText('Rp 200').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Rp 22')).toBeInTheDocument();
      expect(screen.getByText('Rp 218')).toBeInTheDocument();
    });
  });
});
