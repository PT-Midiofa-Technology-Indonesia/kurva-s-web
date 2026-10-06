import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import { CreateSkillCategoryPage } from '../CreateSkillCategoryPage';

const mockSearchParamsRef = { value: new URLSearchParams('tab=skill-category') };
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParamsRef.value,
}));

describe('CreateSkillCategoryPage Integration', () => {
  it('renders skill catalog page when tab is skill', () => {
    mockSearchParamsRef.value = new URLSearchParams('tab=skill');
    render(<CreateSkillCategoryPage />);
    expect(screen.getByText('Buat Skill Catalog Baru')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    mockSearchParamsRef.value = new URLSearchParams('tab=skill-category');
    render(<CreateSkillCategoryPage />);
  });

  it('displays page title', () => {
    render(<CreateSkillCategoryPage />);
    expect(screen.getByText('Buat Skill Category Baru')).toBeInTheDocument();
  });

  it('displays form fields', () => {
    render(<CreateSkillCategoryPage />);
    expect(screen.getByText(/Kode/i)).toBeInTheDocument();
    expect(screen.getByText(/Nama/i)).toBeInTheDocument();
    expect(screen.getByText(/Deskripsi/i)).toBeInTheDocument();
  });

  it('displays back button', () => {
    render(<CreateSkillCategoryPage />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('displays save button', () => {
    render(<CreateSkillCategoryPage />);
    expect(screen.getByRole('button', { name: /Simpan|Save/i })).toBeInTheDocument();
  });

  it('displays cancel button', () => {
    render(<CreateSkillCategoryPage />);
    expect(screen.getByRole('button', { name: /Batal|Cancel/i })).toBeInTheDocument();
  });
});
