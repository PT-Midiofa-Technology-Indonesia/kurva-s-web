import { describe, it } from 'vitest';
import { render } from '@/utils/test-utils';
import { NotFoundPage } from '../NotFoundPage';

describe('NotFoundPage Integration', () => {
  it('renders without crashing', () => {
    render(<NotFoundPage />);
    // Add more assertions here, e.g., waiting for API mock responses
    // expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
