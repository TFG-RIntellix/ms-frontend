/**
 * Represents a feature/variable that strongly influenced the AI model's decision (SHAP value).
 */
export interface TopFeature {
  featureName: string;
  featureValue: string;
  shapValue: number;
  description?: string;
}

/**
 * Represents the complete risk scoring results for a specific request.
 * Contains core risk metrics (PD, LGD, EAD, ECL), financial metrics, and SHAP drivers.
 */
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
