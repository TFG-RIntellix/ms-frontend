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
  eclChange: number;
  riskGradeChange: string;
  monthlyPaymentChange: number;
  dtiChange: number;
  totalPaymentChange: number;
  totalInterestChange: number;
  monthlyDisposableIncomeChange: number;
}

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
  pdChange: number;
  elChange: number;
  riskGradeChange: string;
  isArchived: boolean;
  simulatedResults?: SimulationMetrics;
  delta?: SimulationDelta;
}

export interface DraftRequest {
  requestId: string;
  requestType: string;
  formChanges: Record<string, unknown>;
}

export interface DraftResponse {
  formChanges: Record<string, unknown>;
  simulatedResults: SimulationMetrics;
  delta: SimulationDelta;
}

export interface CreateSimulationPayload {
  scenarioName: string;
  requestId: string;
  partyId: string;
  baseScoringId: string;
  formChanges: Record<string, unknown>;
  simulatedResults: SimulationMetrics & { decision: string };
  delta: SimulationDelta;
}

export interface UpdateSimulationPayload extends CreateSimulationPayload {}
