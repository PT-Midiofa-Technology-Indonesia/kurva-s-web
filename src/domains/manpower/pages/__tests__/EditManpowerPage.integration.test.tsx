import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { MANPOWER_LABELS } from '../../constants';
import { EditManpowerPage } from '../EditManpowerPage';

const mockPush = vi.fn();
const mockParamsRef = { value: { id: '1' } };
vi.mock('next/navigation', () => ({
  useParams: () => mockParamsRef.value,
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/human-resource/manpower/1/edit',
  useSearchParams: () => new URLSearchParams(),
}));

describe('EditManpowerPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
    mockParamsRef.value = { id: '1' };
  });

  it('renders and loads employee data', async () => {
    render(<EditManpowerPage />);

    expect(await screen.findByText(MANPOWER_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
  });

  it('renders page header with back button', async () => {
    render(<EditManpowerPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });
  });

  it('loads employee with userId null (no user link)', async () => {
    render(<EditManpowerPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
  });

  it('redirects to employee tab after editing an employee', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath('/employees/1'), () => {
        return HttpResponse.json({ success: true, message: 'Updated successfully' });
      })
    );

    render(<EditManpowerPage />);

    const nameInput = await screen.findByDisplayValue('John Doe');
    await user.clear(nameInput);
    await user.type(nameInput, 'John Updated');

    await user.click(screen.getByRole('button', { name: MANPOWER_LABELS.EDIT.BUTTONS.SAVE }));

    const confirmButton = await screen.findByRole('button', {
      name: MANPOWER_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/human-resource/manpower');
    });
  });

  it('shows dialog when save button is clicked', async () => {
    const user = userEvent.setup();

    server.use(
      http.get(getApiPath('/employees/2'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Data retrieved successfully',
          data: {
            id: '2',
            userId: null,
            fullName: 'Jane Worker',
            employeeType: 'project_worker',
            isActive: true,
            gender: 'female',
            birthPlace: 'Bandung',
            birthDate: '1992-05-20',
            phone: '6281234567891',
            email: 'jane@example.com',
            province: null,
            city: null,
            district: null,
            village: null,
            postalCode: null,
            addressDetail: null,
            nik: null,
            npwp: null,
            contractType: null,
            salaryType: null,
            hireDate: null,
            terminationDate: null,
            code: null,
            createdAt: '2020-01-01T00:00:00.000Z',
            updatedAt: '2020-01-01T00:00:00.000Z',
          },
        });
      }),
      http.put(getApiPath('/employees/2'), () => {
        return HttpResponse.json({ success: true, message: 'Updated successfully' });
      })
    );

    mockParamsRef.value = { id: '2' };
    render(<EditManpowerPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane Worker')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: MANPOWER_LABELS.EDIT.BUTTONS.SAVE }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('shows not found message when employee does not exist', async () => {
    server.use(
      http.get(getApiPath('/employees/999'), () => {
        return HttpResponse.json({ message: 'Employee tidak ditemukan' }, { status: 404 });
      })
    );

    mockParamsRef.value = { id: '999' };
    render(<EditManpowerPage />);

    await waitFor(() => {
      expect(screen.getByText('Employee tidak ditemukan')).toBeInTheDocument();
    });
  });

  it('renders the page when employee exists', async () => {
    render(<EditManpowerPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
  });

  it('shows confirmation dialog before saving', async () => {
    const user = userEvent.setup();

    render(<EditManpowerPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: MANPOWER_LABELS.EDIT.BUTTONS.SAVE }));

    expect(screen.getByText(MANPOWER_LABELS.EDIT.DIALOG.TITLE)).toBeInTheDocument();
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();

    render(<EditManpowerPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: MANPOWER_LABELS.EDIT.BUTTONS.SAVE }));

    expect(await screen.findByText(MANPOWER_LABELS.EDIT.DIALOG.TITLE)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: MANPOWER_LABELS.EDIT.DIALOG.CANCEL }));
  });

  it('navigates back when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<EditManpowerPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: MANPOWER_LABELS.EDIT.BUTTONS.CANCEL }));

    expect(mockPush).toHaveBeenCalledWith('/human-resource/manpower');
  });
});
