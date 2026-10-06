import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { ProjectBODetail } from '../../api/get-project-boq';
import { InformasiProjectCard } from '../InformasiProjectCard';

const LABELS = {
  TITLE: 'Informasi Project',
  LABELS: {
    PROJECT_NAME: 'Nama Project',
    PROJECT_OWNER: 'Project Owner',
    CLIENT: 'Client',
    ESTIMATED_VALUE: 'Estimated Value',
    TOTAL_VALUE: 'Nilai Project',
    LIMIT_BUDGET: 'Limit Budget',
    TOTAL_VALUE_CCO: 'Nilai CCO',
    PROJECT_PERIOD: 'Periode Project',
    DESCRIPTION: 'Description',
  },
};

const financials = {
  totalValue: 399050000,
  limitBudgetPercentage: 80,
  totalValueCco: 319240000,
};

const project: ProjectBODetail = {
  id: 'proj-1',
  code: 'PRJ-001',
  name: 'Pembangunan Gedung Kantor',
  description: 'Proyek gedung kantor 5 lantai',
  currentStage: 'prospect_identify',
  currentStageName: 'Prospect Identify',
  estimatedValue: 25000000000,
  totalValue: 25000000000,
  totalValueCco: 20000000000,
  limitBudgetPercentage: 80,
  projectStartDate: '2026-06-30T17:00:00.000000Z',
  projectEndDate: '2027-06-29T17:00:00.000000Z',
  startedAt: null,
  tenderSubmissionDeadline: null,
  outcomeReason: null,
  isActive: true,
  isRabComplete: true,
  isLimitBudgetComplete: false,
  isCcoComplete: false,
  company: { id: 'comp-1', name: 'PT. Curva 1' },
  client: { id: 'client-1', name: 'PT Maju Jaya Abadi' },
  createdBy: { id: 'user-1', name: 'Admin' },
  projectType: null,
  createdAt: '2026-06-26T00:03:28+07:00',
  updatedAt: '2026-06-26T00:03:28+07:00',
};

describe('InformasiProjectCard', () => {
  it('renders all project fields when expanded', () => {
    render(<InformasiProjectCard project={project} labels={LABELS} />);

    expect(screen.getByText('Informasi Project')).toBeInTheDocument();
    expect(screen.getByText('Pembangunan Gedung Kantor')).toBeInTheDocument();
    expect(screen.getByText('PT. Curva 1')).toBeInTheDocument();
    expect(screen.getByText('PT Maju Jaya Abadi')).toBeInTheDocument();
    expect(screen.getByText('Proyek gedung kantor 5 lantai')).toBeInTheDocument();
  });

  it('shows the estimated value when no financials are given', () => {
    render(<InformasiProjectCard project={project} labels={LABELS} />);

    expect(screen.getByText('Estimated Value')).toBeInTheDocument();
    expect(screen.queryByText('Nilai Project')).not.toBeInTheDocument();
  });

  it('replaces the estimated value with the three financial fields', () => {
    render(<InformasiProjectCard financials={financials} labels={LABELS} project={project} />);

    expect(screen.queryByText('Estimated Value')).not.toBeInTheDocument();
    expect(screen.getByText('Nilai Project')).toBeInTheDocument();
    expect(screen.getByText('Rp 399.050.000')).toBeInTheDocument();
    expect(screen.getByText('Limit Budget')).toBeInTheDocument();
    expect(screen.getByText('Rp 319.240.000 (80%)')).toBeInTheDocument();
    expect(screen.getByText('Nilai CCO')).toBeInTheDocument();
  });

  it('trims trailing zeros from the limit budget percentage', () => {
    render(
      <InformasiProjectCard
        financials={{ ...financials, limitBudgetPercentage: 82.5 }}
        labels={LABELS}
        project={project}
      />
    );

    expect(screen.getByText('Rp 329.216.250 (82,5%)')).toBeInTheDocument();
  });

  it('renders a dash when the limit budget percentage is missing', () => {
    render(
      <InformasiProjectCard
        financials={{ ...financials, limitBudgetPercentage: null }}
        labels={LABELS}
        project={project}
      />
    );

    expect(screen.getByText('Limit Budget')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('collapses the content when the header is clicked', async () => {
    const user = userEvent.setup();
    render(<InformasiProjectCard project={project} labels={LABELS} />);

    expect(screen.getByText('Pembangunan Gedung Kantor')).toBeInTheDocument();

    await user.click(screen.getByText('Informasi Project'));

    expect(screen.queryByText('Pembangunan Gedung Kantor')).not.toBeInTheDocument();
  });
});
