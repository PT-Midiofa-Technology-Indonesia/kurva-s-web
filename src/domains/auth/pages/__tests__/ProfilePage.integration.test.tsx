import { describe, it } from 'vitest';
import { render } from '@/utils/test-utils';
import { ProfilePage } from '../ProfilePage';

describe('ProfilePage Integration', () => {
  it('renders without crashing', () => {
    render(<ProfilePage />);
  });
});
