import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/shared/utils/test-utils';
import { CostRequestItemAccordionList } from '../CostRequestItemAccordionList';

describe('CostRequestItemAccordionList', () => {
  it('shows the add item trigger in the empty state', () => {
    render(<CostRequestItemAccordionList items={[]} onAddItem={vi.fn()} />);

    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  });

  it('shows the add item trigger below existing items', () => {
    render(
      <CostRequestItemAccordionList
        items={[
          {
            key: 'item-1',
            description: 'Office supplies',
            receiptNumber: 'RCP-001',
            amount: 10000,
            files: [],
          },
        ]}
        onAddItem={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  });

  it('renders a thumbnail for an uploaded image file', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:receipt');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const file = new File(['image'], 'receipt.png', { type: 'image/png' });

    const { unmount } = render(
      <StrictMode>
        <CostRequestItemAccordionList
          items={[
            {
              key: 'item-1',
              description: 'Office supplies',
              amount: 10000,
              files: [
                {
                  key: 'new-0-receipt.png',
                  fileName: file.name,
                  fileSize: file.size,
                  sourceFile: file,
                },
              ],
            },
          ]}
        />
      </StrictMode>
    );

    expect(screen.getByRole('img', { name: file.name })).toHaveAttribute('src', 'blob:receipt');
    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(revokeObjectURL).not.toHaveBeenCalled();

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:receipt');

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });

  it('keeps the document icon for a non-image upload', () => {
    const file = new File(['document'], 'receipt.pdf', { type: 'application/pdf' });

    render(
      <CostRequestItemAccordionList
        items={[
          {
            key: 'item-1',
            description: 'Office supplies',
            amount: 10000,
            files: [
              {
                key: 'new-0-receipt.pdf',
                fileName: file.name,
                fileSize: file.size,
                sourceFile: file,
              },
            ],
          },
        ]}
      />
    );

    expect(screen.queryByRole('img', { name: file.name })).not.toBeInTheDocument();
  });
});
