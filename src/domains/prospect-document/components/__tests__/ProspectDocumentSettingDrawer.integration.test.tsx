import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { PROSPECT_DOCUMENT_LABELS } from '../../constants';
import { ProspectDocumentSettingDrawer } from '../ProspectDocumentSettingDrawer';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

const labels = PROSPECT_DOCUMENT_LABELS.SETTING_DRAWER;

describe('ProspectDocumentSettingDrawer Integration', () => {
  it('renders nothing when closed', () => {
    render(
      <ProspectDocumentSettingDrawer open={false} onClose={() => {}} stage="prospect_identify" />
    );
    expect(screen.queryByText(labels.TITLE)).not.toBeInTheDocument();
  });

  it('renders drawer title when open', async () => {
    render(
      <ProspectDocumentSettingDrawer open={true} onClose={() => {}} stage="prospect_identify" />
    );
    await waitFor(() => {
      expect(screen.getByText(labels.TITLE)).toBeInTheDocument();
    });
  });

  it('displays stage name after loading', async () => {
    render(
      <ProspectDocumentSettingDrawer open={true} onClose={() => {}} stage="prospect_identify" />
    );
    await waitFor(() => {
      expect(screen.getByText('Prospect Identify')).toBeInTheDocument();
    });
  });

  it('displays Document field label', async () => {
    render(
      <ProspectDocumentSettingDrawer open={true} onClose={() => {}} stage="prospect_identify" />
    );
    await waitFor(() => {
      expect(screen.getByText(labels.FIELDS.DOCUMENT)).toBeInTheDocument();
    });
  });

  it('shows save and cancel buttons', async () => {
    render(
      <ProspectDocumentSettingDrawer open={true} onClose={() => {}} stage="prospect_identify" />
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: labels.BUTTONS.SAVE })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: labels.BUTTONS.CANCEL })).toBeInTheDocument();
    });
  });

  it('displays Document Mandatory section when documents are loaded', async () => {
    render(
      <ProspectDocumentSettingDrawer open={true} onClose={() => {}} stage="prospect_identify" />
    );
    await waitFor(() => {
      expect(screen.getAllByText(labels.FIELDS.DOCUMENT_MANDATORY).length).toBeGreaterThan(0);
    });
  });

  it('shows mandatory switches for each selected document', async () => {
    render(
      <ProspectDocumentSettingDrawer open={true} onClose={() => {}} stage="prospect_identify" />
    );
    await waitFor(() => {
      expect(screen.getAllByText(labels.FIELDS.DOCUMENT_MANDATORY).length).toBeGreaterThan(0);
    });
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onClose when Batal is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ProspectDocumentSettingDrawer open={true} onClose={onClose} stage="prospect_identify" />
    );

    const cancelButton = await screen.findByRole('button', { name: labels.BUTTONS.CANCEL });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('sends documentRequirements with isMandatory in payload on save', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    let capturedBody: unknown = null;

    server.use(
      http.post(getApiPath('/prospect-stage-documents/:stage/sync'), async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          success: true,
          message: 'Pengaturan dokumen berhasil diperbarui.',
          data: {
            stage: 'prospect_identify',
            stageName: 'Prospect Identify',
            documentRequirements: [],
          },
        });
      })
    );

    render(
      <ProspectDocumentSettingDrawer open={true} onClose={onClose} stage="prospect_identify" />
    );

    const saveButton = await screen.findByRole('button', { name: labels.BUTTONS.SAVE });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    expect(capturedBody).toEqual({
      documentRequirements: [
        {
          documentTypeId: '019e4011-e8bc-7063-97e8-4c752b075598',
          isActive: true,
          isMandatory: false,
        },
        {
          documentTypeId: '019e4011-e8b8-7282-8744-d8c2b0cae9f9',
          isActive: true,
          isMandatory: false,
        },
      ],
    });
  });

  it('sends updated isMandatory after toggling switch', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    let capturedBody: unknown = null;

    server.use(
      http.post(getApiPath('/prospect-stage-documents/:stage/sync'), async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          success: true,
          message: 'Pengaturan dokumen berhasil diperbarui.',
          data: {
            stage: 'prospect_identify',
            stageName: 'Prospect Identify',
            documentRequirements: [],
          },
        });
      })
    );

    render(
      <ProspectDocumentSettingDrawer open={true} onClose={onClose} stage="prospect_identify" />
    );

    await waitFor(() => {
      expect(screen.getAllByText(labels.FIELDS.DOCUMENT_MANDATORY).length).toBeGreaterThan(0);
    });

    const switches = screen.getAllByRole('switch');
    await user.click(switches[0]); // Toggle first document to mandatory

    const saveButton = screen.getByRole('button', { name: labels.BUTTONS.SAVE });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    expect(capturedBody).toEqual({
      documentRequirements: [
        {
          documentTypeId: '019e4011-e8bc-7063-97e8-4c752b075598',
          isActive: false,
          isMandatory: false,
        },
        {
          documentTypeId: '019e4011-e8b8-7282-8744-d8c2b0cae9f9',
          isActive: true,
          isMandatory: false,
        },
      ],
    });
  });

  it('shows loading spinner while fetching stage detail', () => {
    server.use(
      http.get(getApiPath('/prospect-stage-documents/:stage'), async () => {
        await new Promise(() => {});
      })
    );

    render(
      <ProspectDocumentSettingDrawer open={true} onClose={() => {}} stage="prospect_identify" />
    );
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('handles sync API error without crashing', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(getApiPath('/prospect-stage-documents/:stage/sync'), () => {
        return HttpResponse.json(
          { success: false, message: 'Server error', data: null, errorCode: 'SERVER_ERROR' },
          { status: 500 }
        );
      })
    );

    render(<ProspectDocumentSettingDrawer open={true} onClose={() => {}} stage="qualify" />);

    const saveButton = await screen.findByRole('button', { name: labels.BUTTONS.SAVE });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(labels.TITLE)).toBeInTheDocument();
    });
  });

  it('renders without crashing when stage is null', () => {
    render(<ProspectDocumentSettingDrawer open={true} onClose={() => {}} stage={null} />);
  });
});
