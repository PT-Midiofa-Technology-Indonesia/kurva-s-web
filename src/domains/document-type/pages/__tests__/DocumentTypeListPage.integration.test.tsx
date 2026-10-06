import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { DOCUMENT_TYPE_LABELS } from '../../constants';
import { DocumentTypeListPage } from '../DocumentTypeListPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/master-data/document',
  useSearchParams: () => new URLSearchParams(),
}));

const sampleDocumentType = {
  id: '1',
  code: 'DOC-001',
  name: 'Kartu Tanda Penduduk',
  description: 'Dokumen identitas diri',
  allowedFileTypes: 'pdf,jpg,png',
  allowedFileSize: 2048,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function mockListResponse(items: unknown[] = [sampleDocumentType]) {
  server.use(
    http.get(getApiPath('/document-types'), () =>
      HttpResponse.json({
        success: true,
        message: 'OK',
        data: items,
        meta: {
          page: 1,
          perPage: 10,
          totalItems: items.length,
          totalPages: 1,
        },
      })
    )
  );
}

describe('DocumentTypeListPage Integration', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the page title', async () => {
    mockListResponse();
    render(<DocumentTypeListPage />);
    expect(await screen.findByText(DOCUMENT_TYPE_LABELS.LIST.TITLE)).toBeInTheDocument();
  });

  it('renders the add button', async () => {
    mockListResponse();
    render(<DocumentTypeListPage />);
    expect(
      await screen.findByRole('button', { name: DOCUMENT_TYPE_LABELS.LIST.ADD_BUTTON })
    ).toBeInTheDocument();
  });

  it('fetches and displays the document types', async () => {
    mockListResponse();
    render(<DocumentTypeListPage />);
    await waitFor(() => {
      expect(screen.getByText('DOC-001')).toBeInTheDocument();
      expect(screen.getByText('Kartu Tanda Penduduk')).toBeInTheDocument();
    });
  });

  it('renders file types as badges', async () => {
    mockListResponse();
    render(<DocumentTypeListPage />);
    await waitFor(() => {
      expect(screen.getByText('pdf')).toBeInTheDocument();
      expect(screen.getByText('jpg')).toBeInTheDocument();
      expect(screen.getByText('png')).toBeInTheDocument();
    });
  });

  it('renders active status badge', async () => {
    mockListResponse();
    render(<DocumentTypeListPage />);
    await waitFor(() => {
      expect(screen.getByText(DOCUMENT_TYPE_LABELS.LIST.STATUS.ACTIVE)).toBeInTheDocument();
    });
  });

  it('opens detail drawer when row action is clicked', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(getApiPath('/document-types'), () =>
        HttpResponse.json({
          success: true,
          message: 'OK',
          data: [sampleDocumentType],
          meta: { page: 1, perPage: 10, totalItems: 1, totalPages: 1 },
        })
      ),
      http.get(getApiPath('/document-types/1'), () =>
        HttpResponse.json({
          success: true,
          message: 'OK',
          data: sampleDocumentType,
        })
      )
    );

    render(<DocumentTypeListPage />);

    await waitFor(() => {
      expect(screen.getByText('DOC-001')).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole('button');
    const ellipsisButton = actionButtons.find((btn) =>
      btn.querySelector('svg.lucide-ellipsis-vertical')
    );
    if (!ellipsisButton) throw new Error('Action button not found');
    await user.click(ellipsisButton);

    const detailMenuItem = await screen.findByText(DOCUMENT_TYPE_LABELS.LIST.ACTIONS.DETAIL);
    await user.click(detailMenuItem);

    await waitFor(() => {
      expect(screen.getByText(DOCUMENT_TYPE_LABELS.DETAIL.PAGE_TITLE)).toBeInTheDocument();
    });
  });

  it('handles deleting a document type via action menu', async () => {
    const user = userEvent.setup();
    server.use(
      http.delete(getApiPath('/document-types/:id'), () =>
        HttpResponse.json({ success: true, message: 'deleted' })
      )
    );
    mockListResponse();

    render(<DocumentTypeListPage />);

    await waitFor(() => {
      expect(screen.getByText('DOC-001')).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole('button');
    const ellipsisButton = actionButtons.find((btn) =>
      btn.querySelector('svg.lucide-ellipsis-vertical')
    );
    if (!ellipsisButton) throw new Error('Action button not found');
    await user.click(ellipsisButton);

    const deleteMenuItem = await screen.findByText(DOCUMENT_TYPE_LABELS.LIST.ACTIONS.DELETE);
    await user.click(deleteMenuItem);

    expect(screen.getByText(DOCUMENT_TYPE_LABELS.DIALOG.DELETE_TITLE)).toBeInTheDocument();

    const confirmButton = await screen.findByRole('button', { name: /Hapus/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText(DOCUMENT_TYPE_LABELS.DIALOG.DELETE_TITLE)).not.toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/document-types'), () =>
        HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      )
    );

    render(<DocumentTypeListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
