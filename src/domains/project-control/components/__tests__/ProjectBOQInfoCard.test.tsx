import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ProjectBODetail } from '../../api/get-project-boq';
import { ProjectBOQInfoCard } from '../ProjectBOQInfoCard';

const project: ProjectBODetail = {
  id: 'project-1',
  code: 'PRJ-001',
  name: 'Office Building Project',
  description: 'Project description',
  currentStage: 'planning',
  currentStageName: 'Planning',
  estimatedValue: 1000000,
  totalValue: 900000,
  totalValueCco: 800000,
  limitBudgetPercentage: 80,
  projectStartDate: '2026-01-01',
  projectEndDate: '2026-12-31',
  startedAt: null,
  tenderSubmissionDeadline: null,
  outcomeReason: null,
  isActive: true,
  isRabComplete: false,
  isLimitBudgetComplete: false,
  isCcoComplete: false,
  company: { id: 'company-1', name: 'Company' },
  client: { id: 'client-1', name: 'Client' },
  createdBy: { id: 'user-1', name: 'User' },
  projectType: { id: 'type-1', name: 'Interior' },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('ProjectBOQInfoCard', () => {
  it('renders project type', () => {
    render(<ProjectBOQInfoCard project={project} />);

    expect(screen.getByText('Project Type')).toBeInTheDocument();
    expect(screen.getByText('Interior')).toBeInTheDocument();
  });

  it('renders a dash when project type is missing', () => {
    render(<ProjectBOQInfoCard project={{ ...project, projectType: null }} />);

    expect(screen.getByText('Project Type')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });
});
