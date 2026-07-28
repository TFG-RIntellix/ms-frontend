export interface TopFeature {
  featureName: string;
  featureValue: string;
  shapValue: number;
  description?: string;
}

export interface Scoring {
  scoringId: string;
  requestId: string;
  modelVersion: string;
  scoringDate: string;
  inputFeatures: Record<string, unknown>;
  pd: number;
  lgd: number;
  ead: number;
  ecl: number;
  riskGrade: string;
  monthlyPayment: number;
  dti: number;
  totalPayment: number;
  totalInterest: number;
  monthlyDisposableIncome: number;
  baseValue: number;
  topFeatures: TopFeature[];
}
