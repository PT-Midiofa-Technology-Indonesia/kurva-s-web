import { describe, expect, it } from 'vitest';
import type { BOQProject } from '../../api/get-boq-projects';
import { mapBOQProjectToListItem } from '../boq-project-list.service';

const mockProject: BOQProject = {
  id: 'proj-001',
  code: 'PRJ-001',
  name: 'Office Building',
  description: 'Office building project',
  estimatedValue: 1000000000,
  totalValue: 1200000000,
  projectStartDate: '2026-06-30T17:00:00.000000Z',
  projectEndDate: '2027-06-29T17:00:00.000000Z',
  isRabComplete: true,
  isLimitBudgetComplete: false,
  isCcoComplete: true,
  statusBoqPlanning: true,
  statusBoqFinal: false,
  statusBoqExecution: true,
  company: {
    id: 'comp-001',
    name: 'PT construction',
  },
  client: {
    id: 'client-001',
    name: 'PT Client',
  },
};

describe('boq-project-list.service', () => {
  describe('mapBOQProjectToListItem', () => {
    it('maps project to list item for planning stage', () => {
      const result = mapBOQProjectToListItem(mockProject, 'planning');

      expect(result).toEqual({
        id: 'proj-001',
        projectName: 'Office Building',
        projectOwner: 'PT construction',
        clientName: 'PT Client',
        estimatedValue: 1000000000,
        totalValue: 1200000000,
        projectStartDate: '2026-06-30T17:00:00.000000Z',
        projectEndDate: '2027-06-29T17:00:00.000000Z',
        description: 'Office building project',
        statusBoqComplete: true,
        settingStatus: 'complete',
        isLimitBudgetComplete: false,
        statusBoqPlanning: true,
        statusBoqFinal: false,
        statusBoqExecution: true,
      });
    });

    it('maps project to list item for final stage', () => {
      const result = mapBOQProjectToListItem(mockProject, 'final');

      expect(result).toEqual({
        id: 'proj-001',
        projectName: 'Office Building',
        projectOwner: 'PT construction',
        clientName: 'PT Client',
        estimatedValue: 1000000000,
        totalValue: 1200000000,
        projectStartDate: '2026-06-30T17:00:00.000000Z',
        projectEndDate: '2027-06-29T17:00:00.000000Z',
        description: 'Office building project',
        statusBoqComplete: true,
        settingStatus: 'incomplete',
        isLimitBudgetComplete: false,
        statusBoqPlanning: true,
        statusBoqFinal: false,
        statusBoqExecution: true,
      });
    });

    it('maps project to list item for execution stage', () => {
      const result = mapBOQProjectToListItem(mockProject, 'execution');

      expect(result).toEqual({
        id: 'proj-001',
        projectName: 'Office Building',
        projectOwner: 'PT construction',
        clientName: 'PT Client',
        estimatedValue: 1000000000,
        totalValue: 1200000000,
        projectStartDate: '2026-06-30T17:00:00.000000Z',
        projectEndDate: '2027-06-29T17:00:00.000000Z',
        description: 'Office building project',
        statusBoqComplete: true,
        settingStatus: 'complete',
        isLimitBudgetComplete: false,
        statusBoqPlanning: true,
        statusBoqFinal: false,
        statusBoqExecution: true,
      });
    });

    it('returns incomplete status when all flags are false', () => {
      const incompleteProject: BOQProject = {
        ...mockProject,
        statusBoqPlanning: false,
        statusBoqFinal: false,
        statusBoqExecution: false,
      };

      const planningResult = mapBOQProjectToListItem(incompleteProject, 'planning');
      const finalResult = mapBOQProjectToListItem(incompleteProject, 'final');
      const executionResult = mapBOQProjectToListItem(incompleteProject, 'execution');

      expect(planningResult.settingStatus).toBe('incomplete');
      expect(finalResult.settingStatus).toBe('incomplete');
      expect(executionResult.settingStatus).toBe('incomplete');
    });

    it('returns complete status when all flags are true', () => {
      const completeProject: BOQProject = {
        ...mockProject,
        statusBoqPlanning: true,
        statusBoqFinal: true,
        statusBoqExecution: true,
      };

      const planningResult = mapBOQProjectToListItem(completeProject, 'planning');
      const finalResult = mapBOQProjectToListItem(completeProject, 'final');
      const executionResult = mapBOQProjectToListItem(completeProject, 'execution');

      expect(planningResult.settingStatus).toBe('complete');
      expect(finalResult.settingStatus).toBe('complete');
      expect(executionResult.settingStatus).toBe('complete');
    });
  });
});
