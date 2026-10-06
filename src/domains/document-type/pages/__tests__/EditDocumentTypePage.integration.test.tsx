import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { DOCUMENT_TYPE_LABELS } from '../../constants';
import { EditDocumentTypePage } from '../EditDocumentTypePage';

const mockPush = vi.fn();
const mockParams = { id: '1' };
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => mockParams,
  usePathname: () => '/master-data/document/1/edit',
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

describe('EditDocumentTypePage Integration', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockParams.id = '1';
    server.use(
      http.get(getApiPath('/document-types/:id'), () =>
        HttpResponse.json({
          success: true,
          message: 'OK',
          data: sampleDocumentType,
        })
      )
    );
  });

  it('renders the page title and prefilled data', async () => {
    render(<EditDocumentTypePage />);

    expect(await screen.findByText(DOCUMENT_TYPE_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue('DOC-001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Kartu Tanda Penduduk')).toBeInTheDocument();
    });
  });

  it('shows not-found state when document type does not exist', async () => {
    server.use(
      http.get(getApiPath('/document-types/99'), () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 })
      )
    );

    mockParams.id = '99';
    render(<EditDocumentTypePage />);

    await waitFor(() => {
      expect(screen.getByText(DOCUMENT_TYPE_LABELS.EDIT.NOT_FOUND)).toBeInTheDocument();
    });
  });

  it('handles successful update flow', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath('/document-types/1'), () =>
        HttpResponse.json({
          success: true,
          message: 'Updated',
          data: { ...sampleDocumentType, name: 'KTP Updated' },
        })
      )
    );

    render(<EditDocumentTypePage />);

    const nameInput = await screen.findByDisplayValue('Kartu Tanda Penduduk');
    await user.clear(nameInput);
    await user.type(nameInput, 'KTP Updated');

    const saveButton = screen.getByRole('button', {
      name: DOCUMENT_TYPE_LABELS.EDIT.BUTTONS.SAVE,
    });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: DOCUMENT_TYPE_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/master-data/document?tab=document-type');
    });
  });

  it('displays error message when update fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath('/document-types/1'), () =>
        HttpResponse.json({ message: 'Update gagal' }, { status: 400 })
      )
    );

    render(<EditDocumentTypePage />);

    await screen.findByDisplayValue('Kartu Tanda Penduduk');

    const saveButton = screen.getByRole('button', {
      name: DOCUMENT_TYPE_LABELS.EDIT.BUTTONS.SAVE,
    });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: DOCUMENT_TYPE_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Update gagal/i)).toBeInTheDocument();
    });
  });

  it('navigates back when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<EditDocumentTypePage />);

    await screen.findByDisplayValue('Kartu Tanda Penduduk');

    const cancelButton = screen.getByRole('button', {
      name: DOCUMENT_TYPE_LABELS.EDIT.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/master-data/document?tab=document-type');
  });
});
