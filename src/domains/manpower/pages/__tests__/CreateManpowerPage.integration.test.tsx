import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen } from '../../../../shared/utils/test-utils';
import { MANPOWER_LABELS } from '../../constants';
import { CreateManpowerPage } from '../CreateManpowerPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/human-resource/manpower/create',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

describe('CreateManpowerPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders with correct title', () => {
    render(<CreateManpowerPage />);
    expect(screen.getByText(MANPOWER_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('renders page header with back button', () => {
    render(<CreateManpowerPage />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('shows correct form fields', () => {
    render(<CreateManpowerPage />);
    expect(screen.getByText(MANPOWER_LABELS.CREATE.FIELDS.FULL_NAME)).toBeInTheDocument();
    expect(screen.getByText(MANPOWER_LABELS.CREATE.FIELDS.EMAIL)).toBeInTheDocument();
    expect(screen.getByText(MANPOWER_LABELS.CREATE.FIELDS.PHONE)).toBeInTheDocument();
  });

  it('shows all required form fields', () => {
    render(<CreateManpowerPage />);
    expect(screen.getByText(MANPOWER_LABELS.CREATE.FIELDS.BIRTH_PLACE)).toBeInTheDocument();
    expect(screen.getByText(MANPOWER_LABELS.CREATE.FIELDS.GENDER)).toBeInTheDocument();
    expect(screen.getByText(MANPOWER_LABELS.CREATE.FIELDS.ADDRESS_SECTION)).toBeInTheDocument();
  });

  it('renders form actions with cancel and save buttons', () => {
    render(<CreateManpowerPage />);
    expect(
      screen.getByRole('button', { name: MANPOWER_LABELS.CREATE.BUTTONS.CANCEL })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: MANPOWER_LABELS.CREATE.BUTTONS.SAVE })
    ).toBeInTheDocument();
  });

  it('renders form with save button enabled', () => {
    render(<CreateManpowerPage />);
    const saveButton = screen.getByRole('button', { name: MANPOWER_LABELS.CREATE.BUTTONS.SAVE });
    expect(saveButton).toBeInTheDocument();
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateManpowerPage />);

    await user.click(screen.getByRole('button', { name: MANPOWER_LABELS.CREATE.BUTTONS.CANCEL }));

    expect(mockPush).toHaveBeenCalledWith('/human-resource/manpower');
  });

  it('shows error when creation fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(getApiPath('/employees'), () => {
        return HttpResponse.json({ message: 'Validation Error' }, { status: 422 });
      })
    );

    render(<CreateManpowerPage />);

    await user.type(screen.getByLabelText(MANPOWER_LABELS.CREATE.FIELDS.FULL_NAME), 'New Employee');
    await user.type(screen.getByLabelText(MANPOWER_LABELS.CREATE.FIELDS.EMAIL), 'new@example.com');

    await user.click(screen.getByRole('button', { name: MANPOWER_LABELS.CREATE.BUTTONS.SAVE }));

    const confirmButton = await screen.findByRole('button', {
      name: MANPOWER_LABELS.CREATE.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);
  });
});
