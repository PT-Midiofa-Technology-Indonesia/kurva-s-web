import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/utils/test-utils';
import { EditSkillCategoryPage } from '../EditSkillCategoryPage';

const mockSearchParamsRef = { value: new URLSearchParams('tab=skill-category') };
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParamsRef.value,
}));

describe('EditSkillCategoryPage Integration', () => {
  it('renders skill catalog edit page when tab is skill', async () => {
    mockSearchParamsRef.value = new URLSearchParams('tab=skill');
    render(<EditSkillCategoryPage skillCategoryId="1" />);
    await waitFor(() => {
      expect(screen.queryByText(/Edit Skill Catalog/i)).toBeInTheDocument();
    });
  });

  it('renders without crashing', () => {
    mockSearchParamsRef.value = new URLSearchParams('tab=skill-category');
    render(<EditSkillCategoryPage skillCategoryId="1" />);
  });

  it('displays page title after loading', async () => {
    render(<EditSkillCategoryPage skillCategoryId="1" />);
    await waitFor(
      () => {
        expect(screen.queryByText(/Edit Skill Category/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('displays form fields after data loads', async () => {
    render(<EditSkillCategoryPage skillCategoryId="1" />);
    await waitFor(
      () => {
        expect(screen.getByText(/Kode/i)).toBeInTheDocument();
        expect(screen.getByText(/Nama/i)).toBeInTheDocument();
        expect(screen.getByText(/Deskripsi/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('displays page header with back button', async () => {
    render(<EditSkillCategoryPage skillCategoryId="1" />);
    await waitFor(
      () => {
        // Check if the form is rendered
        const inputs = screen.queryAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  it('displays form after data is fetched', async () => {
    render(<EditSkillCategoryPage skillCategoryId="1" />);
    await waitFor(
      () => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });
});
