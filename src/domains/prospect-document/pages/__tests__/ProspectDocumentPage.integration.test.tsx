import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { mockProspectStageDocuments } from '@/mocks/domains/prospect-document';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { PROSPECT_DOCUMENT_LABELS } from '../../constants';
import { ProspectDocumentPage } from '../ProspectDocumentPage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('ProspectDocumentPage Integration', () => {
  it('renders without crashing', () => {
    render(<ProspectDocumentPage />);
  });

  it('displays page title', async () => {
    render(<ProspectDocumentPage />);
    await waitFor(() => {
      expect(screen.getByText(PROSPECT_DOCUMENT_LABELS.PAGE_TITLE)).toBeInTheDocument();
    });
  });

  it('renders table column headers', async () => {
    render(<ProspectDocumentPage />);
    await waitFor(() => {
      expect(screen.getByText(PROSPECT_DOCUMENT_LABELS.TABLE.STAGE)).toBeInTheDocument();
      expect(screen.getByText(PROSPECT_DOCUMENT_LABELS.TABLE.DOCUMENT_TYPE)).toBeInTheDocument();
      expect(screen.getByText(PROSPECT_DOCUMENT_LABELS.TABLE.ACTION)).toBeInTheDocument();
    });
  });

  it('fetches and displays stage names from API', async () => {
    render(<ProspectDocumentPage />);
    await waitFor(() => {
      expect(screen.getByText('Prospect Identify')).toBeInTheDocument();
      expect(screen.getByText('Qualify')).toBeInTheDocument();
      expect(screen.getByText('Tender Preparation')).toBeInTheDocument();
    });
  });

  it('displays document type badges for stages that have requirements', async () => {
    render(<ProspectDocumentPage />);
    await waitFor(() => {
      // NPWP appears in both Prospect Identify and Qualify rows
      expect(screen.getAllByText('NPWP').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('KTP')).toBeInTheDocument();
    });
  });

  it('shows dash for stages with no document requirements', async () => {
    render(<ProspectDocumentPage />);
    await waitFor(() => {
      const dashes = screen.getAllByText(PROSPECT_DOCUMENT_LABELS.TABLE.EMPTY_DOCUMENTS);
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  it('renders a Pengaturan button for each stage row', async () => {
    render(<ProspectDocumentPage />);
    await waitFor(() => {
      const settingButtons = screen.getAllByRole('button', {
        name: PROSPECT_DOCUMENT_LABELS.ACTION.SETTING,
      });
      expect(settingButtons).toHaveLength(mockProspectStageDocuments.length);
    });
  });

  it('opens the setting drawer when Pengaturan is clicked', async () => {
    const user = userEvent.setup();
    render(<ProspectDocumentPage />);

    const settingButtons = await screen.findAllByRole('button', {
      name: PROSPECT_DOCUMENT_LABELS.ACTION.SETTING,
    });
    await user.click(settingButtons[0]);

    // The drawer title renders as a heading — distinct from the table buttons
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: PROSPECT_DOCUMENT_LABELS.SETTING_DRAWER.TITLE })
      ).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', () => {
    server.use(
      http.get(getApiPath('/prospect-stage-documents'), async () => {
        await new Promise(() => {});
      })
    );

    render(<ProspectDocumentPage />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    server.use(
      http.get(getApiPath('/prospect-stage-documents'), () => {
        return HttpResponse.json(
          {
            success: false,
            message: 'Internal Server Error',
            data: null,
            errorCode: 'SERVER_ERROR',
          },
          { status: 500 }
        );
      })
    );

    render(<ProspectDocumentPage />);

    await waitFor(() => {
      expect(screen.queryByText('Prospect Identify')).not.toBeInTheDocument();
    });
  });
});
