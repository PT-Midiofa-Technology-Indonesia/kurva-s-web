import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { DOCUMENT_TYPE_LABELS } from '../../constants';
import { CreateDocumentTypePage } from '../CreateDocumentTypePage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/master-data/document/create',
  useSearchParams: () => new URLSearchParams(),
}));

function getFileTypeCheckbox(label: string) {
  return screen.getByText(label).closest('label')?.parentElement?.querySelector('button');
}

describe('CreateDocumentTypePage Integration', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the page title', () => {
    render(<CreateDocumentTypePage />);
    expect(screen.getByText(DOCUMENT_TYPE_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('renders the back button', () => {
    render(<CreateDocumentTypePage />);
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
  });

  it('navigates back when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateDocumentTypePage />);

    const cancelButton = await screen.findByRole('button', {
      name: DOCUMENT_TYPE_LABELS.CREATE.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/master-data/document?tab=document-type');
  });

  it('handles successful creation flow', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(getApiPath('/document-types'), () =>
        HttpResponse.json({
          success: true,
          message: 'Created',
          data: { id: '1' },
        })
      )
    );

    render(<CreateDocumentTypePage />);

    const codeInput = await screen.findByLabelText(/Kode/i);
    const nameInput = screen.getByLabelText(/Nama/i);
    const fileSizeInput = screen.getByLabelText(/Maks Ukuran File/i);

    await user.type(codeInput, 'DOC-100');
    await user.type(nameInput, 'Surat Kontrak');
    await user.clear(fileSizeInput);
    await user.type(fileSizeInput, '5120');

    await user.click(getFileTypeCheckbox('.pdf')!);
    await user.click(getFileTypeCheckbox('.docx')!);

    const saveButton = screen.getByRole('button', {
      name: DOCUMENT_TYPE_LABELS.CREATE.BUTTONS.SAVE,
    });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: DOCUMENT_TYPE_LABELS.CREATE.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/master-data/document?tab=document-type');
    });
  });
});
