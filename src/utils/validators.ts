/**
 * CISA Studio — Validadores Semánticos de Rúbricas
 * Autor: Agente 4 (Auditor & Refactor)
 */
import { RubricCriteria } from '../types';

export function calculateTotalRubricWeight(rubrics: RubricCriteria[]): number {
  if (!Array.isArray(rubrics)) return 0;
  const sum = rubrics.reduce((acc, r) => acc + (Number(r.weightPercentage) || 0), 0);
  return parseFloat(sum.toFixed(1));
}

export function isRubricWeightCalibrated(rubrics: RubricCriteria[], tolerance: number = 0.01): boolean {
  const total = calculateTotalRubricWeight(rubrics);
  return Math.abs(total - 100) <= tolerance;
}

export function autoBalanceRubrics(rubrics: RubricCriteria[]): RubricCriteria[] {
  if (!Array.isArray(rubrics) || rubrics.length === 0) return [];
  const equalShare = parseFloat((100 / rubrics.length).toFixed(1));
  
  return rubrics.map((r, idx) => {
    if (idx === rubrics.length - 1) {
      const precedingSum = equalShare * (rubrics.length - 1);
      return { 
        ...r, 
        weightPercentage: parseFloat((100 - precedingSum).toFixed(1)) 
      };
    }
    return { 
      ...r, 
      weightPercentage: equalShare 
    };
  });
}
