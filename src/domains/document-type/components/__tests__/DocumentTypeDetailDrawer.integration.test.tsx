import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { DOCUMENT_TYPE_LABELS } from '../../constants';
import { useDocumentType } from '../../hooks/use-document-type';
import type { DocumentType } from '../../types';
import { DocumentTypeDetailDrawer } from '../DocumentTypeDetailDrawer';

const mockDocumentType: DocumentType = {
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

const mockMutate = vi.fn();
vi.mock('../../hooks/use-document-type', () => ({
  useDocumentType: vi.fn(),
}));
vi.mock('../../hooks/use-update-document-type', () => ({
  useUpdateDocumentType: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}));

function setupMocks(data: DocumentType | null = mockDocumentType) {
  vi.mocked(useDocumentType).mockReturnValue({
    data,
    isLoading: false,
  } as ReturnType<typeof useDocumentType>);
}

describe('DocumentTypeDetailDrawer Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutate.mockReset();
    setupMocks();
  });

  it('renders nothing when open is false', () => {
    render(<DocumentTypeDetailDrawer open={false} onClose={() => {}} id={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders document type data when open is true', async () => {
    render(<DocumentTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      expect(screen.getByText(DOCUMENT_TYPE_LABELS.DETAIL.PAGE_TITLE)).toBeInTheDocument();
      expect(screen.getByText('DOC-001')).toBeInTheDocument();
      expect(screen.getByText('Kartu Tanda Penduduk')).toBeInTheDocument();
      expect(screen.getByText('Dokumen identitas diri')).toBeInTheDocument();
    });
  });

  it('renders file type badges from allowedFileTypes', async () => {
    render(<DocumentTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      expect(screen.getByText('pdf')).toBeInTheDocument();
      expect(screen.getByText('jpg')).toBeInTheDocument();
      expect(screen.getByText('png')).toBeInTheDocument();
    });
  });

  it('shows active status by default', async () => {
    render(<DocumentTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      expect(screen.getByText(DOCUMENT_TYPE_LABELS.DETAIL.STATUS_ACTIVE)).toBeInTheDocument();
    });
  });

  it('shows inactive status when document type is inactive', async () => {
    vi.mocked(useDocumentType).mockReturnValue({
      data: { ...mockDocumentType, isActive: false },
      isLoading: false,
    } as ReturnType<typeof useDocumentType>);

    render(<DocumentTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      expect(screen.getByText(DOCUMENT_TYPE_LABELS.DETAIL.STATUS_INACTIVE)).toBeInTheDocument();
    });
  });

  it('opens confirm dialog when status switch is toggled', async () => {
    render(<DocumentTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(
      screen.getByText(DOCUMENT_TYPE_LABELS.DETAIL.DIALOG.CHANGE_STATUS_TITLE)
    ).toBeInTheDocument();
  });

  it('calls mutate with new status on confirm', async () => {
    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.();
    });

    render(<DocumentTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('switch'));

    const confirmButton = screen.getByRole('button', {
      name: DOCUMENT_TYPE_LABELS.DETAIL.DIALOG.CHANGE_STATUS_CONFIRM,
    });
    fireEvent.click(confirmButton);

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
      expect.any(Object)
    );
  });

  it('closes confirm dialog on cancel', async () => {
    render(<DocumentTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('switch'));

    expect(
      screen.getByText(DOCUMENT_TYPE_LABELS.DETAIL.DIALOG.CHANGE_STATUS_TITLE)
    ).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', {
      name: DOCUMENT_TYPE_LABELS.DETAIL.DIALOG.CHANGE_STATUS_CANCEL,
    });
    fireEvent.click(cancelButton);

    expect(
      screen.queryByText(DOCUMENT_TYPE_LABELS.DETAIL.DIALOG.CHANGE_STATUS_TITLE)
    ).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<DocumentTypeDetailDrawer open={true} onClose={onClose} id="1" />);

    await waitFor(() => {
      expect(document.querySelector('[data-slot="drawer-close"]')).toBeInTheDocument();
    });

    const closeButton = document.querySelector('[data-slot="drawer-close"]')!;
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(<DocumentTypeDetailDrawer open={true} onClose={() => {}} onEdit={onEdit} id="1" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('renders fallback dash for missing fields', async () => {
    vi.mocked(useDocumentType).mockReturnValue({
      data: {
        ...mockDocumentType,
        description: null,
        code: '',
        name: '',
        allowedFileTypes: null,
        allowedFileSize: null,
      },
      isLoading: false,
    } as ReturnType<typeof useDocumentType>);

    render(<DocumentTypeDetailDrawer open={true} onClose={() => {}} id="1" />);

    await waitFor(() => {
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThanOrEqual(2);
    });
  });
});
