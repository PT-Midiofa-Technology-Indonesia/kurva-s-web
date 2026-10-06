import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { POSITION_LABELS } from '../../constants';
import { CreatePositionPage } from '../CreatePositionPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

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

describe('CreatePositionPage Integration', () => {
  beforeEach(() => {
    server.use(
      http.get(getApiPath('/skill-catalogs'), () => {
        return HttpResponse.json(mockSkillCatalogsPage);
      })
    );
  });

  it('renders without crashing', () => {
    render(<CreatePositionPage />);
    expect(screen.getByText(POSITION_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('renders all form fields', async () => {
    render(<CreatePositionPage />);
    expect(screen.getByPlaceholderText(/Masukan kode/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Masukan nama/i)).toBeInTheDocument();
    expect(await screen.findByText(POSITION_LABELS.CREATE.FIELDS.LEVEL)).toBeInTheDocument();
    expect(screen.getByText(POSITION_LABELS.CREATE.FIELDS.SKILL_CATALOG)).toBeInTheDocument();
  });

  it('handles successful creation with skill catalogs', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(getApiPath('/positions'), async ({ request }) => {
        const body = (await request.json()) as any;
        return HttpResponse.json({
          success: true,
          message: 'Created successfully',
          data: {
            id: '1',
            code: 'D005',
            name: 'Job Position 10',
            level: 1,
            isActive: true,
            skillCatalogIds: body.skillCatalogIds,
          },
        });
      })
    );

    render(<CreatePositionPage />);

    const codeInput = screen.getByPlaceholderText(/Masukan kode/i);
    const nameInput = screen.getByPlaceholderText(/Masukan nama/i);

    await user.type(codeInput, 'D005');
    await user.type(nameInput, 'Job Position 10');

    // Select level
    const levelSelect = await screen.findByRole('combobox', { name: /Level/i });
    await user.click(levelSelect);
    await user.click(await screen.findByRole('option', { name: /Level 1/i }));

    // Select status
    const statusSelect = screen.getByRole('combobox', { name: /Status/i });
    await user.click(statusSelect);
    await user.click(await screen.findByRole('option', { name: /^Aktif$/i }));

    // Select skill catalog
    const skillSelect = screen.getByRole('combobox', { name: /Katalog Skill/i });
    await user.click(skillSelect);
    await user.click(await screen.findByRole('option', { name: /SK001 - Welding/i }));

    const saveButton = screen.getByRole('button', {
      name: POSITION_LABELS.CREATE.BUTTONS.SAVE,
    });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: POSITION_LABELS.CREATE.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/master-data/position');
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CreatePositionPage />);

    const cancelButton = screen.getByRole('button', {
      name: POSITION_LABELS.CREATE.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/master-data/position');
  });

  it('shows validation error when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<CreatePositionPage />);

    const saveButton = screen.getByRole('button', {
      name: POSITION_LABELS.CREATE.BUTTONS.SAVE,
    });

    // Button should be disabled with empty required fields
    expect(saveButton).toBeDisabled();

    // Typing and clearing triggers validation messages
    const codeInput = screen.getByPlaceholderText(/Masukan kode/i);
    await user.type(codeInput, 'x');
    await user.clear(codeInput);

    await waitFor(() => {
      expect(screen.getByText(/Kode wajib diisi/i)).toBeInTheDocument();
    });
  });
});
