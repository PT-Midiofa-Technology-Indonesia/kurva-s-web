import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { BOQFinalPage } from '../BOQFinalDetailPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/project-control/boq-management/proj-001/detail',
  useSearchParams: () => new URLSearchParams('tab=final'),
}));

describe('BOQFinalDetailPage Integration', () => {
  it('renders UoM name from API uom object in tree table', async () => {
    render(<BOQFinalPage projectId="proj-001" initialTab="final" />);

    // leaf node name first
    await waitFor(() => {
      expect(screen.getByText('Pondasi')).toBeInTheDocument();
    });

    // UoM cell maps item.uom.name (BE sends uom object, not uomName)
    expect(screen.getByText('Meter')).toBeInTheDocument();
  });

  it('renders page header with BOQ Final title after loading', async () => {
    render(<BOQFinalPage projectId="proj-001" initialTab="final" />);

    await waitFor(() => {
      expect(screen.getByText('BOQ Final')).toBeInTheDocument();
    });
  });
});
