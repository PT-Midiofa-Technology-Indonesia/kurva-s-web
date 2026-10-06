import { describe, it } from 'vitest';
import { render } from '@/utils/test-utils';
import { ServerErrorPage } from '../ServerErrorPage';

describe('ServerErrorPage Integration', () => {
  it('renders without crashing', () => {
    render(<ServerErrorPage />);
  });
});
