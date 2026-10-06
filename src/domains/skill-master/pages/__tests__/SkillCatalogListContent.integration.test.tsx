import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@/utils/test-utils';
import { SkillCatalogListContent } from '../SkillCatalogListContent';

describe('SkillCatalogListContent Integration', () => {
  it('renders without crashing', () => {
    render(<SkillCatalogListContent />);
  });

  it('displays Skill Catalog title', async () => {
    render(<SkillCatalogListContent />);
    await waitFor(() => {
      expect(screen.getByText('Skill Catalog')).toBeInTheDocument();
    });
  });

  it('displays add button with correct label', async () => {
    render(<SkillCatalogListContent />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Tambah Skill Catalog Baru/i })
      ).toBeInTheDocument();
    });
  });

  it('displays mock data from API', async () => {
    render(<SkillCatalogListContent />);
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('displays search bar', async () => {
    render(<SkillCatalogListContent />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });
});
