export interface RiskFactor {
  factor: string;
  severity: string;
  description: string;
}

/**
 * Summary of a generated PDF report, typically used in list views.
 */
export interface ReportSummary {
  reportId: string;
  requestId: string;
  scoringId: string;
  title: string;
  generatedBy: string;
  generatedDate: string;
  fileSizeBytes: number;
}

/**
 * Represents the full metadata details of a generated PDF report.
 */
export interface ReportDetails extends ReportSummary {
  reportType: string;
  aiSummary: string;
  riskAnalysis: string;
  riskFactors: RiskFactor[];
  recommendations: string[];
  modelVersion: string;
  language: string;
}
