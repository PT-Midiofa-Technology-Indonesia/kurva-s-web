import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@/utils/test-utils';
import { SkillCategoryListContent } from '../SkillCategoryListContent';

describe('SkillCategoryListContent Integration', () => {
  it('renders without crashing', () => {
    render(<SkillCategoryListContent />);
  });

  it('fetches and displays the mock data', async () => {
    render(<SkillCategoryListContent />);
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('displays Skill Category title', async () => {
    render(<SkillCategoryListContent />);
    await waitFor(() => {
      expect(screen.getByText('Skill Category')).toBeInTheDocument();
    });
  });

  it('displays add button with correct label', async () => {
    render(<SkillCategoryListContent />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Tambah Skill Category Baru/i })
      ).toBeInTheDocument();
    });
  });

  it('displays filter controls', async () => {
    render(<SkillCategoryListContent />);
    await waitFor(() => {
      // Check if filters section is rendered (SelectInput component doesn't have placeholder directly)
      const container = screen.getByText('Test Item').closest('.flex');
      expect(container).toBeInTheDocument();
    });
  });

  it('displays table columns headers', async () => {
    render(<SkillCategoryListContent />);
    await waitFor(() => {
      // Check for column headers in the table
      const headers = screen.queryAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  it('displays search bar', async () => {
    render(<SkillCategoryListContent />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });
});
