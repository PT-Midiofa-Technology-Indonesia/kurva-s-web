import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TaxFilingInformation } from '../../types';
import { TaxFilingInformationDrawer } from '../TaxFilingDrawers';

const mockInfo: TaxFilingInformation = {
  id: 'info-1',
  filingStatus: 'submitted',
  filingPeriod: '2024-01',
  dueDate: '2024-02-28',
  djpReferenceNo: 'DJP-123',
  bpeNumber: 'BPE-456',
  bpeDate: '2024-01-15',
  submittedBy: { id: 'u1', name: 'Alice', email: 'alice@test.com' },
  submittedAt: '2024-01-15T00:00:00Z',
  attachments: [
    {
      id: 'doc-1',
      fileName: 'existing-doc.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      url: 'https://example.com/doc.pdf',
    },
  ],
};

vi.mock('@/domains/auth/hooks/use-me', () => ({
  useMe: () => ({ data: null }),
}));

vi.mock('@/shared/hooks/use-enums', () => ({
  useEnum: () => ({ data: [], isLoading: false }),
}));

describe('TaxFilingInformationDrawer default values from information prop', () => {
  it('pre-fills BPE Number input from information prop', () => {
    render(
      <TaxFilingInformationDrawer
        open
        onOpenChange={() => {}}
        onSubmit={() => {}}
        information={mockInfo}
      />
    );
    const input = screen.getByPlaceholderText('Enter BPE number') as HTMLInputElement;
    expect(input.value).toBe('BPE-456');
  });

  it('pre-fills DJP Reference No input from information prop', () => {
    render(
      <TaxFilingInformationDrawer
        open
        onOpenChange={() => {}}
        onSubmit={() => {}}
        information={mockInfo}
      />
    );
    const input = screen.getByPlaceholderText('Enter DJP reference no') as HTMLInputElement;
    expect(input.value).toBe('DJP-123');
  });

  it('resets with fresh information values when drawer is reopened', () => {
    const nextInfo: TaxFilingInformation = {
      ...mockInfo,
      bpeNumber: 'BPE-999',
      djpReferenceNo: 'DJP-999',
      attachments: [
        {
          id: 'doc-2',
          fileName: 'fresh-doc.pdf',
          fileSize: 2048,
          mimeType: 'application/pdf',
          url: 'https://example.com/fresh-doc.pdf',
        },
      ],
    };

    const { rerender } = render(
      <TaxFilingInformationDrawer
        open
        onOpenChange={() => {}}
        onSubmit={() => {}}
        information={mockInfo}
      />
    );

    rerender(
      <TaxFilingInformationDrawer
        open={false}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        information={mockInfo}
      />
    );

    rerender(
      <TaxFilingInformationDrawer
        open
        onOpenChange={() => {}}
        onSubmit={() => {}}
        information={nextInfo}
      />
    );

    expect((screen.getByPlaceholderText('Enter BPE number') as HTMLInputElement).value).toBe(
      'BPE-999'
    );
    expect((screen.getByPlaceholderText('Enter DJP reference no') as HTMLInputElement).value).toBe(
      'DJP-999'
    );
    expect(screen.getByText('fresh-doc.pdf')).toBeInTheDocument();
  });
});
