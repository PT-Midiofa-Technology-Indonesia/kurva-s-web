import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/shared/utils/test-utils';
import type { TaxFiling } from '../../types';
import { TaxFilingAttachmentsCard } from '../TaxFilingCards';

const mockTaxFiling = {
  id: 'tax-filing-1',
  code: 'TF-001',
  taxType: { id: 'tt-1', code: 'ppn', name: 'PPN' },
  company: { id: 'c-1', code: 'cmp', name: 'Company' },
  taxPeriod: '2026-08',
  totalTax: 1000,
  dueDate: '2026-08-31',
  status: 'in_progress',
  attachments: [
    {
      id: 'doc-1',
      fileName: 'server-doc.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      url: 'https://example.com/server-doc.pdf',
    },
  ],
  payments: [],
  information: null,
  taxTransactionDetails: [],
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
} satisfies TaxFiling;

describe('TaxFilingAttachmentsCard', () => {
  it('shows aggregate upload progress and disables add files while uploading', () => {
    render(
      <TaxFilingAttachmentsCard
        taxFiling={mockTaxFiling}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        isUploading
        uploadProgress={45}
      />
    );

    expect(screen.getByRole('button', { name: /add files/i })).toBeDisabled();
    expect(screen.getByText('Uploading files...')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
