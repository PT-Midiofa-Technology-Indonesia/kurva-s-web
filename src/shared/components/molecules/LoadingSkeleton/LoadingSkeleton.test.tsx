import { render } from '@/shared/utils/test-utils';
import { LoadingSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders line variant by default', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('rounded-md');
  });

  it('renders multiple lines in paragraph variant', () => {
    const { container } = render(<LoadingSkeleton variant="paragraph" count={3} />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons).toHaveLength(3);
  });

  it('renders paragraph with custom count', () => {
    const { container } = render(<LoadingSkeleton variant="paragraph" count={5} />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons).toHaveLength(5);
  });

  it('renders card variant', () => {
    const { container } = render(<LoadingSkeleton variant="card" />);
    const card = container.querySelector('.border.rounded-lg');
    expect(card).toBeInTheDocument();
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders table-row variant', () => {
    const { container } = render(<LoadingSkeleton variant="table-row" />);
    const row = container.querySelector('tr');
    expect(row).toBeInTheDocument();
    const cells = container.querySelectorAll('td');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('renders circle variant', () => {
    const { container } = render(<LoadingSkeleton variant="circle" />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('applies custom width and height', () => {
    const { container } = render(<LoadingSkeleton width={100} height={50} />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSkeleton className="custom-class" />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toHaveClass('custom-class');
  });
});
