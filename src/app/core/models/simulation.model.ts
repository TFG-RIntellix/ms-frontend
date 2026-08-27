/**
 * Represents a saved simulation summary, typically used in list views.
 */
export interface SimulationSummary {
  simulationId: string;
  scenarioName: string;
  partyName: string;
  requestCode?: string;
  requestId: string;
  simulationDate: string;
  isArchived: boolean;
  simulatedRiskGrade?: string;
}

/**
 * Core metrics returned by a simulation calculation.
 */
export interface SimulationMetrics {
  pd: number;
  lgd: number;
  ead: number;
  ecl: number;
  riskGrade: string;
  monthlyPayment: number;
  dti: number;
  totalPayment: number;
  totalInterest: number;
  disposableIncome: number;
}

export interface SimulationDelta {
  pdChange: number;
  lgdChange: number;
  eadChange: number;
  eclChange: number;
  riskGradeChange: string;
  monthlyPaymentChange: number;
  dtiChange: number;
  totalPaymentChange: number;
  totalInterestChange: number;
  monthlyDisposableIncomeChange: number;
}

/**
 * Represents the full details of a saved simulation, including the exact form changes applied.
 */
export interface SimulationDetails {
  simulationId: string;
  scenarioName: string;
  simulationDate: string;
  requestCode?: string;
  requestId: string;
  partyId: string;
  baseScoringId: string;
  formChanges: Record<string, unknown>;
  simulatedPd: number;
  simulatedLgd: number;
  simulatedEad: number;
  simulatedEcl: number;
  simulatedRiskGrade: string;
  simulatedDecision: string;
  isArchived: boolean;
  simulatedResults?: SimulationMetrics;
  delta?: SimulationDelta;
}

export interface DraftRequest {
  requestId: string;
  requestType: string;
  formChanges: Record<string, unknown>;
}

/**
 * Response from a temporary 'draft' simulation.
 * Contains both the simulated results and the delta (difference) compared to the base scenario.
 */
export interface DraftResponse {
  formChanges: Record<string, unknown>;
  simulatedResults: SimulationMetrics;
  delta: SimulationDelta;
}

/**
 * Payload used to persist a new simulation in the database.
 */
export interface CreateSimulationPayload {
  scenarioName: string;
  requestId: string;
  partyId: string;
  baseScoringId: string;
  formChanges: Record<string, unknown>;
  simulatedResults: SimulationMetrics & { decision: string };
  delta: SimulationDelta;
}


