import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CollapsibleFormCard } from './CollapsibleFormCard';

describe('CollapsibleFormCard', () => {
  it('renders the title and children when defaultOpen is true (default)', () => {
    render(
      <CollapsibleFormCard title="Purchase Order">
        <div>content</div>
      </CollapsibleFormCard>
    );
    expect(screen.getByText('Purchase Order')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('hides children when defaultOpen is false', () => {
    render(
      <CollapsibleFormCard title="Purchase Order" defaultOpen={false}>
        <div>content</div>
      </CollapsibleFormCard>
    );
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('toggles children visibility when the header is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CollapsibleFormCard title="Purchase Order" defaultOpen={false}>
        <div>content</div>
      </CollapsibleFormCard>
    );
    expect(screen.queryByText('content')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Purchase Order' }));
    expect(screen.getByText('content')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Purchase Order' }));
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('the header button has type="button" so it never submits a parent form', () => {
    render(
      <CollapsibleFormCard title="Purchase Order">
        <div>content</div>
      </CollapsibleFormCard>
    );
    expect(screen.getByRole('button', { name: 'Purchase Order' })).toHaveAttribute(
      'type',
      'button'
    );
  });
});
