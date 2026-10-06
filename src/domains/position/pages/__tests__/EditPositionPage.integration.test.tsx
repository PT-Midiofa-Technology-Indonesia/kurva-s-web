import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { POSITION_LABELS } from '../../constants';
import { EditPositionPage } from '../EditPositionPage';

const mockPush = vi.fn();
const mockParams = { id: '1' };
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams,
}));

const mockPosition = {
  id: '1',
  code: 'SE',
  name: 'Software Engineer',
  level: 1,
  description: null,
  isActive: true,
  skillCatalogIds: ['161e8f36-bece-4cd8-9f6f-1513fec257e2'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockSkillCatalogsPage = {
  success: true,
  message: 'Data berhasil diambil.',
  data: [
    { id: '161e8f36-bece-4cd8-9f6f-1513fec257e2', code: 'SK001', name: 'Welding', isActive: true },
    {
      id: '271e8f36-bece-4cd8-9f6f-1513fec257e3',
      code: 'SK002',
      name: 'Electrical',
      isActive: true,
    },
  ],
  meta: { currentPage: 1, lastPage: 1, perPage: 10, total: 2 },
};

describe('EditPositionPage Integration', () => {
  beforeEach(() => {
    mockParams.id = '1';
    server.use(
      http.get(getApiPath('/positions/:id'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Data berhasil diambil.',
          data: mockPosition,
        });
      }),
      http.get(getApiPath('/skill-catalogs'), () => {
        return HttpResponse.json(mockSkillCatalogsPage);
      })
    );
  });

  it('renders and loads position data', async () => {
    render(<EditPositionPage />);

    expect(await screen.findByText(POSITION_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue('SE')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
    });
  });

  it('handles successful update', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath('/positions/:id'), async ({ request }) => {
        const body = (await request.json()) as any;
        return HttpResponse.json({
          success: true,
          message: 'Updated successfully',
          data: {
            ...mockPosition,
            name: 'Senior Software Engineer',
            skillCatalogIds: body.skillCatalogIds,
          },
        });
      })
    );

    render(<EditPositionPage />);

    const nameInput = await screen.findByDisplayValue('Software Engineer');
    await user.clear(nameInput);
    await user.type(nameInput, 'Senior Software Engineer');

    const saveButton = screen.getByRole('button', { name: POSITION_LABELS.EDIT.BUTTONS.SAVE });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: POSITION_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/master-data/position');
    });
  });

  it('shows not-found message when position does not exist', async () => {
    server.use(
      http.get(getApiPath('/positions/:id'), () => {
        return HttpResponse.json({ message: 'Position tidak ditemukan' }, { status: 404 });
      })
    );

    mockParams.id = '999';
    render(<EditPositionPage />);

    await waitFor(() => {
      expect(screen.getByText(POSITION_LABELS.EDIT.NOT_FOUND)).toBeInTheDocument();
    });
  });

  it('shows toast error when update fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath('/positions/:id'), () => {
        return HttpResponse.json({ message: 'Update failed' }, { status: 400 });
      })
    );

    render(<EditPositionPage />);

    await screen.findByDisplayValue('Software Engineer');

    const saveButton = screen.getByRole('button', { name: POSITION_LABELS.EDIT.BUTTONS.SAVE });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: POSITION_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<EditPositionPage />);

    await screen.findByDisplayValue('Software Engineer');

    const cancelButton = screen.getByRole('button', { name: POSITION_LABELS.EDIT.BUTTONS.CANCEL });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/master-data/position');
  });
});
